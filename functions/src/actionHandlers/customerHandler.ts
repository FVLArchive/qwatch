import { UserType, WAIT_IN_LINE_CONTEXT, BaseHandler, PHONE_NUMBER_KEY } from './baseHandler';
import { RemoveFromLineHandler } from './removeFromLineHandler';
import { AddToLineHandler } from './addToLineHandler';
import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Logging } from '../models/logger';
import { CheckLineHandler } from './checkLineHandler';

/** Handle showing the status of the user's latest, open order */
export class CustomerRemoveFromLineHandler extends RemoveFromLineHandler {
    user = UserType.customer;
    reply(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        return Promise.resolve(ResponseType.Normal);
    }
}

/** Handle showing the status of the user's latest, open order */
export class CustomerWaitInLineHandler extends AddToLineHandler {
    user = UserType.customer;
    reply(responseBuilder: IResponseBuilder, phone: string): Promise<ResponseType> {
        responseBuilder.addMessages(Messages.notifyAction(phone));
        responseBuilder.addSuggestions({ title: Messages.sgnUpdatePhone() });
        return Promise.resolve(ResponseType.Normal);
    }
}

export class CustomerUpdatePhoneHandler extends BaseHandler {
    user = UserType.customer;
    buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        Logging.logger.log('UpdatePhoneHandler/buildResponse');
        return this.package.userInfo.settings.getOrDefaultData<string>(PHONE_NUMBER_KEY).then(oldPhone => {
            const newPhone = this.package.app.getArgument(PHONE_NUMBER_KEY).toString();
            let promise = Promise.resolve();

            return this.package.source.updatePhoneInQueue(oldPhone, newPhone).then(success => {
                if (!success) responseBuilder.addMessages(Messages.alreadyInUse(newPhone));
                else {
                    promise = this.package.userInfo.settings.setData(PHONE_NUMBER_KEY, newPhone).then(() => {
                        responseBuilder.addMessages(Messages.updatePhoneSuccess(newPhone));
                    });
                }
                responseBuilder.addSuggestions({ title: Messages.sgnCheckLine() }, { title: Messages.sgnUpdatePhone() });
                return promise.then(() => ResponseType.Normal);
            });
        });
    }
}

export class CustomerCheckLineHandler extends CheckLineHandler {
    user = UserType.customer;
    reply(responseBuilder: IResponseBuilder, inLine: boolean, queueLength?: number, phone?: string): Promise<ResponseType> {
        if (inLine) {
            responseBuilder.addSuggestions({ title: Messages.sgnUpdatePhone() });
        }
        // if customer is not in line, ask if they want to get in line
        else {
            if (queueLength === 0) {
                responseBuilder.addMessages(Messages.comeToFittingRoom());
                responseBuilder.addSuggestions({ title: Messages.sgnCheckLine() });
            } else {
                if (phone) {
                    // put this into context so that phone number will not be required to re-enter
                    // phone number is already in database
                    this.package.app.setContext(WAIT_IN_LINE_CONTEXT, 2, { [PHONE_NUMBER_KEY]: phone });
                }
                responseBuilder.addMessages(Messages.addInLine(queueLength));
                responseBuilder.addSuggestions({ title: Messages.sgnYes() }, { title: Messages.sgnNo() });
            }
        }
        return Promise.resolve(ResponseType.Normal);
    }
}
