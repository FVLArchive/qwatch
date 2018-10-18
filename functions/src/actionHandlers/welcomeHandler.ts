import { BaseHandler } from './baseHandler';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Messages } from '../localization/messages';
import { Logging } from '../models/logger';

/**
 * Handle default entry intent, routes the user to the appropriate handler
 * based on their current circumstances.
 */

export class WelcomeHandler extends BaseHandler {
    /**Check if user is staff or customer on welcome*/
    buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
        Logging.logger.log('welcomeHandler/buildResponse');
        //Let user identify as staff or customer
        responseBuilder.addMessages(Messages.customerOrStaff());
        responseBuilder.addSuggestions({ title: Messages.sgnCustomer() }, { title: Messages.sgnStaff() });
        return Promise.resolve(ResponseType.Normal);
    }
}
