import { Observable, of, from, defer, MonoTypeOperatorFunction, concat, Observer, PartialObserver } from 'rxjs';
import { sequenceEqual, catchError, tap, map, delay, concatAll, timeout, reduce, finalize } from 'rxjs/operators';
import { McGheeSolutions, Handler1, HandlerN, Handler2, Handler3, Handler4 } from './McGheeSolutions';
import { IUserBasic, IUserAuth, IUserProfile, IUserSocial, IUserObject, AlertOp, ReunionNames } from './DataTypes';
import { Logger } from './Logger';

/**
 * Set this to true to log each seqence comparison
 */
const logComparisons = false;

function delayEach<T>(delayAmt: number): MonoTypeOperatorFunction<T> {
  return (source) => source.pipe(
    map((v) => of(v)
      .pipe(delay(delayAmt))),
    concatAll()
  );
}

function wrapStream<T>(values: Array<T>, delayAmt?: number): Observable<T> {
  return (delayAmt === undefined || delayAmt < 0)
    ? defer(() => from(values))
    : defer(() => from(values))
      .pipe(delayEach(delayAmt));
}

function wrap<T>(value: T): Observable<T> {
  return defer(() => of(value));
}

function comparer(a: any, b: any) {
  if (logComparisons) { Logger.group('Comparing'); }
  try {
    const tA = typeof a;
    if (typeof b !== tA) {
      if (logComparisons) { Logger.log(a); }
      if (logComparisons) { Logger.log(b); }
      return false;
    }
    if (tA === 'object') {
      if (logComparisons) { Logger.log(JSON.stringify(a)); }
      if (logComparisons) { Logger.log(JSON.stringify(b)); }
      return JSON.stringify(a) === JSON.stringify(b);
    }

    if (logComparisons) { Logger.log(a); }
    if (logComparisons) { Logger.log(b); }
    return a === b;
  } finally {
    if (logComparisons) { Logger.groupEnd(); }
  }
}

function CompareSuccess<T>(name: string, userObs: Observable<T>, knownObs: Observable<T>): Observable<boolean> {
  let grp = false;
  return knownObs
    .pipe(
      sequenceEqual(userObs, comparer),
      timeout(1000),
      catchError((err) => {
        Logger.error(err);
        return of(false);
      })
    )
    .pipe(
      tap({
        next: () => { if (!grp) { Logger.group(name); grp = true; } },
        complete: () => { if (grp) { Logger.groupEnd(); } }
      } as PartialObserver<boolean>),
      tap({ next: (pass) => Logger.log(`${name}: %c${pass}`, `color:${pass ? 'green' : 'red'}`) })
    );
}

function CompareFailure<T>(name: string, userObs: Observable<T>, knownObs: Observable<T>): Observable<boolean> {
  const errSentinel: any = { q: ['t', 3.14] };
  let grp = false;
  return knownObs
    .pipe(
      catchError(() => of(errSentinel)),
      sequenceEqual(
        userObs.pipe(catchError(() => of(errSentinel))),
        comparer
      ),
      timeout(1000),
      catchError((err) => {
        Logger.error(err);
        return of(false);
      })
    )
    .pipe(
      tap({
        next: () => { if (!grp) { Logger.group(name); grp = true; } },
        complete: () => { if (grp) { Logger.groupEnd(); } }
      } as PartialObserver<boolean>),
      tap({ next: (pass) => Logger.log(`${name}: %c${pass}`, `color:${pass ? 'green' : 'red'}`) })
    );
}

export function AllPass(...obs: Array<Observable<boolean>>): Observable<boolean> {
  return concat(...obs)
    .pipe(
      reduce<boolean>((all, cur) => all && cur)
    );
}

export namespace UsingObservables {

  /**
   * Example problem and solution
   *
   * For each give string
   * * Return the string with `Echo:` prepended
   * * Do not catch errors
   */
  export function ExampleEcho(handler: Handler1<string, string>): Observable<boolean> {
    const src1 = wrap('Hello');
    const src2 = wrapStream(['Blue', 'Green', 'Red']);
    const src3 = wrapStream(['-)', '-|', '-('])
      .pipe(map((em) => {
        if (em === '-(') {
          throw new Error('Internal Failure: Sound.exe has stopped unexpectedly');
        }
        return em;
      }));

    const ko: Handler1<string, string> = (source) => source
      .pipe(
        map((txt) => `Echo:${txt}`)
      );

    return AllPass(
      CompareSuccess('Example Echo Single', handler(src1), ko(src1)),
      CompareSuccess('Example Echo Multiple', handler(src2), ko(src2)),
      CompareFailure('Example Echo Failure', handler(src3), ko(src3))
    );
  }

