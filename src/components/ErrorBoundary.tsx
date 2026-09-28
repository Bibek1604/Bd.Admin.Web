import React from 'react';
import { isChunkLoadError } from '../utils/chunkLoadError';

/**
 * App-wide error boundary. There was none, so any render error — or a lazy page
 * chunk that no longer exists after a deploy — left the admin a blank white
 * screen with no way forward but guessing to reload.
 */

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const stale = isChunkLoadError(error);
    return (
      <div role="alert" className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <h1 className="text-lg font-bold text-slate-900">
            {stale ? 'A new version is available' : 'Something went wrong'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {stale
              ? 'The admin console was updated while this page was open. Reload to continue.'
              : 'This page could not be displayed. Reloading usually fixes it; if it keeps happening, contact support.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold"
            >
              Reload
            </button>
            {!stale && (
              <button
                type="button"
                onClick={() => this.setState({ error: null })}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
