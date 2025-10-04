import toastHelper from '../../utils/toastHelper';
import api from "../api/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  __v: string;
}

export interface Pagination {
  currentPage: string;
  totalPages: string;
  totalUsers: string;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsersResponse {
  status: number;
  message: string;
  data: {
    users: User[];
    pagination: Pagination;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export class UserService {
  static getUsers = async (params: GetUsersParams = {}): Promise<UsersResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      // Always include role=user
      queryParams.append('role', 'user');

      const url = `/api/admin/users?${queryParams.toString()}`;
      const res = await api.get(url);
      const data: UsersResponse = res.data;
      
      if (data.status === 200) {
        return data;
      }
      
      const errorMessage = data.message || 'Failed to fetch users';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch users';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  static deleteUser = async (userId: string): Promise<{ status: number; message: string }> => {
    try {
      const res = await api.delete(`/api/admin/users/${userId}`);
      const data = res.data;
      
      if (data.status === 200) {
        toastHelper.showTost(data.message || 'User deleted successfully', 'success');
        return data;
      }
      
      const errorMessage = data.message || 'Failed to delete user';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete user';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };
}
