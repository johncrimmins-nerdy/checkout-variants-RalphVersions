'use client';

/**
 * Authentication Modal - Shows authentication progress with animation
 * Parent component controls visibility timing
 */

import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AuthenticationModalProps {
  visible: boolean;
}

export default function AuthenticationModal({ visible }: AuthenticationModalProps) {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset animation state when becoming visible
      setAnimationComplete(false);

      // Start animation after a brief delay
      const timeout = setTimeout(() => {
        setAnimationComplete(true);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex cursor-wait items-center justify-center bg-[#1d192c]/95 backdrop-blur-sm">
      <div className="text-center">
        {/* Animated Checkmark */}
        <div className="mb-6 flex justify-center">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full bg-[#00BCD4] transition-all duration-500 ${
              animationComplete ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          >
            <CheckCircle
              className={`h-10 w-10 text-white transition-all delay-200 duration-300 ${
                animationComplete ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-xl font-semibold text-white">Authenticating Login</h2>

        {/* Subtitle */}
        <p className="text-white/70">We recognize your device and are logging you in</p>
      </div>
    </div>
  );
}
