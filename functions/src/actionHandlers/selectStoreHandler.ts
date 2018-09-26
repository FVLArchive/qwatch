import { BaseHandler, STORE_ID_KEY } from './baseHandler';
import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Logging } from '../models/logger';

export class SelectStoreHandler extends BaseHandler {
	/**
	 * Builds the appropriate response to a request to get order status
	 * @param responseBuilder an Instance of an IResponseBuilder used to build the response
	 * @returns Promise for a ResponseType.Normal (i.e. flow will continue following this response being sent)
	 */
	buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
		Logging.logger.log('checkLineHandler/buildResponse');
		const storeid = this.package.app.getSelectedOption();
		return this.package.source.getAvailableStores().then(stores => {
			const index = stores.findIndex(store => store.Id === storeid);
			if (index > -1) {
				const storeName = stores[index].Name;
				this.package.app.userStorage[STORE_ID_KEY] = storeid;
				responseBuilder.addMessages(Messages.storeSet(storeName));
				responseBuilder.addSuggestions({ title: Messages.sgnCheckLine() });
			} else {
				responseBuilder.addMessages(Messages.invalidStore());
				this.addStoreSuggestions(stores, responseBuilder);
			}
			return Promise.resolve(ResponseType.Normal);
		});
	}
}
