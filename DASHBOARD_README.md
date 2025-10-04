# Penny Saver Admin Dashboard

## Overview
A comprehensive admin dashboard for the Penny Saver platform featuring real-time analytics, user management insights, and financial tracking.

## Features

### 📊 Dashboard Analytics
- **User Statistics**: Total users, admins, and regular users
- **Transaction Overview**: Total transactions and financial summaries
- **Income/Expense Tracking**: Net income calculations with detailed breakdowns
- **Date Range Filtering**: Customizable date ranges for data analysis

### 📈 Visualizations
- **User Registration Trends**: Bar chart showing user growth over the last 6 months
- **Top Spending Categories**: Ranked list of expense categories with color coding
- **Recent User Activity**: Table of latest user registrations with role indicators

### 🎨 UI/UX Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic theme switching
- **Smooth Animations**: Hover effects and transitions for better user experience
- **Professional Styling**: Clean, modern interface with consistent branding

## Technical Implementation

### Services
- **DashboardService**: Handles API communication for dashboard data
- **TypeScript Interfaces**: Strongly typed data structures for all dashboard components
- **Error Handling**: Comprehensive error management with user-friendly messages

### Components
- **StatCard**: Reusable component for displaying key metrics
- **ChartCard**: Container component for charts and data visualizations
- **Responsive Grid**: CSS Grid layout for optimal space utilization

### Dependencies
- **React Icons**: Font Awesome icons for visual elements
- **Date-fns**: Date formatting and manipulation
- **Tailwind CSS**: Utility-first CSS framework for styling

## API Integration
- **Endpoint**: `/api/admin/dashboard`
- **Method**: GET
- **Parameters**: Optional `startDate` and `endDate` query parameters
- **Response**: Comprehensive dashboard data including summaries, trends, and recent activity

## Usage
The dashboard automatically loads current data on page load and provides date range filtering for historical analysis. All components are fully responsive and include loading states for optimal user experience.
