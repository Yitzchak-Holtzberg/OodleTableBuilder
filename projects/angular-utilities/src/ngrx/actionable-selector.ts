import { Action, createSelector, MemoizedSelector, Store } from "@ngrx/store";
import { v4 as uuid } from 'uuid';

class AppStoreCache {
  cache: {
    actionableSelectorId$: string,
    [key: string]: any;
  }[] = [];
  isInCache = (props: any, actionableSelectorId: string): boolean => {
    if(typeof props != 'object') props = { props };
    const valueToCache = { ...props, actionableSelectorId$: actionableSelectorId };
    if(this.cache.some(item => shallowEquals(item, valueToCache))) {
      return true;
    }
    this.cache.push(valueToCache);
    return false;
  }
}

let _store: Store<any>;
let _cache = new AppStoreCache();

const setStore = (store: Store) => {
  if(store instanceof Store) _store = store;
};
export function setUpStoreFactory(store: Store){
  return () => new Promise((resolve, reject) => {
    setStore(store);
    resolve(null);
  })
}

/**
 * Creates a selector that can dispatch an action if conditions are met.
 * Note: The props of the selector factory must include the props of the action.
 * @param selectorFactory A method that returns selector.
 * @param action The action that will be dispatched when conditions are met.
 * @param [dispatchIf = defaultFilter] Optional. A method that takes the result of the selector and returns a boolean. The actions gets dispatched
 * if true is returned. If no method is passed in than the action will be dispatched if the selector returns undefined or null.
 */
export const createActionableSelector = <State, Result, Props = any>(
  selectorFactory: (props?: Props) => MemoizedSelector<State, Result>,
  action: ActionReturner<Props | undefined>,
  dispatchIf: (data: Result) => boolean = defaultFilter,
): (props?: Props) => ActionableMemoizedSelector<State, Result> => {
  const id = uuid();
  const slctr = (props?: Props) => createSelector(
    selectorFactory(props),
    (selected: Result) => {
      if(dispatchIf(selected) && !_cache.isInCache(props, id)){
        _store.dispatch(action(props));
      }
      return selected;
    }
  ) as ActionableMemoizedSelector<State, Result>;
  return slctr;
}

type ActionableMemoizedSelector<State, Result> = MemoizedSelector<State, Result>;

export type ActionReturner<Props> = (props: Props) => Action;

export function defaultFilter(data: any) {
  return data == null || data == undefined;
}




/**
 * Returns a shallow clone without prop. Will not error if prop does not exist.
 * @param prop name of property to be removed.
 * @returns a shallow clone without prop
 */
 const deleteProp = <T extends {}, Prop extends string>(t: T, prop: keyof T & Prop): Omit<T, Prop> => {
  const copy = { ...t };
  delete copy[prop];
  return copy;
}

const shallowEquals = (first: object, second: object): boolean => {
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);
  if(firstKeys.length !== secondKeys.length) {
    return false;
  }
  for(let index = 0; index < firstKeys.length; index++) {
    const currentKey = firstKeys[index];
    if(first[currentKey] !== second[currentKey]){
      return false;
    }
  }
  return true;
}
