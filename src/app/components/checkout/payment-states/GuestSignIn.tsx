'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

import type { ThemeVariant } from '@/lib/styles/theme';

import { Button, ErrorMessage, Input, Spinner } from '@/components/ui';
import { trackUserLoginFailed } from '@/lib/analytics';
import { authenticateUser } from '@/lib/api/authenticate-user';
import { getFloatingLabelWrapperClass } from '@/lib/styles/theme';
import { assetUrl } from '@/lib/utils/asset-url';

interface GuestSignInProps {
  onSignInSuccess: (userID: string) => void;
  variant?: ThemeVariant;
}

const themeStyles: Record<
  ThemeVariant,
  {
    container: string;
    eyeButton: string;
    input: string;
    link: string;
    title: string;
  }
> = {
  dark: {
    container: '',
    eyeButton: 'absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white',
    input: 'h-input w-full rounded-lg border px-4 text-white focus:outline-none',
    link: 'text-sm text-accent-cyan hover:underline',
    title: 'mb-4 text-xl font-medium text-white',
  },
  light: {
    container: '',
    eyeButton: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700',
    input:
      'h-input w-full rounded-lg border border-gray-300 bg-white px-4 text-brand-text focus:border-gray-400 focus:outline-none',
    link: 'text-sm text-blue-600 hover:underline',
    title: 'mb-4 text-xl font-medium text-brand-text',
  },
};

export default function GuestSignIn({ onSignInSuccess, variant = 'light' }: GuestSignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const styles = themeStyles[variant];
  const wrapperClass = getFloatingLabelWrapperClass(variant);

  const validateForm = useCallback(
    (currentEmail: string, currentPassword: string): null | string => {
      const emptyFields: string[] = [];

      if (!currentEmail.trim()) {
        emptyFields.push('email address');
      }
      if (!currentPassword) {
        emptyFields.push('password');
      }

      if (emptyFields.length > 0) {
        const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
        return `Please enter your ${listFormatter.format(emptyFields)}`;
      }

      return null;
    },
    []
  );

  const runValidation = useCallback(
    (currentEmail: string = email, currentPassword: string = password) => {
      if (!hasAttemptedSubmit) return;
      const validationError = validateForm(currentEmail, currentPassword);
      setError(validationError);
    },
    [email, password, hasAttemptedSubmit, validateForm]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const validationError = validateForm(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await authenticateUser(email, password);

      if ('error' in result) {
        trackUserLoginFailed('invalid_credentials');
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      onSignInSuccess(result.userID);
    } catch (err) {
      console.error('Login failed:', err);
      trackUserLoginFailed(err instanceof Error ? err.message : 'unknown_error');
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative w-full max-w-[400px] ${styles.container}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Spinner theme={variant} />
        </div>
      )}

      <form
        className={`space-y-4 transition-all duration-200 ${isLoading ? 'pointer-events-none blur-[1px] opacity-50' : ''}`}
        onSubmit={handleSubmit}
      >
        <h3 className={`${styles.title} pb-2`}>Sign in to continue</h3>

        {error && <ErrorMessage theme={variant}>{error}</ErrorMessage>}

        <Input
          label="Email Address"
          name="Email-Address"
          onChange={(e) => {
            setEmail(e.target.value);
            runValidation(e.target.value, password);
          }}
          theme={variant}
          type="email"
          value={email}
        />

        <div className={`${wrapperClass} relative`}>
          <input
            className={`${styles.input} pr-12 track-input track-input-focusin track-input-focusout`}
            name="Password"
            onChange={(e) => {
              setPassword(e.target.value);
              runValidation(email, e.target.value);
            }}
            placeholder=" "
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
          <label>Password</label>
          <button
            className={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            <Image
              alt={showPassword ? 'Hide password' : 'Show password'}
              className="h-5 w-5"
              height={20}
              src={assetUrl(
                `/images/${showPassword ? 'EyeSlash' : 'Eye'}${variant === 'dark' ? '-white' : ''}.svg`
              )}
              unoptimized
              width={20}
            />
          </button>
        </div>

        <Button
          className="track-click"
          data-element_id="login_submit"
          data-element_type="button"
          data-page_section="express_checkout"
          isLoading={isLoading}
          loadingText="Signing in..."
          theme={variant}
          type="submit"
        >
          Sign in
        </Button>

        <div className="text-center">
          <a
            className={`${styles.link} track-click`}
            data-element_id="forgot_password"
            data-element_type="link"
            data-page_section="express_checkout"
            href="https://www.varsitytutors.com/passwords/forgot"
            rel="noopener noreferrer"
            target="_blank"
          >
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}
