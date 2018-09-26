import { IOrderItem, IAddress } from "./models/order";
import { DialogflowApp } from "actions-on-google/dialogflow-app";
import { Logging } from "./models/logger";

/**
 * A collection of helper functions.
 */
export class Utility {
    public static CONTEXT_NEW: string  = "conversation_new";
    public static ORDER_SELECTION_CONTEXT: string = "order-selection";

    /**
     * Takes in "amount" and returns said price with the tax added
     * @param amount The price you want to add tax to
     * @returns The price + tax
     */
    static addTax(amount: number): number {
        const tax: number = .13;

        const price = amount*(1 + tax);
        return price;
    }

    /**
     * Takes in "value" and returns it as a price 
     * eg. 15.0 => 15.00
     * @param value The number you want to convert to a price
     * @returns The number as a price
     */
    static roundTo(value: number): number {
        let negative: boolean = false;
        let n = value;

        if(n < 0) {
            negative = true;
            n = n * -1;
        }
        const multiplier = Math.pow(10, 2);
        n = parseFloat((n * multiplier).toFixed(11));
        n = +(Math.round(n) / multiplier).toFixed(2);
        if( negative ) {    
            n  = +(n * -1).toFixed(2);
        }
        return parseFloat(n.toFixed(2));
    }

    /**
     * Convert a price's decimal portion (cents) to nanos.  
     * Based on https://stackoverflow.com/questions/4512306/get-decimal-portion-of-a-number-with-javascript#comment53636643_4512317
     * 
     * Nanoes are a 9 digit integer representing the fractional portion of a price.
     * @param price Price to get nanos from.
     * @return Nanos from price.
     */
    static getNanos(price: number): number {
        return parseInt((price % 1).toFixed(9).substring(2));
    }

    /**
     * Get the whole value (value prior to decimal) from a number.
     * @param num Number to get whole value part from.
     * @return Whole value prior to decimal place.
     */
    static getWholeValue(num: number): number {
        return Math.floor(num);
    }

    /**
     * Will return the most expensive IOrderItem in an IOrderItem array; items must be defined and not be empty.
     * @param items The array of IOrderItems
     * @returns The most expensive IOrderItem
     */
    static getMostExpensiveItem (items: IOrderItem[]): IOrderItem {
        return items.sort((a, b) => b.product.unitPrice - a.product.unitPrice)[0];
    }
    
    /**
     *  Gets the address from an IOrderAddress, will return the address with a newline if "useNewlines" is set to true

     * @param address An IOrderAddress
     * @param useNewlines Default value is false, meant to determine if the address with be returned with newline
     * @returns A string of the address
     */
    static getAddressString (address: IAddress, useNewlines: boolean = false): string {
        let str = "";
        if (address) {
            str = `${address.address1}${address.address2 ? `${useNewlines ? '  \n' : ', '}${address.address2}` : ''}`;
        }
        return str;
    }

    /**
     * Returns a boolean about whether if the current conversation is new
     * @param app The DialogflowApp
     * @returns True if the current conversation is new, false if not
     */
    static isNewConversationV1(app: DialogflowApp): boolean {
        return (this.getV1ConversationState(app) === app.ConversationTypes.NEW || app.getContext(Utility.CONTEXT_NEW) ? true : false);
    }

    /**
     * Returns a enumeration (in this case sent as a number) to denote the conversation's state
     * @param app The DialogflowApp
     * @returns An enumeration of the the conversation state 
     */
    protected static getV1ConversationState(app: DialogflowApp): number {
        let result: number = app.ConversationTypes.UNSPECIFIED;
        const originalRequest = (<any>app).body_.originalRequest;       // body_ is a magical, undocumented, field on DialogflowApp that contains the original dialogflow request.
        if (originalRequest && originalRequest.data && originalRequest.data.conversation)
            result = originalRequest.data.conversation.type
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
        Logging.logger.warn("isNewConversationV2 is not implemented. Returning false.")
        return false;
    }
    
    /**
     * Truncate a string to a maximum length, if it is longer then three '.' will be added. 
     * @param str String to truncate.
     * @param maxLength Max length the string can be.
     */
    static truncateString(str: string, maxLength: number): string {
        return (str && str.length > maxLength) ? `${str.substr(0, maxLength - 3)}...` : str;
    }

    /**
     * Converts a and b to boolean then checks XOR on the result.
     * @param a First parameter.
     * @param b Second parameter.
     */
    static XOR(a: any, b: any): boolean {
        return (!a !== !b);
    }
}