  /**
   * * Multiply each given number by 10 and emit.
   * * Ignore undefined values
   *
   * @example 1 then undefined then 10 => 10 then 100
   */
  export function Multiply(handler: Handler1<number | undefined, number>): Observable<boolean> {
    const src1 = wrapStream([1, 2, 3, 4, 5]);
    const src2 = wrapStream([1, undefined, 4, undefined, 8]);
    const src3 = wrap(undefined);
    const src4 = wrap(Math.random());
    const ko = McGheeSolutions.koMultiply;

    return AllPass(
      CompareSuccess('Multiply Numbers', handler(src1), ko(src1)),
      CompareSuccess('Multiply Mixed', handler(src2), ko(src2)),
      CompareSuccess('Multiply NaN', handler(src3), ko(src3)),
      CompareSuccess('Multiply Rnd', handler(src4), ko(src4))
    );
  }

  /**
   * For each given string,
   * * Split the string by newlines, and emit each substring.
   * * Do not emit the split strings together as an array.
   * @example 'a\nb\nc' => 'a' then 'b' then 'c'
   */
  export function NewlineTokenization(handler: Handler1<string, string>): Observable<boolean> {
    const src1 = wrap('This is line one.\nThis is line two\nAnd I am line three!');
    const src2 = wrapStream(['1:1\n1:2\n1:3', '2:1\n2:2', '3:1']);
    const ko = McGheeSolutions.koNewlineToken;

    return AllPass(
      CompareSuccess('NewlineTokenization Single', handler(src1), ko(src1)),
      CompareSuccess('NewlineTokenization Multiple', handler(src2), ko(src2))
    );
  }

  /**
   * * Combine the given streams of strings into a single stream of numbers
   * * Must have the same order as the string streams are given
   * * Throw an exception if any string is not a number.
   *
   * @example [('1' then '3'), ('2' then '6')] => 1 then 3 then 2 then 6
   */
  export function SingleFile(handler: HandlerN<string, number>): Observable<boolean> {
    const src1 = [wrapStream(['1', '10']), wrapStream(['-1', '3.14'])];
    const src2 = [wrap('alice'), wrap('bob')];
    const src3 = [wrapStream(['2', 'one']), wrapStream(['3', 'zero'])];
    const src4 = ['1', '2', '3', '4', '5', '6'].map(wrap);
    const src5 = [Math.random() * 10, Math.random() * 10, Math.random() * 10]
      .map(String)
      .map(wrap);
    const ko = McGheeSolutions.koSingleFile;

    return AllPass(
      CompareSuccess('SingleFile Nums', handler(src1), ko(src1)),
      CompareFailure('SingleFile NaN', handler(src2), ko(src2)),
      CompareFailure('SingleFile Mixed', handler(src3), ko(src3)),
      CompareSuccess('SingleFile Many Sources', handler(src4), ko(src4)),
      CompareSuccess('SingleFile Rnd', handler(src5), ko(src5))
    );

  }

  /**
   * * Combine two streams: OwnerNames and PetNames
   * * Return a stream of objects with the owner and pet.
   *
   * @example [('Alice' then 'Bob'), ('Fido' then 'Max')] => { owner: 'Alice', pet: 'Fido' } then { owner: 'Bob', pet: 'Max' }
   */
  export function Reunion(handler: Handler2<string, string, ReunionNames>): Observable<boolean> {
    const owners = wrapStream(['DanTori', 'LeeDani', 'Chritchell']);
    const pets = wrapStream(['Peaches', 'CocoMaya', 'Frisket']);
    const ko = McGheeSolutions.koReunion;

    return CompareSuccess('Reunion', handler(owners, pets), ko(owners, pets));
  }

