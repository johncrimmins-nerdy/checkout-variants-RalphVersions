/**
 * Tests for PricingCard component
 * Displays pricing information to users
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PricingCard from './PricingCard';

describe('PricingCard', () => {
  const defaultProps = {
    entitledHours: 10,
    priceCents: 50000,
  };

  describe('light variant (default)', () => {
    it('should render hours and price', () => {
      render(<PricingCard {...defaultProps} />);

      expect(screen.getByText('10 hours')).toBeInTheDocument();
      expect(screen.getByText(/\$500/)).toBeInTheDocument();
    });

    it('should show "Selected plan" label for memberships', () => {
      render(<PricingCard {...defaultProps} />);

      expect(screen.getByText('Selected plan')).toBeInTheDocument();
    });

    it('should show "Package details" label for packages', () => {
      render(<PricingCard {...defaultProps} isPackage />);

      expect(screen.getByText('Package details')).toBeInTheDocument();
    });

    it('should show /mo suffix for memberships', () => {
      render(<PricingCard {...defaultProps} />);

      expect(screen.getByText('/mo')).toBeInTheDocument();
    });

    it('should not show /mo suffix for packages', () => {
      render(<PricingCard {...defaultProps} isPackage />);

      expect(screen.queryByText('/mo')).not.toBeInTheDocument();
    });

    it('should show discount when oldPriceCents is provided', () => {
      render(<PricingCard {...defaultProps} discountLabel="-20%" oldPriceCents={62500} />);

      expect(screen.getByText('-20%')).toBeInTheDocument();
      expect(screen.getByText(/\$625/)).toBeInTheDocument();
    });

    it('should show plan switcher when switcherText and onSwitchPlan are provided', async () => {
      const user = userEvent.setup();
      const mockOnSwitch = jest.fn();

      render(
        <PricingCard {...defaultProps} onSwitchPlan={mockOnSwitch} switcherText="Change plan" />
      );

      const switcherButton = screen.getByRole('button', { name: 'Change plan' });
      expect(switcherButton).toBeInTheDocument();

      await user.click(switcherButton);
      expect(mockOnSwitch).toHaveBeenCalledTimes(1);
    });

    it('should not show plan switcher when only one prop is provided', () => {
      render(<PricingCard {...defaultProps} switcherText="Change plan" />);

      expect(screen.queryByRole('button', { name: 'Change plan' })).not.toBeInTheDocument();
    });
  });

  describe('dark variant', () => {
    it('should render with dark theme styles', () => {
      render(<PricingCard {...defaultProps} variant="dark" />);

      expect(screen.getByText('Your Recommended Plan')).toBeInTheDocument();
      expect(screen.getByText('10 hours of 1-on-1 tutoring per month')).toBeInTheDocument();
    });

    it('should show custom card label', () => {
      render(<PricingCard {...defaultProps} cardLabel="Special Offer" variant="dark" />);

      expect(screen.getByText('Special Offer')).toBeInTheDocument();
    });

    it('should transform discount label for dark theme', () => {
      render(
        <PricingCard {...defaultProps} discountLabel="-20%" oldPriceCents={62500} variant="dark" />
      );

      expect(screen.getByText('Save 20%')).toBeInTheDocument();
    });

    it('should show plan name', () => {
      render(<PricingCard {...defaultProps} planName="Premium Plan" variant="dark" />);

      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
    });
  });

  describe('dark-inline variant', () => {
    it('should render without box container', () => {
      const { container } = render(<PricingCard {...defaultProps} variant="dark-inline" />);

      // Should have border-b but not rounded-xl (box container)
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('border-b');
      expect(wrapper.className).not.toContain('rounded-xl');
    });
  });

  describe('installments', () => {
    const installmentProps = {
      ...defaultProps,
      firstInstallment: '250',
      hasInstallments: true,
      isPackage: true,
      secondInstallment: '250',
    };

    it('should show installment summary for equal payments', () => {
      render(<PricingCard {...installmentProps} />);

      expect(screen.getByText('2 installments of $250')).toBeInTheDocument();
    });

    it('should show installment summary for unequal payments', () => {
      render(<PricingCard {...installmentProps} firstInstallment="260" secondInstallment="240" />);

      expect(screen.getByText('Installments of $260 and $240')).toBeInTheDocument();
    });

    it('should show installment details', () => {
      render(<PricingCard {...installmentProps} />);

      expect(
        screen.getByText(/You'll pay \$250 today, and then pay \$250 in 30 days/)
      ).toBeInTheDocument();
    });

    it('should show installment on discount row in dark variant', () => {
      render(<PricingCard {...installmentProps} oldPriceCents={62500} variant="dark" />);

      expect(screen.getByText('2 installments of $250')).toBeInTheDocument();
    });
  });

  describe('currency support', () => {
    it('should display USD ($) by default', () => {
      render(<PricingCard {...defaultProps} />);

      expect(screen.getByText(/\$500/)).toBeInTheDocument();
    });

    it('should display CAD (CA$) when currencyCode is CAD', () => {
      render(<PricingCard {...defaultProps} currencyCode="CAD" />);

      expect(screen.getByText(/CA\$500/)).toBeInTheDocument();
    });

    it('should display GBP (£) when currencyCode is GBP', () => {
      render(<PricingCard {...defaultProps} currencyCode="GBP" />);

      expect(screen.getByText(/£500/)).toBeInTheDocument();
    });

    it('should use correct currency symbol in installment text', () => {
      render(
        <PricingCard
          {...defaultProps}
          currencyCode="CAD"
          firstInstallment="250"
          hasInstallments
          isPackage
          secondInstallment="250"
        />
      );

      expect(screen.getByText('2 installments of CA$250')).toBeInTheDocument();
      expect(screen.getByText(/CA\$250 today/)).toBeInTheDocument();
    });

    it('should use correct currency symbol for old price', () => {
      render(
        <PricingCard
          {...defaultProps}
          currencyCode="GBP"
          discountLabel="-20%"
          oldPriceCents={62500}
        />
      );

      expect(screen.getByText(/£625/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper button type for plan switcher', () => {
      render(<PricingCard {...defaultProps} onSwitchPlan={() => {}} switcherText="Change plan" />);

      const button = screen.getByRole('button', { name: 'Change plan' });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should have tracking data attributes on switcher button', () => {
      render(<PricingCard {...defaultProps} onSwitchPlan={() => {}} switcherText="Change plan" />);

      const button = screen.getByRole('button', { name: 'Change plan' });
      expect(button).toHaveAttribute('data-element_id', 'plan-switcher');
      expect(button).toHaveAttribute('data-element_type', 'button');
      expect(button).toHaveAttribute('data-page_section', 'plan-select');
    });
  });

  describe('discount label display', () => {
    it('displays discountLabel when provided (light variant)', () => {
      render(
        <PricingCard
          {...defaultProps}
          discountLabel="-20%"
          oldPriceCents={62500}
          priceCents={50000}
        />
      );

      expect(screen.getByText('-20%')).toBeInTheDocument();
    });

    it('displays discountLabel transformed for dark variant', () => {
      render(
        <PricingCard
          {...defaultProps}
          discountLabel="-20%"
          oldPriceCents={62500}
          priceCents={50000}
          variant="dark"
        />
      );

      expect(screen.getByText('Save 20%')).toBeInTheDocument();
    });

    it('does not show discount label when not provided', () => {
      render(<PricingCard {...defaultProps} oldPriceCents={62500} priceCents={50000} />);

      // Without discountLabel, no discount badge should appear
      expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
    });
  });
});
