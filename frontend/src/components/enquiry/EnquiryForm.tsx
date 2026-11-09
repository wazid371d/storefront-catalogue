import { FormEvent, useRef, useState } from 'react';
import { submitEnquiry } from '../../api/enquiries';
import { ApiError } from '../../api/client';

interface EnquiryFormProps {
  productId: string;
  productTitle: string;
  /** called when the customer dismisses the post-submit confirmation (e.g. closes the dialog) */
  onDone?: () => void;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RequiredField = Exclude<keyof FormValues, 'phone'>;

// Order matters: this is also the order focus moves to the first invalid field.
const REQUIRED_FIELD_ORDER: RequiredField[] = ['name', 'email', 'message'];

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please Enter a valid email address.';
  if (values.message.trim().length < 10) errors.message = 'Tell us a little more — at least 10 characters.';
  return errors;
}

export function EnquiryForm({ productId, productTitle, onDone }: EnquiryFormProps) {
  const [values, setValues] = useState<FormValues>({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fieldRefs = { name: nameInputRef, email: emailInputRef, message: messageInputRef };

  function updateField<K extends keyof FormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    setSubmitError(null);

    if (Object.keys(fieldErrors).length > 0) {
      // Move focus to the first invalid field so its error is announced
      // immediately, instead of leaving an AT user to discover it by chance.
      const firstInvalid = REQUIRED_FIELD_ORDER.find((field) => fieldErrors[field]);
      if (firstInvalid) fieldRefs[firstInvalid].current?.focus();
      return;
    }

    setStatus('submitting');
    try {
      await submitEnquiry({ productId, ...values, phone: values.phone || undefined });
      setStatus('submitted');
    } catch (err) {
      setStatus('idle');
      if (err instanceof ApiError && err.fieldErrors) {
        const next: FieldErrors = {};
        for (const fieldError of err.fieldErrors) {
          if (fieldError.field in values) {
            next[fieldError.field as keyof FormValues] = fieldError.message;
          }
        }
        setErrors(next);
      }
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (status === 'submitted') {
    return (
      <div className="enquiry-confirmation">
        <p className="enquiry-confirmation__title">Thank you!</p>
        <p>We&rsquo;ve passed your enquiry about &ldquo;{productTitle}&rdquo; to our team — expect to hear back soon.</p>
        {onDone && (
          <button type="button" className="button" onClick={onDone}>
            Done
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {submitError && (
        <p className="enquiry-form__submit-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="form-field">
        <label htmlFor="enquiry-name">Name</label>
        <input
          id="enquiry-name"
          ref={nameInputRef}
          value={values.name}
          onChange={(event) => updateField('name', event.target.value)}
          aria-required="true"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'enquiry-name-error' : undefined}
        />
        {errors.name && (
          <span id="enquiry-name-error" className="form-field__error">
            {errors.name}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="enquiry-email">Email</label>
        <input
          id="enquiry-email"
          ref={emailInputRef}
          type="email"
          value={values.email}
          onChange={(event) => updateField('email', event.target.value)}
          aria-required="true"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'enquiry-email-error' : undefined}
        />
        {errors.email && (
          <span id="enquiry-email-error" className="form-field__error">
            {errors.email}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="enquiry-phone">Phone (optional)</label>
        <input id="enquiry-phone" value={values.phone} onChange={(event) => updateField('phone', event.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="enquiry-message">Message</label>
        <textarea
          id="enquiry-message"
          ref={messageInputRef}
          value={values.message}
          onChange={(event) => updateField('message', event.target.value)}
          aria-required="true"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'enquiry-message-error' : undefined}
        />
        {errors.message && (
          <span id="enquiry-message-error" className="form-field__error">
            {errors.message}
          </span>
        )}
      </div>

      <div className="enquiry-form__actions">
        <button type="submit" className="button" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
        </button>
      </div>
    </form>
  );
}
