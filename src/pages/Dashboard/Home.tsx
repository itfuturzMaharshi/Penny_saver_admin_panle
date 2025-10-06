import React, { useState, useEffect } from 'react';
import { DashboardService, DashboardData } from '../../services/dashboard/dashboard.services';
import { format } from 'date-fns';

// Icons
import { 
  FaUsers, 
  FaUserShield, 
  FaUser, 
  FaExchangeAlt, 
  FaCalendarAlt,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const Home: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getDashboardData({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = () => {
    fetchDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {title}
            </p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center mt-3 text-sm font-semibold ${
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <div className={`p-1.5 rounded-full mr-2 ${
                trend.isPositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {trend.isPositive ? (
                  <FaArrowUp className="text-xs" />
                ) : (
                  <FaArrowDown className="text-xs" />
                )}
              </div>
              {Math.abs(trend.value)}% from last period
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color} shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ title, children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-80 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-96"></div>
            </div>
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Unable to fetch dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const { summary, userRegistrationTrends, topCategories, recentUsers } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Penny Saver Dashboard
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                Welcome back! Here's what's happening with your savings platform.
              </p>
            </div>
            
            {/* Date Range Selector */}
            <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-3">
                <FaCalendarAlt className="text-emerald-500 text-lg" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                />
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-3">
                <span className="text-gray-400 font-medium">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                />
              </div>
              <button
                onClick={handleDateRangeChange}
                className="group flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold transform hover:-translate-y-0.5"
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={summary.totalUsers.toLocaleString()}
            icon={<FaUsers className="text-white text-2xl" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            subtitle={`${summary.totalRegularUsers} regular users`}
          />
          <StatCard
            title="Total Admins"
            value={summary.totalAdmins.toLocaleString()}
            icon={<FaUserShield className="text-white text-2xl" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Total Transactions"
            value={summary.totalTransactions.toLocaleString()}
            icon={<FaExchangeAlt className="text-white text-2xl" />}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Net Income"
            value={formatCurrency(summary.totalIncome - summary.totalExpenses)}
            icon={<FaDollarSign className="text-white text-2xl" />}
            color={summary.totalIncome > summary.totalExpenses ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-red-500 to-red-600"}
            subtitle={`Income: ${formatCurrency(summary.totalIncome)} | Expenses: ${formatCurrency(summary.totalExpenses)}`}
          />
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Registration Trends */}
          <ChartCard title="User Registration Trends (Last 6 Months)">
            <div className="h-80 flex items-end justify-between gap-3">
              {userRegistrationTrends.map((trend, index) => {
                const maxCount = Math.max(...userRegistrationTrends.map(t => t.count));
                const height = (trend.count / maxCount) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div
                      className="bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl w-full transition-all duration-500 ease-out hover:from-emerald-700 hover:to-emerald-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      style={{ height: `${height}%` }}
                      title={`${getMonthName(trend._id.month)} ${trend._id.year}: ${trend.count} users`}
                    ></div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center font-medium">
                      {getMonthName(trend._id.month)}
                    </div>
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {trend.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Top Spending Categories */}
          <ChartCard title="Top Spending Categories">
            <div className="space-y-4">
              {topCategories.slice(0, 5).map((category, index) => (
                <div key={category._id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-4 shadow-lg ${
                      index === 0 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      index === 1 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      index === 2 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      index === 3 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                      'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}></div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {category.category?.name || category._id}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {formatCurrency(category.total)}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Recent Users */}
        <ChartCard title="Recent User Registrations" className="col-span-1 lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">Name</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">Email</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">Role</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all duration-200 group">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-medium">
                      {user.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                        user.role === 'admin' 
                          ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900 dark:to-purple-800 dark:text-purple-200'
                          : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200'
                      }`}>
                        {user.role === 'admin' ? (
                          <FaUserShield className="mr-1.5" />
                        ) : (
                          <FaUser className="mr-1.5" />
                        )}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-medium">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Home;