  /**
   * * Take the 3 user preferences
   * * * globalAllowAlerts, mentionedAlerts, and wasMentioned
   * * Return a string according to the following rules:
   * * * (T,T,T): 'ShowAlert'
   * * * (T,T,F): 'Wait'
   * * * (T,F,X): 'Noop'
   * * * (F,X,X): 'Noop'
   */
  export function AllTheFacts(handler: Handler3<boolean, boolean, boolean, AlertOp>): Observable<boolean> {
    const showAlert = [true, true, true].map(wrap);
    const wait = [true, true, false].map(wrap);
    const noop1 = [true, false, true].map(wrap);
    const noop2 = [false, true, true].map(wrap);
    const ko = McGheeSolutions.koAllTheFacts;

    const helper = (name: string, arr: Array<Observable<boolean>>) =>
      CompareSuccess(`AllTheFacts ${name}`, handler(arr[0], arr[1], arr[2]), ko(arr[0], arr[1], arr[2]));

    return AllPass(
      helper('ShowAlert', showAlert),
      helper('Wait', wait),
      helper('Noop1', noop1),
      helper('Noop2', noop2)
    );
  }

  /**
   * * Take each value from the stream and add it to the previous value
   * * Consider 6 the previous value for the first item
   */
  export function Twins(handler: Handler1<number, number>): Observable<boolean> {
    const seq1 = wrapStream([1, 1]);
    const seq2 = wrapStream([10, 20, 10]);
    const seq3 = wrapStream([10, -10, 10]);
    const seq4 = wrapStream([0]);
    const seq5 = wrapStream([Math.random() * 10, Math.random() * 100]);
    const ko = McGheeSolutions.koTwins;

    return AllPass(
      CompareSuccess('Twins 1', handler(seq1), ko(seq1)),
      CompareSuccess('Twins 2', handler(seq2), ko(seq2)),
      CompareSuccess('Twins 3', handler(seq3), ko(seq3)),
      CompareSuccess('Twins 4', handler(seq4), ko(seq4)),
      CompareSuccess('Twins Rnd', handler(seq5), ko(seq5))
    );
  }

  /**
   * * Two streams of numbers given, Hare and Tortoise(in that order)
   * * Emit the name('Hare' or 'Tortoise') of the first stream that emits a 0
   *
   * @example (hare=>3) then (tort=>1) then (hare=>1) then (tort=>0) => 'Tortoise'
   */
  export function Aesop(handler: Handler2<number, number, string>): Observable<boolean> {
    const tort = wrapStream([5, 4, 3, 2, 1, 0], 5);
    const hare = wrapStream([3, 2, 1, 0, 0, 0], 5);
    const ko = McGheeSolutions.koAesop;

    return AllPass(
      CompareSuccess('Aesop 1', handler(hare, tort), ko(hare, tort)),
      CompareSuccess('Aesop 2', handler(tort, hare), ko(tort, hare))
    );
  }

  /**
   * * Four data sources are given, each emits a unique part of a single user object.
   * * Each time data is received, combine the new data with any existing data, and emit.
   * * Emit a default value of an empty object until the first data arrives.
   * * Each data source will only emit once.
   * * Bonus points if you catch the reference
   *
   * @example ({Username: 'bob'}) then ({Groups: []}) => {} then {Username: 'bob'} then {Username: 'bob', Groups: []}
   */
  export function NotChunky(handler: Handler4<IUserBasic, IUserAuth, IUserProfile, IUserSocial, Partial<IUserObject>>): Observable<boolean> {
    const social = of({ FriendList: ['Amy Greene', 'Ella Fitzgerald'] } as IUserSocial)
      .pipe(delay(150));

    const profile = of({ AvatarPath: 'imgs/MM', Preferences: { drink: 'champagne' } } as IUserProfile)
      .pipe(delay(100));

    const auth = of({ LastPasswordChanged: new Date(-233784000000), Groups: ['actress', 'model', 'singer'] } as IUserAuth)
      .pipe(delay(50));

    const basic = of({ UserName: 'Norma Jean', LastLogin: new Date(-1375473600000) } as IUserBasic)
      .pipe(delay(10));
    const ko = McGheeSolutions.koNotChunky;

    return CompareSuccess('Not Chunky', handler(basic, auth, profile, social), ko(basic, auth, profile, social));
  }
}
