import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { AuthService } from "../../services/auth/auth.services";
import toastHelper from "../../utils/toastHelper";
import countriesData from "../../data/countries.json";

// Validation schema
const signUpSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  countryCode: yup
    .string()
    .required("Country code is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^\d{6,15}$/, "Phone number must be 6-15 digits"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  agreeToTerms: yup
    .boolean()
    .required("You must agree to the Terms and Conditions and Privacy Policy")
    .oneOf([true], "You must agree to the Terms and Conditions and Privacy Policy"),
});

type SignUpFormData = yup.InferType<typeof signUpSchema>;

export default function SignUpForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      countryCode: "+91",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const countryCode = watch("countryCode");

  // Process countries data
  const countries = useMemo(() => {
    return [...countriesData.countries]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((country) => ({
        name: country.name,
        code: country.code,
        phone_code: country.phone_code,
        flag: country.flag,
      }));
  }, []);

  // Filter countries based on search term
  const getFilteredCountries = (searchTerm: string) => {
    if (!searchTerm) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.phone_code.includes(searchTerm)
    );
  };

  // Handle country code change
  const handlePhoneCodeChange = (phoneCode: string) => {
    setValue("countryCode", phoneCode);
    setShowPhoneDropdown(false);
    setPhoneSearchTerm("");
  };

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setSubmitting(true);
      await AuthService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        mobileNumber: `${data.countryCode}${data.phone}`,
      });
      try {
        await AuthService.resendVerificationEmail(data.email);
      } catch {}
      toastHelper.success("Registered successfully. Please verify your email.");
      navigate(`/verify-notice?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";
      toastHelper.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneChange = (e: any) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setValue("phone", numericValue);
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
          </div>

          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <Label>
                    Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    value={watch("name")}
                    onChange={(e) => setValue("name", e.target.value)}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={watch("email")}
                    onChange={(e) => setValue("email", e.target.value)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Country Code + Phone Number */}
                <div>
                  <Label>
                    Phone Number<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative flex">
                    {/* Country Code Selector */}
                    <div className="relative w-24 mr-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPhoneDropdown(!showPhoneDropdown);
                          if (showPhoneDropdown) setPhoneSearchTerm(""); // Clear search when closing
                        }}
                        className="flex items-center justify-between cursor-pointer w-full px-3 py-[0.625rem] bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-700 text-sm hover:bg-gray-100 transition-colors h-11" // Adjusted padding and added h-10
                      >
                        <div className="flex items-center">
                          {countries.find((c) => c.phone_code === countryCode)
                            ?.flag && (
                            <img
                              src={
                                countries.find(
                                  (c) => c.phone_code === countryCode
                                )?.flag || ""
                              }
                              alt="flag"
                              className="w-4 h-4 mr-1"
                            />
                          )}
                          <span>{countryCode}</span>
                        </div>
                        <svg
                          className="ml-1 w-3 h-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {showPhoneDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                              </div>
                              <input
                                type="text"
                                value={phoneSearchTerm}
                                onChange={(e) =>
                                  setPhoneSearchTerm(e.target.value)
                                }
                                className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md"
                                placeholder="Search countries..."
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          {/* Countries List */}
                          <div className="max-h-48 overflow-y-auto">
                            {getFilteredCountries(phoneSearchTerm).map(
                              (country) => (
                                <div
                                  key={country.code}
                                  onClick={() =>
                                    handlePhoneCodeChange(country.phone_code)
                                  }
                                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                >
                                  <img
                                    src={country.flag}
                                    alt={country.name}
                                    className="w-4 h-4 mr-2"
                                  />
                                  <span className="truncate">
                                    {country.name}
                                  </span>
                                  <span className="ml-auto text-gray-500">
                                    {country.phone_code}
                                  </span>
                                </div>
                              )
                            )}
                            {getFilteredCountries(phoneSearchTerm).length ===
                              0 && (
                              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                No countries found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Phone Number Input */}
                    <div className="relative flex-1">
                      <Input
                        type="tel"
                        id="phone"
                        placeholder="Enter your phone number"
                        value={watch("phone")}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </div>
                  {(errors.countryCode || errors.phone) && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.countryCode?.message || errors.phone?.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={watch("password")}
                      onChange={(e) => setValue("password", e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label>
                    Confirm Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={watch("confirmPassword")}
                      onChange={(e) => setValue("confirmPassword", e.target.value)}
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={watch("agreeToTerms")}
                    onChange={(checked) => setValue("agreeToTerms", checked)}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}

                {/* Button */}
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg shadow-theme-xs bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60"
                  >
                    {submitting ? (
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
