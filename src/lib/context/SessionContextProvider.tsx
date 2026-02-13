'use client';

/**
 * Session Context Provider for managing URL parameters and user state
 */

import { useSearchParams } from 'next/navigation';
import React, { createContext, useContext, useMemo } from 'react';

import { FLAGS, useFlags } from '@/hooks/use-flags';

export type PurchasableType = 'CATALOG_ITEM' | 'QUOTE';

interface SessionContextValue {
  clientID?: string;
  isLeadResubmissionFlow: boolean;
  promoCode?: string;
  purchasableID?: string;
  purchasableType?: PurchasableType;
  segmentGrade?: string;
  shouldUsePromoCode: () => boolean;
  subject?: string;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionContextProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const flags = useFlags();

  // Compute session data from URL params and feature flags
  const sessionData = useMemo(() => {
    const clientID = searchParams.get('c') ?? undefined;
    const purchasableID = (searchParams.get('q') || searchParams.get('catalogItemId')) ?? undefined;
    let promoCode = searchParams.get('p') ?? undefined;
    const purchasableType: PurchasableType = searchParams.get('q') ? 'QUOTE' : 'CATALOG_ITEM';
    const segmentGrade = searchParams.get('sg') ?? undefined;
    const subject = searchParams.get('sub') ?? undefined;

    const leadResubmissionEnabled = flags[FLAGS.ECOMM_614_LEAD_RESUBMISSION] ?? false;
    const isLeadResubmissionFlow = Boolean(subject && clientID && leadResubmissionEnabled);

    // Auto-apply promo code for churned clients
    const churnedClientPromoCode = flags[FLAGS.ECOMM_827_CHURNED_CLIENT_PROMOCODE] ?? 'none';
    if (isLeadResubmissionFlow && !promoCode && churnedClientPromoCode !== 'none') {
      promoCode = churnedClientPromoCode;
    }

    const shouldUsePromoCode = (): boolean => {
      return (
        purchasableType === 'CATALOG_ITEM' &&
        (flags[FLAGS.ECOMM_682_NEW_CHECKOUT_PROMO_CODES] ?? 'default') === 'variant' &&
        Boolean(promoCode)
      );
    };

    return {
      clientID,
      isLeadResubmissionFlow,
      promoCode,
      purchasableID,
      purchasableType,
      segmentGrade,
      shouldUsePromoCode,
      subject,
    };
  }, [searchParams, flags]);

  return <SessionContext.Provider value={sessionData}>{children}</SessionContext.Provider>;
}

/**
 * Hook to access session context
 */
export function useSessionContext() {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionContextProvider');
  }

  return context;
}
