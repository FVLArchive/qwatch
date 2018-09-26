import { ISource } from './source';
import { MockSource } from './mockSource';
import { UserInfo } from '../../models/userInfo';
import { Logging } from '../../models/logger';
import { FirebaseSource } from '../firebaseSource/firebaseSource';

/**
 * A string meant to denote the value of key in a key-value pair stored in Firebase
 */
export const sourceKey = 'source';

/**
 * Enumerator used to determine which restaurant source is used
 */
export enum Source {
	Mock = 1,
	Api = 2
}

/**
 * Class implemented to use the factory method to generate a particular IRestaurantSource
 */
export class SourceFactory {
	/**
	 * Get an instance of the active data provider.
	 * @param userId ID of the user.
	 * @param config Override the default Data Provider (Should probably be moved to reading from the RT DB).
	 */
	static getSource(userInfo: UserInfo): Promise<ISource> {
		return userInfo.settings.getOrDefaultGlobalData(sourceKey, Source.Mock).then(config => {
			switch (config) {
				case Source.Api:
					return new FirebaseSource(userInfo).init();
				default:
					Logging.logger.log('Using mock source');
					return new MockSource(userInfo).init();
			}
		});
	}
}
