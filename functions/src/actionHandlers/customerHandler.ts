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
    addSuggestions(responseBuilder: IResponseBuilder): void {
        responseBuilder.addSuggestions({ title: Messages.sgnCheckLine() });
    }
}

/** Handle showing the status of the user's latest, open order */
export class CustomerWaitInLineHandler extends AddToLineHandler {
    user = UserType.customer;
    reply(responseBuilder: IResponseBuilder, phone: string): Promise<ResponseType> {
        responseBuilder.addMessages(Messages.notifyAction(phone));
        responseBuilder.addSuggestions(
            { title: Messages.sgnUpdatePhone() },
            { title: Messages.sgnRemoveFromLine() },
            { title: Messages.sgnCheckLine() }
        );
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
    reply(responseBuilder: IResponseBuilder, param: object = {}): Promise<ResponseType> {
        return this.package.source.getNewPosition().then(length => {
            if (length === 0) {
                responseBuilder.addMessages(Messages.comeToFittingRoom());
                responseBuilder.addSuggestions({ title: Messages.sgnCheckLine() });
            } else {
                this.package.app.setContext(WAIT_IN_LINE_CONTEXT, 2, param);
                responseBuilder.addMessages(Messages.addInLine(length));
                responseBuilder.addSuggestions({ title: Messages.sgnYes() }, { title: Messages.sgnNo() });
            }
            return ResponseType.Normal;
        });
    }
}
