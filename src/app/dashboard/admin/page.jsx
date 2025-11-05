"use client";

import { useState, useEffect } from "react";
import supabase from "../../../../lib/supabaseClinet";
import { ProjectSelector, ProjectInfoCard } from "@/components/ProjectSelector";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPage() {
  // Project state
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({});
  // Dynamic data states
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [scheduleTasks, setScheduleTasks] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [budgetData, setBudgetData] = useState({
    labels: [],
    datasets: [],
  });
  const [teamMetrics, setTeamMetrics] = useState({
    totalUsers: 0,
    admins: 0,
    members: 0,
    activeSubcontractors: 0,
    onSiteSubcontractors: 0,
    tasksAssigned: 0,
    completedTasks: 0,
    documents: 0,
    storageUsed: "0 GB",
  });
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to convert Excel serial date to JavaScript Date
  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
  };

  // Helper function to format money in short form
  const formatMoney = (amount) => {
    if (!amount && amount !== 0) return "$0";

    const num =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
        : amount;

    if (Math.abs(num) >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (Math.abs(num) >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num}`;
    }
  };

  // Load projects
  useEffect(() => {
    loadProjects();
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
    }
  };

  useEffect(() => {
    if (!selectedProject?.id) return;

    const makeSummary = async () => {
      setIsLoading(true);
      setIsDataLoaded(false);

      try {
        const project_id = selectedProject.id;

        // ✅ Fetch daily reports
        const { data: dailyReportData, error: dailyReportError } =
          await supabase
            .from("daily_reports")
            .select("*")
            .eq("project_id", project_id);

        if (dailyReportError) {
          toast.error(
            "Error getting daily reports: " + dailyReportError.message
          );
          return;
        }

        const total_daily_reports = dailyReportData?.length || 0;
        const reports = dailyReportData;

        // ✅ Fetch project budget
        const { data: budgetData, error: budgetError } = await supabase
          .from("project")
          .select("budget")
          .eq("id", project_id)
          .single();

        if (budgetError) {
          toast.error("Error getting budget: " + budgetError.message);
          return;
        }

        const totalBudget = budgetData?.budget || 0;

        const { data: teamData, error: teamError } = await supabase
          .from("project")
          .select("team_members , id")
          .eq("id", project_id);
        if (teamError) {
          toast.error("Error getting team info: " + teamError.message);
          return;
        }
        const teamMembers = teamData[0]?.team_members?.length || 0;

        const { data: scheduleData, error: scheduleError } = await supabase
          .from("project_schedules")
          .select("data , project_id")
          .eq("project_id", project_id);
        if (scheduleError) {
          toast.error("Error getting schedule info: " + scheduleError.message);
          return;
        }
        const schedule = scheduleData[0]?.data || [];
        const { data: budgetSummary, error: budgetSummaryError } =
          await supabase
            .from("project_budgets")
            .select("project_id , data")
            .eq("project_id", project_id);
        if (budgetSummaryError) {
          toast.error(
            "Error getting budgetSummary info: " + budgetSummaryError.message
          );
          return;
        }
        const budgetSummaryData = budgetSummary[0]?.data || [];

        setSummary({
          total_daily_reports,
          reports,
          totalBudget,
          teamMembers,
          schedule,
          budgetSummaryData,
        });
      } catch (err) {
        console.error("Unexpected summary error:", err);
        toast.error("Failed to fetch summary data.");
      } finally {
        setIsLoading(false);
        setIsDataLoaded(true);
      }
    };

    makeSummary();
  }, [selectedProject]);

  // Generate dynamic data from summary
  useEffect(() => {
    if (Object.keys(summary).length === 0) return;

    // Pending Approvals Data (using actual data where available)
    setPendingApprovals([
      {
        id: 1,
        type: "Change Order",
        description: "MEP coordination changes - Level 2",
        submittedBy: "Sarah Chen",
        submittedDate: "Sep 28, 2025",
        amount: "$8.5K",
        status: "pending",
      },
      {
        id: 2,
        type: "Budget Request",
        description: "Additional materials for foundation",
        submittedBy: "Mike Rodriguez",
        submittedDate: "Oct 1, 2025",
        amount: "$12.3K",
        status: "pending",
      },
    ]);

    // Schedule Tasks Data from actual schedule - 2 weeks lookahead
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);

    const scheduleTasksData =
      summary.schedule
        ?.filter((task) => {
          const taskStartDate = excelDateToJSDate(task.start);
          const taskEndDate = excelDateToJSDate(task.end);

          // Show tasks that start within the next 2 weeks OR are currently ongoing
          return (
            (taskStartDate >= today && taskStartDate <= twoWeeksFromNow) ||
            (taskStartDate <= today && taskEndDate >= today)
          );
        })
        .slice(0, 5) // Limit to 5 tasks for display
        .map((task, index) => {
          const taskStartDate = excelDateToJSDate(task.start);
          const taskEndDate = excelDateToJSDate(task.end);

          return {
            id: task.id,
            title: task.name,
            startDate: taskStartDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            endDate: taskEndDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            responsibleParty: "Contractor",
            status:
              task.progress === 100
                ? "Completed"
                : task.progress > 50
                ? "On Track"
                : task.progress > 0
                ? "In Progress"
                : "Not Started",
            progress: task.progress || 0,
            statusColor:
              task.progress === 100
                ? "green"
                : task.progress > 50
                ? "green"
                : task.progress > 0
                ? "orange"
                : "gray",
          };
        }) || [];

    setScheduleTasks(scheduleTasksData);

    // Recent Photos Data (placeholder as in original)
    setRecentPhotos([
      {
        id: 1,
        title: "Foundation Pour - East Wing Completed",
        date: "Oct 2, 2025",
        location: "Building A - Level 1",
        imageUrl:
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
      },
      {
        id: 2,
        title: "Steel Erection Progress",
        date: "Oct 1, 2025",
        location: "Building B - Level 2",
        imageUrl:
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop",
      },
      {
        id: 3,
        title: "MEP Installation",
        date: "Sep 30, 2025",
        location: "Building A - Level 3",
        imageUrl:
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
      },
    ]);

    // Daily Reports Data from actual reports
    const dailyReportsData =
      summary.reports?.slice(0, 3).map((report, index) => ({
        id: report.id,
        date: new Date(report.report_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        weather: report.weather_condition || "Not specified",
        temperature: "N/A",
        description: report.work_summary || "No summary provided",
        crewSize: report.total_workers || 0,
      })) || [];

    setDailyReports(dailyReportsData);

    // Budget Data for Chart from actual budget summary
    const validBudgetItems =
      summary.budgetSummaryData?.filter(
        (item) =>
          item &&
          item["Contract Amount"] !== undefined &&
          item["Remaining Balanc"] !== undefined
      ) || [];

    const budgetLabels = validBudgetItems
      .slice(0, 5)
      .map((item) => item["TRADER /VENDOR NAME"] || "Unknown Vendor");

    const plannedData = validBudgetItems
      .slice(0, 5)
      .map((item) => item["Contract Amount"] || 0);

    const actualData = validBudgetItems
      .slice(0, 5)
      .map((item) => item["Contract Amount"] - item["Remaining Balanc"] || 0);

    setBudgetData({
      labels: budgetLabels,
      datasets: [
        {
          label: "Planned",
          data: plannedData,
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: "Actual",
          data: actualData,
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
      ],
    });
  }, [summary]);

  // Chart options with money formatting
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Budget Variance by Trade",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${formatMoney(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax:
          budgetData.datasets.length > 0 &&
          Math.max(...budgetData.datasets.flatMap((d) => d.data)) > 0
            ? Math.max(...budgetData.datasets.flatMap((d) => d.data)) * 1.2
            : 1000, // Default range if no data
        ticks: {
          callback: function (value) {
            return formatMoney(value);
          },
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  useEffect(()=>{
    console.log(summary);
    
  },[summary])
  // Create Project modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectBudget, setNewProjectBudget] = useState("");
  const [newProjectLocation, setNewProjectLocation] = useState("");
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    console.log("Modal opened");
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setNewProjectName("");
    setNewProjectBudget("");
    setNewProjectLocation("");
    setSelectedCollaborators([]);
    setSubmitError(null);
    setIsSubmitting(false);
  };

  const handleCreateProject = async () => {
    // Basic validation
    if (!newProjectName.trim()) {
      setSubmitError("Project name is required");
      return;
    }
    const budgetNumber =
      parseFloat(newProjectBudget.toString().replace(/[^0-9.-]+/g, "")) || 0;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data, error } = await supabase.from("project").insert([
        {
          projectName: newProjectName.trim(),
          budget: budgetNumber,
          projectLocation: newProjectLocation || null,
          projectCollabrate: selectedCollaborators.length
            ? selectedCollaborators.map((c) => c.name).join(", ")
            : null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);

        // Handle specific RLS error
        if (error.code === "42501") {
          setSubmitError(
            "Database permission error. Please run RLS policies in Supabase SQL Editor. Check the supabase-project-rls-fix.sql file."
          );
        } else if (error.code === "42P01") {
          setSubmitError(
            "Project table not found. Please create the project table in Supabase."
          );
        } else if (
          error.message?.includes("column") &&
          error.message?.includes("does not exist")
        ) {
          setSubmitError(
            "Table structure error. Please check project table columns."
          );
        } else {
          setSubmitError(error.message || "Failed to create project");
        }

        setIsSubmitting(false);
        return;
      }

      console.log("Project created successfully:", data);
      // On success, close modal and optionally refresh local state
      closeModal();
      // Show success message
      toast.success("Project created successfully!");
    } catch (err) {
      console.error("Unexpected error:", err);
      setSubmitError(err.message || "Unexpected error");
      setIsSubmitting(false);
    }
  };

  // Handle photo navigation
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % recentPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + recentPhotos.length) % recentPhotos.length
    );
  };

  // Empty state components
  const EmptyState = ({ icon, title, description, action }) => (
    <div className="text-center py-8">
      <div className="text-4xl mb-4">{icon}</div>
      <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );

  // Loading component
  const LoadingState = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Loading Project Data
        </h3>
        <p className="text-gray-500">
          Fetching project details, schedule, and budget information...
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && <LoadingState />}

      {/* Admin Dashboard Banner */}
      <div className="bg-blue-600 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Admin Dashboard
            </h2>
            <p className="text-blue-100">
              Full system control and management access
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={openModal}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-50 transition-colors cursor-pointer"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="font-medium">Create Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Full system control and management access
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
          <div className="flex-1 lg:flex-none">
            <ProjectSelector
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onProjectCreate={(newProject) => {
                console.log("Project created:", newProject);
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6 justify-center ">
        {/* Daily Reports Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-medium">Daily Reports</h3>
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {summary.total_daily_reports || 0}
          </div>
          <div className="text-sm text-blue-600">Total submitted</div>
        </div>

        {/* Budget Status Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-medium">Budget Status</h3>
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {summary.totalBudget ? formatMoney(summary.totalBudget) : "$0"}
          </div>
          <div className="text-sm text-green-600">
            {summary.totalBudget ? "Total budget" : "No budget set"}
          </div>
        </div>

        {/* Active Team Members Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-medium">Active Team Members</h3>
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {summary.teamMembers || 0}
          </div>
          <div className="text-sm text-blue-600">
            {summary.teamMembers ? "Current crew size" : "No team members"}
          </div>
        </div>

        {/* Schedule Progress Card */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-medium">Schedule Progress</h3>
            <svg
              className="w-6 h-6 text-purple-600"
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
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {summary.schedule?.length || 0}
          </div>
          <div className="text-sm text-purple-600">
            {summary.schedule?.length ? "Total tasks" : "No schedule data"}
          </div>
        </div>
      </div>

      {/* Schedule Lookahead and Budget Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 2-Week Schedule Lookahead */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            2-Week Schedule Lookahead
          </h3>
          <div className="space-y-4">
            {!summary.schedule || summary.schedule.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No Schedule"
                description="No schedule has been uploaded for this project yet."
              />
            ) : scheduleTasks.length > 0 ? (
              scheduleTasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        task.statusColor === "green"
                          ? "bg-green-100 text-green-800"
                          : task.statusColor === "orange"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {task.startDate} - {task.endDate} • {task.responsibleParty}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          task.statusColor === "green"
                            ? "bg-green-500"
                            : task.statusColor === "orange"
                            ? "bg-orange-500"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-800 mb-1">All caught up!</h4>
                <p className="text-gray-500">No tasks in the next 2 weeks. Take a break! ☕</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Variance Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Budget Variance by Trade
            </h3>
            <Link
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              href={"/dashboard/budget"}
            >
              View Details
            </Link>
          </div>
          <div className="h-80">
            {isDataLoaded && budgetData.labels.length > 0 ? (
              <Bar data={budgetData} options={chartOptions} />
            ) : (
              <EmptyState
                icon="💰"
                title="No Budget Data"
                description="Budget data is not available for this project. Upload a budget file to see the variance chart."
              />
            )}
          </div>
        </div>
      </div>

      {/* Daily Reports Below Budget Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Daily Reports
        </h3>
        <div className="space-y-4">
          {dailyReports.length > 0 ? (
            dailyReports.map((report) => (
              <div key={report.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{report.date}</h4>
                  <div className="text-sm text-gray-500">
                    {report.weather}, {report.temperature}
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{report.description}</p>
                <div className="text-sm text-gray-500">
                  ({report.crewSize} crew)
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon="📝"
              title="No Daily Reports"
              description="No daily reports have been submitted for this project yet. Check back later for updates."
            />
          )}
        </div>
      </div>

      {/* Mount the Create Project modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        name={newProjectName}
        setName={setNewProjectName}
        budget={newProjectBudget}
        setBudget={setNewProjectBudget}
        location={newProjectLocation}
        setLocation={setNewProjectLocation}
        selectedCollaborators={selectedCollaborators}
        setSelectedCollaborators={setSelectedCollaborators}
        onSubmit={handleCreateProject}
        error={submitError}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

// Simple collaborator suggestion helper (replace with server-driven data later)
function CollaboratorSuggestions({ query, onSelect }) {
  const candidates = [
    { id: "u1", name: "Sarah Chen" },
    { id: "u2", name: "Mike Rodriguez" },
    { id: "u3", name: "John Martinez" },
    { id: "u4", name: "Anita Gupta" },
    { id: "u5", name: "Samuel Lee" },
  ];

  if (!query || query.trim().length < 1) return null;

  const lower = query.toLowerCase();
  const matches = candidates
    .filter((c) => c.name.toLowerCase().includes(lower))
    .slice(0, 5);

  if (matches.length === 0)
    return <div className="mt-2 text-sm text-gray-500">No matches</div>;

  return (
    <ul className="mt-2 bg-white border rounded shadow max-h-40 overflow-auto">
      {matches.map((m) => (
        <li
          key={m.id}
          onClick={() => onSelect(m)}
          className="p-2 hover:bg-gray-100 cursor-pointer"
        >
          {m.name}
        </li>
      ))}
    </ul>
  );
}

// Modal markup appended after component so it's easy to find; kept in same file for simplicity.
function CreateProjectModal({
  isOpen,
  onClose,
  name,
  setName,
  budget,
  setBudget,
  location,
  setLocation,
  selectedCollaborators,
  setSelectedCollaborators,
  onSubmit,
  error,
  isSubmitting,
}) {
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [data, setData] = useState([]); // ✅ initially empty array

  const getAllUser = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "team");

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      console.log("Users fetched:", data);
      setData(data || []); // ✅ safe fallback
    }
  };

  useEffect(() => {
    getAllUser();
  }, []);

  if (!isOpen) return null;

  // ✅ Map Supabase data to collaborators
  const availableCollaborators = data.map((user) => ({
    id: user.id,
    name: `${user.full_name}`.trim(),
    email: user.email || "",
    role: user.role || "",
  }));

  // ✅ Filter collaborators based on search input
  const filteredCollaborators = availableCollaborators.filter(
    (collab) =>
      collab.name.toLowerCase().includes(collaboratorQuery.toLowerCase()) &&
      !selectedCollaborators.some((sel) => sel.id === collab.id)
  );

  const handleCollaboratorSelect = (collaborator) => {
    setSelectedCollaborators((prev) => [...prev, collaborator]);
    setCollaboratorQuery("");
    setShowSuggestions(false);
  };

  const handleCollaboratorRemove = (collaboratorId) => {
    setSelectedCollaborators((prev) =>
      prev.filter((c) => c.id !== collaboratorId)
    );
  };

  const handleInputChange = (e) => {
    setCollaboratorQuery(e.target.value);
    setShowSuggestions(e.target.value.trim().length > 0);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card text-card-foreground rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border">
        <div className="flex items-center justify-between p-2">
          <h3 className="text-xl font-semibold text-card-foreground">
            Create New Project
          </h3>
          <button
            onClick={onClose}
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
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full border border-input rounded-lg px-3 py-2 bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Budget (USD)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter budget amount"
                className="w-full border border-input rounded-lg px-3 py-2 bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Project Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter project location"
                className="w-full border border-input rounded-lg px-3 py-2 bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="text-sm text-destructive">{error}</div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-input rounded-lg text-card-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
