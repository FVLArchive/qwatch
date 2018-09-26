import { UserInfo } from '../../models/userInfo';
import { ISource, Store, QueueItem } from './source';

/**
 * Interface for a mock customer for the mockRestaurantSource
 */

/**
 * A mock implementation of IRestaurantSource, meant for initial testing
 */

export class MockSource implements ISource {
	//since firebase has multiple instance of the server, mock source doesn't work well
	static queue: string[] = ['1231231234', '3311624733', '5151651651', '7811114895'];
	public storeId: string = '1';
	constructor(public userInfo: UserInfo) {}

	init(): Promise<ISource> {
		return Promise.resolve(this);
	}

	getPosition(phone: string): Promise<number> {
		return Promise.resolve(MockSource.queue.indexOf(phone) + 1);
	}

	getNewPosition(): Promise<number> {
		console.log('Queue:', MockSource.queue);
		return Promise.resolve(MockSource.queue.length);
	}
	removeFromLine(phone: string): Promise<boolean> {
		console.log('Old queue:', MockSource.queue);
		if (!phone) Promise.resolve(false);
		const i = MockSource.queue.indexOf(phone);
		if (i === -1) return Promise.resolve(false);
		MockSource.queue.splice(i, 1);
		return Promise.resolve(true);
	}

	goToNext(): Promise<QueueItem> {
		MockSource.queue.shift();
		return Promise.resolve({ Phone: MockSource.queue[0] });
	}

	addToLine(user: QueueItem): Promise<number> {
		const phone = user.Phone;
		const i = MockSource.queue.indexOf(phone);
		//if phone already exist, return its position
		if (i > -1) return Promise.resolve(i + 1);
		const length = MockSource.queue.push(phone);
		console.log('New queue:', MockSource.queue);
		return Promise.resolve(length);
	}

	updatePhoneInQueue(oldPhone: string, newPhone: string): Promise<boolean> {
		console.log('OMG:', MockSource.queue);
		let i = MockSource.queue.indexOf(newPhone);
		if (i > -1) return Promise.resolve(false);
		i = MockSource.queue.indexOf(oldPhone);

		console.log('Index:', i);
		if (i > -1) MockSource.queue[i] = newPhone;
		return Promise.resolve(true);
	}

	getAvailableStores(): Promise<Store[]> {
		return Promise.resolve([
			{
				Name: 'Store 1',
				Id: '1'
			},
			{
				Name: 'Store 2',
				Id: '2'
			},
			{
				Name: 'Store 3',
				Id: '3'
			}
		]);
	}
}
