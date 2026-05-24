import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
};

type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn(
      `ErrorBoundary[${this.props.label ?? "anon"}] caught:`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) return this.props.fallback;
      return (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 text-coffee-950 px-4 py-3 text-xs">
          <p className="font-semibold mb-1">
            This section hit an error and was hidden.
          </p>
          <p className="font-light text-coffee-700 break-words">
            {this.state.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
