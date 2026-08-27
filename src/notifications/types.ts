export interface ToastItem {
  id: string;
  kind: 'error' | 'update' | 'success';
  message: string;
  title?: string;
  requestKey?: string;
  onRetry?: () => Promise<unknown>;
}
