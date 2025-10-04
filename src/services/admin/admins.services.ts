import toastHelper from '../../utils/toastHelper';
import api from "../api/api";

export interface Admin {
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
  currentPage: number;
  totalPages: number;
  totalAdmins: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminsResponse {
  status: number;
  message: string;
  data: {
    admins: Admin[];
    pagination: Pagination;
  };
}

export interface AdminResponse {
  status: number;
  message: string;
  data: Admin;
}

export interface GetAdminsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAdminRequest {
  name?: string;
  role?: string;
}

export class AdminService {
  static getAdmins = async (params: GetAdminsParams = {}): Promise<AdminsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);

      const url = `/api/admin/admins?${queryParams.toString()}`;
      const res = await api.get(url);
      const data: AdminsResponse = res.data;
      
      if (data.status === 200) {
        return data;
      }
      
      const errorMessage = data.message || 'Failed to fetch admins';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch admins';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  static getAdminById = async (adminId: string): Promise<AdminResponse> => {
    try {
      const res = await api.get(`/api/admin/admins/${adminId}`);
      const data: AdminResponse = res.data;
      
      if (data.status === 200) {
        return data;
      }
      
      const errorMessage = data.message || 'Failed to fetch admin';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch admin';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  static createAdmin = async (adminData: CreateAdminRequest): Promise<AdminResponse> => {
    try {
      const res = await api.post('/api/admin/admins', adminData);
      const data: AdminResponse = res.data;
      
      if (data.status === 200) {
        toastHelper.showTost(data.message || 'Admin created successfully', 'success');
        return data;
      }
      
      const errorMessage = data.message || 'Failed to create admin';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create admin';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  static updateAdmin = async (adminId: string, adminData: UpdateAdminRequest): Promise<AdminResponse> => {
    try {
      const res = await api.put(`/api/admin/admins/${adminId}`, adminData);
      const data: AdminResponse = res.data;
      
      if (data.status === 200) {
        toastHelper.showTost(data.message || 'Admin updated successfully', 'success');
        return data;
      }
      
      const errorMessage = data.message || 'Failed to update admin';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update admin';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  static deleteAdmin = async (adminId: string): Promise<{ status: number; message: string }> => {
    try {
      const res = await api.delete(`/api/admin/admins/${adminId}`);
      const data = res.data;
      
      if (data.status === 200) {
        toastHelper.showTost(data.message || 'Admin deleted successfully', 'success');
        return data;
      }
      
      const errorMessage = data.message || 'Failed to delete admin';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete admin';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };
}
