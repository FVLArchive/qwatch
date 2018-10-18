import { DialogflowApp } from 'actions-on-google';
import { UserInfo } from '../models/userInfo';
import { ISource } from '../dataSources/source/source';
import { ResponseType } from '../models/IResponseBuilder';

/**
 * A package used to be passed to an instance of an IActionHandler.
 * Contains all information and data sources that are required to create a response.
 */
export interface IActionHandlerPackage {
    /** The instance of Dialogflow App that is used throughout the function call. Used with the V1 dialogflow API. */
    app: DialogflowApp;
    /** An interface used to gather user settings */
    userInfo: UserInfo;
    /** An interface used to interact with the stored data */
    source: ISource;

    // v2 support
    /** The request object that contains the data provided by Dialogflow to these functions. Used with the V2 Dialogflow API. */
    request?: any;
    /** The response object to contain data to be provided to Dialogflow to display messages. Used with the V2 Dialogflow API. */
    response?: any;
}

/**
 * Handler to perform business logic and respond to the user.
 * Note that implementations of IActionHandler should focus on WHAT to communicate to the user
 * whereas implementations of IResponseBuilder should focus on HOW it is communicated.
 */
export interface IActionHandler {
    /**
     * Initializes the action handler, generally by storing the package.
     * @param IActionHandlerPackage The already initialized package that this action handler will base the request off of.
     * @returns This action handler
     */
    init(IActionHandlerPackage): Promise<IActionHandler>;
    /**
     * Performs all functionality required by the current request.
     * Any messages to be displayed will be added to the provided response builder.
     * Any information required will be taken from the package provided during initialization.
     * @param IResponseBuilder All new messages will be appended to this response builder.
     * @returns Whether this conversation should be continued or ended after the response.
     */
    buildResponse(IResponseBuilder): Promise<ResponseType>;
    /**
     * The primary method called to carry out all the handler's functionality as well as create and send the associated response
     */
    respond(): Promise<void>;
}
