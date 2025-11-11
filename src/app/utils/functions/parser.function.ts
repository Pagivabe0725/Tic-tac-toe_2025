  /**
   * Retrieves a JSON-encoded value from the specified Web Storage
   * (`localStorage` or `sessionStorage`) and parses it into a strongly-typed object.
   *
   * @typeParam T - The expected type of the parsed object.
   * @param key - The key associated with the stored item.
   * @param storage - Either `'localStorage'` or `'sessionStorage'`.
   * @returns The parsed object of type `T`, or `undefined` if the key does not exist
   *          or the stored value is not valid JSON.
   *
   * @example
   * ```ts
   * const user = parseFromStorage<User>('user_data', 'localStorage');
   * if (user) console.log(user.email);
   * ```
   */
  export function parseFromStorage<T>(
    key: string,
    storage: 'localStorage' | 'sessionStorage'
  ): T | undefined {
    const value = window[storage].getItem(key);
    if (!value) return undefined;

    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }