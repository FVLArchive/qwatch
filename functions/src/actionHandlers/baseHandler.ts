import { IActionHandler, IActionHandlerPackage } from './IActionHandler';
import { Messages } from '../localization/messages';
import { ResponseType, IResponseBuilder, IOption } from '../models/IResponseBuilder';
import { DefaultResponseBuilder } from '../models/defaultResponseBuilder';
import { Utility } from '../utility';
import { IProduct } from '../models/order';
import { Logging } from '../models/logger';
import { Store } from '../dataSources/source/source';

/** The key used to store the last message that was sent to the user.  */
export const lastResponseToUserKey = 'lastResponseToUser';
const IMAGE_BASE_URL_KEY = 'imageBaseUrl';
const IMAGE_TYPE_KEY = 'imageType';
const IMAGE_BY_NAME_KEY = 'imageByName';
const DEFAULT_ITEM_URL_KEY = 'defaultImageUrl';
export const PHONE_NUMBER_KEY = 'phone';
export const STORE_ID_KEY = 'storeid';
export const WAIT_IN_LINE_CONTEXT: string = 'wait_in_line';
export const SELECT_STORE_CONTEXT = 'select_store';
export const PERMISSION = 'notifcation_permission';

export enum UserType {
	customer,
	staff
}

/**
 * The base implementation that all actionHandlers should extend.
 * Includes logic to add welcome messages and ensure the user if valid.
 */
export abstract class BaseHandler implements IActionHandler {
	/** The object containing all required data sources and tools to complete and send the response */
	package: IActionHandlerPackage;
	protected user: UserType;

	/**
	 * Initialize this action handler.
	 * @param p The package the action handler will use.
	 * @returns This initialized IActionHandler.
	 */
	init(p: IActionHandlerPackage): Promise<IActionHandler> {
		this.package = p;
		return Promise.resolve(this);
	}

	/**
	 * Build the response that is specific to the individual implementation of action handler.
	 * @returns Whether or not this message should end the conversation.
	 */
	abstract buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType>;

	/**
	 * Build the response that will be sent to the user.
	 */
	respond(): Promise<void> {
		let responseType: ResponseType;
		const responseBuilder = new DefaultResponseBuilder(Messages.defaultListMessage());
		return (
			this.buildWelcomeMessage(responseBuilder)
				.then(() => {
					this.package.source.storeId = this.getStoreId();
					return this.buildResponse(responseBuilder);
				})
				.then(rType => {
					responseType = rType;
					return this.buildOptionsVoice(responseBuilder);
				})
				.then(() => {
					if (this.package.response) {
						return responseBuilder.respondV2(this.package.response, responseType);
					} else {
						return responseBuilder.respondV1(this.package.app, responseType);
					}
				})
				// Save the response for possible repeating
				.then(() => this.package.userInfo.settings.setData(lastResponseToUserKey, JSON.stringify(responseBuilder)))
				.then(() => null)
				.catch(err => {
					Logging.logger.error(err);
					this.package.app.tell(Messages.errorHandlingResponse());
				})
		);
	}

	/** The key to the user setting field that contains the amount of times the user has started a conversation with this action */
	static conversationCountKey = 'conversationCount';

	/**
	 * Add a welcome message to the response if this is the start of a conversation.
	 * Adds a longer introduction message if this is one if the first 5 conversations the user has had.
	 * Adds a short greeting otherwise.
	 * @param responseBuilder The response builder that will be modified to add all required messages.
	 */
	protected buildWelcomeMessage(responseBuilder: IResponseBuilder): Promise<void> {
		if (this.isNewConversation()) {
			return this.package.userInfo.settings.getOrDefaultData(BaseHandler.conversationCountKey, 0).then(count => {
				responseBuilder.addMessages(
					count > 2 ? Messages.familiarWelcomeMessage() : Messages.introductoryWelcomeMessage()
				);
				return this.incrementConversationCount(count).then(() => Promise.resolve());
			});
		}
		return Promise.resolve();
	}

