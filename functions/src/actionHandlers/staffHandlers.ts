import { UserType, BaseHandler } from './baseHandler';
import { RemoveFromLineHandler } from './removeFromLineHandler';
import { AddToLineHandler } from './addToLineHandler';
import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Logging } from '../models/logger';
import { CheckLineHandler } from './checkLineHandler';
import { Utility } from '../utility';

export class StaffRemoveFromLineHandler extends RemoveFromLineHandler {
    user = UserType.staff;
    addSuggestions(responseBuilder: IResponseBuilder): void {
        responseBuilder.addSuggestions(
            { title: Messages.sgnNextCustomer() },
            { title: Messages.sgnAddNewCustomer() },
            { title: Messages.sgnRemoveFromLine() },
            { title: Messages.sgnCheckLine() }
        );
    }
}

export class StaffAddToLineHandler extends AddToLineHandler {
    user = UserType.staff;
    reply(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        responseBuilder.addSuggestions(
            { title: Messages.sgnNextCustomer() },
            { title: Messages.sgnAddNewCustomer() },
            { title: Messages.sgnRemoveFromLine() },
            { title: Messages.sgnCheckLine() }
        );
        return Promise.resolve(ResponseType.Normal);
    }
}

export class StaffNextInLineHandler extends BaseHandler {
    buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        Logging.logger.log('StaffNextInLineHandler/buildResponse');
        return this.package.source.goToNext().then(next => {
            if (next) {
                if (next.UserID) {
                    Utility.sendNotification(next.UserID, 'Your Turn', 'send_notification');
                }
                responseBuilder.addMessages(Messages.notify(next.Phone));
                return this.package.source.getNewPosition().then(length => {
                    if (length) {
                        responseBuilder.addSuggestions(
                            { title: Messages.sgnNextCustomer() },
                            { title: Messages.sgnRemoveFromLine() }
                        );
                    } else {
                        responseBuilder.addMessages(Messages.lastInLine());
                    }
                    responseBuilder.addSuggestions({ title: Messages.sgnAddNewCustomer() }, { title: Messages.sgnCheckLine() });
                    return ResponseType.Normal;
                });
            } else {
                responseBuilder.addMessages(Messages.noOneInLine());
                responseBuilder.addSuggestions({ title: Messages.sgnAddNewCustomer() }, { title: Messages.sgnCheckLine() });
                return ResponseType.Normal;
            }
        });
    }
}

export class StaffCheckLineHandler extends CheckLineHandler {
    user = UserType.staff;
    reply(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        return this.package.source.getNewPosition().then(length => {
            if (length === 0) {
                responseBuilder.addMessages(Messages.noOneInLine());
            } else {
                responseBuilder.addMessages(Messages.peopleInLine(length));
                responseBuilder.addSuggestions({ title: Messages.sgnNextCustomer() }, { title: Messages.sgnRemoveFromLine() });
            }
            responseBuilder.addSuggestions({ title: Messages.sgnAddNewCustomer() });
            return ResponseType.Normal;
        });
    }
}
