import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  validateCheckoutForm,
} from './validate-checkout-form';

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('invalid@example')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('should accept passwords with 8 or more characters', () => {
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('password123')).toBe(true);
    expect(isValidPassword('a'.repeat(8))).toBe(true);
  });

  it('should reject passwords with fewer than 8 characters', () => {
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('pass')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should validate 10-digit phone numbers', () => {
    expect(isValidPhone('1234567890')).toBe(true);
    expect(isValidPhone('(123) 456-7890')).toBe(true);
    expect(isValidPhone('123-456-7890')).toBe(true);
  });

  it('should validate 11-digit phone numbers starting with 1', () => {
    expect(isValidPhone('11234567890')).toBe(true);
    expect(isValidPhone('1-123-456-7890')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('21234567890')).toBe(false); // 11 digits not starting with 1
    expect(isValidPhone('')).toBe(false);
  });
});

describe('validateCheckoutForm', () => {
  it('should validate all fields correctly', () => {
    const result = validateCheckoutForm({
      email: 'test@example.com',
      name: 'John Doe',
      password: 'password123',
      phone: '1234567890',
      termsAccepted: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should return errors for invalid fields', () => {
    const result = validateCheckoutForm({
      email: 'invalid',
      name: 'J',
      password: '123',
      phone: '123',
      termsAccepted: false,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
    expect(result.errors.name).toBeDefined();
    expect(result.errors.password).toBeDefined();
    expect(result.errors.phone).toBeDefined();
    expect(result.errors.terms).toBeDefined();
  });

  it('should only validate provided fields', () => {
    const result = validateCheckoutForm({
      email: 'test@example.com',
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should handle empty name strings', () => {
    const result = validateCheckoutForm({
      name: '  ',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });
});
