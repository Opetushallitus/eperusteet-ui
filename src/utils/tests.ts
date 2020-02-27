import Vue from 'vue';
import * as _ from 'lodash';
import VueCompositionApi, { ref, computed, reactive } from '@vue/composition-api';

import { mount, Wrapper, WrapperArray, createLocalVue, RouterLinkStub } from '@vue/test-utils';
Vue.use(VueCompositionApi);

type Constructable<T> = new(...params: any[]) => T;

/**
 * Mocks given store.
 *
 * @returns {undefined}
 */
export function mock<T>(X: Constructable<T>, overrides: Partial<T> = {}): T {
  const mocks: any = new X();
  for (const key of _.keys(X.prototype)) {
    mocks[key] = jest.fn();
  }
  return {
    ...mocks,
    ...overrides,
  };
}

/**
 * Allows iterating WrapperArray easily
 *
 * @returns {undefined}
 */
export function map<T extends Vue, R>(wrapper: WrapperArray<T>, fn: (param: Wrapper<T>) => R): R[] {
  const result = [] as R[];
  for (let idx = 0; idx < wrapper.length; ++idx) {
    result.push(fn(wrapper.at(idx)));
  }
  return result;
}
