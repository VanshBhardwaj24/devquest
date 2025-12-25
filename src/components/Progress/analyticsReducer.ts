import { AnalyticsData } from '../../services/analyticsService';

export interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  viewMode: 'overview' | 'detailed';
  timeRange: '7d' | '30d' | '90d';
}

export type AnalyticsAction =
  | { type: 'INIT_FETCH' }
  | { type: 'FETCH_SUCCESS'; payload: AnalyticsData }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'overview' | 'detailed' }
  | { type: 'SET_TIME_RANGE'; payload: '7d' | '30d' | '90d' };

export const initialAnalyticsState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
  viewMode: 'overview',
  timeRange: '30d',
};

export function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case 'INIT_FETCH':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload, error: null };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.payload };
    default:
      return state;
  }
}
