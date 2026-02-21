"use client";

import { useEffect } from "react";

interface ToastProps {
  successMessage?: string;
  errorMessage?: string;
  onCloseSuccess?: () => void;
  onCloseError?: () => void;
  duration?: number;
}

export default function Toast({
  successMessage,
  errorMessage,
  onCloseSuccess,
  onCloseError,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (successMessage && onCloseSuccess) {
      const timer = setTimeout(onCloseSuccess, duration);
      return () => clearTimeout(timer);
    }
  }, [successMessage, onCloseSuccess, duration]);

  useEffect(() => {
    if (errorMessage && onCloseError) {
      const timer = setTimeout(onCloseError, duration);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, onCloseError, duration]);

  if (!successMessage && !errorMessage) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-lg pointer-events-auto min-w-[280px] max-w-sm">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium flex-1">{successMessage}</span>
          {onCloseSuccess && (
            <button
              onClick={onCloseSuccess}
              className="text-green-500 hover:text-green-700 shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-lg pointer-events-auto min-w-[280px] max-w-sm">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium flex-1">{errorMessage}</span>
          {onCloseError && (
            <button
              onClick={onCloseError}
              className="text-red-500 hover:text-red-700 shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
