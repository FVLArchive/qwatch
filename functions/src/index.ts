import * as functions from 'firebase-functions';
import { DialogflowHandler } from './dialogflowHandler';
import * as admin from 'firebase-admin';
import { Logging } from './models/logger';
import { UserStateProviderFactory } from './dataSources/userState/userStateProviderFactory';
import { Request, Response } from 'express';

/**
 * Initializes firebase when starting the session
 */
function initializeFirebase() {
    if (admin.apps.length === 0) {
        admin.initializeApp(functions.config().firebase);
    }
}

const ACCESS_TOKEN_KEY = 'fulfillmentAccessToken';
const DEFAULT_ACCESS_TOKEN = 'CMW30zdzlcYYFUei';
// const IGNORE_GIVEN_NAME_PATTERN = /Google/;
// const IGNORE_FAMILY_NAME_PATTERN = /Crawler/;

/** Indicator on how to proceed with a request */
enum AllowedRequestResult {
    Continue,
    Ignore,
    Block
}

/**
 * Determine whether or not the request should be processed.
 * We are using a basic access token that can be configured in the global settings to guard against crawlers and other unwanted clients
 */
function allowRequest(request: Request, response: Response): Promise<AllowedRequestResult> {
    if (request.headers.fulfillmentaccesstoken)
        return UserStateProviderFactory.createUserStateProvider('')
            .then(settings => settings.getOrDefaultGlobalData(ACCESS_TOKEN_KEY, DEFAULT_ACCESS_TOKEN))
            .then(
                token =>
                    token === request.headers.fulfillmentaccesstoken ? AllowedRequestResult.Continue : AllowedRequestResult.Block
            );

    // return Promise.resolve(AllowedRequestResult.Block);
    return Promise.resolve(AllowedRequestResult.Continue);
}

/**
 * Process the Dialogflow fulfillment call.
 * @param request Express request
 * @param response Express response
 * @param initializeFirebaseConfig Function to initialize the Firebase Admin Configuration
 */
export function processDialogflowFulfillment(
    request: Request,
    response: Response,
    initializeFirebaseConfig: () => void
): Promise<Response> {
    initializeFirebaseConfig();
    return Logging.createLogger().then(logger => {
        const dialogFlowHandler = new DialogflowHandler();
        if (request.body.result) {
            return allowRequest(request, response).then(result => {
                switch (result) {
                    case AllowedRequestResult.Continue:
                        return dialogFlowHandler
                            .processV1Request(request, response)
                            .catch(e => {
                                const error = <Error>e;
                                logger.error(error);
                                response.status(500).send(error.message);
                            })
                            .catch(e => logger.error(`Error! ${e.message}`));
                    case AllowedRequestResult.Ignore:
                        return response.status(204).send();
                    case AllowedRequestResult.Block:
                        return response.status(401).send('Unauthorized');
                }
            });
        } else if (request.body.queryResult) {
            return response.status(400).send('Webhook Request v2 is currently not supported');
        } else {
            logger.warn('Invalid Request');
            return response.status(400).send('Invalid Webhook Request (expecting v1 webhook request)');
        }
    });
}

/**
 * Function for dialogflowFirebaseFulfillment endpoint (the main endpoint of the project)
 * on Firebase
 */
export const dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    return processDialogflowFulfillment(request, response, initializeFirebase);
});
