import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

// Categories interfaces
export interface DefaultCategory {
  _id: string;
  name: string;
  categoryType: string;
  description?: string;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: string;
}

export interface Pagination {
  currentPage: string;
  totalPages: string;
  totalCategories: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CategoriesResponse {
  status: number;
  message: string;
  data: {
    defaultCategories: DefaultCategory[];
    pagination: Pagination;
  };
}

export interface CategoryResponse {
  status: number;
  message: string;
  data: DefaultCategory;
}

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  categoryType?: string;
  isActive?: boolean;
  search?: string;
}

export interface CreateCategoryRequest {
  name: string;
  categoryType: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  categoryType?: string;
  isActive?: boolean;
}

export class CategoriesService {
  /**
   * Get all default categories with pagination and filters
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<CategoriesResponse>
   */
  static getCategories = async (params: GetCategoriesParams = {}): Promise<CategoriesResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.categoryType) queryParams.append('categoryType', params.categoryType);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.search) queryParams.append('search', params.search);

      const url = `/api/admin/default-categories?${queryParams.toString()}`;
      const res = await api.get(url);
      const data: CategoriesResponse = res.data;
      
      if (data.status === 200) {
        return data;
      }
      
      const errorMessage = data.message || 'Failed to fetch categories';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch categories';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  /**
   * Get a single category by ID
   * @param categoryId - The category ID
   * @returns Promise<CategoryResponse>
   */
  static getCategoryById = async (categoryId: string): Promise<CategoryResponse> => {
    try {
      const res = await api.get(`/api/admin/default-categories/${categoryId}`);
      const data: CategoryResponse = res.data;
      
      if (data.status === 200) {
        return data;
      }
      
      const errorMessage = data.message || 'Failed to fetch category';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch category';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  /**
   * Create a new default category
   * @param payload - Category data
   * @returns Promise<CategoryResponse>
   */
  static createCategory = async (payload: CreateCategoryRequest): Promise<CategoryResponse> => {
    try {
      const res = await api.post('/api/admin/default-categories', payload);
      const data: CategoryResponse = res.data;
      
      if (data.status === 200) {
        toastHelper.showTost(data.message || 'Category created successfully', 'success');
        return data;
      }
      
      const errorMessage = data.message || 'Failed to create category';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create category';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  /**
   * Update an existing category
   * @param categoryId - The category ID
   * @param payload - Updated category data
   * @returns Promise<CategoryResponse>
   */
  static updateCategory = async (categoryId: string, payload: UpdateCategoryRequest): Promise<CategoryResponse> => {
    try {
      const res = await api.put(`/api/admin/default-categories/${categoryId}`, payload);
      const data: CategoryResponse = res.data;
      
      if (data.status === 200) {
        toastHelper.showTost(data.message || 'Category updated successfully', 'success');
        return data;
      }
      
      const errorMessage = data.message || 'Failed to update category';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update category';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  /**
   * Delete a category
   * @param categoryId - The category ID
   * @returns Promise<{ status: number; message: string }>
   */
  static deleteCategory = async (categoryId: string): Promise<{ status: number; message: string }> => {
    try {
      const res = await api.delete(`/api/admin/default-categories/${categoryId}`);
      const data = res.data;
      
      if (data.status === 200) {
        toastHelper.showTost(data.message || 'Category deleted successfully', 'success');
        return data;
      }
      
      const errorMessage = data.message || 'Failed to delete category';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete category';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };
}
