/**
 * Container component for constraining content width on ultrawide displays
 *
 * Industry Standards:
 * - Bootstrap 5: 1320px (xxl)
 * - Tailwind CSS: 1280px (max-w-7xl), 1536px (max-w-screen-2xl)
 * - Material Design: 1280px
 * - Webflow (this project): 1280px - 1440px
 *
 * Default: 1280px (most common across design systems)
 */

import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * Maximum width of the container
   * @default "1280px" - Industry standard for readable content
   * Options: "1280px" | "1440px" | "1536px" | "none"
   */
  maxWidth?: '1280px' | '1440px' | '1536px' | 'none';
}

export default function Container({
  children,
  className = '',
  maxWidth = '1280px',
}: ContainerProps) {
  const maxWidthStyles = maxWidth !== 'none' ? { maxWidth } : {};

  return (
    <div className={`mx-auto w-full ${className}`} style={maxWidthStyles}>
      {children}
    </div>
  );
}
