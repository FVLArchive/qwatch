import { DialogflowApp } from 'actions-on-google/dialogflow-app';
import { Logging } from './models/logger';

/**
 * A collection of helper functions.
 */
export class Utility {
    public static CONTEXT_NEW: string = 'conversation_new';

    /**
     * Returns a boolean about whether if the current conversation is new
     * @param app The DialogflowApp
     * @returns True if the current conversation is new, false if not
     */
    static isNewConversationV1(app: DialogflowApp): boolean {
        return this.getV1ConversationState(app) === app.ConversationTypes.NEW || app.getContext(Utility.CONTEXT_NEW)
            ? true
            : false;
    }

    /**
     * Returns a enumeration (in this case sent as a number) to denote the conversation's state
     * @param app The DialogflowApp
     * @returns An enumeration of the the conversation state
     */
    protected static getV1ConversationState(app: DialogflowApp): number {
        let result: number = app.ConversationTypes.UNSPECIFIED;
        const originalRequest = (<any>app).body_.originalRequest; // body_ is a magical, undocumented, field on DialogflowApp that contains the original dialogflow request.
        if (originalRequest && originalRequest.data && originalRequest.data.conversation)
            result = originalRequest.data.conversation.type;
        Logging.logger.log(`Conversation state is: ${result}`);
        return result;
    }

    /**
     * Returns a boolean about whether if the current conversation is new
     * Currently not implemented
     * @returns False all the time as this is currently not implemented
     */
    static isNewConversationV2(): boolean {
        //TODO: Implement V2 isNewConversation
        Logging.logger.warn('isNewConversationV2 is not implemented. Returning false.');
        return false;
    }
    /**
     * Converts a and b to boolean then checks XOR on the result.
     * @param a First parameter.
     * @param b Second parameter.
     */
    static XOR(a: any, b: any): boolean {
        return !a !== !b;
    }

    /**
     * Sends a notification to google assistant
     * @param userId user id receiver of notification
     * @param title title of the notification
     * @param intent intent to invoke in dialogflow
     */
    static sendNotification(userId: string, title: string, intent: string): void {
        const { google } = require('googleapis');
        const key = require('./config/serviceAccount');
        const request = require('request');

        let jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            ['https://www.googleapis.com/auth/actions.fulfillment.conversation'],
            null
        );

        jwtClient.authorize((err, tokens) => {
            // code to retrieve target userId and intent
            let notif = {
                userNotification: { title },
                target: { userId, intent }
            };
            if (tokens) {
                request.post(
                    'https://actions.googleapis.com/v2/conversations:send',
                    {
                        auth: {
                            bearer: tokens.access_token
                        },
                        json: true,
                        body: { customPushMessage: notif }
                    },
                    (error, httpResponse, body) => {
                        console.log(httpResponse.statusCode + ': ' + httpResponse.statusMessage);
                    }
                );
            }
        });
    }
}
