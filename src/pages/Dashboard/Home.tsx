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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <FaArrowUp className="mr-1" />
              ) : (
                <FaArrowDown className="mr-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
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
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            Failed to load dashboard data
          </div>
        </div>
      </div>
    );
  }

  const { summary, userRegistrationTrends, topCategories, recentUsers } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Penny Saver Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back! Here's what's happening with your savings platform.
              </p>
            </div>
            
            {/* Date Range Selector */}
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleDateRangeChange}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={summary.totalUsers.toLocaleString()}
            icon={<FaUsers className="text-white text-xl" />}
            color="bg-blue-500"
            subtitle={`${summary.totalRegularUsers} regular users`}
          />
          <StatCard
            title="Total Admins"
            value={summary.totalAdmins.toLocaleString()}
            icon={<FaUserShield className="text-white text-xl" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Total Transactions"
            value={summary.totalTransactions.toLocaleString()}
            icon={<FaExchangeAlt className="text-white text-xl" />}
            color="bg-green-500"
          />
          <StatCard
            title="Net Income"
            value={formatCurrency(summary.totalIncome - summary.totalExpenses)}
            icon={<FaDollarSign className="text-white text-xl" />}
            color={summary.totalIncome > summary.totalExpenses ? "bg-green-500" : "bg-red-500"}
            subtitle={`Income: ${formatCurrency(summary.totalIncome)} | Expenses: ${formatCurrency(summary.totalExpenses)}`}
          />
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Registration Trends */}
          <ChartCard title="User Registration Trends (Last 6 Months)">
            <div className="h-64 flex items-end justify-between gap-2">
              {userRegistrationTrends.map((trend, index) => {
                const maxCount = Math.max(...userRegistrationTrends.map(t => t.count));
                const height = (trend.count / maxCount) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg w-full transition-all duration-500 ease-out hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${height}%` }}
                      title={`${getMonthName(trend._id.month)} ${trend._id.year}: ${trend.count} users`}
                    ></div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      {getMonthName(trend._id.month)}
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {trend.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Top Spending Categories */}
          <ChartCard title="Top Spending Categories">
            <div className="space-y-3">
              {topCategories.slice(0, 5).map((category, index) => (
                <div key={category._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-orange-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {category.category?.name || category._id}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
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
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {user.role === 'admin' ? (
                          <FaUserShield className="mr-1" />
                        ) : (
                          <FaUser className="mr-1" />
                        )}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
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