/**
 * Checkout form validation utilities
 */

export interface CheckoutFormValidation {
  errors: {
    email?: string;
    name?: string;
    password?: string;
    phone?: string;
    terms?: string;
  };
  isValid: boolean;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns True if valid, false otherwise
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters
  return password.length >= 8;
}

/**
 * Validate phone number
 * @param phone - Phone number to validate
 * @returns True if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's 10 digits or 11 digits starting with 1
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
}

/**
 * Validate checkout form
 * @param data - Form data to validate
 * @returns Validation result
 */
export function validateCheckoutForm(data: {
  email?: string;
  name?: string;
  password?: string;
  phone?: string;
  termsAccepted?: boolean;
}): CheckoutFormValidation {
  const errors: CheckoutFormValidation['errors'] = {};

  if (data.email !== undefined && !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (data.name !== undefined && data.name.trim().length < 2) {
    errors.name = 'Please enter your full name';
  }

  if (data.password !== undefined && !isValidPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (data.phone !== undefined && !isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (data.termsAccepted !== undefined && !data.termsAccepted) {
    errors.terms = 'You must accept the terms and conditions';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
