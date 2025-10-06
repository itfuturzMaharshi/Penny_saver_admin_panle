import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import toastHelper from "../../utils/toastHelper";
import {
  AdminService,
  Admin,
  GetAdminsParams,
  CreateAdminRequest,
  UpdateAdminRequest,
} from "../../services/admin/admins.services";

const AdminsTable: React.FC = () => {
  const [adminsData, setAdminsData] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  // Fetch admins on component mount and when page/search changes
  useEffect(() => {
    fetchAdmins();
  }, [currentPage, searchTerm]);

  // Debug log to see modal state
  useEffect(() => {
    console.log("Modal state:", isModalOpen);
  }, [isModalOpen]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const params: GetAdminsParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      };

      const response = await AdminService.getAdmins(params);

      if (response.status === 200 && response.data) {
        setAdminsData(response.data.admins);
        setTotalAdmins(Number(response.data.pagination.totalAdmins));
        setTotalPages(Number(response.data.pagination.totalPages));
      }
    } catch (error) {
      toastHelper.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (editAdmin) {
        // Update existing admin
        const updateData: UpdateAdminRequest = {
          name: formData.name.trim(),
          role: formData.role,
        };
        await AdminService.updateAdmin(editAdmin._id, updateData);
      } else {
        // Create new admin
        const createData: CreateAdminRequest = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        };
        await AdminService.createAdmin(createData);
      }

      setIsModalOpen(false);
      setEditAdmin(null);
      resetForm();
      fetchAdmins();
    } catch (error) {
      // Error toasts handled in service
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (admin: Admin) => {
    const confirmed = await Swal.fire({
      title: "Delete Admin",
      text: `Are you sure you want to delete ${admin.name}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (confirmed.isConfirmed) {
      try {
        await AdminService.deleteAdmin(admin._id);
        fetchAdmins();
      } catch (error) {
        toastHelper.error("Failed to delete admin");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin",
    });
    setShowPassword(false);
  };

  const openAddModal = () => {
    console.log("Add Admin button clicked"); // Debug log
    setEditAdmin(null);
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditAdmin(null);
    resetForm();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-6 max-w-[calc(100vw-360px)] mx-auto">
      {/* Total Admins Card */}
      <div className="mb-4 flex justify-start">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-4 w-64 max-w-xs hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">
                  Total Admins
                </h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                {totalAdmins}
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-xs font-medium">
                {totalAdmins === 1
                  ? "1 administrator"
                  : `${totalAdmins} administrators`}{" "}
                in system
              </p>
            </div>
            <div className="flex-shrink-0 ml-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
                <i className="fas fa-users text-white text-sm"></i>
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
                  placeholder="Search by name or email..."
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
                  name="admin-search"
                  id="admin-search-field"
                />
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
                Add New Admin
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
                  <div className="flex items-center gap-3">Admin Name</div>
                </th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle tracking-wide">
                  <div className="flex items-center gap-3">Email Address</div>
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
                  <td colSpan={4} className="p-16 text-center">
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
                        Loading Admins...
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                        Please wait while we fetch the data
                      </div>
                    </div>
                  </td>
                </tr>
              ) : adminsData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center">
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                        No admins found
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-sm">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Get started by adding your first admin"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                adminsData.map((admin: Admin, index: number) => (
                  <tr
                    key={admin._id || index}
                    className="group hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all duration-200 border-l-4 border-transparent hover:border-emerald-500"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {admin.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Administrator
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {admin.email}
                      </div>
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
                          {formatDate(admin.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="group/btn p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          title="Edit Admin"
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
                          onClick={() => handleDelete(admin)}
                          className="group/btn p-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          title="Delete Admin"
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
                    Showing {adminsData.length} of {totalAdmins} admins
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editAdmin ? "Edit Admin" : "Add New Admin"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {editAdmin
                        ? "Update admin information"
                        : "Create a new administrator account"}
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
                  Full Name
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-user text-gray-400 group-focus-within:text-emerald-500 transition-colors text-lg"></i>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="Enter admin full name"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name="admin-name"
                    id="admin-name-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Email Address
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400 group-focus-within:text-emerald-500 transition-colors text-lg"></i>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Enter admin email address"
                    disabled={!!editAdmin}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name="admin-email"
                    id="admin-email-field"
                  />
                </div>
              </div>

              {!editAdmin && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Password
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="fas fa-lock text-gray-400 group-focus-within:text-emerald-500 transition-colors text-lg"></i>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="Enter secure password"
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      name="admin-password"
                      id="admin-password-field"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <i className="fas fa-eye text-lg"></i>
                      ) : (
                        <i className="fas fa-eye-slash text-lg"></i>
                      )}
                    </button>
                  </div>
                </div>
              )}
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
                  disabled={
                    isSaving ||
                    !formData.name ||
                    (!editAdmin && (!formData.email || !formData.password))
                  }
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
                      <span>{editAdmin ? "Update Admin" : "Create Admin"}</span>
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

export default AdminsTable;
