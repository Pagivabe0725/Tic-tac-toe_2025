import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Functions {
  pick<T>(object: any, keys: (keyof T)[]): T {
    const result: Partial<T> = {};
    keys.forEach((key) => {
      if (object[key] !== undefined) result[key] = object[key];
    });
    return result as T;
  }
}