	protected getStoreId(): string {
		const storeId = this.package.app.userStorage[STORE_ID_KEY];
		if (!storeId) return null;
		return storeId.toString();
	}

	protected addStoreSuggestions(stores: Store[], responseBuilder: IResponseBuilder): void {
		this.package.app.setContext(SELECT_STORE_CONTEXT);
		responseBuilder.addOptionsTitle(Messages.listStore());
		for (let store of stores) {
			const option: IOption = { title: store.Name, actionKey: store.Id };
			//option.description = store.Address ? store.Address : 'Unknown';
			responseBuilder.addOptions(option);
			//responseBuilder.addSuggestions({ title: stores[i].Id });
		}
	}

	protected getPhoneNumber(updateUserStorage: boolean = true): Promise<string> {
		return this.package.userInfo.settings.getOrDefaultData<string>(PHONE_NUMBER_KEY).then(phone => {
			const obj = this.package.app.getArgument(PHONE_NUMBER_KEY);
			if (this.user === UserType.customer) {
				if (!phone && obj) {
					phone = obj.toString();
					if (updateUserStorage) return this.package.userInfo.settings.setData(PHONE_NUMBER_KEY, phone);
				}
			} else {
				if (obj) phone = obj.toString();
				else phone = null;
			}
			return phone;
		});
	}

	/**
	 * Check if this is going to be the first response in the current conversation.
	 * @returns True if the conversation is new.
	 * False if the conversation is is not new.
	 */
	protected isNewConversation() {
		return this.package.app ? Utility.isNewConversationV1(this.package.app) : Utility.isNewConversationV2();
	}

	/**
	 * Increment the count for how many times this user has conversed with this action.
	 * Has a reasonable count cap to prevent overflow yet still allow analytics.
	 * @param oldCount The count prior to beginning this conversation.
	 */
	protected incrementConversationCount(oldCount: number): Promise<number> {
		return this.package.userInfo.settings.setData(BaseHandler.conversationCountKey, Math.min(oldCount + 1, 10000));
	}

	/**
	 * Create a message to be stated by voice out of all the options that have been added to the response builder.
	 * This message will be added to responseBuilder directly.
	 * @param responseBuilder The response builder that will be modified to add the voice message.
	 */
	protected buildOptionsVoice(responseBuilder: IResponseBuilder): Promise<void> {
		const voiceMessages: string[] = responseBuilder
			.getOptions()
			.filter(option => option.voiceMessage)
			.map(option => option.voiceMessage);
		if (voiceMessages.length > 0) {
			const optionsMessage = Messages.concatenateOptionsList(voiceMessages);
			responseBuilder.addVoiceMessage(optionsMessage, 0);
		}
		return Promise.resolve();
	}

	//#region Image helpers
	/**
	 * Gets default fallback image
	 * @returns Promise for image url as a string
	 */
	protected getDefaultItemImageUrl(): Promise<string> {
		return this.package.userInfo.settings.getOrDefaultGlobalData(
			DEFAULT_ITEM_URL_KEY,
			'https://replaceMeWithDefaultImageURL'
		);
	}

	/**
	 * Gets image url based on the given IProduct
	 * @param product an IProduct object that provides the relevant information needed
	 *                to find the appropriate image url
	 * @returns Promise for image url as a string
	 */
	protected getItemImageUrl(product: IProduct): Promise<string> {
		return this.package.userInfo.settings
			.getOrDefaultGlobalData(IMAGE_BASE_URL_KEY, 'https://yourImageUrlHere/')
			.then(baseURL =>
				this.package.userInfo.settings.getOrDefaultGlobalData(IMAGE_TYPE_KEY, '.png?alt=media').then(imageType =>
					this.package.userInfo.settings.getOrDefaultGlobalData(IMAGE_BY_NAME_KEY, false).then(byName => {
						const imagePartUrl = encodeURI((byName ? product.name : product.sku || 'unknown').replace('/', '').trim());
						const imageUrl = `${baseURL}${imagePartUrl}${imageType}`;
						Logging.logger.log('Image for', product, imageUrl);
						return imageUrl;
					})
				)
			);
	}
	//#endregion
}
