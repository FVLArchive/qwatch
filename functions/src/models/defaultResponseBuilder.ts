import { RichResponse, BasicCard } from 'actions-on-google/response-builder';
import { DialogflowApp } from 'actions-on-google/dialogflow-app';
import { OrderUpdate, Order, ActionPaymentTransactionConfig } from 'actions-on-google/transactions';
import { ISimpleResponse, IOption, IResponseBuilder, ISuggestion, ResponseType } from './IResponseBuilder';
import { Logging } from './logger';
import { Utility } from '../utility';

interface ITransactionDecision {
	order: Order;
	transactionConfig: ActionPaymentTransactionConfig;
}

/** Limits and specifications required by Google Assistant */
const MAX_CHAT_BUBBLE = 2;
const MAX_CHARS_PER_CHAT_BUBBLE = 640;
const SSML_OPEN_ELEMENT = '<speak>';
const SSML_CLOSE_ELEMENT = '</speak>';
const MAX_SUGGESTIONS = 8;
const MAX_CHARS_PER_SUGGESTION = 25;
const MAX_CHARS_PER_SUGGESTION_LINK = MAX_CHARS_PER_SUGGESTION - 5; // 5 is due to the length of "Open ", which is prepended to all suggestion links.

/** Used to concatenate strings when required */
const ELLIPSIS = '...';

/**
 * The default response builder.
 * Supports responding to the Dialogflow v1 API and can be extended to support the v2 API.
 */
export class DefaultResponseBuilder implements IResponseBuilder {
	/** Arrays of different response features to be processed into a response when required. */
	simpleResponses: ISimpleResponse[] = [];
	options: IOption[] = [];
	optionsTitle: string;
	suggestions: ISuggestion[] = [];
	/** An order update storing the information required for Google's transaction API. */
	orderUpdate: OrderUpdate;
	/** The order proposal that will be presented to the user for deciding to purchase or not. */
	transactionDecision: ITransactionDecision;
	/** Used as a separator when individual messages have to be combined due to message count restrictions */
	static messageDelimiter = '\n\n';
	/** Messages that will be stated by voice after all other messages have been read. These will only be heard on a screen-less device */
	voiceMessages: string[] = [];
	global = {};

	constructor(public defaultListMessage: string) {}

	/**
	 * Attempt to reduce messages to meet restrictions imposed by Google.
	 * Merges all of the simple responses except for the last response together.
	 * Simple responses are separated by a globally configurable delimiter
	 * @param srs The input array of simple responses that may have more individual responses than allowed
	 * @returns An array of simple responses which hopefully has two or fewer responses. If truncation could not be completed due to character limits, returns the original simple response array.
	 */
	protected reduceSimpleResponses(srs: ISimpleResponse[]): ISimpleResponse[] {
		const n = srs.length;
		if (n > MAX_CHAT_BUBBLE) {
			const mergeSet = srs.slice(0, n - MAX_CHAT_BUBBLE + 1);
			const firstSR: ISimpleResponse = {
				displayText: mergeSet.map(sr => sr.displayText).join(DefaultResponseBuilder.messageDelimiter),
				textToSpeech: mergeSet.map(sr => sr.textToSpeech).join(DefaultResponseBuilder.messageDelimiter)
			};
			// joining ssml messages is complicated by it's syntax
			if (mergeSet.some(sr => sr.ssml !== undefined && sr.ssml.length > 0)) {
				// A crude ssml concatenator technique... should consider using an ssml library if ssml is going to be part of the design
				firstSR.ssml = `${SSML_OPEN_ELEMENT}${mergeSet
					.map(sr => sr.ssml)
					.join()
					.replace(SSML_OPEN_ELEMENT, '')
					.replace(SSML_CLOSE_ELEMENT, '')}${SSML_OPEN_ELEMENT}`;
			}

			if (!this.isValidSimpleResponse(firstSR)) {
				// give up... combined message would be too long
				Logging.logger.warn(
					`Attempt to display ${
						this.simpleResponses.length
					} chat bubbles in a turn but max allowed is 2 and could not reduce the number of bubbles`
				);
				return srs;
			}
			const result = [firstSR];
			result.push(...srs.slice(n - MAX_CHAT_BUBBLE + 1, n));
			return result;
		}
		return srs;
	}

