'use client';

/**
 * Checkout Completed Modal - Shows success animation before redirect
 * Displays for minimum 3 seconds then redirects to the provided URL
 */

import { CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MINIMUM_DISPLAY_TIME_MS = 3000; // 3 seconds

interface CheckoutCompletedModalProps {
  /** URL to redirect to after the modal display time */
  redirectUrl?: null | string;
  visible: boolean;
}

export default function CheckoutCompletedModal({
  redirectUrl,
  visible,
}: CheckoutCompletedModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const showTimeRef = useRef<null | number>(null);
  const hasRedirectedRef = useRef(false);

  // Store redirectUrl in a ref so the timeout always has the latest value
  const redirectUrlRef = useRef(redirectUrl);

  // Update ref when redirectUrl changes
  useEffect(() => {
    redirectUrlRef.current = redirectUrl;
  }, [redirectUrl]);

  // Effect 1: Show modal when visible prop becomes true
  useEffect(() => {
    if (visible && !isVisible) {
      setIsVisible(true);
      showTimeRef.current = Date.now();

      // Start animation after a brief delay
      setTimeout(() => {
        setAnimationComplete(true);
      }, 300);
    }
  }, [visible, isVisible]);

  // Effect 2: Handle redirect timer - runs when isVisible becomes true
  // This is separate from Effect 1 so Strict Mode's double-invoke of Effect 1
  // doesn't clear this timer
  useEffect(() => {
    if (!isVisible) return;

    // Trigger redirect after minimum display time
    const timerId = setTimeout(() => {
      if (redirectUrlRef.current && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        window.location.href = redirectUrlRef.current;
      }
    }, MINIMUM_DISPLAY_TIME_MS);

    return () => {
      clearTimeout(timerId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d192c]/95 backdrop-blur-sm">
      <div className="text-center">
        {/* Animated Checkmark */}
        <div className="mb-6 flex justify-center">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full bg-[#00BCD4] transition-all duration-500 ${
              animationComplete ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          >
            <CheckCircle
              className={`h-12 w-12 text-white transition-all duration-300 delay-200 ${
                animationComplete ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-2xl font-bold text-white">Welcome back!</h2>

        {/* Subtitle */}
        <p className="text-lg text-white/80">
          Your learning plan is now active. Next up—requesting your new tutor.
        </p>
      </div>
    </div>
  );
}
