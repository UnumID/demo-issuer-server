import { Paginated } from '@feathersjs/feathers';

type MaybePaginated<T> = T[] | Paginated<T>;

export const isPaginated = <T> (
  maybePaginated: MaybePaginated<T>
): maybePaginated is Paginated<T> => {
  return !!(maybePaginated as Paginated<T>).data;
};
