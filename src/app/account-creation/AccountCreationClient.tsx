'use client';

/**
 * Account Creation Client Component
 * Handles post-purchase account setup for new customers
 */

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import Container from '@/components/layout/Container';
import { Button, Spinner } from '@/components/ui';
import { FLAGS, useFlags } from '@/hooks/use-flags';
import { IntegrationError, trackErrorWithContext } from '@/lib/analytics';
import { setupECommClient } from '@/lib/api/setup-ecomm-client';
import { getAccountCreationRedirectUrl } from '@/lib/utils/account-creation-helpers';
import { assetUrl } from '@/lib/utils/asset-url';

import PasswordRequirement from './PasswordRequirement';

export default function AccountCreationClient() {
  const searchParams = useSearchParams();
  const flags = useFlags();

  // Pre-fill email from URL query parameter (login=email)
  const [email, setEmail] = useState(searchParams.get('login') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Email validation
  const validateEmail = (value: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  // Password validation
  const validatePassword = (value: string): boolean => {
    return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
  };

  // Check individual password requirements
  const getPasswordRequirements = (value: string) => {
    return {
      hasLowerCase: /[a-z]/.test(value),
      hasMinLength: value.length >= 8,
      hasNumber: /[0-9]/.test(value),
      hasUpperCase: /[A-Z]/.test(value),
    };
  };

  const passwordReqs = getPasswordRequirements(password);
  const allRequirementsMet =
    passwordReqs.hasMinLength &&
    passwordReqs.hasUpperCase &&
    passwordReqs.hasLowerCase &&
    passwordReqs.hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    const isEmailValid = validateEmail(email);
    setEmailError(!isEmailValid);

    // Validate password
    const isPasswordValid = validatePassword(password);
    setPasswordError(!isPasswordValid);

    if (!isEmailValid || !isPasswordValid) {
      setError('Please fill in all required fields correctly.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await setupECommClient({ email, password });

      // Store client UUID and email for later use
      if (result.clientUUID) {
        sessionStorage.setItem('clientUUID', result.clientUUID);
      }
      sessionStorage.setItem('clientEmail', email);

      // Redirect based on return_to parameter or onboarding flag
      const returnTo = searchParams.get('return_to');
      const onboardingFlag = flags[FLAGS.ACT_417_ONBOARDING_WIZARD] ?? '';
      const enableOnboarding =
        typeof onboardingFlag === 'string' && onboardingFlag.includes('variant');

      window.location.href = getAccountCreationRedirectUrl(returnTo, enableOnboarding);
    } catch (err) {
      console.error('Account creation error:', err);

      // Track error for analytics
      trackErrorWithContext(
        new IntegrationError('Account creation error', {
          email: email || '',
          error: err instanceof Error ? err.message : String(err),
          payment_step: 'submit-account-creation-data',
        })
      );

      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <Container maxWidth="1440px">
          <Image
            alt="Varsity Tutors"
            className="h-8 w-auto"
            height={32}
            src={assetUrl('/images/vt-logo.svg')}
            unoptimized
            width={180}
          />
        </Container>
      </header>

      {/* Main Content - Two Column Layout */}
      <main>
        <Container maxWidth="1440px">
          <div className="flex min-h-[calc(100vh-80px)] flex-col lg:flex-row">
            {/* Left Column - White Background with Content */}
            <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
              <div className="w-full max-w-[28rem] text-center">
                {/* Success Message with CheckCircle Asset */}
                <div className="mx-auto mb-5 inline-flex items-center gap-2 bg-[#f6f8f6] px-4 py-3">
                  <Image
                    alt="Success"
                    height={32}
                    src={assetUrl('/images/CheckCircle.svg')}
                    unoptimized
                    width={32}
                  />
                  <span className="text-sm font-medium text-gray-800">
                    Thank you for your purchase!
                  </span>
                </div>

                <h1 className="mb-4 text-4xl font-bold text-brand-text">
                  Finish creating your account
                </h1>
                <p className="text-base text-gray-600">
                  This information will be used for signing in and getting session reminders.
                </p>
              </div>
            </div>

            {/* Right Column - Light Purple Background (#faf9fe) with Form */}
            <div className="flex w-full items-center justify-center bg-[#faf9fe] px-6 py-12 lg:w-1/2">
              <div className="w-full max-w-[22.5rem]">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div>
                    <div className={`error-wrapper ${emailError ? 'has-error' : ''}`}>
                      <div className="dynamic-input-label-wrapper">
                        <input
                          className="track-input track-input-focusin track-input-focusout mb-1 h-[56px] w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-brand-text focus:border-gray-400 focus:outline-none"
                          name="Email-Address"
                          onBlur={() => setEmailError(!validateEmail(email))}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError(false);
                            setError(null);
                          }}
                          placeholder=" "
                          required
                          type="email"
                          value={email}
                        />
                        <label>Email Address</label>
                      </div>
                      {emailError && (
                        <div className="form_error-msg">Please enter a valid email address.</div>
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className={`error-wrapper ${passwordError ? 'has-error' : ''}`}>
                      <div className="dynamic-input-label-wrapper relative">
                        <input
                          className="track-input track-input-focusin track-input-focusout mb-1 h-[56px] w-full rounded-lg border border-gray-300 bg-white px-4 pr-12 text-base text-brand-text focus:border-gray-400 focus:outline-none"
                          name="Password"
                          onBlur={() => setPasswordError(!validatePassword(password))}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                            setError(null);
                          }}
                          placeholder=" "
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                        />
                        <label>Password</label>
                        <button
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          <Image
                            alt={showPassword ? 'Hide password' : 'Show password'}
                            className="h-5 w-5"
                            height={20}
                            src={assetUrl(`/images/${showPassword ? 'EyeSlash' : 'Eye'}.svg`)}
                            unoptimized
                            width={20}
                          />
                        </button>
                      </div>
                      {/* Password Requirements List - Fades in/out smoothly */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          (password.length > 0 || passwordError) && !allRequirementsMet
                            ? 'max-h-48 opacity-100'
                            : 'max-h-0 opacity-0'
                        }`}
                        style={{ transitionProperty: 'max-height, opacity' }}
                      >
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="mb-2 text-sm font-medium text-gray-700">
                            Your password must contain:
                          </div>
                          <PasswordRequirement
                            isMet={passwordReqs.hasMinLength}
                            label="At least 8 characters"
                          />
                          <PasswordRequirement
                            isMet={passwordReqs.hasUpperCase}
                            label="One uppercase letter"
                          />
                          <PasswordRequirement
                            isMet={passwordReqs.hasLowerCase}
                            label="One lowercase letter"
                          />
                          <PasswordRequirement isMet={passwordReqs.hasNumber} label="One number" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="track-click mt-4"
                    data-element_id="create_account_submit"
                    data-element_type="button"
                    data-page_section="account_creation"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  {error && <div className="mt-2 text-center text-sm text-red-600">{error}</div>}

                  {isLoading && (
                    <div className="mt-4 flex justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
