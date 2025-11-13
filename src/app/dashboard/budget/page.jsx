"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import supabase from "@/lib/supabaseClinet";

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
  const [budgetLineItems, setBudgetLineItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
    loadBudgetData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadBudgetData();
    }
  }, [selectedProject]);

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

  const loadBudgetData = async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      // Load budget line items from API
      const { data: budgetData, error: budgetError } = await supabase
        .from("project_budgets")
        .select("*")
        .eq("project_id", selectedProject.id)
        .order("created_at", { ascending: false });

      if (budgetError) throw budgetError;

      if (budgetData && budgetData.length > 0) {
        setBudgetLineItems(budgetData);

        // Calculate totals
        const totalPlanned = budgetData.reduce(
          (sum, item) => sum + (item.planned || 0),
          0
        );
        const totalCommitted = budgetData.reduce(
          (sum, item) => sum + (item.committed || 0),
          0
        );
        const totalActual = budgetData.reduce(
          (sum, item) => sum + (item.actual || 0),
          0
        );
        const totalVariance = budgetData.reduce(
          (sum, item) => sum + (item.variance || 0),
          0
        );

        setBudgetMetrics({
          totalBudget: totalPlanned,
          totalSpent: totalActual,
          remaining: totalPlanned - totalActual,
          percentageUsed:
            totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
        });
      } else {
        // No data from API, show empty state
        setBudgetLineItems([]);
        setBudgetMetrics({
          totalBudget: 0,
          totalSpent: 0,
          remaining: 0,
          percentageUsed: 0,
        });
      }

      // Load change orders
      const { data: changeOrderData, error: changeOrderError } = await supabase
        .from("project_budgets")
        .select("*")
        .eq("project_id", selectedProject.id)
        .order("created_at", { ascending: false });

      if (changeOrderError) {
        console.error("Error loading change orders:", changeOrderError);
      } else {
        setChangeOrders(changeOrderData || []);
      }
    } catch (error) {
      console.error("Error loading budget data:", error);
      toast.error("Failed to load budget data");
      setBudgetLineItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chart data - now dynamic based on budget line items
  const budgetChartData = {
    labels: budgetLineItems.map((item) => item.category),
    datasets: [
      {
        label: "Planned",
        data: budgetLineItems.map((item) => item.planned || 0),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Actual",
        data: budgetLineItems.map((item) => item.actual || 0),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: budgetLineItems.map((item) => item.category),
    datasets: [
      {
        data: budgetLineItems.map((item) => item.actual || 0),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#06B6D4",
          "#F97316",
          "#84CC16",
          "#EC4899",
          "#6366F1",
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
            return "$" + value / 1000 + "K";
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
    setNewBudget({
      projectId: "",
      category: "",
      allocatedAmount: "",
      description: "",
    });
    setNewExpense({
      projectId: "",
      category: "",
      expenseName: "",
      amount: "",
      date: "",
      vendor: "",
      paymentStatus: "pending",
      receipt: null,
    });
    setNewChangeOrder({
      projectId: "",
      reason: "",
      oldAmount: "",
      newAmount: "",
      approvedBy: "",
      date: "",
    });
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const exportToExcel = () => {
    if (budgetLineItems.length === 0) {
      toast.error("No budget data to export");
      return;
    }

    // Create Excel data with dynamic fields
    const excelData = [
      [
        "TRADER /VENDOR NAME",
        "Contract Amount",
        "Approved Change Orders",
        "Revised Contract Total",
        "Paid to Date",
        "Remaining Balanc",
        "Payment Status",
        "% Complete",
      ],
      ...budgetLineItems.map((item) => [
        item.category || "",
        item.planned || 0,
        item.committed || 0,
        item.actual || 0,
        item.variance || 0,
        item.percent_complete || 0,
      ]),
      [
        "Total",
        budgetLineItems.reduce((sum, item) => sum + (item.planned || 0), 0),
        budgetLineItems.reduce((sum, item) => sum + (item.committed || 0), 0),
        budgetLineItems.reduce((sum, item) => sum + (item.actual || 0), 0),
        budgetLineItems.reduce((sum, item) => sum + (item.variance || 0), 0),
        "-",
      ],
    ];

    // Convert to CSV format
    const csvContent = excelData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `budget-report-${selectedProject?.projectName || "project"}-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Budget report exported successfully!");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Budget Management
          </h1>
          <p className="text-muted-foreground">
            Track project budgets, expenses, and financial performance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
          <div className="flex-1 lg:flex-none">
            <ProjectSelector
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onProjectCreate={(newProject) => {
                toast.success(
                  `Project "${newProject.projectName}" created successfully!`
                );
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
          <BudgetUploader
            projectId={selectedProject.id}
            onUploadSuccess={() => {
              loadBudgetData();
              toast.success("Budget data uploaded successfully!");
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a project to view or upload budget data.
          </p>
        )}
      </div>

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
                <svg
                  className="w-5 h-5"
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

            <div className="p-6">
              {modalType === "budget" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category Name</Label>
                    <Input
                      id="category"
                      value={newBudget.category}
                      onChange={(e) =>
                        setNewBudget({ ...newBudget, category: e.target.value })
                      }
                      placeholder="e.g., Labor, Materials"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Allocated Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newBudget.allocatedAmount}
                      onChange={(e) =>
                        setNewBudget({
                          ...newBudget,
                          allocatedAmount: e.target.value,
                        })
                      }
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newBudget.description}
                      onChange={(e) =>
                        setNewBudget({
                          ...newBudget,
                          description: e.target.value,
                        })
                      }
                      placeholder="Category description"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
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
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          expenseName: e.target.value,
                        })
                      }
                      placeholder="Enter expense name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                      id="vendor"
                      value={newExpense.vendor}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, vendor: e.target.value })
                      }
                      placeholder="Vendor name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <select
                      id="paymentStatus"
                      value={newExpense.paymentStatus}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          paymentStatus: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option
                        value="pending"
                        className="bg-background text-foreground"
                      >
                        Pending
                      </option>
                      <option
                        value="paid"
                        className="bg-background text-foreground"
                      >
                        Paid
                      </option>
                      <option
                        value="overdue"
                        className="bg-background text-foreground"
                      >
                        Overdue
                      </option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
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
                      onChange={(e) =>
                        setNewChangeOrder({
                          ...newChangeOrder,
                          reason: e.target.value,
                        })
                      }
                      placeholder="Reason for budget change"
                    />
                  </div>
                  <div>
                    <Label htmlFor="oldAmount">Old Amount</Label>
                    <Input
                      id="oldAmount"
                      type="number"
                      value={newChangeOrder.oldAmount}
                      onChange={(e) =>
                        setNewChangeOrder({
                          ...newChangeOrder,
                          oldAmount: e.target.value,
                        })
                      }
                      placeholder="Previous amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newAmount">New Amount</Label>
                    <Input
                      id="newAmount"
                      type="number"
                      value={newChangeOrder.newAmount}
                      onChange={(e) =>
                        setNewChangeOrder({
                          ...newChangeOrder,
                          newAmount: e.target.value,
                        })
                      }
                      placeholder="New amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="approvedBy">Approved By</Label>
                    <Input
                      id="approvedBy"
                      value={newChangeOrder.approvedBy}
                      onChange={(e) =>
                        setNewChangeOrder({
                          ...newChangeOrder,
                          approvedBy: e.target.value,
                        })
                      }
                      placeholder="Approver name"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button onClick={handleChangeOrderSubmit}>
                      Create Change Order
                    </Button>
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
