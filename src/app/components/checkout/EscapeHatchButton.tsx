'use client';

import { trackEscapePlanClicked } from '@/lib/analytics';

/**
 * Escape hatch button that redirects users to webflow checkout.
 * Adds ab_checkout=webflow param to current URL.
 */
export default function EscapeHatchButton() {
  const handleClick = () => {
    trackEscapePlanClicked();
    const url = new URL(window.location.href);
    url.searchParams.set('ab_checkout', 'webflow');
    window.location.href = url.toString();
  };

  return (
    <button
      aria-label="Switch to alternative checkout"
      className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
      onClick={handleClick}
      type="button"
    >
      <span aria-hidden="true" className="text-xl">
        ?
      </span>
    </button>
  );
}
