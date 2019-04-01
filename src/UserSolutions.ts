import { UsingObservables, AllPass } from './UsingObservables';
import { tap, map, delay } from 'rxjs/operators';
import { MonoTypeOperatorFunction, PartialObserver, Observable, of } from 'rxjs';
import { Logger } from './Logger';
import { ReunionNames, AlertOp } from './DataTypes';

export namespace UserSolutions {

  /**
   * Helper pipeline function provided to aid in debugging.
   *
   * Add this operator to your pipeline to view every event at that point in the pipeline.
   *
   * Tip: Remove from pipeline when you are done. Else the output will get very messy very quickly
   */
  function LogEverything<T>(
    title?: string,
    logNext: boolean = true,
    logErr: boolean = true,
    logCmp: boolean = true
  ): MonoTypeOperatorFunction<T> {
    return (source) => source.pipe(
      tap({
        next: logNext ? (v) => Logger.info(title, 'next', v) : undefined,
        error: logErr ? (e) => Logger.error(title, 'error', e) : undefined,
        complete: logCmp ? () => Logger.info(title, 'complete') : undefined
      } as PartialObserver<T>)
    );
  }

  /**
   * Example problem and solution
   *
   * For each give string
   * * Return the string with `Echo:` prepended
   * * Do not catch errors
   */
  export function ExampleEcho(): Observable<boolean> {
    return UsingObservables.ExampleEcho(
      (source) => {
        return source.pipe(
          LogEverything('Before Echo'),
          map((x) => 'Echo:' + x),
          LogEverything('After Echo', true, false, false)
        );
      }
    );
  }

  /**
   * For each given string,
   * * Split the string by newlines, and emit each substring.
   * * Do not emit the split strings together as an array.
   * @example 'a\nb\nc' => 'a' then 'b' then 'c'
   */
  export function NewlineTokenization(): Observable<boolean> {
    return UsingObservables.NewlineTokenization(
      (stringSource) => {
        return of('');
      }
    );
  }

  /**
   * * Multiply each given number by 10 and emit.
   * * Ignore undefined values
   *
   * @example 1 then undefined then 10 => 10 then 100
   */
  export function Multiply(): Observable<boolean> {
    return UsingObservables.Multiply(
      (numberSource) => {
        return of(0);
      }
    );
  }

  /**
   * * Combine the given streams of strings into a single stream of numbers
   * * Must have the same order as the string streams are given
   * * Throw an exception if any string is not a number.
   *
   * @example [('1' then '3'), ('2' then '6')] => 1 then 3 then 2 then 6
   */
  export function SingleFile(): Observable<boolean> {
    return UsingObservables.SingleFile(
      (stringSources) => {
        return of(1);
      }
    );
  }

  /**
   * * Combine two streams: OwnerNames and PetNames
   * * Return a stream of objects with the owner and pet.
   *
   * @example [('Alice' then 'Bob'), ('Fido' then 'Max')] => { owner: 'Alice', pet: 'Fido' } then { owner: 'Bob', pet: 'Max' }
   */
  export function Reunion(): Observable<boolean> {
    return UsingObservables.Reunion(
      (owners, pets) => {
        return of({ owner: '', pet: '' } as ReunionNames);
      }
    );
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
  export function AllTheFacts(): Observable<boolean> {
    return UsingObservables.AllTheFacts(
      (globalAllowAlerts, mentionedAlerts, wasMentioned) => {
        return of();
      }
    );
  }

  /**
   * * Take each value from the stream and add it to the previous value
   * * Consider `6` the previous value for the first item
   */
  export function Twins(): Observable<boolean> {
    return UsingObservables.Twins(
      (numberSource) => {
        return of(-12345);
      }
    );
  }

  /**
   * * Two streams of numbers given, Hare and Tortoise(in that order)
   * * Emit the name('Hare' or 'Tortoise') of the first stream that emits a 0
   *
   * @example (hare=>3) then (tort=>1) then (hare=>1) then (tort=>0) => 'Tortoise'
   */
  export function Aesop(): Observable<boolean> {
    return UsingObservables.Aesop(
      (hare, tortoise) => {
        return of('Deer');
      }
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
  export function NotChunky(): Observable<boolean> {
    return UsingObservables.NotChunky(
      (basic, auth, profile, social) => {
        return of({});
      }
    );
  }

  /**
   * Runs all tests and displays the final result.
   * 
   * Note: You may comment any tests out when you are done with them, or havent gotten to them.
   */
  export function RunAll(): void {
    Logger.warn('%cBegining Tests', 'font:2em monospace');
    AllPass(
      ExampleEcho(),
      NewlineTokenization(),
      Multiply(),
      //SingleFile(),
      //Reunion(),
      //AllTheFacts(),
      //Twins(),
      //Aesop(),
      //NotChunky()
    )
      .subscribe((p) => Logger.log(`%c${p ? 'All Passed' : 'Attention Required'}`, `font: 2em monospace; color: ${p ? 'green' : 'red'};`));
  }

}

// Script is defered, so we know the body and its static contents are ready.
// Go Go!
UserSolutions.RunAll();
