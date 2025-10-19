# Budget Management System Setup Guide

## 🎯 Overview
Complete budget management system with expense tracking, change orders, payment management, and real-time analytics.

## 🚀 Quick Setup

### 1. Database Setup
Run the following SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content from: budget-database-setup.sql
-- This creates all necessary tables, indexes, triggers, and RLS policies
```

### 2. Storage Setup
Create a storage bucket for receipt files:

```sql
-- In Supabase Dashboard > Storage
CREATE BUCKET 'budget-files' WITH (public = true);
```

### 3. Test the System
1. Navigate to `/dashboard/budget` or `/dashboard/budget-demo`
2. Select a project
3. Try creating budget categories
4. Add expenses with receipts
5. Create change orders

## 📊 Features Implemented

### ✅ Budget Planning
- **Category Management**: Create, edit, delete budget categories
- **Allocation Tracking**: Set and monitor budget allocations
- **Milestone-based Budgets**: Track budgets by project phases
- **Visual Progress**: Progress bars showing budget usage

### ✅ Expense Tracking
- **Expense Recording**: Add expenses with detailed information
- **Receipt Uploads**: File upload for receipts/invoices (PDF, images)
- **Payment Status**: Track Paid/Pending/Overdue status
- **Vendor Management**: Record vendor information
- **Automatic Calculations**: Real-time budget vs actual variance

### ✅ Real-Time Budget Overview
- **Interactive Charts**: Bar charts and pie charts
- **Quick Stats**: Total budget, spent, remaining, percentage used
- **Category Breakdown**: Detailed view of each category
- **Budget Alerts**: Visual warnings for over-budget categories

### ✅ Change Orders Management
- **Change Order Creation**: Track budget revisions
- **Approval Workflow**: Who approved, when, reason
- **Amount Tracking**: Old vs new amounts with difference calculation
- **Status Management**: Pending/Approved/Rejected status

### ✅ Payment Management
- **Payment Recording**: Track all payments
- **Payment Methods**: Check, wire transfer, cash, credit card, ACH
- **Status Tracking**: Pending/Approved/Paid/Failed
- **Payment References**: Track payment confirmation numbers

### ✅ Reports & Analytics
- **Budget Variance Reports**: Compare planned vs actual
- **Category Breakdown**: Detailed spending analysis
- **Overrun Detection**: Identify budget overruns
- **Export Capabilities**: Ready for PDF/Excel export

## 🗄️ Database Tables

### 1. `budget_categories`
- Stores budget categories and allocations
- Fields: id, project_id, category_name, allocated_amount, description

### 2. `expenses`
- Tracks all project expenses
- Fields: id, project_id, category_id, expense_name, amount, date, vendor, payment_status, receipt_url

### 3. `change_orders`
- Manages budget revisions
- Fields: id, project_id, change_order_number, reason, old_amount, new_amount, approved_by, status

### 4. `payments`
- Records payment transactions
- Fields: id, project_id, expense_id, payment_amount, payment_date, payment_method, status

### 5. `budget_milestones`
- Tracks phase-based budgets
- Fields: id, project_id, milestone_name, allocated_budget, start_date, end_date, status

## 🎨 UI Components

### Core Components
- **BudgetCategoryCard**: Displays category with progress bar and alerts
- **ExpenseCard**: Shows expense details with status indicators
- **ChangeOrderCard**: Displays change order information
- **FileUpload**: Drag & drop file upload for receipts
- **BudgetAlert**: Warning and notification components

### Charts & Visualizations
- **Bar Charts**: Budget vs actual comparison
- **Pie Charts**: Expense distribution
- **Progress Bars**: Category usage indicators
- **Status Badges**: Color-coded status indicators

## 🔧 API Functions

### Budget Categories API
```javascript
import { budgetCategoriesApi } from '@/lib/budgetApi';

// Get categories
const { data } = await budgetCategoriesApi.getCategories(projectId);

// Create category
const { data } = await budgetCategoriesApi.createCategory(categoryData);

// Update category
const { data } = await budgetCategoriesApi.updateCategory(categoryId, updates);

// Delete category
await budgetCategoriesApi.deleteCategory(categoryId);
```

### Expenses API
```javascript
import { expensesApi } from '@/lib/budgetApi';

// Get expenses
const { data } = await expensesApi.getExpenses(projectId);

