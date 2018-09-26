import { UserInfo } from '../../models/userInfo';

export interface Store {
	Name: string;
	Address?: string;
	Id: string;
}

export interface QueueItem {
	UserID?: string;
	Phone: string;
}

export interface ISource {
	userInfo: UserInfo;
	storeId: string;
	init(): Promise<ISource>;
	getPosition(phone: string): Promise<number>;
	getNewPosition(): Promise<number>;
	removeFromLine(phone: string): Promise<boolean>;
	goToNext(): Promise<QueueItem>;
	addToLine(user: QueueItem): Promise<number>;
	getAvailableStores(): Promise<Store[]>;
	/**
	 * Update phone number. Return false if new phone is already used
	 * @param oldPhone
	 * @param newPhone
	 */
	updatePhoneInQueue(oldPhone: string, newPhone: string): Promise<boolean>;
}
