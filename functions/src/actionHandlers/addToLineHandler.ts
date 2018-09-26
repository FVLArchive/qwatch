import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { BaseHandler, UserType, PHONE_NUMBER_KEY, PERMISSION } from './baseHandler';
import { Logging } from '../models/logger';
import { QueueItem } from '../dataSources/source/source';

/** Handle showing the status of the user's latest, open order */
export abstract class AddToLineHandler extends BaseHandler {
	/**
	 * Builds the appropriate response to a request to get order status
	 * @param responseBuilder an Instance of an IResponseBuilder used to build the response
	 * @returns Promise for a ResponseType.Normal (i.e. flow will continue following this response being sent)
	 */
	buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
		Logging.logger.log('AddToLineHandler/buildResponse');
		const phone = this.package.app.getArgument(PHONE_NUMBER_KEY).toString();
		const user: QueueItem = { Phone: phone };
		return this.package.userInfo.settings.getOrDefaultData(PERMISSION).then(sendNotification => {
			if (sendNotification && this.user == UserType.customer) {
				user.UserID = this.package.userInfo.userId;
			}
			return this.package.source.addToLine(user).then(num => {
				responseBuilder.addMessages(Messages.position(phone, num));
				let promise = Promise.resolve();
				if (this.user === UserType.customer) {
					promise = this.package.userInfo.settings.setData(PHONE_NUMBER_KEY, phone).then(() => {
						responseBuilder.addMessages(Messages.notifyAction(phone));
						responseBuilder.addSuggestions({ title: Messages.sgnUpdatePhone() });
					});
				} else {
					responseBuilder.addSuggestions(
						{ title: Messages.sgnNextCustomer() },
						{ title: Messages.sgnAddNewCustomer() }
					);
				}
				responseBuilder.addSuggestions({ title: Messages.sgnRemoveFromLine() }, { title: Messages.sgnCheckLine() });
				return promise.then(() => ResponseType.Normal);
			});
		});
	}
}
