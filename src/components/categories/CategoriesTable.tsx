import React, { useState, useEffect } from 'react';
import { CategoriesService, DefaultCategory, GetCategoriesParams, CreateCategoryRequest, UpdateCategoryRequest } from '../../services/categories/categories.services';
import Swal from 'sweetalert2';

const CategoriesTable: React.FC = () => {
  const [categories, setCategories] = useState<DefaultCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editCategory, setEditCategory] = useState<DefaultCategory | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryType: '',
    isActive: true,
  });

  // Fetch categories on component mount and when page/search changes
  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, categoryTypeFilter, isActiveFilter]);


  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params: GetCategoriesParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        categoryType: categoryTypeFilter || undefined,
        isActive: isActiveFilter ? isActiveFilter === 'true' : undefined,
      };
      
      const response = await CategoriesService.getCategories(params);
      
      // Safely handle the response data
      if (response?.data) {
        const categoriesData = response.data.defaultCategories || [];
        setCategories(categoriesData);
        setTotalPages(parseInt(response.data.pagination?.totalPages || '1'));
        setTotalCategories(parseInt(response.data.pagination?.totalCategories || '0'));
      } else {
        setCategories([]);
        setTotalPages(1);
        setTotalCategories(0);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Set default values on error
      setCategories([]);
      setTotalPages(1);
      setTotalCategories(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (editCategory) {
        // Update existing category
        const updateData: UpdateCategoryRequest = {
          name: formData.name,
          categoryType: formData.categoryType,
          isActive: formData.isActive,
        };
        await CategoriesService.updateCategory(editCategory._id, updateData);
      } else {
        // Create new category
        const createData: CreateCategoryRequest = {
          name: formData.name,
          categoryType: formData.categoryType,
        };
        await CategoriesService.createCategory(createData);
      }
      
      setIsModalOpen(false);
      setEditCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: DefaultCategory) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      categoryType: category.categoryType,
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (category: DefaultCategory) => {
    const confirmed = await Swal.fire({
      title: 'Delete Category',
      text: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (confirmed.isConfirmed) {
      try {
        await CategoriesService.deleteCategory(category._id);
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryType: '',
      isActive: true,
    });
  };

  const openAddModal = () => {
    setEditCategory(null);
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditCategory(null);
    resetForm();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getCategoryTypeBadge = (categoryType: string) => {
    const typeColors = {
      income: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      expense: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const colors = typeColors[categoryType as keyof typeof typeColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors}`}>
        {categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-[calc(100vw-360px)] mx-auto">
      {/* Total Categories Card */}
      <div className="mb-4 flex justify-start">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-4 w-64 max-w-xs hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">
                  Total Categories
                </h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                {totalCategories}
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-xs font-medium">
                {totalCategories === 1
                  ? "1 category"
                  : `${totalCategories} categories`}{" "}
                in system
              </p>
            </div>
            <div className="flex-shrink-0 ml-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
                <i className="fas fa-tags text-white text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Table Header with Controls */}
        <div className="bg-gray-50 dark:bg-gray-800 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="pl-12 pr-6 py-3 w-full sm:w-80 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  name="category-search"
                  id="category-search-field"
                />
              </div>

              {/* Category Type Filter */}
              <div className="relative">
                <select
                  value={categoryTypeFilter}
                  onChange={(e) => {
                    setCategoryTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={isActiveFilter}
                  onChange={(e) => {
                    setIsActiveFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                className="group relative inline-flex items-center gap-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={openAddModal}
                type="button"
              >
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                Add New Category
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle tracking-wide">
                  <div className="flex items-center gap-3">Category Name</div>
                </th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle tracking-wide">
                  <div className="flex items-center gap-3">Type</div>
                </th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle tracking-wide">
                  <div className="flex items-center gap-3">Status</div>
                </th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle tracking-wide">
                  <div className="flex items-center gap-3">Created Date</div>
                </th>
                <th className="px-8 py-5 text-center text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle tracking-wide">
                  <div className="flex items-center justify-center gap-3">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-6"></div>
                        <div
                          className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-emerald-400 animate-spin"
                          style={{
                            animationDirection: "reverse",
                            animationDuration: "1.5s",
                          }}
                        ></div>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                        Loading Categories...
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                        Please wait while we fetch the data
                      </div>
                    </div>
                  </td>
                </tr>
              ) : !categories || categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                        No categories found
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-sm">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Get started by adding your first category"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                (categories || []).map((category) => (
                  <tr
                    key={category._id}
                    className="group hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all duration-200 border-l-4 border-transparent hover:border-emerald-500"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Category
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {getCategoryTypeBadge(category.categoryType)}
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(category.isActive)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {formatDate(category.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="group/btn p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          title="Edit Category"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="group/btn p-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          title="Delete Category"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 dark:bg-gray-800 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Showing {categories?.length || 0} of {totalCategories} categories
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:border-gray-200 dark:disabled:border-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-500 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                        currentPage === pageNum
                          ? "bg-emerald-600 text-white border-2 border-emerald-600 shadow-lg"
                          : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-500"
                      }`}
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
                className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:border-gray-200 dark:disabled:border-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-500 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
              >
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 transition-opacity duration-300"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative dark:bg-emerald-900/20 px-8 py-6 rounded-t-2xl border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editCategory ? "Edit Category" : "Add New Category"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {editCategory
                        ? "Update category information"
                        : "Create a new category"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Category Name
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-tag text-gray-400 group-focus-within:text-emerald-500 transition-colors text-lg"></i>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="Enter category name"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name="category-name"
                    id="category-name-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Category Type
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-list text-gray-400 group-focus-within:text-emerald-500 transition-colors text-lg"></i>
                  </div>
                  <select
                    value={formData.categoryType}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryType: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <option value="">Select category type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Status
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === true}
                      onChange={() => setFormData({ ...formData, isActive: true })}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-2 border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === false}
                      onChange={() => setFormData({ ...formData, isActive: false })}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-2 border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-6 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={closeModal}
                  className="group flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name || !formData.categoryType}
                  className="group flex items-center gap-3 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <div className="relative">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        <div
                          className="absolute inset-0 rounded-full h-4 w-4 border-2 border-transparent border-t-white animate-spin"
                          style={{
                            animationDirection: "reverse",
                            animationDuration: "1.5s",
                          }}
                        ></div>
                      </div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>{editCategory ? "Update Category" : "Create Category"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesTable;