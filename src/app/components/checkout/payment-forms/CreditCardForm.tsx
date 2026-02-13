'use client';

import type { HostedFieldsEvent } from 'braintree-web/hosted-fields';

import * as braintree from 'braintree-web';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { ThemeVariant } from '@/lib/styles/theme';

import { Button, ErrorMessage } from '@/components/ui';
import { trackCardFieldBlur, trackCardFieldFocused } from '@/lib/analytics';
import { useBraintreeClient } from '@/lib/payment/useBraintreeClient';
import { getFloatingLabelWrapperClass } from '@/lib/styles/theme';

export interface CreditCardFormData {
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
}

interface CreditCardFormProps {
  isVisible?: boolean;
  onBack: () => void;
  onComplete: (nonce: string, formData: CreditCardFormData) => Promise<void>;
  variant?: ThemeVariant;
}

const themeStyles: Record<
  ThemeVariant,
  {
    backButton: string;
    hostedFieldBg: string;
    hostedFieldLoadingBg: string;
    hostedFieldNotReady: string;
    hostedFieldReady: string;
    input: string;
    title: string;
  }
> = {
  dark: {
    backButton: 'text-blue-400 hover:text-blue-300',
    hostedFieldBg: '#4a5078',
    hostedFieldLoadingBg: '#4a5078',
    hostedFieldNotReady: 'pointer-events-none border',
    hostedFieldReady: 'border',
    input: 'border text-white',
    title: 'text-white',
  },
  light: {
    backButton: 'text-blue-600 hover:underline',
    hostedFieldBg: '#ffffff',
    hostedFieldLoadingBg: '#f3f4f6',
    hostedFieldNotReady: 'pointer-events-none border border-gray-300 bg-gray-100',
    hostedFieldReady: 'border border-gray-300 bg-white',
    input:
      'border border-gray-300 bg-white text-brand-text focus:border-gray-400 focus:outline-none',
    title: 'text-brand-text',
  },
};

export default function CreditCardForm({
  isVisible = true,
  onBack,
  onComplete,
  variant = 'light',
}: CreditCardFormProps) {
  const isDark = variant === 'dark';
  const [error, setError] = useState<null | string>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFieldsReady, setIsFieldsReady] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const hostedFieldsRef = useRef<braintree.HostedFields | null>(null);
  const initAttemptedRef = useRef(false);

  const styles = themeStyles[variant];
  const wrapperClass = getFloatingLabelWrapperClass(variant);

  const validateForm = useCallback(
    (
      currentFirstName: string,
      currentLastName: string,
      currentPostalCode: string
    ): null | string => {
      const emptyFields: string[] = [];
      const invalidFields: string[] = [];

      const hostedFieldLabels: Record<string, string> = {
        cvv: 'CVV',
        expirationDate: 'expiration date',
        number: 'card number',
      };

      // Check regular fields
      if (!currentFirstName.trim()) {
        emptyFields.push('first name');
      }
      if (!currentLastName.trim()) {
        emptyFields.push('last name');
      }
      if (!currentPostalCode.trim()) {
        emptyFields.push('zip code');
      }

      // Check hosted fields (card number, expiration, CVV)
      if (hostedFieldsRef.current) {
        const state = hostedFieldsRef.current.getState();
        const hostedFieldNames = ['number', 'expirationDate', 'cvv'] as const;

        for (const fieldName of hostedFieldNames) {
          const field = state.fields[fieldName];
          if (field.isEmpty) {
            emptyFields.push(hostedFieldLabels[fieldName]);
          } else if (!field.isValid) {
            invalidFields.push(hostedFieldLabels[fieldName]);
          }
        }
      }

      const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

      if (emptyFields.length > 0) {
        return `Please enter your ${listFormatter.format(emptyFields)}`;
      }

      if (invalidFields.length > 0) {
        return `Please enter a valid ${listFormatter.format(invalidFields)}`;
      }

      return null;
    },
    []
  );

  const runValidation = useCallback(
    (
      currentFirstName: string = firstName,
      currentLastName: string = lastName,
      currentPostalCode: string = postalCode
    ) => {
      if (!hasAttemptedSubmit) return;
      const validationError = validateForm(currentFirstName, currentLastName, currentPostalCode);
      setError(validationError);
    },
    [firstName, lastName, postalCode, hasAttemptedSubmit, validateForm]
  );

  // Ref to store the latest runValidation for use in event handlers
  const runValidationRef = useRef(runValidation);
  useEffect(() => {
    runValidationRef.current = runValidation;
  }, [runValidation]);

  const {
    client: braintreeClient,
    error: clientError,
    isLoading: isClientLoading,
  } = useBraintreeClient();

  useLayoutEffect(() => {
    // If hosted fields already exist (e.g., from React Strict Mode double-run),
    // reuse them instead of trying to create new ones
    if (hostedFieldsRef.current) {
      setIsFieldsReady(true);
      return;
    }

    if (initAttemptedRef.current) return;
    if (!braintreeClient) return;

    const client = braintreeClient;

    initAttemptedRef.current = true;
    let mounted = true;

    async function setupHostedFields() {
      try {
        setError(null);

        const hostedFields = await braintree.hostedFields.create({
          client,
          fields: {
            cvv: {
              placeholder: ' ',
              selector: '#cc-cvv',
            },
            expirationDate: {
              placeholder: ' ',
              selector: '#cc-expiration-date',
            },
            number: {
              placeholder: ' ',
              selector: '#cc-number',
            },
          },
          styles: {
            '::placeholder': {
              color: '#9ca3af',
            },
            ':focus': {
              outline: 'none',
            },
            input: {
              background: 'transparent',
              border: 'none',
              color: isDark ? '#ffffff' : '#1d192c',
              'font-family': 'General Sans, sans-serif',
              'font-size': '16px',
              'font-weight': '400',
              'line-height': '1.5',
              padding: '8px 12px',
              transition: 'background-color 5000s ease-in-out 0s',
            },
            'input.invalid': {
              color: '#ef4444',
            },
          },
        });

        // Always store the ref and set ready state - even if cleanup ran during async
        // (React Strict Mode simulates cleanup but doesn't actually unmount)
        hostedFieldsRef.current = hostedFields;
        setIsFieldsReady(true);

        // Only set up event handlers if still mounted
        if (mounted) {
          hostedFields.on('focus', (event: HostedFieldsEvent) => {
            const fieldName = event.emittedBy as 'cvv' | 'expirationDate' | 'number';
            trackCardFieldFocused(fieldName);

            const field = event.fields[event.emittedBy];
            const wrapper = field.container.closest('.dynamic-input-label-wrapper');
            if (wrapper) {
              wrapper.classList.add('is-focused');
            }
          });

          hostedFields.on('validityChange', () => {
            runValidationRef.current();
          });

          hostedFields.on('notEmpty', () => {
            runValidationRef.current();
          });

          hostedFields.on('blur', (event: HostedFieldsEvent) => {
            const fieldName = event.emittedBy as 'cvv' | 'expirationDate' | 'number';
            trackCardFieldBlur(fieldName);

            const field = event.fields[event.emittedBy];
            const wrapper = field.container.closest('.dynamic-input-label-wrapper');
            if (wrapper) {
              wrapper.classList.remove('is-focused');
              if (!field.isEmpty) {
                wrapper.classList.add('has-content');
              } else {
                wrapper.classList.remove('has-content');
              }
            }
          });
        }
      } catch (err) {
        console.error('Failed to initialize Braintree hosted fields:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load payment form');
        }
      }
    }

    void setupHostedFields();

    return () => {
      mounted = false;
    };
  }, [braintreeClient, isDark]);

  // Clear all fields on visibility toggle (for clean UX and to reset autofill state)
  useEffect(() => {
    if (!isVisible) {
      // Clear hosted fields when hidden for security
      if (hostedFieldsRef.current) {
        hostedFieldsRef.current.clear('number');
        hostedFieldsRef.current.clear('expirationDate');
        hostedFieldsRef.current.clear('cvv');
      }
      // Clear regular input fields to reset autofill CSS state
      setFirstName('');
      setLastName('');
      setPostalCode('');
      setHasAttemptedSubmit(false);
      setError(null);
      setIsProcessing(false);

      // Remove has-content class from hosted field wrappers since fields are now empty
      // This resets the floating labels to their default position
      document.querySelectorAll('#cc-number, #cc-expiration-date, #cc-cvv').forEach((el) => {
        const wrapper = el.closest('.dynamic-input-label-wrapper');
        if (wrapper) {
          wrapper.classList.remove('has-content');
          wrapper.classList.remove('is-focused');
        }
      });
    }
  }, [isVisible]);

  // Handle client error
  useEffect(() => {
    if (clientError) {
      setError(clientError.message);
    }
  }, [clientError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!hostedFieldsRef.current) {
      setError('Payment form not initialized');
      return;
    }

    // Validate all fields
    const validationError = validateForm(firstName, lastName, postalCode);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Tokenize the card
      const payload = await hostedFieldsRef.current.tokenize();

      await onComplete(payload.nonce, {
        email: '', // Not collected in form - will use buyer info from checkout details
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        postalCode: postalCode.trim(),
      });
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isClientLoading || !isFieldsReady;
  const hostedFieldBg = isLoading ? styles.hostedFieldLoadingBg : styles.hostedFieldBg;

  return (
    <form
      aria-hidden={!isVisible}
      className="w-full max-w-[400px] space-y-4"
      onSubmit={handleSubmit}
    >
      <h3 className={`pb-2 text-xl font-medium ${styles.title}`}>Pay with credit card</h3>

      {error && <ErrorMessage theme={variant}>{error}</ErrorMessage>}

      <div className="grid grid-cols-2 gap-4">
        <div className={wrapperClass}>
          <input
            className={`track-input track-input-focusin track-input-focusout h-input w-full rounded-lg px-3 ${styles.input}`}
            name="First-Name"
            onChange={(e) => {
              setFirstName(e.target.value);
              runValidation(e.target.value, lastName, postalCode);
            }}
            placeholder=" "
            tabIndex={isVisible ? 0 : -1}
            type="text"
            value={firstName}
          />
          <label>First name</label>
        </div>
        <div className={wrapperClass}>
          <input
            className={`track-input track-input-focusin track-input-focusout h-input w-full rounded-lg px-3 ${styles.input}`}
            name="Last-Name"
            onChange={(e) => {
              setLastName(e.target.value);
              runValidation(firstName, e.target.value, postalCode);
            }}
            placeholder=" "
            tabIndex={isVisible ? 0 : -1}
            type="text"
            value={lastName}
          />
          <label>Last name</label>
        </div>
      </div>

      <div className={`${wrapperClass} hosted-field-wrapper ${isLoading ? 'is-loading' : ''}`}>
        <div
          className={`hosted-field card-number-block mb-1 h-input w-full rounded-lg transition-all ${
            !isLoading ? styles.hostedFieldReady : styles.hostedFieldNotReady
          }`}
          id="cc-number"
          style={{ backgroundColor: hostedFieldBg }}
        ></div>
        <label className="dynamic-label">Card number</label>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className={`${wrapperClass} hosted-field-wrapper ${isLoading ? 'is-loading' : ''}`}>
          <div
            className={`hosted-field exp-date-block mb-1 h-input w-full rounded-lg transition-all ${
              !isLoading ? styles.hostedFieldReady : styles.hostedFieldNotReady
            }`}
            id="cc-expiration-date"
            style={{ backgroundColor: hostedFieldBg }}
          ></div>
          <label className="dynamic-label">Exp. date</label>
        </div>
        <div className={`${wrapperClass} hosted-field-wrapper ${isLoading ? 'is-loading' : ''}`}>
          <div
            className={`hosted-field cvv-number-block mb-1 h-input w-full rounded-lg transition-all ${
              !isLoading ? styles.hostedFieldReady : styles.hostedFieldNotReady
            }`}
            id="cc-cvv"
            style={{ backgroundColor: hostedFieldBg }}
          ></div>
          <label className="dynamic-label">CVV</label>
        </div>
        <div className={wrapperClass}>
          <input
            className={`track-input track-input-focusin track-input-focusout mb-1 h-input w-full rounded-lg px-3 ${styles.input}`}
            name="postal-code"
            onChange={(e) => {
              setPostalCode(e.target.value);
              runValidation(firstName, lastName, e.target.value);
            }}
            placeholder=" "
            tabIndex={isVisible ? 0 : -1}
            type="text"
            value={postalCode}
          />
          <label>Zip code</label>
        </div>
      </div>

      <Button
        className="track-click"
        data-element_id="submit_credit_card"
        data-element_type="button"
        data-page_section="express_checkout"
        disabled={isProcessing || isLoading}
        tabIndex={isVisible ? 0 : -1}
        theme={variant}
        type="submit"
      >
        {isProcessing ? 'Processing...' : isLoading ? 'Loading...' : 'Complete your purchase'}
      </Button>

      <Button
        className="track-click"
        data-element_id="change_payment_method"
        data-element_type="button"
        data-page_section="express_checkout"
        fullWidth={false}
        onClick={onBack}
        tabIndex={isVisible ? 0 : -1}
        theme={variant}
        type="button"
        variant="back"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path
            d="M15 12H9M12 15l-3-3 3-3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        Use a different payment method
      </Button>
    </form>
  );
}
