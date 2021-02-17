import { isPlainObject } from 'lodash';

export function sanitizeValues<T = any> (obj: T, keys: string[], replacement = 'SANITIZED'): T {
  if (!obj) return obj;

  const sanitized = { ...obj };

  Object.keys(obj).forEach((k: string) => {
    const value = (obj as any)[k];

    // if value is an object, recursively sanitize it
    if (isPlainObject(value)) {
      (sanitized as any)[k] = sanitizeValues(value, keys, replacement);
    }

    // if value is an array, recursively sanitize each element
    if (Array.isArray(value)) {
      (sanitized as any)[k] = value.map(el => sanitizeValues(el, keys, replacement));
    }

    // replace values at matching keys
    keys.forEach(key => {
      if (k === key) {
        (sanitized as any)[k] = replacement;
      }
    });
  });

  return sanitized;
}
