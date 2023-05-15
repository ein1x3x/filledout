import deepmerge from 'deepmerge';
import { createEvent, createStore, Event, is, sample, Store } from 'effector';
import { set as setProperty } from 'object-path-immutable';
import { reset as resetAll } from 'patronum/reset';
import {
  ErrorsMap,
  FieldUIEvent,
  FormModel,
  RejectionPayload
} from './types/common';
import { CreateFormFactoryParams, CreateFormParams } from './types/create-form';
import { DeepPartial, PathPayload, PathValuePair } from './types/utils';

const createFormFactory = ({
  showValidationOn: showValidationOnDefaults
}: CreateFormFactoryParams) => {
  const createForm = <V, O = V>({
    meta,
    resetOn,
    onSubmit,
    onReject,
    isDisabled,
    validateOn,
    reinitialize,
    initialValues,
    showValidationOn = showValidationOnDefaults
  }: CreateFormParams<V, O>): FormModel<V, O> => {
    // events
    const submitted = createEvent<O>();

    const blured = createEvent<PathPayload>();

    const focused = createEvent<PathPayload>();

    const dispatch = createEvent<FieldUIEvent>();

    const changed = createEvent<PathValuePair>();

    const rejected = createEvent<RejectionPayload<V>>();

    // methods

    const put = createEvent<V>();

    const reset = createEvent<void>();

    const patch = createEvent<DeepPartial<V>>();

    const submit = createEvent<void | any>();

    const set = createEvent<PathValuePair>();

    const setMeta = createEvent<PathValuePair>();

    const clearMeta = createEvent<PathValuePair>();

    const change = createEvent<PathValuePair>();

    const validate = createEvent<void>();

    const $initialValues = (
      is.store(initialValues) ? initialValues : createStore(initialValues)
    ) as Store<V>;

    // state
    // eslint-disable-next-line effector/no-getState
    const $values = createStore<V>($initialValues.getState());

    const $focused = createStore<string>(null!);

    const $isDisabled = isDisabled ?? createStore(false);

    const $submitCount = createStore(0);

    const $dirty = createStore<Record<string, boolean>>({});

    const $touched = createStore<Record<string, boolean>>({});

    const $errors = createStore<ErrorsMap>({});

    const $meta = meta
      ? is.store(meta)
        ? meta
        : createStore(meta)
      : createStore<Record<string, any>>({});

    // calculated

    const $isValid = $errors.map(state => {
      const values = Object.values(state);

      if (values.length == 0) return true;

      return values.every(one => Object.keys(one).length == 0);
    });

    const $isDirty = $dirty.map(state => Object.keys(state).length > 0);

    const $isTouched = $touched.map(state => Object.keys(state).length > 0);

    const $isFocused = $focused.map(Boolean);

    const $isSubmitted = $submitCount.map(count => count > 0);

    sample({
      clock: patch as Event<V>,

      source: $values,

      fn: (values, payload) =>
        deepmerge(values, payload, {
          arrayMerge: (_, sourceArray) => sourceArray
        }) as V,

      target: $values
    });

    if (reinitialize) {
      sample({
        clock: $initialValues.updates,

        target: [reset, put]
      });
    }

    sample({
      clock: reset,

      source: $initialValues,

      target: $values
    });

    sample({
      clock: put,

      target: $values
    });

    sample({
      clock: [change, set],

      source: $values,

      fn: (values, { path, value }) => {
        return setProperty(values, path, value);
      },

      target: $values
    });

    sample({
      clock: change,

      target: changed
    });

    sample({
      clock: focused,

      fn: ({ path }) => path,

      target: $focused
    });

    sample({
      clock: blured,

      fn: () => null as unknown as string,

      target: $focused
    });

    sample({
      clock: submit,

      source: $submitCount,

      fn: count => count + 1,

      target: $submitCount
    });

    sample({
      clock: change,

      source: $dirty,

      fn: (state, { path }) => ({
        ...state,
        [path]: true
      }),

      target: $dirty
    });

    sample({
      clock: blured,

      source: $touched,

      fn: (state, { path }) => ({
        ...state,
        [path]: true
      }),

      target: $touched
    });

    if (reinitialize) {
      sample({
        clock: $initialValues.updates,

        target: $values
      });
    }

    sample({
      clock: reset,

      source: $initialValues,

      target: $values
    });

    resetAll({
      clock: reset,

      target: [$dirty, $errors, $focused, $submitCount, $touched]
    });

    if (onSubmit) {
      sample({
        clock: submitted,

        target: onSubmit
      });
    }

    if (onReject) {
      sample({
        clock: rejected,

        target: onReject
      });
    }

    if (resetOn) {
      sample({
        clock: resetOn,

        target: reset
      });
    }

    if (validateOn) {
      sample({
        clock: validateOn,

        target: validate
      });
    }

    const form = {
      $meta,
      $dirty,
      $errors,
      $values,
      $focused,
      $isDirty,
      $isValid,
      $touched,
      $isFocused,
      $isTouched,
      $isDisabled,
      $isSubmitted,
      $submitCount,
      $initialValues,

      put,
      set,
      reset,
      patch,
      blured,
      change,
      submit,
      changed,
      focused,
      setMeta,
      rejected,
      validate,
      dispatch,
      clearMeta,
      submitted,

      showValidationOn
    };

    return form;
  };

  return createForm;
};

export { createFormFactory };