	/**
	 * Ensures that simple responses meet all the requirements for simple responses. These are:
	 * Within the character limit.
	 * Contain either textToSpeech or ssml.
	 * @param response The simple response that is to be validated.
	 */
	protected isValidSimpleResponse(response: ISimpleResponse): boolean {
		return !(
			response.displayText.length > MAX_CHARS_PER_CHAT_BUBBLE ||
			(response.ssml && response.ssml.length > MAX_CHARS_PER_CHAT_BUBBLE) ||
			(response.textToSpeech && response.textToSpeech.length > MAX_CHARS_PER_CHAT_BUBBLE) ||
			!Utility.XOR(response.ssml, response.textToSpeech)
		); // Ensure ssml OR textToSpeech exists, but not both
	}

	////// V1 components - override these for finer control to satisfy your UI design

	/**
	 * Merge all provided voice responses into one message and add them to the last simple response when the device does not have a screen.
	 * @param app the DialogflowApp that can be used to get surface capabilities.
	 */
	protected processVoiceMessages(app: DialogflowApp): void {
		// If the device has screen capabilities or there are no voice messages, do nothing.
		if (
			this.voiceMessages.length < 1 ||
			app.getSurfaceCapabilities().some(capability => capability === app.SurfaceCapabilities.SCREEN_OUTPUT)
		) {
			return;
		}

		if (this.simpleResponses.length < 1) {
			this.addSimpleResponses({});
		}

		const lastSR = this.simpleResponses[this.simpleResponses.length - 1];
		lastSR.textToSpeech = [lastSR.textToSpeech]
			.concat(this.voiceMessages)
			.join(DefaultResponseBuilder.messageDelimiter);

		if (!this.isValidSimpleResponse(lastSR)) {
			Logging.logger.warn(
				`Attempted to merge ${
					this.voiceMessages.length
				} voice only messages with the last simple response as max allowed chat bubbles is 2 but could not merge.`
			);
			return;
		}

		this.simpleResponses[this.simpleResponses.length - 1] = lastSR;
		return;
	}

	/**
	 * Process basic messages into v1 rich responses.
	 * We can have at most 2 text bubbles according to Google.
	 * @param richResponse The richResponse that the simple responses are going to be added to.
	 */
	protected processV1SimpleResponses(richResponse: RichResponse): void {
		const responses = this.reduceSimpleResponses(this.simpleResponses);
		const simpleResponseSlice = responses.slice(0, MAX_CHAT_BUBBLE);
		for (const simpleResponse of simpleResponseSlice) {
			richResponse.addSimpleResponse({ speech: simpleResponse.textToSpeech, displayText: simpleResponse.displayText });
		}
	}

	/**
	 * Process suggestion chips/quick-replies and suggestions with external links into v1 rich responses.
	 * @param richResponse The richResponse that the suggestions are going to be added to.
	 */
	protected processV1Suggestions(richResponse: RichResponse): void {
		let linkCount = 0;
		// Handle suggestions
		if (this.options.length === 1) {
			// If there is only one option, it will be displayed as a basic card which does not support selection by tapping the option.
			// Instead, we must add a suggestion so the user can continue the conversation.
			// Use unshift to add this as the first suggestion to be the most visible suggestion.
			this.suggestions.unshift({ title: this.options[0].title });
		}
		if (this.suggestions.length > MAX_SUGGESTIONS)
			Logging.logger.warn(
				`A maximum of ${MAX_SUGGESTIONS} suggestions are supported, but ${
					this.suggestions.length
				} have been added.\n Only the first ${MAX_SUGGESTIONS} will be displayed.`
			);
		const sgs = this.suggestions.slice(0, MAX_SUGGESTIONS);

		for (const suggestion of sgs) {
			const charLimit = suggestion.linkUrl ? MAX_CHARS_PER_SUGGESTION_LINK : MAX_CHARS_PER_SUGGESTION;
			const title =
				suggestion.title.length > charLimit
					? `${suggestion.title.slice(0, charLimit - ELLIPSIS.length)}${ELLIPSIS}`
					: suggestion.title;
			if (suggestion.linkUrl) {
				if (linkCount++ < 1) richResponse.addSuggestionLink(title, suggestion.linkUrl);
				else Logging.logger.warn(`Cannot add LINK suggestion ${suggestion.title}, max allowed is 1`);
			} else richResponse.addSuggestions(title);
		}
	}

