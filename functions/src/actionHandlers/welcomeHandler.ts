import { BaseHandler } from './baseHandler';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Messages } from '../localization/messages';
import { Logging } from '../models/logger';

/**
 * Handle default entry intent, routes the user to the appropriate handler
 * based on their current circumstances.
 */

export class WelcomeHandler extends BaseHandler {
	/**
	 * Adds to the responseBuilder passed in, sending a welcome message to the user
	 * @param responseBuilder An IResponseBuilder object which represents a reply to the user
	 * @returns An enum ResponseType which is either "final" or "normal" to indicate the conversation's end
	 */
	buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
		Logging.logger.log('welcomeHandler/buildResponse');
		responseBuilder.addMessages(Messages.customerOrStaff());
		responseBuilder.addSuggestions({ title: Messages.sgnCustomer() }, { title: Messages.sgnStaff() });
		return Promise.resolve(ResponseType.Normal);
	}
}
