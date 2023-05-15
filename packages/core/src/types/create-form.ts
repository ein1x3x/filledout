import { Effect, Event, Store } from 'effector';
import { ErrorsMap, ValidationTriggersConfiguration } from './common';

type CreateFormParams<V, O = V> = {
  reinitialize?: boolean;

  onSubmit?: Effect<O, any>;

  isDisabled?: Store<boolean>;

  initialValues: Store<V> | V;

  resetOn?: (Event<any> | Effect<any, any>)[];

  validateOn?: (Event<any> | Effect<any, any>)[];

  meta?: Record<string, any> | Store<Record<string, any>>;

  onReject?: Effect<{ values: V; errors: ErrorsMap }, any>;
} & ValidationTriggersConfiguration;

type CreateFormFactoryParams = ValidationTriggersConfiguration;

export type { CreateFormFactoryParams, CreateFormParams };
