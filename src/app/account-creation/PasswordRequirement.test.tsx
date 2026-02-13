/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';

import PasswordRequirement from './PasswordRequirement';

describe('PasswordRequirement', () => {
  describe('when requirement is not met', () => {
    it('renders the label text', () => {
      render(<PasswordRequirement isMet={false} label="At least 8 characters" />);

      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    });

    it('displays label in gray', () => {
      render(<PasswordRequirement isMet={false} label="At least 8 characters" />);

      const label = screen.getByText('At least 8 characters');
      expect(label).toHaveClass('text-gray-600');
    });

    it('does not display label in green', () => {
      render(<PasswordRequirement isMet={false} label="At least 8 characters" />);

      const label = screen.getByText('At least 8 characters');
      expect(label).not.toHaveClass('text-green-600');
    });
  });

  describe('when requirement is met', () => {
    it('renders the label text', () => {
      render(<PasswordRequirement isMet={true} label="At least 8 characters" />);

      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    });

    it('displays label in green', () => {
      render(<PasswordRequirement isMet={true} label="At least 8 characters" />);

      const label = screen.getByText('At least 8 characters');
      expect(label).toHaveClass('text-green-600');
    });

    it('does not display label in gray', () => {
      render(<PasswordRequirement isMet={true} label="At least 8 characters" />);

      const label = screen.getByText('At least 8 characters');
      expect(label).not.toHaveClass('text-gray-600');
    });
  });

  describe('different labels', () => {
    it('renders custom label text', () => {
      render(<PasswordRequirement isMet={false} label="Must include a number" />);

      expect(screen.getByText('Must include a number')).toBeInTheDocument();
    });

    it('renders special character requirement', () => {
      render(<PasswordRequirement isMet={true} label="Include special character" />);

      expect(screen.getByText('Include special character')).toBeInTheDocument();
    });
  });
});
