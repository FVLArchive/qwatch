/**
 * Represents a type of payment method of the user
 * For example, cash, debit, credit etc.
 */
export interface IPaymentMethod {
	id?: number;
	name: string;
	primary?: boolean;
	cardInfo?: ICardInfo;
}

/**
 * Represents the key information of a credit/debit card
 */
export interface ICardInfo {
	cardNumber: string;
	expiry: ICardExpiry;
}

/**
 * Represents the expiration date of a credit/debit card
 */
export interface ICardExpiry {
	month: string;
	year: string;
}
