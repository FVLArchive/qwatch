export class Messages /*implements IResponsesSource*/ {
    static testing = false;

    /**
     * Will return one of the strings given in the options string array
     * @param options An array of strings that can be potentially returned
     */
    private static getOneOf(options: string[]): string {
        if (!Messages.testing) {
            return options[Math.floor(Math.random() * options.length)];
        }
        return options[0];
    }

    static vendorName = 'Qwatch';

    /** Welcome message when the user is familiar with us */
    static familiarWelcomeMessage(): string {
        return Messages.getOneOf([`Hi, this is ${Messages.vendorName}.`, `Hello, this is ${Messages.vendorName}.`]);
    }

    /** Returns no problem message */
    static defaultListMessage(): string {
        return Messages.getOneOf([`Here are your options:`]);
    }

    /** Welcome message when the user is unfamiliar with us */
    static helpMessage(): string {
        return `In this app, you can line up virtually, saving your time.`;
    }

    /** Welcome message when the user is unfamiliar with us */
    static introductoryWelcomeMessage(): string {
        return Messages.getOneOf([`${Messages.familiarWelcomeMessage()} ${Messages.helpMessage()}`]);
    }

    static welcomeNotSignedInSurfaceSwitchRequiredNotificationMessage(): string {
        return `Continue signing in with ${Messages.vendorName}`;
    }

    //Qwatch messages
    static position(phone: string, num: number): string {
        return `${phone} is number ${num} in line.`;
    }

    static lastInLine(): string {
        return `This is the last person in line.`;
    }

    static notInLine(phone: string): string {
        return `${phone} were not in line.`;
    }
    static noOneInLine(): string {
        return `There is no one in line.`;
    }
    static comeToFittingRoom(): string {
        return `${Messages.noOneInLine()} Please come now.`;
    }

    static peopleInLine(length: number) {
        if (length === 1) return `There is ${length} person in line.`;
        return `There are ${length} people in line.`;
    }

    static addInLine(length: number): string {
        return `${this.peopleInLine(length)} Would you like to get in line?`;
    }

    static removedFromLine(phone: string): string {
        return `${phone} have been removed from the line.`;
    }

    static notifyAction(phone: string): string {
        return `You will receive a call at ${phone} when it is almost your turn.`;
    }

    static notify(phone: string): string {
        return `Call ${phone} to notify them it's their turn.`;
    }

    static askStore(): string {
        return 'Which store are you in?';
    }

    static listStore(): string {
        return 'Here is a list of stores you can choose from:';
    }

    static alreadyInUse(phone: string): string {
        return `${phone} is already in use. Please use another number.`;
    }

    static updatePhoneSuccess(phone: string): string {
        return `Successfully changed phone number to ${phone}`;
    }

    static storeSet(name: string): string {
        return `Your store has been set to ${name}`;
    }

    static invalidStore(): string {
        return `Please select from the provided list.`;
    }

    static customerOrStaff(): string {
        return 'Are you a customer or staff?';
    }

    // action handler errors

    /** General error for when handling the request fails */
    static errorHandlingResponse(): string {
        return Messages.getOneOf([`Sorry, I'm having trouble handling your request at the moment.`]);
    }

    // action handler errors end

    /* Generic messages */

    /** Suggestion stating to check line */
    static sgnCheckLine(): string {
        return `Check line`;
    }

    /** Suggestion stating to try again */
    static sgnRemoveFromLine(): string {
        return `Remove`;
    }

    /** Suggestion for yes */
    static sgnYes(): string {
        return `Yes`;
    }

    /** Suggestion for no*/
    static sgnNo(): string {
        return `Nope`;
    }

    static sgnUpdatePhone(): string {
        return `Update phone`;
    }

    static sgnAddNewCustomer(): string {
        return `Add`;
    }

    static sgnNextCustomer(): string {
        return `Next customer`;
    }

    static sgnCustomer(): string {
        return `Customer`;
    }

    static sgnStaff(): string {
        return `Staff`;
    }

    /**
     * Combines a list of options into a sentence stating they are options.
     * @param messages The strings options that are to be displayed in the text list.
     * @example concatenateOptionsList(["apple", "orange", "banana"]) === "Your options are apple, orange and banana."
     * @returns the readable sentence or null if the provided string array was empty or null.
     */
    static concatenateOptionsList(messages: string[]): string {
        if (messages) {
            return `Your options are ${Messages.concatenateMessagesList(messages)}.`;
        } else return null;
    }

    /**
     * Converts an array of strings into a readable list of those strings.
     * The first n-1 strings will be comma separated and the last will be separated by 'and'.
     * @example concatenateReadableList(["apple", "orange", "banana"]) === "apple, orange and banana"
     * @returns the readable result or null if the string array was empty or null.
     */
    static concatenateMessagesList(messages: string[]): string {
        if (messages) {
            switch (messages.length) {
                case 0:
                    return null;
                case 1:
                    return messages[0];
                default:
                    const responses: string[] = [];
                    for (let i = 0; i < messages.length - 1; i++) {
                        // Loop through all message EXCEPT for the last message: The last one will be handled outside the loop.
                        responses.push(messages[i]);
                    }
                    return `${responses.join(', ')} and ${messages[messages.length - 1]}`;
            }
        } else return null;
    }
}
