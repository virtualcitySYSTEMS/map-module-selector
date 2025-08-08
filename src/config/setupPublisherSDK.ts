import { authorize, setServerUrl } from '@vcsuite/publisher-sdk';
import { getLogger } from '@vcsuite/logger';
import { name } from '../../package.json';
import type { ModuleSelectorConfig } from '../index';

export function setupPublisherSDK(options: ModuleSelectorConfig): void {
  try {
    if (options.serverUrl) {
      const serverUrl = new URL(
        options.serverUrl,
        window.location.href,
      ).toString();
      setServerUrl(serverUrl);

      const token = options.token || localStorage.getItem('Meteor.loginToken');
      if (token) {
        authorize(token);
        getLogger(name).info('Publisher connection successful');
      }
    }
  } catch (err) {
    getLogger(name).error('Failed to connect to publisher', err);
  }
}
