'use client';

import { useEffect } from 'react';

/**
 * Optimized Meta Pixel Loader
 *
 * Performance optimizations:
 * 1. Captures fbclid immediately (0ms) - No attribution loss
 * 2. Stores attribution data in cookies before pixel loads
 * 3. Loads Meta Pixel script after delay (non-blocking)
 * 4. Integrates with existing event deduplication system
 */

interface MetaPixelLoaderProps {
  loadDelay?: number;
  pixelId: string;
}

export function MetaPixelLoader({ loadDelay = 2000, pixelId }: MetaPixelLoaderProps) {
  useEffect(() => {
    // STEP 1: Capture fbclid immediately (0ms delay)
    captureFbclidImmediately();

    // STEP 2: Set up Meta Pixel stub and queue init/PageView immediately
    // This ensures init is first in queue when the script processes it
    setupPixelStub();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq('init', pixelId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq('track', 'PageView');

    // STEP 3: Load actual Meta Pixel script after delay (non-blocking)
    const timer = setTimeout(() => {
      loadMetaPixelScript();
    }, loadDelay);

    return () => clearTimeout(timer);
  }, [pixelId, loadDelay]);

  return null;
}

/**
 * Builds cookie string with optional domain and Secure flag
 */
function buildCookieString(
  name: string,
  value: string,
  expiryDate: Date,
  rootDomain: null | string
): string {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const domainPart = rootDomain ? `; domain=.${rootDomain}` : '';
  const securePart = isSecure ? '; Secure' : '';

  return `${name}=${value}; expires=${expiryDate.toUTCString()}; path=/${domainPart}; SameSite=Lax${securePart}`;
}

/**
 * Capture fbclid from URL immediately and store in cookie
 */
function captureFbclidImmediately() {
  if (typeof window === 'undefined') return;

  try {
    const rootDomain = getRootDomain();

    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');

    if (fbclid) {
      const timestamp = Date.now();
      const fbcValue = `fb.1.${timestamp}.${fbclid}`;

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90);

      document.cookie = buildCookieString('_fbc', fbcValue, expiryDate, rootDomain);

      console.log('[Meta Pixel] fbclid captured immediately:', fbclid);
    }

    const existingFbp = getCookie('_fbp');
    if (!existingFbp) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 2147483647);
      const fbpValue = `fb.1.${timestamp}.${random}`;

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90);

      document.cookie = buildCookieString('_fbp', fbpValue, expiryDate, rootDomain);

      console.log('[Meta Pixel] _fbp cookie generated:', fbpValue);
    }
  } catch (error) {
    console.error('[Meta Pixel] Error capturing fbclid:', error);
  }
}

/**
 * Helper to get cookie value
 */
function getCookie(name: string): null | string {
  if (typeof document === 'undefined') return null;

  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Returns the root domain for cookie access, or null for localhost/IP addresses
 * where domain attribute should be omitted.
 */
function getRootDomain(): null | string {
  const hostname = window.location.hostname;

  // Skip domain attribute for localhost
  if (hostname === 'localhost') return null;

  // Skip domain attribute for IP addresses (IPv4 pattern)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return null;

  // Skip for single-level domains (no dots)
  if (!hostname.includes('.')) return null;

  // Extract root domain (e.g., varsitytutors.com from www.varsitytutors.com)
  return hostname.split('.').slice(-2).join('.');
}

/**
 * Load the actual Meta Pixel script.
 * Note: init and PageView are already queued via the stub, so the script
 * will process them when it loads.
 */
function loadMetaPixelScript() {
  if (typeof window === 'undefined') return;

  try {
    const existingScript = document.querySelector('script[src*="fbevents.js"]');
    if (existingScript) {
      console.log('[Meta Pixel] Script already exists, skipping');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.async = true;

    script.onload = () => {
      console.log('[Meta Pixel] Script loaded and processing queued events');
    };

    script.onerror = () => {
      console.error('[Meta Pixel] Failed to load script');
    };

    document.head.appendChild(script);
  } catch (error) {
    console.error('[Meta Pixel] Error loading script:', error);
  }
}

/**
 * Set up pixel stub for early fbq() calls
 */
function setupPixelStub() {
  if (typeof window === 'undefined') return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(window as any).fbq) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n: any = ((window as any).fbq = function (...args: unknown[]) {
      n.callMethod ? n.callMethod(...args) : n.queue.push(args);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any)._fbq) (window as any)._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
  }
}
