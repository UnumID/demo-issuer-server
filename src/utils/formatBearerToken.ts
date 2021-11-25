/**
 * Helper to format a bear token.
 * @param token
 * @returns
 */
export const formatBearerToken = (token: string): string =>
  token.startsWith('Bearer ') ? token : `Bearer ${token}`;
