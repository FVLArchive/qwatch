import { BaseHandler } from './baseHandler';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';

export class NotificationPermissionHandler extends BaseHandler {
    /** Builds the appropriate response ask for permission for sending notification*/
    buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        this.package.app.askForUpdatePermission('send_notification', null);
        return Promise.resolve(ResponseType.Normal);
    }
}
