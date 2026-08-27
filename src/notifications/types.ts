export interface ToastItem {
  id: string;
  kind: 'error' | 'update';
  message: string;
  requestKey?: string;
  onRetry?: () => Promise<unknown>;
}
