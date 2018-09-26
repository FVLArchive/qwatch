import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { BaseHandler } from './baseHandler';
import { Logging } from '../models/logger';

export const MAKE_ANOTHER_ORDER_KEY: string = 'make_another_order';

/** Handle showing the status of the user's latest, open order */
export abstract class RemoveFromLineHandler extends BaseHandler {
	abstract addSuggestions(responseBuilder: IResponseBuilder): void;
	/**
	 * Builds the appropriate response to a request to get order status
	 * @param responseBuilder an Instance of an IResponseBuilder used to build the response
	 * @returns Promise for a ResponseType.Normal (i.e. flow will continue following this response being sent)
	 */
	buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
		Logging.logger.log('RemoveFromLineHandler/buildResponse');
		return this.getPhoneNumber().then(phone => {
			return this.package.source.removeFromLine(phone).then(success => {
				if (success) responseBuilder.addMessages(Messages.removedFromLine(phone));
				else responseBuilder.addMessages(Messages.notInLine(phone));
				this.addSuggestions(responseBuilder);
				return ResponseType.Normal;
			});
		});
	}
}
