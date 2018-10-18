import { BaseHandler } from './baseHandler';
import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Logging } from '../models/logger';

export abstract class CheckLineHandler extends BaseHandler {
    // implement customer/staff specific reply in CustomerHandler/StaffHandler
    protected abstract reply(
        responseBuilder: IResponseBuilder,
        inLine: boolean,
        queueLength?: number,
        phone?: string
    ): Promise<ResponseType>;

    /** Builds the appropriate response to a return the position of the customer or return the length of the current queue depending if a phone number is given or in line*/
    buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        Logging.logger.log('checkLineHandler/buildResponse');
        return this.getPhoneNumber().then(phone => {
            if (phone) {
                return this.package.source.getPosition(phone).then(num => {
                    // if the number is already in line
                    if (num > 0) {
                        responseBuilder.addMessages(Messages.position(phone, num));
                        responseBuilder.addSuggestions(
                            { title: Messages.sgnRemoveFromLine() },
                            { title: Messages.sgnCheckLine() }
                        );
                        return this.reply(responseBuilder, true);
                    }
                    // if the number is not in line
                    else {
                        return this.package.source.getNewPosition().then(length => {
                            return this.reply(responseBuilder, false, length, phone);
                        });
                    }
                });
            }
            // there is no phone number
            return this.package.source.getNewPosition().then(length => {
                return this.reply(responseBuilder, false, length);
            });
        });
    }
}
