"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-1">
            Terjadi Kesalahan
          </h3>
          <p className="text-sm text-red-600 text-center mb-4 max-w-md">
            {this.state.error?.message || "Terjadi kesalahan yang tidak terduga."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
