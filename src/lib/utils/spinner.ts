/**
 * Spinner utility functions for loading states
 */

/**
 * Hide spinner element
 * @param spinnerId - ID of the spinner element
 */
export function hideSpinner(spinnerId: string = 'spinner'): void {
  if (typeof document === 'undefined') return;

  const spinner = document.getElementById(spinnerId);
  if (spinner) {
    spinner.style.display = 'none';
  }
}

/**
 * Show spinner element
 * @param spinnerId - ID of the spinner element
 */
export function showSpinner(spinnerId: string = 'spinner'): void {
  if (typeof document === 'undefined') return;

  const spinner = document.getElementById(spinnerId);
  if (spinner) {
    spinner.style.display = 'flex';
  }
}
