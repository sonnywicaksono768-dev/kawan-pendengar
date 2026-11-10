"use client";

import { Icon } from "@/components/Icon";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <Icon name="alert" />
      <div>
        <p>{message}</p>
        {(onRetry || onDismiss) && (
          <div className="actions">
            {onRetry && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
                Coba lagi
              </button>
            )}
            {onDismiss && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>
                Tutup pesan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
