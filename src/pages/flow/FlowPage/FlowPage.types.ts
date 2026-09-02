import type { FlowResponse } from '../../../types';

export interface FlowPageTypes {
  data: FlowResponse | null;
  days: 30 | 60 | 90;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  loading: boolean;
  changeDays: (days: 30 | 60 | 90) => void;
  refresh: () => void;
}
