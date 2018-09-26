import * as functions from 'firebase-functions';
import { DialogflowHandler } from './dialogflowHandler';
import * as uuid from 'uuid/v4';
import * as admin from 'firebase-admin';
// import { MockAcmeApi } from './dataSources/mockServices/mockAcmeApi/mockAcmeApi';
import { Logging } from './models/logger';
import { UserStateProviderFactory } from './dataSources/userState/userStateProviderFactory';
import { Request, Response } from 'express';
//import { AcmeApi } from './dataSources/mockServices/acmeApi';

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
	// const app = new DialogflowApp({ request, response });
	// const user = app.getUser();
	// if (
	// 	user &&
	// 	user.userName &&
	// 	IGNORE_GIVEN_NAME_PATTERN.test(user.userName.givenName) &&
	// 	IGNORE_FAMILY_NAME_PATTERN.test(user.userName.familyName)
	// )
	// 	return Promise.resolve(AllowedRequestResult.Ignore);

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
			//dialogFlowHandler.processV2Request(request, response);
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
	console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
	return processDialogflowFulfillment(request, response, initializeFirebase);
});

/**
 * Function for authTest endpoint on Firebase
 */
export const authTest = functions.https.onRequest((req, res) => {
	console.log(req.query);

	initializeFirebase();

	const accessToken = uuid();
	admin
		.database()
		.ref(`/auth/${req.query.client_id}`)
		.push(accessToken);
	const redirectUri = `${req.query.redirect_uri}#access_token=${accessToken}&token_type='bearer'&state=${
		req.query.state
	}`;
	console.log(`Redirect URI: ${redirectUri}`);
	res.redirect(redirectUri);
});

/**
 * Function for test endpoint on Firebase
 */
export const test = functions.https.onRequest((req, res) => res.send(req.query.text));

export const testNotification = functions.https.onRequest((req, res) => {
	const { google } = require('googleapis');
	const key = require('./Qwatch-af80ad63750c');
	const request = require('request');
	console.log(google.auth);
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
			userNotification: {
				title: 'Your Turn'
			},
			target: {
				userId: 'ABwppHHM0TRo9axhVf-t0xqs922GCyUYHhz3b_9VlUuraNedTREpm2LPJi9PNkGT-yR2P_bWNCuIrQZfjIeFWQ',
				intent: 'send_notification'
			}
		};
		console.log(err);
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
					res.end();
				}
			);
		}
	});
});
