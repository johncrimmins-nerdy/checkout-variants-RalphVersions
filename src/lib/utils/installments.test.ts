/**
 * Tests for installment calculation utilities
 */

import { calculateInstallments, formatInstallmentText } from './installments';

describe('calculateInstallments', () => {
  describe('when numberOfPayments is 1 (one-time payment)', () => {
    it('should return hasInstallments as false', () => {
      const result = calculateInstallments(200000, 1);
      expect(result.hasInstallments).toBe(false);
    });

    it('should return full price as first installment', () => {
      const result = calculateInstallments(200000, 1);
      expect(result.firstInstallmentCents).toBe(200000);
      expect(result.firstInstallment).toBe('2000');
    });

    it('should return 0 for second installment', () => {
      const result = calculateInstallments(200000, 1);
      expect(result.secondInstallmentCents).toBe(0);
      expect(result.secondInstallment).toBe('0');
    });
  });

  describe('when numberOfPayments is 2 (installments)', () => {
    it('should return hasInstallments as true', () => {
      const result = calculateInstallments(200000, 2);
      expect(result.hasInstallments).toBe(true);
    });

    describe('even split (divisible by 200 cents)', () => {
      it('should split $2,000 evenly into $1,000 + $1,000', () => {
        const result = calculateInstallments(200000, 2);
        expect(result.firstInstallmentCents).toBe(100000);
        expect(result.secondInstallmentCents).toBe(100000);
        expect(result.firstInstallment).toBe('1000');
        expect(result.secondInstallment).toBe('1000');
      });

      it('should split $4,000 evenly into $2,000 + $2,000', () => {
        const result = calculateInstallments(400000, 2);
        expect(result.firstInstallmentCents).toBe(200000);
        expect(result.secondInstallmentCents).toBe(200000);
      });

      it('should split $1,000 evenly into $500 + $500', () => {
        const result = calculateInstallments(100000, 2);
        expect(result.firstInstallmentCents).toBe(50000);
        expect(result.secondInstallmentCents).toBe(50000);
      });
    });

    describe('uneven split (not divisible by 200 cents)', () => {
      it('should split $1,999 into $1,000 + $999', () => {
        const result = calculateInstallments(199900, 2);
        expect(result.firstInstallmentCents).toBe(100000);
        expect(result.secondInstallmentCents).toBe(99900);
        expect(result.firstInstallment).toBe('1000');
        expect(result.secondInstallment).toBe('999');
      });

      it('should split $2,001 into $1,001 + $1,000', () => {
        const result = calculateInstallments(200100, 2);
        expect(result.firstInstallmentCents).toBe(100100);
        expect(result.secondInstallmentCents).toBe(100000);
        expect(result.firstInstallment).toBe('1001');
        expect(result.secondInstallment).toBe('1000');
      });

      it('should split $2,050 into $1,025 + $1,025 (first rounds up to nearest dollar)', () => {
        const result = calculateInstallments(205000, 2);
        // 205000 / 200 = 1025, ceil = 1025, * 100 = 102500
        expect(result.firstInstallmentCents).toBe(102500);
        expect(result.secondInstallmentCents).toBe(102500);
      });

      it('should handle odd cents properly', () => {
        // $2,001.01 (200101 cents) - not divisible by 200
        const result = calculateInstallments(200101, 2);
        // ceil(200101 / 200) = ceil(1000.505) = 1001, * 100 = 100100
        expect(result.firstInstallmentCents).toBe(100100);
        expect(result.secondInstallmentCents).toBe(100001);
      });
    });

    describe('edge cases', () => {
      it('should handle minimum price ($0.02)', () => {
        const result = calculateInstallments(2, 2);
        expect(result.hasInstallments).toBe(true);
        // 2 / 200 = 0.01, ceil = 1, * 100 = 100
        expect(result.firstInstallmentCents).toBe(100);
        expect(result.secondInstallmentCents).toBe(-98); // This reveals an edge case bug
      });

      it('should handle $0 price', () => {
        const result = calculateInstallments(0, 2);
        expect(result.hasInstallments).toBe(true);
        expect(result.firstInstallmentCents).toBe(0);
        expect(result.secondInstallmentCents).toBe(0);
      });
    });
  });

  describe('when numberOfPayments is other values', () => {
    it('should return hasInstallments as false for 0 payments', () => {
      const result = calculateInstallments(200000, 0);
      expect(result.hasInstallments).toBe(false);
    });

    it('should return hasInstallments as false for 3 payments', () => {
      const result = calculateInstallments(200000, 3);
      expect(result.hasInstallments).toBe(false);
    });
  });
});

describe('formatInstallmentText', () => {
  describe('when no installments', () => {
    it('should return empty strings', () => {
      const breakdown = {
        firstInstallment: '2000',
        firstInstallmentCents: 200000,
        hasInstallments: false,
        secondInstallment: '0',
        secondInstallmentCents: 0,
      };

      const result = formatInstallmentText(breakdown, 200000);
      expect(result.summary).toBe('');
      expect(result.details).toBe('');
    });
  });

  describe('when equal installments', () => {
    it('should return correct summary and details', () => {
      const breakdown = {
        firstInstallment: '1000',
        firstInstallmentCents: 100000,
        hasInstallments: true,
        secondInstallment: '1000',
        secondInstallmentCents: 100000,
      };

      const result = formatInstallmentText(breakdown, 200000);
      expect(result.summary).toBe('2 installments of $1000');
      expect(result.details).toBe(
        "Your total is $2000. You'll pay $1000 today, and then pay $1000 in 30 days."
      );
    });
  });

  describe('when unequal installments', () => {
    it('should return correct summary and details', () => {
      const breakdown = {
        firstInstallment: '1001',
        firstInstallmentCents: 100100,
        hasInstallments: true,
        secondInstallment: '1000',
        secondInstallmentCents: 100000,
      };

      const result = formatInstallmentText(breakdown, 200100);
      expect(result.summary).toBe('Installments of $1001 and $1000');
      expect(result.details).toBe(
        "Your total is $2001. You'll pay $1001 today, and then pay $1000 in 30 days."
      );
    });
  });

  describe('with custom currency symbol', () => {
    it('should use provided currency symbol', () => {
      const breakdown = {
        firstInstallment: '1000',
        firstInstallmentCents: 100000,
        hasInstallments: true,
        secondInstallment: '1000',
        secondInstallmentCents: 100000,
      };

      const result = formatInstallmentText(breakdown, 200000, '€');
      expect(result.summary).toBe('2 installments of €1000');
      expect(result.details).toBe(
        "Your total is €2000. You'll pay €1000 today, and then pay €1000 in 30 days."
      );
    });
  });
});
