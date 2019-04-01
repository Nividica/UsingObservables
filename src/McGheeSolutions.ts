// tslint:disable:no-duplicate-imports
// import { from, concat, merge, zip, forkJoin, of, race } from 'rxjs';
// import { switchMap, filter, map, pairwise, take, startWith, scan } from 'rxjs/operators';

import { Observable, from as o2, concat as o5, merge as o8, zip as o6, forkJoin as o7, of as o11, race as o10 } from 'rxjs';
import { switchMap as o1, filter as o3, map as o4, pairwise as o9, take as o12, startWith as o13, scan as o14 } from 'rxjs/operators';

import { IUserBasic, IUserAuth, IUserProfile, IUserSocial, IUserObject, AlertOp, ReunionNames } from './DataTypes';

export type Handler1<T, R> = (source: Observable<T>) => Observable<R>;
export type Handler2<T1, T2, R> = (source1: Observable<T1>, source2: Observable<T2>) => Observable<R>;
export type Handler3<T1, T2, T3, R> = (source1: Observable<T1>, source2: Observable<T2>, source3: Observable<T3>) => Observable<R>;
export type Handler4<T1, T2, T3, T4, R> = (source1: Observable<T1>, source2: Observable<T2>, source3: Observable<T3>, source4: Observable<T4>) => Observable<R>;
export type HandlerN<T, R> = (sources: Array<Observable<T>>) => Observable<R>;

/**
 * Note these are not the -only- way or the -best- way to solve the problems.
 *
 * These are only my way of solving them.
 */
export namespace McGheeSolutions {
  /**
   * Hint: from, switchMap
   */
  export const koNewlineToken: Handler1<string, string> = ((z) => z
    .pipe(o1((x) => o2(x.split('\n')))));

  /**
   * Hint: filter, map
   */
  export const koMultiply: Handler1<number | undefined, number> = ((z) => z
    .pipe(o3((x): x is number => x !== undefined), o4((n) => n * 10)));

  /**
   * Hint: concat, map, throw
   */
  export const koSingleFile: HandlerN<string, number> = ((z) => o5(...z)
    .pipe(o4((s) => { const n = Number(s); if (isNaN(n)) { throw new Error(); } return n; })));

  /**
   * Hint: map, zip
   */
  export const koReunion: Handler2<string, string, ReunionNames> = ((z1, z2) => o6(z1, z2)
    .pipe(o4(([owner, pet]) => ({ owner, pet }))));

  /**
   * Hint: forkJoin, map
   */
  export const koAllTheFacts: Handler3<boolean, boolean, boolean, AlertOp> = (z1, z2, z3) => o7(z1, z2, z3)
    .pipe(o4(([z4, z5, z6]) => (!z4 || !z5) ? 'Noop' : (z6 ? 'ShowAlert' : 'Wait')));

  /**
   * Hint: map, merge, pairwise
   */
  export const koTwins: Handler1<number, number> = (z) => o8(o11(6), z)
    .pipe(o9(), o4(([p, c]) => p + c));

  /**
   * Hint: filter, map, race, take
   */
  export const koAesop: Handler2<number, number, string> = (z1, z2) => o10(z2
    .pipe(o3((x) => !x), o4(() => 'Tortoise')), z1.pipe(o3((x) => !x), o4(() => 'Hare')))
    .pipe(o12(1));

  /**
   * Hint: merge, scan, startWith
   */
  export const koNotChunky: Handler4<IUserBasic, IUserAuth, IUserProfile, IUserSocial, Partial<IUserObject>> =
    (z1, z2, z3, z4) => o8(z1, z2, z3, z4)
      // tslint:disable-next-line:prefer-object-spread
      .pipe(o13({}), o14((o, nO) => Object.assign(o, nO)));

}
