import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import toastHelper from "../../utils/toastHelper";
import UploadExcelModal from "./UploadExcelModal";
import ProductModal from "./ProductsModal";
import { ProductService } from "../../services/products/products.services";

interface Product {
  _id?: string;
  id?: string;
  specification: string;
  name: string;
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
  expiryTime: string;
  isVerified: boolean;
  isApproved: boolean;
  canVerify: boolean;
  canApprove: boolean;
  purchaseType: string;
}

const ProductsTable: React.FC = () => {
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const itemsPerPage = 10;

  // Fetch products on component mount and when page/search changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.list({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });
      const docs =
        response && response.data && Array.isArray(response.data.docs)
          ? response.data.docs
          : [];
      
      
      setProductsData(docs);
      setTotalDocs(Number(response?.data?.totalDocs) || docs.length || 0);
      setTotalPages(Number(response?.data?.totalPages) || 1);
    } catch (error) {
      toastHelper.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (productData: any) => {
    try {
      // Check if we're in edit mode - handle both _id and id fields
      const productId = editProduct?._id || editProduct?.id;
      const isEditMode = Boolean(productId);
      
      if (isEditMode && editProduct && productId) {
        // For update, send all fields that are provided in the form data
        const updatePayload = {
          id: productId,
          specification: productData.specification,
          skuFamilyId: productData.skuFamilyId,
          simType: productData.simType,
          color: productData.color,
          ram: productData.ram,
          storage: productData.storage,
          condition: productData.condition,
          price: Number(productData.price),
          stock: Number(productData.stock),
          country: productData.country,
          moq: Number(productData.moq),
          isNegotiable: Boolean(productData.isNegotiable),
          isFlashDeal: Boolean(productData.isFlashDeal),
          expiryTime: productData.expiryTime,
          purchaseType: String(productData.purchaseType).trim().toLowerCase() === "full" ? "full" : "partial"
        };
        await ProductService.update(updatePayload);
        toastHelper.showTost("Product updated successfully!", "success");
      } else {
        // For create, send all required fields
        const processedData = {
          skuFamilyId: productData.skuFamilyId,
          specification: productData.specification,
          simType: productData.simType,
          color: productData.color,
          ram: productData.ram,
          storage: productData.storage,
          condition: productData.condition,
          price: Number(productData.price),
          stock: Number(productData.stock),
          country: productData.country,
          moq: Number(productData.moq),
          isNegotiable: Boolean(productData.isNegotiable),
          isFlashDeal: Boolean(productData.isFlashDeal),
          expiryTime: productData.expiryTime,
          purchaseType: String(productData.purchaseType).trim().toLowerCase() === "full" ? "full" : "partial"
        };
        await ProductService.create(processedData);
        toastHelper.showTost("Product created successfully!", "success");
      }
      setIsModalOpen(false);
      setEditProduct(null);
      fetchProducts();
    } catch (error) {
      toastHelper.error("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  const handleVerify = async (product: Product) => {
    const productId = product._id || product.id;
    if (!productId) return;

    const confirmed = await Swal.fire({
      title: "Verify Product",
      text: "Are you sure you want to verify this product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, verify it!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmed.isConfirmed) {
      try {
        const result = await ProductService.verifyProduct(productId);
        if (result !== false) {
          toastHelper.showTost("Product verified successfully!", "success");
          fetchProducts();
        }
      } catch (error) {
        toastHelper.error("Failed to verify product");
      }
    }
  };

  const handleApprove = async (product: Product) => {
    const productId = product._id || product.id;
    if (!productId) return;

    const confirmed = await Swal.fire({
      title: "Approve Product",
      text: "Are you sure you want to approve this product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmed.isConfirmed) {
      try {
        const result = await ProductService.approveProduct(productId);
        if (result !== false) {
          toastHelper.showTost("Product approved successfully!", "success");
          fetchProducts();
        }
      } catch (error) {
        toastHelper.error("Failed to approve product");
      }
    }
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
  };

  const getProductImageSrc = (): string => {
    return "https://via.placeholder.com/60x60?text=Product";
  };

  const formatPrice = (price: number | string): string => {
    if (typeof price === "string") {
      const num = parseFloat(price);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    }
    return price.toFixed(2);
  };

  const formatExpiryTime = (expiryTime: string): string => {
    if (!expiryTime) return "-";
    try {
      const date = new Date(expiryTime);
      return format(date, "MMM dd, yyyy");
    } catch {
      return "-";
    }
  };

  const getStatusBadge = (product: Product) => {
    if (product.isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 border border-green-200">
          Approved
        </span>
      );
    } else if (product.isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
          Pending Approval
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          Under Verification
        </span>
      );
    }
  };

  const placeholderImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMmyTPv4M5fFPvYLrMzMQcPD_VO34ByNjouQ&s";

  return (
    <div className="p-4 max-w-[calc(100vw-360px)] mx-auto">
      {/* Table Container */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-sm">
        {/* Table Header with Controls */}
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by SKU Family ID or other..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-64"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-[#16a34a] text-white px-4 py-2 text-sm font-medium hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <i className="fas fa-upload text-xs"></i>
              Upload File
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-[#16a34a] text-white px-4 py-2 text-sm font-medium hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
              onClick={() => {
                setEditProduct(null);
                setIsModalOpen(true);
              }}
            >
              <i className="fas fa-plus text-xs"></i>
              Add Product
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  SIM Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Color
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  RAM
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Storage
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Country
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400 text-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600 mx-auto mb-4"></div>
                      Loading Products...
                    </div>
                  </td>
                </tr>
              ) : (
                  Array.isArray(productsData) ? productsData.length === 0 : true
                ) ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400 text-lg">
                      No products found
                    </div>
                  </td>
                </tr>
              ) : (
                (Array.isArray(productsData) ? productsData : []).map(
                  (item: Product, index: number) => (
                    <tr
                      key={item._id || item.id || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={getProductImageSrc()}
                          alt={item.specification || "Product"}
                          className="w-12 h-12 object-contain rounded-md border border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              placeholderImage;
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.simType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.color}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.ram}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.storage}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        ${formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.country}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {getStatusBadge(item)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleView(item)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {item.canVerify && (
                            <button
                              onClick={() => handleVerify(item)}
                              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                              title="Verify"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          {item.canApprove && (
                            <button
                              onClick={() => handleApprove(item)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                              title="Approve"
                            >
                              <i className="fas fa-thumbs-up"></i>
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
            Showing {productsData.length} of {totalDocs} items
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      currentPage === pageNum
                        ? "bg-[#16a34a] text-white dark:bg-green-500 dark:text-white border border-green-600 dark:border-green-500"
                        : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditProduct(null);
        }}
        onSave={handleSave}
        editItem={editProduct || undefined}
      />
      <UploadExcelModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchProducts}
      />

      {/* View-Only Product Modal with Scrollable Content */}
      {selectedProduct && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 transition-opacity duration-300"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <img
                  src={getProductImageSrc()}
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      placeholderImage;
                  }}
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Product Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 flex-shrink-0"
                title="Close"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {/* Status Badge */}
              <div className="mb-6">{getStatusBadge(selectedProduct)}</div>

              {/* Product Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Basic Information
                  </h3>

                  {selectedProduct.specification && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Specification
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        {selectedProduct.specification}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SIM Type
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {selectedProduct.simType}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {selectedProduct.color}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        RAM
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        {selectedProduct.ram}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Storage
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        {selectedProduct.storage}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Condition
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {selectedProduct.condition}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Flash Deal
                      </label>
                      <p
                        className={`text-sm font-medium bg-gray-50 dark:bg-gray-800 p-3 rounded-md ${
                          selectedProduct.isFlashDeal
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedProduct.isFlashDeal ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Negotiable
                      </label>
                      <p
                        className={`text-sm font-medium bg-gray-50 dark:bg-gray-800 p-3 rounded-md ${
                          selectedProduct.isNegotiable
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedProduct.isNegotiable ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Pricing & Inventory
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price
                    </label>
                    <p className="text-lg text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md font-semibold">
                      ${formatPrice(selectedProduct.price)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Stock
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        {selectedProduct.stock} units
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        MOQ
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        {selectedProduct.moq} units
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {selectedProduct.country}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Purchase Type
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md capitalize">
                      {selectedProduct.purchaseType}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiry Date
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {formatExpiryTime(selectedProduct.expiryTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;