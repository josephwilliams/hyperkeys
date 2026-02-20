"use client";

import React from "react";

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="h-screen flex flex-col items-center justify-center gap-4"
          style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
        >
          <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Oops, something went wrong
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded text-sm"
            style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
