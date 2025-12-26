import React, { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log for debugging; keep minimal to avoid leaking in prod
    // Developers can hook this to a reporting service later
    console.error('Uncaught error in a component:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const fallback = this.props.fallback ?? (
        <div className="p-4 border-2 border-red-500 bg-red-100 text-red-900">
          <h3 className="font-bold">Something went wrong.</h3>
          {this.state.error?.message && (
            <pre className="text-xs whitespace-pre-wrap mt-2">{this.state.error.message}</pre>
          )}
        </div>
      );

      return fallback as ReactNode;
    }

    return this.props.children as ReactNode;
  }
}

export default ErrorBoundary;