	/**
	 * Adds an order update to the list if one has been provided to the response builder
	 * @param richResponse The richResponse that the suggestions are going to be added to.
	 */
	protected processOrderUpdate(richResponse: RichResponse): void {
		if (this.orderUpdate) richResponse.addOrderUpdate(this.orderUpdate);
	}

	/**
	 * Send v1 rich responses depending on how options are interpreted.
	 * Follows Google's [recommendations]{@Link https://developers.google.com/actions/assistant/responses} for how different amounts of options should be displayed.
	 * @param app           The DialogflowApp that will be used to create the list of options and submit the response.
	 * @param responseType  Determines whether this should be the final message or not.
	 * @param richResponse  The richResponse that the simple responses are going to be added to.
	 */
	protected respondV1WithOptions(
		app: DialogflowApp,
		responseType: ResponseType,
		richResponse: RichResponse
	): Promise<void> {
		if (this.options.length > 0) {
			// Add default simple response if none exist.
			// Required as Google requires all lists and carousels to have a simple response
			if (this.simpleResponses.length === 0) {
				richResponse.addSimpleResponse(this.defaultListMessage);
			}
			const items = this.options.map(option => {
				const item = app.buildOptionItem(option.actionKey, option.actionSynonyms).setTitle(option.title);
				if (option.description) item.setDescription(option.description);
				if (option.imageUri) item.setImage(option.imageUri, option.title);
				return item;
			});

			// We will follow design guidelines and decide whether to present the options as a list or carousel
			// based on the number of options: < 2, use card; > 6, or if specified, use list; otherwise carousel
			// If you don't like this logic, we suggest implementing your own IResponseBuilder.
			if (this.options.length < 2) {
				// Basic card does not follow the format of list and carousel, so adjustment is needed.
				// Basic card also does not support keys and synonyms, so functionality of selecting the item will be missing.
				const item = this.options[0];
				const bc: BasicCard = new BasicCard();
				bc.setTitle(item.title);
				if (item.description) bc.setBodyText(item.description);
				if (item.imageUri) bc.setImage(item.imageUri, item.title);
				if (item.subSuggestions) {
					for (const suggestion of item.subSuggestions) {
						if (suggestion.linkUrl) bc.addButton(suggestion.title, suggestion.linkUrl);
						else Logging.logger.warn(`Attempt to display button "${suggestion.title}" in card with no link URL`);
					}
				}

				app.ask(richResponse.addBasicCard(bc));
			} else if (this.preferList()) {
				// display as a list
				app.askWithList(richResponse, app.buildList(this.optionsTitle ? this.optionsTitle : 'Options').addItems(items));
			} else {
				// display as a carousel
				app.askWithCarousel(richResponse, app.buildCarousel().addItems(items));
			}
		} else {
			switch (responseType) {
				case ResponseType.Normal:
					app.ask(richResponse);
					break;
				case ResponseType.Final:
					app.tell(richResponse);
					break;
			}
		}
		return Promise.resolve();
	}

	/**
	 * Determine if the options should be displayed as a list.
	 * If there are more than 6 items or all items don't have images nor description
	 * @returns True if the options should be displayed as a list, False if a carousel would be preferred
	 */
	protected preferList(): boolean {
		return this.options.length > 6 || this.options.every(option => !option.imageUri && !option.description);
	}

	//////////////////////////
	////// IResponseBuilder
	//////////////////////////

	/**
	 * Generate the response that should be submitted to Dialogflow based on all the information that has been provided to this response builder.
	 * @param app The DialogflowApp that will be used to generate and submit the response.
	 * @param responseType Determines whether this should be the final message or not.
	 */
	respondV1(app: DialogflowApp, responseType: ResponseType): Promise<void> {
		// If there is a transaction decision present no other messages can be sent.
		if (this.transactionDecision) {
			app.askForTransactionDecision(this.transactionDecision.order, this.transactionDecision.transactionConfig);
			return Promise.resolve();
		}

		const richResponse = new RichResponse();
		this.processVoiceMessages(app);
		this.processV1SimpleResponses(richResponse);
		this.processV1Suggestions(richResponse);
		this.processOrderUpdate(richResponse);
		return this.respondV1WithOptions(app, responseType, richResponse);
	}

