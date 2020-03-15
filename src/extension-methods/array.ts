import _ from 'lodash';
import { Optional } from '../types';

type Orderable = string | number | Date;
type Equatable = string | number | boolean;
type Comparable = string | number; // Orderable & Equatable

/* eslint-disable */
declare global {
  interface Array<T> {
    /**
     * Beholder alle elementer hvor map-funksjonen `f` ikke returnerer `undefined`
     */
    filterMap: <E>(f: (x: T) => Optional<E>) => T[];
    /**
     * @param key - Sorteringsnøkkelen, ex. `x => x.name`
     *
     * Stabil sorteringsalgoritme i stigende rekkefølge bestemt av `key`
     */
    sortBy: (key: (x: T) => Orderable) => T[];
    /**
     * @param key - Nøkkelen som bestemmer unikhet, ex.: `x => x.id`
     *
     * Behold unike elementer bestemt av `key`
     */
    uniqBy: (key: (x: T) => Equatable) => T[];
    /**
     * Grupperer etter `key`
     */
    groupBy: <S extends string>(key: (x: T) => S) => Record<S, Optional<T[]>>;
    /**
     * Produserer liste av lister, gruppert etter `key` (og sortert etter `key`)
     * der nøkkelen og listen er behandlet av en valgfri map-funksjon `f`
     *
     * ex.: `[2.2, 1.1, 2.9].chunkBy(Math.floor)` => `[[1.1], [2.2, 2.9]]`
     * ex.: `[2.2, 1.1, 2.9].chunkBy(Math.floor, (key, values) => ({key, values}))` => `[{key: 1, values: [1.1]}, {key: 2, values: [2.2, 2.9]}]`
     */
    chunkBy<C extends Comparable>(key: (x: T) => C): T[][];
    chunkBy<C extends Comparable, E>(
      key: (x: T) => C,
      f?: (key: C, values: T[]) => E,
    ): E[];

    /**
     * @param key - Nøkkelen som bestemmer likhet, ex. `x => x.id`
     *
     * Bytter ut eksisterende elementer med matchende nye elementer
     * og legger resterende nye elementer på slutten
     */
    replaceBy: (newThings: T[], key: (x: T) => Equatable) => T[];
  }
}

Array.prototype.filterMap = function<T, E>(
  this: T[],
  f: (x: T) => Optional<E>,
): E[] {
  return this.reduce((acc: E[], x) => {
    const y = f(x);
    if (y !== undefined) {
      return [...acc, y];
    }
    return acc;
  }, []);
};

Array.prototype.sortBy = function<T>(this: T[], key: (x: T) => Orderable): T[] {
  return _.sortBy(this, key);
};

Array.prototype.uniqBy = function<T>(this: T[], key: (x: T) => Equatable): T[] {
  return _.uniqBy(this, key);
};

Array.prototype.groupBy = function<S extends string, T>(
  this: any[],
  key: (x: T) => S,
) {
  return _.groupBy(this, key) as Record<S, Optional<T[]>>;
};

Array.prototype.chunkBy = function<T, C extends Comparable, E>(
  this: T[],
  key: (x: T) => C,
  f?: (key: C, values: T[]) => E,
) {
  const chunked = Object.entries(_.groupBy(this, key)).sortBy(
    ([_key, values]) => _key,
  );
  return f
    ? chunked.map(([_key, values]) => f(_key as C, values))
    : chunked.map(([_key, values]) => values);
};

Array.prototype.replaceBy = function<T>(
  this: T[],
  _newThings: T[],
  key: (x: T) => Equatable,
): T[] {
  const oldThings = this.uniqBy(key);
  const newThings = _newThings.uniqBy(key);
  const replacedThings = oldThings.map(
    x => newThings.find(y => key(y) === key(x)) || x,
  );
  return [
    ...replacedThings,
    ...newThings.filter(x => !replacedThings.map(key).includes(key(x))),
  ];
};