// Create expense
const { data } = await expensesApi.createExpense(expenseData);

// Upload receipt
const { data } = await expensesApi.uploadReceipt(file, fileName);
```

### Change Orders API
```javascript
import { changeOrdersApi } from '@/lib/budgetApi';

// Get change orders
const { data } = await changeOrdersApi.getChangeOrders(projectId);

// Create change order
const { data } = await changeOrdersApi.createChangeOrder(changeOrderData);
```

## 📱 Pages & Routes

### Main Budget Dashboard
- **Route**: `/dashboard/budget`
- **Features**: Full budget management interface
- **Components**: All budget features integrated

### Demo Page
- **Route**: `/dashboard/budget-demo`
- **Features**: Showcase all budget features
- **Components**: Mock data demonstration

## 🎯 Usage Examples

### Creating a Budget Category
```javascript
const categoryData = {
  project_id: selectedProject.id,
  category_name: "Labor",
  allocated_amount: 1200000,
  description: "Construction labor costs",
  created_by: currentUser.id
};

const { data, error } = await budgetCategoriesApi.createCategory(categoryData);
```

### Recording an Expense
```javascript
const expenseData = {
  project_id: selectedProject.id,
  category_id: categoryId,
  expense_name: "Steel Beams",
  amount: 25000,
  expense_date: "2024-01-16",
  vendor: "Steel Corp",
  payment_status: "pending",
  created_by: currentUser.id
};

const { data, error } = await expensesApi.createExpense(expenseData);
```

### Creating a Change Order
```javascript
const changeOrderData = {
  project_id: selectedProject.id,
  category_id: categoryId,
  reason: "Additional foundation work required",
  old_amount: 450000,
  new_amount: 520000,
  approved_by: "John Smith",
  created_by: currentUser.id
};

const { data, error } = await changeOrdersApi.createChangeOrder(changeOrderData);
```

## 🔐 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Authenticated users can manage their project data
- Proper permissions for CRUD operations

### File Upload Security
- Files stored in Supabase Storage
- Public URLs for receipt access
- File type validation (PDF, PNG, JPG)

## 📊 Analytics & Reporting

### Budget Variance Analysis
```javascript
// Calculate budget variance for a project
const { data } = await budgetSummaryApi.getBudgetVariance(projectId);
```

### Budget Summary
```javascript
// Get budget summary
const { data } = await budgetSummaryApi.getBudgetSummary(projectId);
```

## 🚨 Notifications & Alerts

### Budget Alerts
- Category approaching budget limit (>80%)
- Category exceeding budget (>100%)
- Overdue payments
- Pending approvals

### Alert Types
- **Warning**: Yellow alerts for approaching limits
- **Error**: Red alerts for overruns and overdue items
- **Success**: Green alerts for completed actions

## 🎨 Theming

### Dark/Light Mode Support
- All components support theme switching
- CSS variables for consistent theming
- Responsive design for all screen sizes

### Color Coding
- **Green**: On track, completed, approved
- **Yellow**: Warning, pending, approaching limit
- **Red**: Over budget, overdue, rejected

## 📱 Mobile Responsive

### Responsive Features
- Mobile-friendly forms and modals
- Touch-friendly buttons and inputs
- Optimized charts for mobile viewing
- Collapsible navigation

## 🔄 Real-time Updates

### Live Data Sync
- Automatic data refresh after changes
- Real-time budget calculations
- Instant status updates
- Live progress indicators

## 🎯 Next Steps

1. **Run Database Setup**: Execute `budget-database-setup.sql`
2. **Create Storage Bucket**: Set up `budget-files` bucket
3. **Test Features**: Navigate to budget dashboard
4. **Customize Categories**: Add your specific budget categories
5. **Set Up Notifications**: Configure budget alerts
6. **Train Users**: Show team how to use the system

## 🆘 Troubleshooting

### Common Issues
1. **RLS Policy Errors**: Run the database setup script
2. **File Upload Fails**: Check storage bucket permissions
3. **Charts Not Loading**: Ensure Chart.js dependencies are installed
4. **Theme Issues**: Check CSS variables in globals.css

### Support
- Check browser console for errors
- Verify Supabase connection
- Ensure all dependencies are installed
- Check file permissions and storage setup

---

**Budget Management System is now fully functional and ready for production use!** 🎉💰📊




