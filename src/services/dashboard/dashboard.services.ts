import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

// Dashboard interfaces
export interface DashboardSummary {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface UserRegistrationTrend {
  _id: {
    year: number;
    month: number;
  };
  count: number;
}

export interface TopCategory {
  _id: string;
  total: number;
  category: {
    _id: string;
    name: string;
    color?: string;
  };
}

export interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  userRegistrationTrends: UserRegistrationTrend[];
  topCategories: TopCategory[];
  recentUsers: RecentUser[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface DashboardResponse {
  status: number;
  message: string;
  data: DashboardData;
}

export interface DashboardParams {
  startDate?: string;
  endDate?: string;
}

export class DashboardService {
  /**
   * Get admin dashboard data
   * @param params - Optional date range parameters
   * @returns Promise<DashboardResponse>
   */
  static getDashboardData = async (params: DashboardParams = {}): Promise<DashboardResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const url = `/api/admin/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await api.get(url);
      const data: DashboardResponse = res.data;
      
      if (data.status === 200) {
        return data;
      }
      
      const errorMessage = data.message || 'Failed to fetch dashboard data';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch dashboard data';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  /**
   * Get dashboard data for a specific date range
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Promise<DashboardResponse>
   */
  static getDashboardDataByDateRange = async (
    startDate: string, 
    endDate: string
  ): Promise<DashboardResponse> => {
    return this.getDashboardData({ startDate, endDate });
  };

  /**
   * Get current month dashboard data
   * @returns Promise<DashboardResponse>
   */
  static getCurrentMonthDashboard = async (): Promise<DashboardResponse> => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.getDashboardData({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    });
  };

  /**
   * Get last 30 days dashboard data
   * @returns Promise<DashboardResponse>
   */
  static getLast30DaysDashboard = async (): Promise<DashboardResponse> => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return this.getDashboardData({
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    });
  };
}
