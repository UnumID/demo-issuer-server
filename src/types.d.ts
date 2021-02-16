import { CredentialSubject, Credential } from '@unumid/types';

export type Rename<
T,
K extends keyof T,
N extends string | number | symbol
> = Pick<T, Exclude<keyof T, K>> & { [P in N]: T[K] };

export interface Dto<T = any> {
  data?: Partial<T>;
  result?: T;
}

export interface RequestDto<T = any> extends Dto<T> {
  data: Partial<T>;
}

export interface ResponseDto<T = any> extends Dto<T> {
  result: T;
}

export type CredentialWithRenamedContext = Rename<Credential, '@context', 'context'>;
