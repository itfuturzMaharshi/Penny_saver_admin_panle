import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AsyncSelect from "react-select/async";
import { ProductService } from "../../services/products/products.services";

interface Product {
  _id?: string;
  specification: string | { name: string; _id: string };
  simType: string | string[];
  color: string;
  ram: string | string[];
  storage: string | string[];
  condition: string;
  price: number;
  stock: number;
  country: string;
  moq: number;
  isNegotiable: boolean;
  isFlashDeal?: boolean;
  expiryTime?: string;
  isVerified?: boolean;
  isApproved?: boolean;
  canVerify?: boolean;
  canApprove?: boolean;
}

interface FormData {
  specification: string;
  skuFamilyId?: string;
  specificationName?: string;
  simType: string;
  color: string;
  ram: string;
  storage: string;
  condition: string;
  price: number | string;
  stock: number | string;
  country: string;
  moq: number | string;
  purchaseType: string;
  isNegotiable: boolean;
  isFlashDeal: boolean;
  expiryTime: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: FormData) => Promise<void>;
  editItem?: Product;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [formData, setFormData] = useState<FormData>({
    specification: "",
    skuFamilyId: "",
    specificationName: "",
    simType: "",
    color: "",
    ram: "",
    storage: "",
    condition: "",
    price: 0,
    stock: 0,
    country: "",
    moq: 0,
    purchaseType: "partial",
    isNegotiable: false,
    isFlashDeal: false,
    expiryTime: "",
  });
  const [dateError, setDateError] = useState<string | null>(null);
  const [moqError, setMoqError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const colorOptions = ["Graphite", "Silver", "Gold", "Sierra Blue", "Mixed"];
  const countryOptions = ["Hongkong", "Dubai", "Singapore"];
  const simOptions = ["E-Sim", "Physical Sim"];
  const ramOptions = ["4GB", "6GB", "8GB", "16GB", "32GB"];
  const storageOptions = ["128GB", "256GB", "512GB", "1TB"];
  const conditionOptions = ["AAA", "A+", "Mixed"];

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        // In edit mode, preserve the exact identifiers
        const fromListName = (editItem as any)?.name as string | undefined;
        const fromListId = (editItem as any)?.skuFamilyId as string | undefined;
        const specName =
          fromListName ??
          (typeof editItem.specification === "object"
            ? editItem.specification?.name || ""
            : editItem.specification || "");
        const specId =
          fromListId ??
          (typeof editItem.specification === "object"
            ? editItem.specification?._id || ""
            : "");
        setFormData({
          specification: specName,
          skuFamilyId: specId,
          specificationName: specName,
          simType: Array.isArray(editItem.simType)
            ? editItem.simType[0] || ""
            : editItem.simType || "",
          color: editItem.color || "",
          ram: Array.isArray(editItem.ram)
            ? editItem.ram[0] || ""
            : editItem.ram || "",
          storage: Array.isArray(editItem.storage)
            ? editItem.storage[0] || ""
            : editItem.storage || "",
          condition: editItem.condition || "",
          price: editItem.price || 0,
          stock: editItem.stock || 0,
          country: editItem.country || "",
          moq: editItem.moq || 0,
          purchaseType:
            String((editItem as any)?.purchaseType || "partial")
              .trim()
              .toLowerCase() === "full"
              ? "full"
              : "partial",
          isNegotiable: !!editItem.isNegotiable,
          isFlashDeal: !!editItem.isFlashDeal,
          expiryTime: editItem.expiryTime || "",
        });
      } else {
        setFormData({
          specification: "",
          skuFamilyId: "",
          specificationName: "",
          simType: "",
          color: "",
          ram: "",
          storage: "",
          condition: "",
          price: 0,
          stock: 0,
          country: "",
          moq: 0,
          purchaseType: "partial",
          isNegotiable: false,
          isFlashDeal: false,
          expiryTime: "",
        });
      }
      setDateError(null);
    }
  }, [isOpen, editItem]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((previous) => {
      let updatedValue: any;
      if (type === "checkbox") {
        updatedValue = checked;
      } else if (type === "number") {
        updatedValue = parseFloat(value) || 0;
      } else {
        updatedValue = value;
      }

      // Normalize purchaseType strictly to 'full' or 'partial'
      if (name === "purchaseType") {
        updatedValue =
          String(updatedValue).trim().toLowerCase() === "full"
            ? "full"
            : "partial";
      }

      let next = { ...previous, [name]: updatedValue } as FormData;

      // If switching to full purchase, align MOQ to Stock
      if (name === "purchaseType" && updatedValue === "full") {
        next.moq = Number(previous.stock) || 0;
      }
      // If stock changes while full, keep MOQ in sync
      if (name === "stock" && previous.purchaseType === "full") {
        const numericStock =
          typeof updatedValue === "number"
            ? updatedValue
            : parseFloat(String(updatedValue)) || 0;
        next.moq = numericStock;
      }

      const numericStock =
        parseFloat(String(name === "stock" ? updatedValue : previous.stock)) ||
        0;
      const numericMoq =
        parseFloat(String(name === "moq" ? updatedValue : previous.moq)) || 0;
      const purchaseType = String(
        name === "purchaseType" ? updatedValue : previous.purchaseType
      );
      if (purchaseType === "partial") {
        if (numericMoq > numericStock) {
          setMoqError("MOQ must be less than or equal to Stock");
        } else {
          setMoqError(null);
        }
      } else {
        setMoqError(null);
      }

      return next;
    });
  };

  const handleNumericChange = (
    name: "price" | "stock" | "moq",
    e: React.ChangeEvent<HTMLInputElement>,
    allowDecimal: boolean
  ) => {
    let value = e.target.value;

    if (allowDecimal) {
      value = value.replace(/[^0-9.]/g, "");
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
      }
    } else {
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData((previous) => {
      const next: FormData = { ...previous, [name]: value } as FormData;

      if (name === "stock" && previous.purchaseType === "full") {
        const numeric = value === "" ? 0 : parseFloat(value) || 0;
        next.moq = numeric;
      }

      const numericStock =
        parseFloat(String(name === "stock" ? value : previous.stock)) || 0;
      const numericMoq =
        parseFloat(String(name === "moq" ? value : previous.moq)) || 0;
      if (previous.purchaseType === "partial") {
        if (numericMoq > numericStock) {
          setMoqError("MOQ must be less than or equal to Stock");
        } else {
          setMoqError(null);
        }
      } else {
        setMoqError(null);
      }

      return next;
    });
  };

  const loadOptions = async (inputValue: string) => {
    try {
      const res = await ProductService.listByName(inputValue);
      const specs = res?.data?.specs || res?.data || [];
      return specs.map((s: { _id: string; name: string }) => ({
        value: s._id,
        label: s.name,
      }));
    } catch (error) {
      return [];
    }
  };

  const handleSpecChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      specification: selectedOption ? selectedOption.label : "",
      specificationName: selectedOption ? selectedOption.label : "",
      skuFamilyId: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      setFormData((prev) => ({
        ...prev,
        expiryTime: date.toISOString(),
      }));
      setDateError(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        expiryTime: "",
      }));
      setDateError("Please select a valid date and time");
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    if (!formData.skuFamilyId) {
      alert("Please select a Specification");
      return;
    }
    if (formData.isFlashDeal && !formData.expiryTime) {
      setDateError("Expiry time is required for Flash Deal");
      return;
    }
    const numericStock = parseFloat(String(formData.stock)) || 0;
    const numericMoq = parseFloat(String(formData.moq)) || 0;
    if (
      String(formData.purchaseType) === "partial" &&
      numericMoq > numericStock
    ) {
      setMoqError("MOQ must be less than or equal to Stock");
      return;
    }
    
    try {
      setIsLoading(true);
      const normalizedPurchaseType =
        formData.purchaseType?.toLowerCase() === "full" ? "full" : "partial";

      const payload: FormData = {
        ...formData,
        purchaseType: normalizedPurchaseType,
        specification: formData.specificationName || formData.specification || "",
        skuFamilyId: formData.skuFamilyId || "",
      };
      
      await onSave(payload);
      // Don't call onClose here - let the parent component handle it after save completes
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = editItem ? "Edit Product" : "Create Product";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[800px] max-h-[80vh] transform transition-all duration-300 scale-100 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 pb-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-transform duration-200 hover:scale-110"
            >
              <svg
                className="w-6 h-6"
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SKU Family ID, Country, and Sim Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  SKU Family ID
                </label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadOptions}
                  value={
                    formData.skuFamilyId
                      ? {
                          value: String(formData.skuFamilyId),
                          label:
                            formData.specificationName || formData.specification,
                        }
                      : null
                  }
                  onChange={handleSpecChange}
                  placeholder="Select SKU Family"
                  isSearchable
                  className="text-gray-800 dark:text-gray-200"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: document.documentElement.classList.contains("dark")
                        ? "#1F2937"
                        : "#F9FAFB",
                      borderColor: document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "#E5E7EB",
                      borderRadius: "0.5rem",
                      padding: "0.25rem 0.75rem",
                      height: "42px",
                      minHeight: "42px",
                      fontSize: "0.875rem",
                      "&:hover": {
                        borderColor: document.documentElement.classList.contains("dark")
                          ? "#4B5563"
                          : "#D1D5DB",
                      },
                      boxShadow: "none",
                    }),
                    input: (base) => ({
                      ...base,
                      color: document.documentElement.classList.contains("dark")
                        ? "#E5E7EB"
                        : "#111827",
                      padding: 0,
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: document.documentElement.classList.contains("dark")
                        ? "#1F2937"
                        : "#FFFFFF",
                      color: document.documentElement.classList.contains("dark")
                        ? "#E5E7EB"
                        : "#111827",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? document.documentElement.classList.contains("dark")
                          ? "#2563EB"
                          : "#3B82F6"
                        : state.isFocused
                        ? document.documentElement.classList.contains("dark")
                          ? "#374151"
                          : "#F3F4F6"
                        : document.documentElement.classList.contains("dark")
                          ? "#1F2937"
                          : "#FFFFFF",
                      color: document.documentElement.classList.contains("dark")
                        ? "#E5E7EB"
                        : "#111827",
                      "&:hover": {
                        backgroundColor: document.documentElement.classList.contains("dark")
                          ? "#374151"
                          : "#F3F4F6",
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: document.documentElement.classList.contains("dark")
                        ? "#E5E7EB"
                        : "#111827",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: document.documentElement.classList.contains("dark")
                        ? "#9CA3AF"
                        : "#6B7280",
                    }),
                  }}
                  components={{
                    DropdownIndicator: () => (
                      <i className="fas fa-chevron-down text-gray-400 text-xs" />
                    ),
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  Country
                </label>
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-8 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm appearance-none cursor-pointer border-gray-200 dark:border-gray-700"
                  >
                    <option value="" disabled>
                      Select Country
                    </option>
                    {countryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  SIM Type
                </label>
                <div className="relative">
                  <select
                    name="simType"
                    value={formData.simType}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-8 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm appearance-none cursor-pointer border-gray-200 dark:border-gray-700"
                  >
                    <option value="" disabled>
                      Select SIM Type
                    </option>
                    {simOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
            </div>

            {/* Color, RAM, and Storage Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  Color
                </label>
                <div className="relative">
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-8 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm appearance-none cursor-pointer border-gray-200 dark:border-gray-700"
                  >
                    <option value="" disabled>
                      Select Color
                    </option>
                    {colorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  RAM
                </label>
                <div className="relative">
                  <select
                    name="ram"
                    value={formData.ram}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-8 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm appearance-none cursor-pointer border-gray-200 dark:border-gray-700"
                  >
                    <option value="" disabled>
                      Select RAM
                    </option>
                    {ramOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  Storage
                </label>
                <div className="relative">
                  <select
                    name="storage"
                    value={formData.storage}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-8 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm appearance-none cursor-pointer border-gray-200 dark:border-gray-700"
                  >
                    <option value="" disabled>
                      Select Storage
                    </option>
                    {storageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
            </div>

            {/* Condition, Price, and Stock Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  Condition
                </label>
                <div className="relative">
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-8 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm appearance-none cursor-pointer border-gray-200 dark:border-gray-700"
                  >
                    <option value="" disabled>
                      Select Condition
                    </option>
                    {conditionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={(e) => handleNumericChange("price", e, true)}
                  inputMode="decimal"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm border-gray-200 dark:border-gray-700"
                  placeholder="Enter Price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  Stock
                </label>
                <input
                  type="text"
                  name="stock"
                  value={formData.stock}
                  onChange={(e) => handleNumericChange("stock", e, false)}
                  inputMode="numeric"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm border-gray-200 dark:border-gray-700"
                  placeholder="Enter Stock Quantity"
                />
              </div>
            </div>

            {/* MOQ and Purchase Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  MOQ
                </label>
                <input
                  type="text"
                  name="moq"
                  value={formData.moq}
                  onChange={(e) => handleNumericChange("moq", e, false)}
                  inputMode="numeric"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm border-gray-200 dark:border-gray-700"
                  placeholder="Enter Minimum Order Quantity"
                  disabled={formData.purchaseType === "full"}
                />
                {moqError && formData.purchaseType === "partial" && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {moqError}
                  </p>
                )}
                {formData.purchaseType === "full" && (
                  <p className="mt-1 text-xs text-gray-500">
                    MOQ equals Stock for Full purchase type.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                  Purchase Type
                </label>
                <div className="relative">
                  <select
                    name="purchaseType"
                    value={formData.purchaseType}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-8 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm appearance-none cursor-pointer border-gray-200 dark:border-gray-700"
                  >
                    <option value="partial">Partial</option>
                    <option value="full">Full</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
            </div>

            {/* Is Negotiable, Is Flash Deal, and Expiry Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="isNegotiable"
                  checked={formData.isNegotiable}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 transition duration-200"
                />
                <label className="ml-2 text-sm font-medium text-gray-950 dark:text-gray-200">
                  Is Negotiable
                </label>
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="isFlashDeal"
                  checked={formData.isFlashDeal}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 transition duration-200"
                />
                <label className="ml-2 text-sm font-medium text-gray-950 dark:text-gray-200">
                  Is Flash Deal
                </label>
              </div>
              {formData.isFlashDeal && (
                <div>
                  <label className="block text-sm font-medium text-gray-950 dark:text-gray-200 mb-2">
                    Expiry Time
                  </label>
                  <DatePicker
                    selected={
                      formData.expiryTime ? new Date(formData.expiryTime) : null
                    }
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    placeholderText="Select date and time"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-sm border-gray-200 dark:border-gray-700"
                  />
                  {dateError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {dateError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              className="min-w-[160px] px-4 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-green-600 transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!!dateError || !!moqError || isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : editItem ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;