import api from "../api/api";
import { env } from "../../utils/env";
import toastHelper from "../../utils/toastHelper";

export interface CreateProductRequest {
  specification: string;
  skuFamilyId?: string;
  simType: string;
  color: string;
  ram: string;
  storage: string;
  condition: string;
  price: number;
  stock: number;
  country: string;
  moq: number;
  isNegotiable: boolean;
  isFlashDeal: boolean;
  expiryTime?: string;
  purchaseType: string;
}

export interface GetProductRequest {
  id: string;
}
export interface UpdateProductRequest {
  id: string;
  specification?: string;
  skuFamilyId?: string;
  simType?: string;
  color?: string;
  ram?: string;
  storage?: string;
  condition?: string;
  price?: number;
  stock?: number;
  country?: string;
  moq?: number;
  isNegotiable?: boolean;
  isFlashDeal?: boolean;
  expiryTime?: string;
  purchaseType?: string;
}

export interface ListProductsRequest {
  page: number;
  limit: number;
  search?: string;
  includeExpired?: boolean;
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}

export class ProductService {
  static create = async (
    payload: CreateProductRequest
  ): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/product/create`;
    try {
      // Process numeric values and boolean flags
      const processedPayload = {
        skuFamilyId: payload.skuFamilyId || "", 
        specification: payload.specification,
        simType: payload.simType,
        color: payload.color,
        ram: payload.ram,
        storage: payload.storage,
        condition: payload.condition,
        price: Number(payload.price),
        stock: Number(payload.stock),
        country: payload.country,
        moq: Number(payload.moq),
        isNegotiable: Boolean(payload.isNegotiable),
        isFlashDeal: Boolean(payload.isFlashDeal),
        purchaseType: payload.purchaseType || "partial",
        expiryTime: payload.isFlashDeal ? payload.expiryTime : undefined,
      };

      const res = await api.post(url, processedPayload);

      const data: ApiResponse = res.data;
      toastHelper.showTost(
        data.message || "Product created successfully",
        "success"
      );
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create product";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };

  static get = async (payload: GetProductRequest): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/product/get`;
    try {
      const res = await api.post(url, payload);
      const data: ApiResponse = res.data;
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to get product";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };

  static update = async (
    payload: UpdateProductRequest
  ): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/product/update`;
    try {
      // Process payload similar to create method
      const processedPayload = {
        id: payload.id,
        skuFamilyId: payload.skuFamilyId || "", 
        specification: payload.specification,
        simType: payload.simType,
        color: payload.color,
        ram: payload.ram,
        storage: payload.storage,
        condition: payload.condition,
        price: Number(payload.price),
        stock: Number(payload.stock),
        country: payload.country,
        moq: Number(payload.moq),
        isNegotiable: Boolean(payload.isNegotiable),
        isFlashDeal: Boolean(payload.isFlashDeal),
        purchaseType: payload.purchaseType || "partial",
        expiryTime: payload.isFlashDeal ? payload.expiryTime : undefined,
      };
      
      // Remove undefined values
      const cleanPayload = Object.fromEntries(
        Object.entries(processedPayload).filter(([_, value]) => value !== undefined)
      );
      
      const res = await api.post(url, cleanPayload);
      const data: ApiResponse = res.data;
      toastHelper.showTost(
        data.message || "Product updated successfully",
        "success"
      );
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update product";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };

  static list = async (payload: ListProductsRequest): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/product/list`;
    try {
      const res = await api.post(url, payload);
      const data: ApiResponse = res.data;
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to list products";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };

  static listByName = async (search: string = ""): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/product/listByName`;
    try {
      const res = await api.post(url, { search });
      const data: ApiResponse = res.data;
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to list by name";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };

  static importExcel = async (file: File): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/product/import`;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data: ApiResponse = res.data;
      toastHelper.showTost(
        data.message || "Products imported successfully",
        "success"
      );
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to import products";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };

  static verifyProduct = async (id: string): Promise<boolean> => {
    const url = `${env.baseUrl}/api/seller/product/verify`;
    try {
      await api.post(url, { id });
      toastHelper.showTost("Product verified successfully", "success");
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to verify product";
      toastHelper.showTost(errorMessage, "error");
      return false;
    }
  };

  static approveProduct = async (id: string): Promise<boolean> => {
    const url = `${env.baseUrl}/api/seller/product/approve`;
    try {
      await api.post(url, { id });
      toastHelper.showTost("Product approved successfully", "success");
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to approve product";
      toastHelper.showTost(errorMessage, "error");
      return false;
    }
  };
}
