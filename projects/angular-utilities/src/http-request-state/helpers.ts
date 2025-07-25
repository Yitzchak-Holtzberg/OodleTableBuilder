import { HttpRequestState, HttpRequestStateError, HttpRequestStateInProgress, HttpRequestStateNotStarted, HttpRequestStateSuccess, HttpRequestStatus } from "./types";

export function isErrorState<T>(state: HttpRequestState<T>): state is HttpRequestStateError {
  return state.status === HttpRequestStatus.fail;
}

export function isSuccessState<T>(state: HttpRequestState<T>): state is HttpRequestStateSuccess<T> {
  return state.status === HttpRequestStatus.success;
}

export function isSuccessOrErrorState<T>(state: HttpRequestState<T>): state is (HttpRequestStateSuccess<T> | HttpRequestStateError) {
  return state.status === HttpRequestStatus.success || state.status === HttpRequestStatus.fail;
}

export function createSuccess<T>(body: T): HttpRequestStateSuccess<T> {
  return { status: HttpRequestStatus.success, body };
}

export function createFailure(error: any): HttpRequestStateError {
  return { status: HttpRequestStatus.fail, error };
}

export const notStarted: HttpRequestStateNotStarted = { status: HttpRequestStatus.notStarted };


export const inProgress: HttpRequestStateInProgress = { status: HttpRequestStatus.inProgress };

export function statusIsSuccessOrInProgress( status: HttpRequestStatus) {
  return [HttpRequestStatus.success, HttpRequestStatus.inProgress].includes(status);
}