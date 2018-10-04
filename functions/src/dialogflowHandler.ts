import { IMessage } from "./models/v2ResponseTypes";
import { DialogflowApp } from "actions-on-google";
import { ActionHandlers } from "./actionHandlers";
//import { PayMethodDisplayHandler, PayMethodChangeHandler } from "./actionHandlers/paymentMethodHandler";

interface IDialogflowResponse {
    fulfillmentText?: string;
    fulfillmentMessages?: string | IMessage[];
    outputContexts?: string;
}

export class DialogflowResponse implements IDialogflowResponse {
    fulfillmentText?: string;
    fulfillmentMessages?: string | IMessage[];
    outputContexts?: string;
}

export class DialogflowHandler {
    processV1Request(request, response) {
        const app = new DialogflowApp({ request, response });
        return app.handleRequestAsync(ActionHandlers.handlers);
    }
}