	/**
	 * Respond using Dialogflow V2 format.
	 * Not yet implemented.
	 * @throws An error "Method not implemented" every time this function is called.
	 */
	respondV2(response: any, responseType: ResponseType): Promise<void> {
		throw new Error('Method not implemented.');
	}

	/**
	 * Add a simple message that is the same written and spoken.
	 * @param messages The strings of text that are to be added as individual messages.
	 * @returns The parent responseBuilder.
	 */
	addMessages(...messages: string[]): IResponseBuilder {
		this.addSimpleResponses(
			...messages.map(message => {
				return { ssml: '', displayText: message, textToSpeech: message };
			})
		);
		return this;
	}

	/**
	 * Add a message that might be presented differently depending on the medium.
	 * @param simpleResponses The simple responses that are to be added as individual messages.
	 * @returns The parent responseBuilder.
	 */
	addSimpleResponses(...simpleResponses: ISimpleResponse[]): IResponseBuilder {
		this.simpleResponses.push(...simpleResponses);
		return this;
	}

	/**
	 * Add option cards.
	 * @param options The options that are to be added to the array of options to be displayed.
	 * @returns The parent responseBuilder.
	 */
	addOptions(...options: IOption[]): IResponseBuilder {
		this.options.push(...options);
		return this;
	}

	/**
	 * Get all option cards.
	 * @returns The array of options that have been added to this response builder.
	 */
	getOptions(): IOption[] {
		return this.options;
	}

	/**
	 * Add a title for a set of options, which may or may not be displayed.
	 * @param title The title of the option set, to be displayed if possible.
	 * @returns The parent responseBuilder.
	 */
	addOptionsTitle(title: string): IResponseBuilder {
		this.optionsTitle = title;
		return this;
	}

	/**
	 * Add suggestion/quick-replies.
	 * @param suggestions The suggestions or link suggestion to be displayed beneath the rest of the message.
	 * @returns The parent responseBuilder.
	 */
	addSuggestions(...suggestions: ISuggestion[]): IResponseBuilder {
		this.suggestions.push(...suggestions);
		return this;
	}

	/**
	 * Add an order/transaction update.
	 * @param orderUpdate The transaction update to be displayed to the user.
	 * @returns The parent responseBuilder.
	 */
	addOrderUpdate(orderUpdate: OrderUpdate): IResponseBuilder {
		this.orderUpdate = orderUpdate;
		return this;
	}

	/**
	 * Add an order/transaction update.
	 * @param orderUpdate The transaction update to be displayed to the user.
	 * @returns The parent responseBuilder.
	 */
	addTransactionDecision(order: Order, transactionConfig: ActionPaymentTransactionConfig): IResponseBuilder {
		this.transactionDecision = {
			order: order,
			transactionConfig: transactionConfig
		};
		return this;
	}

	/**
	 * Add a message that should be stated by voice if and only if the user's device does not have screen capabilities.
	 * @param message The text message that should be stated by voice.
	 * @param index An optional index to add the message to in the array of messages.
	 *              Indexes are limited to the range [0, messageArraySize].
	 */
	addVoiceMessage(message: string, index?: number): IResponseBuilder {
		// Need to check if i is undefined or null as 'if (i)' fails when i === 0, which is a valid state
		if (index === null || index === undefined) {
			this.voiceMessages.push(message);
		} else if (index < 0) {
			//Logging.logger.warn(`Tried to add a voiceMessage "${message}" at index ${index}. Minimum allowed is 0, adding there.`);
			this.voiceMessages.splice(0, 0, message);
		} else if (index >= this.voiceMessages.length) {
			//Logging.logger.warn(`Tried to add a voiceMessage "${message}" at index ${index}. Maximum allowed is ${this.voiceMessages.length - 1} due to current list of voice messages, adding there.`);
			this.voiceMessages.splice(this.voiceMessages.length - 1, 0, message);
		} else {
			// Add the message at index i, removing 0 other array values.
			this.voiceMessages.splice(index, 0, message);
		}
		return this;
	}
}
