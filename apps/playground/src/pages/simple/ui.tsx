import { useForm } from '@filledout/react';
import { Field } from '../../shared/field';
import { $$simple } from './model';

export const Simple = () => {
  const { fields, onSubmit } = useForm($$simple.$$form);

  return (
    <form
      onSubmit={event => {
        event?.preventDefault();
        onSubmit();
      }}
    >
      <Field.Input field={fields.email} label='Email' />
      <button type='submit'>Submit</button>
    </form>
  );
};
