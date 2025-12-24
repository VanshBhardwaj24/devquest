import { DashboardData, SystemLog } from '../../services/dashboardService';

export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  activeTab: string;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  viewMode: 'grid' | 'list' | 'compact';
  widgetLayout: string[]; // For future draggable layout
}

export type DashboardAction =
  | { type: 'INIT_FETCH' }
  | { type: 'FETCH_SUCCESS'; payload: DashboardData }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_TAB'; payload: string }
  | { type: 'REFRESH_LOGS'; payload: SystemLog[] }
  | { type: 'UPDATE_WIDGETS'; payload: Partial<DashboardData['widgets']> }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' | 'compact' }
  | { type: 'CLEAR_ERROR' };

export const initialDashboardState: DashboardState = {
  data: null,
  loading: true,
  error: null,
  activeTab: 'overview',
  isRefreshing: false,
  lastUpdated: null,
  viewMode: 'grid',
  widgetLayout: ['stats', 'activity', 'system'],
};

export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'INIT_FETCH':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        data: action.payload,
        lastUpdated: new Date(),
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };
    case 'REFRESH_LOGS':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          systemLogs: [...action.payload, ...state.data.systemLogs].slice(0, 50), // Keep last 50
        },
      };
    case 'UPDATE_WIDGETS':
        if (!state.data) return state;
        return {
            ...state,
            data: {
                ...state.data,
                widgets: { ...state.data.widgets, ...action.payload }
            }
        };
    case 'SET_VIEW_MODE':
        return {
            ...state,
            viewMode: action.payload
        };
    case 'CLEAR_ERROR':
        return {
            ...state,
            error: null
        };
    default:
      return state;
  }
}
