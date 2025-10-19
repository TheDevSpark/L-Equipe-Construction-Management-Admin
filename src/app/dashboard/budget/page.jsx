"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectSelector, ProjectInfoCard } from "@/components/ProjectSelector";
import BudgetUploader from "@/components/BudgetUploader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import toast from "react-hot-toast";
import supabase from "../../../../lib/supabaseClinet";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function BudgetPage() {
  // State Management
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'budget', 'expense', 'change-order'
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  
  // Budget Data
  const [budgetMetrics, setBudgetMetrics] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    percentageUsed: 0,
  });
  
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [changeOrders, setChangeOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // Form States
  const [newBudget, setNewBudget] = useState({
    projectId: "",
    category: "",
    allocatedAmount: "",
    description: "",
  });
  
  const [newExpense, setNewExpense] = useState({
    projectId: "",
    category: "",
    expenseName: "",
    amount: "",
    date: "",
    vendor: "",
    paymentStatus: "pending",
    receipt: null,
  });
  
  const [newChangeOrder, setNewChangeOrder] = useState({
    projectId: "",
    reason: "",
    oldAmount: "",
    newAmount: "",
    approvedBy: "",
    date: "",
  });

  // Load initial data
  useEffect(() => {
    loadProjects();
    generateMockData();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase.from("project").select("*");
      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    }
  };

  const generateMockData = () => {
    // Mock budget categories
    setBudgetCategories([
      { id: 1, name: "Labor", allocated: 1200000, spent: 850000, remaining: 350000 },
      { id: 2, name: "Materials", allocated: 800000, spent: 650000, remaining: 150000 },
      { id: 3, name: "Equipment", allocated: 400000, spent: 280000, remaining: 120000 },
      { id: 4, name: "Subcontractors", allocated: 600000, spent: 450000, remaining: 150000 },
      { id: 5, name: "Permits", allocated: 50000, spent: 45000, remaining: 5000 },
      { id: 6, name: "Miscellaneous", allocated: 100000, spent: 75000, remaining: 25000 },
    ]);

    // Mock expenses
    setExpenses([
      {
        id: 1,
        projectId: 1,
        category: "Labor",
        expenseName: "Construction Workers - Week 1",
        amount: 15000,
        date: "2024-01-15",
        vendor: "ABC Construction",
        paymentStatus: "paid",
        receipt: null,
      },
      {
        id: 2,
        projectId: 1,
        category: "Materials",
        expenseName: "Steel Beams",
        amount: 25000,
        date: "2024-01-16",
        vendor: "Steel Corp",
        paymentStatus: "pending",
        receipt: null,
      },
    ]);

    // Mock change orders
    setChangeOrders([
      {
        id: 1,
        projectId: 1,
        reason: "Additional foundation work required",
        oldAmount: 450000,
        newAmount: 520000,
        approvedBy: "John Smith",
        date: "2024-01-10",
        status: "approved",
      },
    ]);

    // Calculate metrics
    const totalAllocated = 3150000;
    const totalSpent = 2095000;
    const remaining = totalAllocated - totalSpent;
    const percentageUsed = (totalSpent / totalAllocated) * 100;

    setBudgetMetrics({
      totalBudget: totalAllocated,
      totalSpent: totalSpent,
      remaining: remaining,
      percentageUsed: percentageUsed,
    });
  };

  // Chart data
  const budgetChartData = {
    labels: budgetCategories.map(cat => cat.name),
    datasets: [
      {
        label: "Allocated",
        data: budgetCategories.map(cat => cat.allocated),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Spent",
        data: budgetCategories.map(cat => cat.spent),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: budgetCategories.map(cat => cat.name),
    datasets: [
      {
        data: budgetCategories.map(cat => cat.spent),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#06B6D4",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + (value / 1000) + "K";
          },
        },
      },
    },
  };

  // Modal handlers
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setNewBudget({ projectId: "", category: "", allocatedAmount: "", description: "" });
    setNewExpense({ projectId: "", category: "", expenseName: "", amount: "", date: "", vendor: "", paymentStatus: "pending", receipt: null });
    setNewChangeOrder({ projectId: "", reason: "", oldAmount: "", newAmount: "", approvedBy: "", date: "" });
  };

  const handleBudgetSubmit = async () => {
    // Add budget logic here
    toast.success("Budget added successfully!");
    closeModal();
  };

  const handleExpenseSubmit = async () => {
    // Add expense logic here
    toast.success("Expense recorded successfully!");
    closeModal();
  };

  const handleChangeOrderSubmit = async () => {
    // Add change order logic here
    toast.success("Change order created successfully!");
    closeModal();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Budget Management</h1>
          <p className="text-muted-foreground">Track project budgets, expenses, and financial performance</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
          <div className="flex-1 lg:flex-none">
            <ProjectSelector
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onProjectCreate={(newProject) => {
                toast.success(`Project "${newProject.projectName}" created successfully!`);
              }}
              showCreateButton={true}
              className="w-full lg:w-auto"
            />
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Project Info */}
      <ProjectInfoCard project={selectedProject} />

      <div className="bg-card border border-border rounded-lg p-6">
        {selectedProject ? (
          <BudgetUploader projectId={selectedProject.id} />
        ) : (
          <p className="text-sm text-muted-foreground">Select a project to view or upload budget data.</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(budgetMetrics.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">Approved project funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(budgetMetrics.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Actual expenses incurred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(budgetMetrics.remaining)}</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{budgetMetrics.percentageUsed.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg w-full sm:w-fit">
        {[
          { id: "overview", label: "Overview", shortLabel: "Overview" },
          { id: "planning", label: "Budget Planning", shortLabel: "Planning" },
          { id: "expenses", label: "Expense Tracking", shortLabel: "Expenses" },
          { id: "change-orders", label: "Change Orders", shortLabel: "Changes" },
          { id: "payments", label: "Payments", shortLabel: "Payments" },
          { id: "reports", label: "Reports", shortLabel: "Reports" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget vs Actual Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual by Category</CardTitle>
              <CardDescription>Compare allocated vs spent amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={budgetChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Expense Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
              <CardDescription>Spending breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Doughnut data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>

          {/* Budget Categories */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>Detailed breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetCategories.map((category) => (
                  <div key={category.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {((category.spent / category.allocated) * 100).toFixed(1)}% used
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Allocated: {formatCurrency(category.allocated)}</span>
                      <span>Spent: {formatCurrency(category.spent)}</span>
                      <span>Remaining: {formatCurrency(category.remaining)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(category.spent / category.allocated) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Planning Tab */}
      {activeTab === "planning" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budget Categories</CardTitle>
                  <CardDescription>Manage budget allocations by category</CardDescription>
                </div>
                <Button onClick={() => openModal("budget")}>Add Category</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(category.allocated)} allocated
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => openModal("budget")}>
                Add Budget Category
              </Button>
              <Button variant="outline" className="w-full">
                Import Budget Template
              </Button>
              <Button variant="outline" className="w-full">
                Export Budget Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense Tracking Tab */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Expense Tracking</h2>
            <Button onClick={() => openModal("expense")}>Add Expense</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Track all project expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{expense.expenseName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {expense.category} • {expense.vendor} • {expense.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{formatCurrency(expense.amount)}</div>
                          <div className={`text-sm px-2 py-1 rounded-full ${
                            expense.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : expense.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {expense.paymentStatus}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Expenses:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(budgetMetrics.totalSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Payments:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(25000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overdue Payments:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(5000)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card text-card-foreground rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-card-foreground">
                {modalType === "budget" && "Add Budget Category"}
                {modalType === "expense" && "Add Expense"}
                {modalType === "change-order" && "Create Change Order"}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {modalType === "budget" && (
                <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category Name</Label>
                  <Input
                    id="category"
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    placeholder="e.g., Labor, Materials"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Allocated Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newBudget.allocatedAmount}
                    onChange={(e) => setNewBudget({ ...newBudget, allocatedAmount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newBudget.description}
                    onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                    placeholder="Category description"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={closeModal}>Cancel</Button>
                  <Button onClick={handleBudgetSubmit}>Add Category</Button>
                </div>
              </div>
            )}

            {modalType === "expense" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expenseName">Expense Name</Label>
                  <Input
                    id="expenseName"
                    value={newExpense.expenseName}
                    onChange={(e) => setNewExpense({ ...newExpense, expenseName: e.target.value })}
                    placeholder="Enter expense name"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                    placeholder="Vendor name"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <select
                    id="paymentStatus"
                    value={newExpense.paymentStatus}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={closeModal}>Cancel</Button>
                  <Button onClick={handleExpenseSubmit}>Add Expense</Button>
                </div>
              </div>
            )}

            {modalType === "change-order" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for Change</Label>
                  <Input
                    id="reason"
                    value={newChangeOrder.reason}
                    onChange={(e) => setNewChangeOrder({ ...newChangeOrder, reason: e.target.value })}
                    placeholder="Reason for budget change"
                  />
                </div>
                <div>
                  <Label htmlFor="oldAmount">Old Amount</Label>
                  <Input
                    id="oldAmount"
                    type="number"
                    value={newChangeOrder.oldAmount}
                    onChange={(e) => setNewChangeOrder({ ...newChangeOrder, oldAmount: e.target.value })}
                    placeholder="Previous amount"
                  />
                </div>
                <div>
                  <Label htmlFor="newAmount">New Amount</Label>
                  <Input
                    id="newAmount"
                    type="number"
                    value={newChangeOrder.newAmount}
                    onChange={(e) => setNewChangeOrder({ ...newChangeOrder, newAmount: e.target.value })}
                    placeholder="New amount"
                  />
                </div>
                <div>
                  <Label htmlFor="approvedBy">Approved By</Label>
                  <Input
                    id="approvedBy"
                    value={newChangeOrder.approvedBy}
                    onChange={(e) => setNewChangeOrder({ ...newChangeOrder, approvedBy: e.target.value })}
                    placeholder="Approver name"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={closeModal}>Cancel</Button>
                  <Button onClick={handleChangeOrderSubmit}>Create Change Order</Button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}