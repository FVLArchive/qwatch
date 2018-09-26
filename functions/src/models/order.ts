import { IPaymentMethod } from './paymentMethod';

// ----------------- Interfaces ------------------

/**
 * Interface for an objects which holds the
 * key aspects of a individual food item
 */
export interface IProduct {
	id: string;
	name: string;
	unitPrice: number;
	calories?: number;
	categories?: string[];
	description?: string;
	isHalal?: boolean;
	isVegetarian?: boolean;
	sku?: string;
}

/**
 * Interface for an objects which holds the
 * key aspects of a individual food item when
 * that item is a part of an order
 */
export interface IOrderItem {
	product: IProduct;
	quantity: number;
	items?: IOrderItem[];
}

/**
 * Interface for describing a tax where amount is the cash value,
 * not a percentage
 * For example, the name could be GST and the amount is 1.65
 */
export interface ITax {
	name: string;
	amount: number;
}

/**
 * Enum for whether food will be delivered or picked up
 */
export enum AddressType {
	Delivery,
	Pickup
}

/**
 * Interface for an object which describes the
 * key components of an order's delivery address
 */
export interface IAddress {
	id?: number;
	name: string;
	address1: string;
	address2?: string;
	city: string;
	province: string;
	postalCode: string;
	countryCode: string;
	phoneNumber: string;
	notes?: string;
	type: AddressType;
	isReplacement?: boolean;
}

/**
 * Interface for an object which describes the
 * key components of an order
 */
export interface IOrder {
	id: string;
	referenceId?: string; // Invoice #, order reference, etc.
	items: IOrderItem[];
	name: string;
	orderType: OrderType;
	result: OrderResult;
	status: OrderStatusType;
	timePlaced: string; // If user wants this field to be stored on Firebase Realtime Database, it needs to be set as a string instead of a date
	subtotal: number;
	deliveryFee?: number;
	taxes: ITax[];
	totalPrice: number;
	eta?: string; // If user wants this field to be stored on Firebase Realtime Database, it needs to be set as a string instead of a date
	orderSource?: string; // eg. web, mobile, google home, etc.
	paymentMethod?: IPaymentMethod;
	storeId?: string;
	storeAddress?: IAddress;
	timeDelivered?: string; // If user wants this field to be stored on Firebase Realtime Database, it needs to be set as a string instead of a date
	timePickedUp?: string; // If user wants this field to be stored on Firebase Realtime Database, it needs to be set as a string instead of a date
	orderAddress?: IAddress;
	instructionsForMerchant?: string;
	instructionsForCustomer?: string;
	[meta: string]: any; // A general map to hold arbitrary meta data
}

/**
 * Interface for an object which describes all
 * of a user's saved orders
 * [ NOTE: This is currently unused ]
 */
export interface IAllOrders {
	favourites: IOrder[];
	latest: IOrder;
	quick: IOrder;
}

/**
 * Interface for an object which describes
 * the key info for a vendor location
 */
export interface IStoreInfo {
	address: string;
	id: string;
	name: string;
	phone: string;
	//... etc.
}

// ----------------- Enumerations ------------------

/**
 * Enum to denote whether an order is for delivery
 * or order
 */
export enum OrderType {
	Delivery = 'D',
	Pickup = 'P'
}

/**
 * Enum to denote the result of an order request
 */
export enum OrderResult {
	InProgress = 1,
	OrderInvalid = 2,
	PaymentFailure = 3,
	Success = 4
}

/**
 * Enum to denote the status of an order
 */
export enum OrderStatusType {
	Approved = 'Approved',
	Held = 'Held',
	Deferred = 'Deferred',
	InPreparation = 'In Preparation',
	DriverDispatched = 'Driver Dispatched',
	Cancelled = 'Cancelled',
	Voided = 'Voided',
	Fulfilled = 'Fulfilled'
}

/**
 * Enum to denote the category of a saved ordered
 * [ NOTE: Favourite is currently unused ]
 */
export enum OrderCategory {
	Quick = 'quick',
	Last = 'last',
	Favourite = 'favourite'
}

/**
 * Enum to denote the category of a saved ordered, made more readable
 * [ NOTE: Favourite is currently unused ]
 */
export enum OrderCategoryReadable {
	Quick = 'Quick Order',
	Last = 'Last Order',
	Favourite = 'Favourite Order'
}
