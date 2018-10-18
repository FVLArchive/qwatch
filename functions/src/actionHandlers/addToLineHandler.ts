import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { BaseHandler, UserType, PHONE_NUMBER_KEY, PERMISSION } from './baseHandler';
import { Logging } from '../models/logger';
import { QueueItem } from '../dataSources/source/source';

export abstract class AddToLineHandler extends BaseHandler {
    protected abstract reply(responseBuilder: IResponseBuilder, param?: string): Promise<ResponseType>;
    /** Adds a customer to line by getting the queue from database and modify it */
    buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        Logging.logger.log('AddToLineHandler/buildResponse');
        const phone = this.package.app.getArgument(PHONE_NUMBER_KEY).toString();
        const user: QueueItem = { Phone: phone };
        return this.package.userInfo.settings.getOrDefaultData(PERMISSION).then(sendNotification => {
            // add user id along with the phone number if customer is the one adding the app
            // use it to send notification to customer
            if (sendNotification && this.user == UserType.customer) {
                user.UserID = this.package.userInfo.userId;
            }
            return this.package.source.addToLine(user).then(num => {
                responseBuilder.addMessages(Messages.position(phone, num));
                let promise = Promise.resolve('');
                // store phone number to user is user is a customer
                if (this.user === UserType.customer) {
                    promise = this.package.userInfo.settings.setData(PHONE_NUMBER_KEY, phone);
                }
                return promise.then(() => this.reply(responseBuilder, phone));
            });
        });
    }
}
