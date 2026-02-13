'use client';

import { useEffect } from 'react';

import { initNewRelicBrowser } from './newrelic-browser';

/**
 * Client component to initialize New Relic browser agent
 * Must be used in a client component context
 */
export function NewRelicInitializer() {
  useEffect(() => {
    initNewRelicBrowser();
  }, []);

  return null;
}
