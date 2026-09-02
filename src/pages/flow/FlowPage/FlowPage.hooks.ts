import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchFlowThunk } from '../../../store/slices/flowSlice';
import type { FlowPageTypes } from './FlowPage.types';

export const useFlowPage = (): FlowPageTypes => {
  const dispatch = useAppDispatch();
  const { data, days, status, error } = useAppSelector((s) => s.flow);
  const loading = status === 'loading' && !data;

  useEffect(() => {
    dispatch(fetchFlowThunk(days));
  }, [days, dispatch]);

  const changeDays = (d: 30 | 60 | 90) => {
    dispatch(fetchFlowThunk(d));
  };

  const refresh = () => {
    dispatch(fetchFlowThunk(days));
  };

  return {
    data,
    days,
    status,
    error,
    loading,
    changeDays,
    refresh,
  };
};
