import { BaseHandler, PERMISSION } from './baseHandler';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Logging } from '../models/logger';
import { Messages } from '../localization/messages';

export class AskForStoreHandler extends BaseHandler {
	/**
	 * Builds the appropriate response to a request to get order status
	 * @param responseBuilder an Instance of an IResponseBuilder used to build the response
	 * @returns Promise for a ResponseType.Normal (i.e. flow will continue following this response being sent)
	 */
	buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
		Logging.logger.log('AskForStoreHandler/buildResponse');
		let promise = Promise.resolve();
		if (this.package.app.isPermissionGranted()) {
			promise = this.package.userInfo.settings.setData(PERMISSION, true).then(() => Promise.resolve());
		}
		responseBuilder.addMessages(Messages.askStore());
		return promise.then(() => this.package.source.getAvailableStores()).then(stores => {
			this.addStoreSuggestions(stores, responseBuilder);
			return ResponseType.Normal;
		});
	}
}
