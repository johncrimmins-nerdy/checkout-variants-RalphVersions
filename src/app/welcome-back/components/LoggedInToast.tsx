'use client';

/**
 * Logged-in Toast - Shows notification when user is authenticated
 * Auto-hides after 5 seconds with slide animation
 */

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { assetUrl } from '@/lib/utils/asset-url';

const TOAST_DISPLAY_TIME_MS = 5000; // 5 seconds

interface LoggedInToastProps {
  onHide?: () => void;
  visible: boolean;
}

export default function LoggedInToast({ onHide, visible }: LoggedInToastProps) {
  const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (visible) {
      // Auto-hide after display time
      timeoutRef.current = setTimeout(() => {
        onHide?.();
      }, TOAST_DISPLAY_TIME_MS);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, onHide]);

  return (
    <div
      className={`fixed left-1/2 top-4 z-40 -translate-x-1/2 transition-all duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
        <Image
          alt=""
          className="h-5 w-5"
          height={20}
          src={assetUrl('/images/CheckCircle.svg')}
          width={20}
        />
        <span className="text-sm font-medium text-gray-900">You&apos;re logged in.</span>
      </div>
    </div>
  );
}
