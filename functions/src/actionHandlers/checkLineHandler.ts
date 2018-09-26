import { BaseHandler, PHONE_NUMBER_KEY, UserType } from './baseHandler';
import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Logging } from '../models/logger';

export abstract class CheckLineHandler extends BaseHandler {
	/**
	 * Builds the appropriate response to a request to get order status
	 * @param responseBuilder an Instance of an IResponseBuilder used to build the response
	 * @returns Promise for a ResponseType.Normal (i.e. flow will continue following this response being sent)
	 */
	protected abstract reply(responseBuilder: IResponseBuilder, param?: object);

	buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
		Logging.logger.log('checkLineHandler/buildResponse');
		return this.getPhoneNumber().then(phone => {
			if (phone) {
				return this.package.source.getPosition(phone).then(num => {
					if (num > 0) {
						responseBuilder.addMessages(Messages.position(phone, num));
						if (this.user === UserType.customer) {
							responseBuilder.addSuggestions({ title: Messages.sgnUpdatePhone() });
						} else {
							responseBuilder.addSuggestions(
								{ title: Messages.sgnNextCustomer() },
								{ title: Messages.sgnAddNewCustomer() }
							);
						}
						responseBuilder.addSuggestions({ title: Messages.sgnRemoveFromLine() }, { title: Messages.sgnCheckLine() });
						return ResponseType.Normal;
					} else {
						const param = { [PHONE_NUMBER_KEY]: phone };
						return this.reply(responseBuilder, param);
					}
				});
			}

			return this.reply(responseBuilder);
		});
	}
}
