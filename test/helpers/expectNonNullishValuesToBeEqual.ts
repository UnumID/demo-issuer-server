export type POJO<T = any> = Record<string | symbol | number, T>;

/**
 * tests that all of the non-nullish (null || undefined) values in two objects are equal
 * used because of a mikro-orm quirk where creating an entity will return undefined
 * (or omit properties entirely), while get, etc., return null after loading from the db
 * @param {POJO} obj1 the first object to compare
 * @param {POJO} obj2 the second object to compare
 */
export const expectNonNullishValuesToBeEqual = (
  obj1: POJO,
  obj2: POJO
): void => {
  for (const key in obj1) {
    if (obj1[key] != null) {
      if (obj2[key] != null) {
        expect(obj1[key]).toEqual(obj2[key]);
      } else {
        fail(`Expected ${obj1[key]}, received ${obj2[key]}`);
      }
    }
  }
};
