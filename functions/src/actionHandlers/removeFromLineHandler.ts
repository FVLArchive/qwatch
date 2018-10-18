import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { BaseHandler } from './baseHandler';
import { Logging } from '../models/logger';

export abstract class RemoveFromLineHandler extends BaseHandler {
    protected abstract reply(responseBuilder: IResponseBuilder): Promise<ResponseType>;
    /**remove a phone number from the queue of the current store the user is in*/
    buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        Logging.logger.log('RemoveFromLineHandler/buildResponse');
        return this.getPhoneNumber().then(phone => {
            if (!phone) {
                responseBuilder.addMessages(Messages.noPhoneProvided());
                return Promise.resolve(ResponseType.Normal);
            }
            return this.package.source.removeFromLine(phone).then(success => {
                if (success) responseBuilder.addMessages(Messages.removedFromLine(phone));
                else responseBuilder.addMessages(Messages.notInLine(phone));
                responseBuilder.addSuggestions({ title: Messages.sgnCheckLine() });
                return this.reply(responseBuilder);
            });
        });
    }
}
