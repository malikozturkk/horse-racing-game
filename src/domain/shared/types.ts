declare const __brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type HorseId = Brand<number, "HorseId">;
export type RoundId = Brand<string, "RoundId">;
export type SeasonId = Brand<string, "SeasonId">;

export const asHorseId = (n: number): HorseId => n as HorseId;
export const asRoundId = (s: string): RoundId => s as RoundId;
export const asSeasonId = (s: string): SeasonId => s as SeasonId;

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export interface DomainError {
  readonly code: string;
  readonly message: string;
  readonly cause?: unknown;
}

export const domainError = (
  code: string,
  message: string,
  cause?: unknown
): DomainError => ({ code, message, cause });
