import { BaseHandler, PERMISSION } from './baseHandler';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Logging } from '../models/logger';
import { Messages } from '../localization/messages';

export class AskForStoreHandler extends BaseHandler {
    /**Builds the appropriate response to suggest a list of stores */
    buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        Logging.logger.log('AskForStoreHandler/buildResponse');
        let promise = Promise.resolve();
        if (this.package.app.isPermissionGranted()) {
            // invoked after asking for notification permission
            promise = this.package.userInfo.settings.setData(PERMISSION, true).then(() => Promise.resolve());
        }
        responseBuilder.addMessages(Messages.askStore());
        //both staff and customer get the same reply, so no need to abstract out reply
        return promise.then(() => this.package.source.getAvailableStores()).then(stores => {
            this.addStoreSuggestions(stores, responseBuilder);
            return ResponseType.Normal;
        });
    }
}
