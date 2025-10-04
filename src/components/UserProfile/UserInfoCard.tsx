import { useState } from "react";
import { AuthService } from "../../services/auth/auth.services";
import toastHelper from "../../utils/toastHelper";

interface FormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserInfoCardProps {
  formData: FormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export default function UserInfoCard({
  formData,
  handleChange,
}: UserInfoCardProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "account"
  >("profile");
  const [showPassword, setShowPassword] = useState<{
    current: boolean;
    new: boolean;
    confirm: boolean;
  }>({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name: formData?.name?.trim(),
      };

      await AuthService.updateProfile(payload);

      // Update localStorage user
      try {
        const stored = localStorage.getItem("user");
        const prevUser = stored ? JSON.parse(stored) : {};
        const merged = {
          ...prevUser,
          name: payload.name ?? prevUser?.name,
        };
        localStorage.setItem("user", JSON.stringify(merged));
      } catch {}
    } catch (error) {
      // Error toasts handled in service
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toastHelper.showTost("Please fill all password fields", "warning");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toastHelper.showTost(
        "New password and confirm password do not match",
        "warning"
      );
      return;
    }
    if (formData.newPassword.length < 6) {
      toastHelper.showTost("Password must be at least 6 characters", "warning");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await AuthService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (!response) return;

      // Clear password fields on success
      handleChange({
        target: { name: "currentPassword", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      handleChange({
        target: { name: "newPassword", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      handleChange({
        target: { name: "confirmPassword", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    } catch (error) {
      // Error toast already handled in service
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePassword = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="p-5 border bg-white border-gray-200 rounded-2xl shadow dark:border-gray-800 lg:p-6">
      {/* Two Tabs */}
      <div className="flex gap-6 border-b pb-3 mb-5">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-2 text-base font-medium ${
            activeTab === "profile"
              ? "border-b-2 border-[#16a34a] text-[#16a34a]"
              : "text-gray-600 dark:text-gray-400 hover:text-[#16a34a]"
          }`}
        >
          <i className="fas fa-user mr-2"></i> Profile
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`pb-2 text-base font-medium ${
            activeTab === "account"
              ? "border-b-2 border-[#16a34a] text-[#16a34a]"
              : "text-gray-600 dark:text-gray-400 hover:text-[#16a34a]"
          }`}
        >
          <i className="fas fa-cog mr-2"></i> Account Setting
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                <i className="fas fa-user text-gray-500"></i> Name
                <span className="text-red-500">*</span>
              </p>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg  dark:bg-gray-800 dark:text-white/90 dark:border-gray-600"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                <i className="fas fa-envelope text-gray-500"></i> Email Address
                <span className="text-xs text-gray-400">(Read Only)</span>
              </p>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:text-white/90 dark:border-gray-600"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-white shadow bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 transition-colors"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2 min-w-[130px]">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 
           5.373 0 12h4zm2 5.291A7.962 7.962 
           0 014 12H0c0 3.042 1.135 5.824 
           3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 min-w-[130px]">
                  <i className="fas fa-save"></i>
                  <span>Save Changes</span>
                </span>
              )}
            </button>
          </div>
        </div>
      )}


      {/* Account Setting Tab */}
      {activeTab === "account" && (
        <div className="grid grid-cols-1 gap-6">
          <div>
            <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
              <i className="fas fa-lock text-gray-500"></i> Current Password
            </p>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
              />
              <button
                type="button"
                onClick={() => togglePassword("current")}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <i
                  className={`fas ${
                    showPassword.current ? "fa-eye" : "fa-eye-slash"
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
              <i className="fas fa-lock text-gray-500"></i> New Password
            </p>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
              />
              <button
                type="button"
                onClick={() => togglePassword("new")}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <i
                  className={`fas ${
                    showPassword.new ? "fa-eye" : "fa-eye-slash"
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
              <i className="fas fa-lock text-gray-500"></i> Confirm Password
            </p>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
              />
              <button
                type="button"
                onClick={() => togglePassword("confirm")}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <i
                  className={`fas ${
                    showPassword.confirm ? "fa-eye" : "fa-eye-slash"
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleChangePassword}
              className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-white shadow bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 transition-colors"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <span className="flex items-center justify-center w-[160px]">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 
             5.373 0 12h4zm2 5.291A7.962 7.962 
             0 014 12H0c0 3.042 1.135 5.824 
             3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center w-[160px] gap-2">
                  <i className="fa-solid fa-pen-to-square"></i> Change Password
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
