import { sanitizeValues } from '../../src/utils/sanitizeValues';

describe('sanitizeValues', () => {
  it('sanitizes top-level values at the matching key(s)', () => {
    const obj = {
      name: 'test',
      password: 'test',
      secret: 'test'
    };
    const sanitizedObj = sanitizeValues(obj, ['password', 'secret']);
    const expected = {
      name: 'test',
      password: 'SANITIZED',
      secret: 'SANITIZED'
    };
    expect(sanitizedObj).toEqual(expected);
  });

  it('sanitizes nested values at the matching key(s)', () => {
    const obj = {
      nested: {
        name: 'test',
        password: 'test',
        secret: 'test'
      }
    };
    const sanitized = sanitizeValues(obj, ['password', 'secret']);
    const expected = {
      nested: {
        name: 'test',
        password: 'SANITIZED',
        secret: 'SANITIZED'
      }
    };
    expect(sanitized).toEqual(expected);
  });

  it('sanitizes a complex object', () => {
    const obj = {
      secret: 'test',
      test: 'test',
      nestedObj: {
        secret: 'test',
        test: 'test',
        deepNestedObj: {
          secret: 'test',
          test: 'test'
        }
      },
      arr: [{ secret: 'test', test: 'test' }]
    };
    const sanitized = sanitizeValues(obj, ['secret']);
    const expected = {
      secret: 'SANITIZED',
      test: 'test',
      nestedObj: {
        secret: 'SANITIZED',
        test: 'test',
        deepNestedObj: {
          secret: 'SANITIZED',
          test: 'test'
        }
      },
      arr: [{ secret: 'SANITIZED', test: 'test' }]
    };
    expect(sanitized).toEqual(expected);
  });
});
