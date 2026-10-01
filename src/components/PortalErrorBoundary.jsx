import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/* Catches rendering errors from the portal views. Without this a single broken
   view (for example one unexpected record) unmounts the whole app and leaves a
   completely blank page; instead the user keeps a clear way to recover. */
class PortalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal view crashed:', error, errorInfo);
  }

  handleRetry() {
    this.setState({ hasError: false });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { title = 'This page could not be displayed', compact = false } = this.props;

    return (
      <div
        role="alert"
        className={compact
          ? 'rounded-lg border border-amber-300 bg-amber-50 px-5 py-6 text-center'
          : 'flex min-h-screen items-center justify-center bg-slate-100 px-4'}
      >
        <div className={compact ? '' : 'w-full max-w-md rounded-lg border border-amber-300 bg-white p-8 text-center shadow-lg'}>
          <AlertTriangle size={36} className="mx-auto text-amber-500" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Something unexpected happened while showing this view. You are still signed in — try
            again, and if it keeps happening reload the portal.
          </p>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded bg-school-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-school-blue-dark"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-school-blue hover:text-school-blue"
            >
              Reload the portal
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default PortalErrorBoundary;
