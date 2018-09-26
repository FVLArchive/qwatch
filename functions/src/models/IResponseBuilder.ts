import { DialogflowApp } from 'actions-on-google/dialogflow-app';
import { OrderUpdate, Order, ActionPaymentTransactionConfig } from 'actions-on-google/transactions';

/**
 * Shortcut triggers, typically presented as text or spoken using a speech synthesizer
 */
export interface ISimpleResponse {
	/** Custom speech with formatting according to SSML specs */
	ssml?: string;
	/** Spoken phrase */
	textToSpeech?: string;
	/** Text phrase */
	displayText?: string;
}

/**
 * Shortcut triggers, typically presented as buttons or quick-replies
 */
export interface ISuggestion {
	/** The display text of the suggestion and also the utterance to respond with when selected */
	title: string;
	/** A hyperlink that should be followed when selected instead of uttering the title */
	linkUrl?: string;
}

/**
 * An general option, typically in a collection from which the user can choose
 */
export interface IOption {
	title: string;
	description?: string;
	/** An image that represents the option graphically */
	imageUri?: string;
	/** Unique identifier that represents the action for the option */
	actionKey?: string;
	/** Utterances that may also trigger the action associated with this option */
	actionSynonyms?: string[];
	/** Typically represents context-specific buttons/actions */
	subSuggestions?: ISuggestion[];
	/** A message that should be stated by voice. */
	voiceMessage?: string;
}

/**
 * Flags to indicate the type of response; whether or not to end the conversation, etc.
 */
export enum ResponseType {
	Normal,
	Final
}

/**
 * Abstracts responses to logic elements and translates them in to UI elements.
 * Note that implementations of IActionHandler should focus on WHAT to communicate to the user
 * whereas implementations of IResponseBuilder should focus on HOW it is communicated.
 */
export interface IResponseBuilder {
	/** Respond using Dialogflow V1 format */
	respondV1(app: DialogflowApp, responseType: ResponseType): Promise<void>;

	/** Respond using Dialogflow V2 format */
	respondV2(response: any, responseType: ResponseType): Promise<void>;

	/** Add simple messages that is the same written and spoken */
	addMessages(...messages: string[]): IResponseBuilder;

	/** Add messages that might be different depending on the medium */
	addSimpleResponses(...simpleResponses: ISimpleResponse[]): IResponseBuilder;

	/** Add option cards */
	addOptions(...options: IOption[]): IResponseBuilder;

	/** Get all option cards */
	getOptions(): IOption[];

	/** Add a title for a set of options */
	addOptionsTitle(title: string): IResponseBuilder;

	/** Add suggestion/quick-replies */
	addSuggestions(...suggestions: ISuggestion[]): IResponseBuilder;

	/** Add an update (status+info) to an existing order */
	addOrderUpdate(orderUpdate: OrderUpdate): IResponseBuilder;

	/** Add a transaction decision, if there is one no other messages can be sent. */
	addTransactionDecision(order: Order, transactionConfig: ActionPaymentTransactionConfig): IResponseBuilder;

	/** Add a message to be stated by voice if the user's device has no screen capabilities */
	addVoiceMessage(message: string, index?: number): IResponseBuilder;
}
