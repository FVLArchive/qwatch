import { BaseHandler } from './baseHandler';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';

export class NotificationPermissionHandler extends BaseHandler {
	/**
	 * Builds the appropriate response to a request to get order status
	 * @param responseBuilder an Instance of an IResponseBuilder used to build the response
	 * @returns Promise for a ResponseType.Normal (i.e. flow will continue following this response being sent)
	 */

	buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
		this.package.app.askForUpdatePermission('send_notification', null);
		return Promise.resolve(ResponseType.Normal);
	}
}
