import { DialogflowApp } from 'actions-on-google';
import { ISource } from './dataSources/source/source';
import { SourceFactory } from './dataSources/source/sourceFactory';
import { UserInfo } from './models/userInfo';
import { Messages } from './localization/messages';
//Handlers
import { IActionHandlerPackage, IActionHandler } from './actionHandlers/IActionHandler';
import { Logging } from './models/logger';
import { WelcomeHandler } from './actionHandlers/welcomeHandler';
import {
    CustomerRemoveFromLineHandler,
    CustomerWaitInLineHandler,
    CustomerUpdatePhoneHandler,
    CustomerCheckLineHandler
} from './actionHandlers/customerHandler';
import {
    StaffAddToLineHandler,
    StaffNextInLineHandler,
    StaffRemoveFromLineHandler,
    StaffCheckLineHandler
} from './actionHandlers/staffHandlers';
import { SelectStoreHandler } from './actionHandlers/selectStoreHandler';
import { AskForStoreHandler } from './actionHandlers/askForStoreHandler';
import { NotificationPermissionHandler } from './actionHandlers/notificationPermissionHandler';

export class ActionHandlers {
    /** A Map of handlers that are invoked by DialogflowApp when it receives an action string from an intent invocation. */
    static readonly handlers: Map<string, (app: DialogflowApp) => any> = new Map([
        // ['default', ActionHandlers.default],
        ['input.welcome', ActionHandlers.welcome],
        // ['input.unknown', ActionHandlers.unknownInput],
        // ['message.repeat', ActionHandlers.repeat],
        // customer
        ['customer.checkLine', ActionHandlers.customerCheckLine],
        ['customer.waitInLine', ActionHandlers.customerAddToLine],
        ['customer.removeFromLine', ActionHandlers.customerRemoveFromLine],
        ['customer.updatePhone', ActionHandlers.customerUpdatePhone],
        // // sales
        ['staff.addCustomerInLine', ActionHandlers.staffAddToLine],
        ['staff.nextCustomer', ActionHandlers.staffNextCustomer],
        ['staff.removeCustomerFromLine', ActionHandlers.staffRemoveFromLine],
        ['staff.checkCurrentLine', ActionHandlers.staffCheckLine],
        //select identity
        ['select.staff', ActionHandlers.askForStore],
        ['select.customer', ActionHandlers.enableNotification],

        ['finish.push.setup', ActionHandlers.askForStore],

        ['select.store', ActionHandlers.selectStore],
        ['change.store', ActionHandlers.askForStore],
        ['enable.notification', ActionHandlers.enableNotification]
    ]);

    /**
     * Get user information regarding the current user in the conversation.
     * @param app Instance of DialogflowApp
     */
    static getUserInfo(app: DialogflowApp): Promise<UserInfo> {
        const user = app.getUser();
        return new UserInfo(user.userId).init();
    }

    static getSource(userInfo: UserInfo): Promise<ISource> {
        return SourceFactory.getSource(userInfo);
    }

    static getHandlerPackage(app: DialogflowApp): Promise<IActionHandlerPackage> {
        return ActionHandlers.getUserInfo(app).then(userInfo => {
            return ActionHandlers.getSource(userInfo).then(source => {
                const pkg: IActionHandlerPackage = {
                    app: app,
                    userInfo: userInfo,
                    source: source
                };
                return pkg;
            });
        });
    }

    static handle(app: DialogflowApp, actionHandler: IActionHandler): Promise<void> {
        return ActionHandlers.getHandlerPackage(app)
            .then(pkg => actionHandler.init(pkg))
            .then(handler => handler.respond())
            .catch(err => {
                Logging.logger.error('Handling action', err);
                app.tell(Messages.errorHandlingResponse());
                // TODO: notify somebody
            });
    }

    static welcome(app: DialogflowApp): Promise<void> {
        return ActionHandlers.handle(app, new WelcomeHandler());
    }
    static enableNotification(app: DialogflowApp): Promise<void> {
        return ActionHandlers.handle(app, new NotificationPermissionHandler());
    }
    static customerCheckLine(app): Promise<void> {
        return ActionHandlers.handle(app, new CustomerCheckLineHandler());
    }

    static customerRemoveFromLine(app): Promise<void> {
        return ActionHandlers.handle(app, new CustomerRemoveFromLineHandler());
    }

    static customerAddToLine(app): Promise<void> {
        return ActionHandlers.handle(app, new CustomerWaitInLineHandler());
    }

    static customerUpdatePhone(app): Promise<void> {
        return ActionHandlers.handle(app, new CustomerUpdatePhoneHandler());
    }

    static staffAddToLine(app): Promise<void> {
        return ActionHandlers.handle(app, new StaffAddToLineHandler());
    }

    static staffNextCustomer(app): Promise<void> {
        return ActionHandlers.handle(app, new StaffNextInLineHandler());
    }

    static staffRemoveFromLine(app): Promise<void> {
        return ActionHandlers.handle(app, new StaffRemoveFromLineHandler());
    }

    static staffCheckLine(app): Promise<void> {
        return ActionHandlers.handle(app, new StaffCheckLineHandler());
    }

    static askForStore(app): Promise<void> {
        return ActionHandlers.handle(app, new AskForStoreHandler());
    }

    static selectStore(app): Promise<void> {
        return ActionHandlers.handle(app, new SelectStoreHandler());
    }
}
