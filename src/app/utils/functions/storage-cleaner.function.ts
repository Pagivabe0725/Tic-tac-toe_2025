import { STORAGE_PREFIX } from '../constants/sessionstorage-prefix.constant';

/**
 * Removes one or more items from Web Storage.
 *
 * @param {'localStorage' | 'sessionStorage'} storage - The storage type to clean.
 * @param {boolean} prefix - Whether to prepend STORAGE_PREFIX to each key.
 * @param {...string} elements - Keys to remove.
 */
export function storageCleaner(
  storage: 'localStorage' | 'sessionStorage',
  prefix: boolean,
  ...elements: string[]
) {
  for (const element of elements) {
    window[storage].removeItem(prefix ? STORAGE_PREFIX + element : element);
  }
}
