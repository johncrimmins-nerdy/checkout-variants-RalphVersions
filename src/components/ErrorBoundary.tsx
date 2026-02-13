'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { SystemError, trackErrorWithContext } from '@/lib/analytics';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    trackErrorWithContext(
      new SystemError('React component error', {
        component_stack_preview: errorInfo.componentStack?.substring(0, 200) || '',
        error_message: error.message,
      })
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">Something went wrong</h1>
            <p className="mb-4 text-gray-600">Please refresh the page and try again.</p>
            <button
              className="rounded-lg bg-[#5c3bfe] px-6 py-3 text-white hover:bg-[#4a2fcc]"
              onClick={() => window.location.reload()}
              type="button"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
