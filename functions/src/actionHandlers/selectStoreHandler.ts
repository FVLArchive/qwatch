import { BaseHandler, STORE_ID_KEY } from './baseHandler';
import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Logging } from '../models/logger';

export class SelectStoreHandler extends BaseHandler {
    /**Set the current store to the selected store, reply with a list of available stores if store is invalid*/
    buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        Logging.logger.log('selectStoreHandler/buildResponse');
        // which option user chose from list on the app
        const storeid = this.package.app.getSelectedOption();
        return this.package.source.getAvailableStores().then(stores => {
            const index = stores.findIndex(store => store.Id === storeid);
            // if store exists
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
