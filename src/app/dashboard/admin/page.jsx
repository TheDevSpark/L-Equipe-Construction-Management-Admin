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

  // Generate dynamic data
  useEffect(() => {
    // Pending Approvals Data
    setPendingApprovals([
      {
        id: 1,
        type: "Change Order",
        description: "MEP coordination changes - Level 2",
        submittedBy: "Sarah Chen",
        submittedDate: "Sep 28, 2025",
        amount: "$8,500",
        status: "pending",
      },
      {
        id: 2,
        type: "Budget Request",
        description: "Additional materials for foundation",
        submittedBy: "Mike Rodriguez",
        submittedDate: "Oct 1, 2025",
        amount: "$12,300",
        status: "pending",
      },
    ]);

    // Schedule Tasks Data
    setScheduleTasks([
      {
        id: 1,
        title: "Site Preparation & Grading",
        startDate: "Oct 3",
        endDate: "Oct 10",
        responsibleParty: "Smith Excavation",
        status: "On Track",
        progress: 75,
        statusColor: "green",
      },
      {
        id: 2,
        title: "Foundation Formwork",
        startDate: "Oct 7",
        endDate: "Oct 14",
        responsibleParty: "ABC Concrete",
        status: "On Track",
        progress: 45,
        statusColor: "green",
      },
      {
        id: 3,
        title: "Underground Utilities",
        startDate: "Oct 5",
        endDate: "Oct 12",
        responsibleParty: "Johnson Plumbing",
        status: "At Risk",
        progress: 30,
        statusColor: "orange",
      },
    ]);

    // Recent Photos Data
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

    // Daily Reports Data
    setDailyReports([
      {
        id: 1,
        date: "Oct 2, 2025",
        weather: "Sunny",
        temperature: "72°F",
        description: "Foundation pour completed on east wing. No delays.",
        crewSize: 45,
      },
      {
        id: 2,
        date: "Oct 1, 2025",
        weather: "Partly Cloudy",
        temperature: "68°F",
        description:
          "Steel erection progressing. Inspector approved MEP rough-in.",
        crewSize: 42,
      },
      {
        id: 3,
        date: "Sep 30, 2025",
        weather: "Light Rain",
        temperature: "65°F",
        description:
          "Rain delayed exterior work by 2 hours. Interior work continued.",
        crewSize: 38,
      },
    ]);

    // Budget Data for Chart
    setBudgetData({
      labels: ["Site Work", "Foundation", "Framing", "MEP", "Finishes"],
      datasets: [
        {
          label: "Planned",
          data: [450000, 380000, 650000, 500000, 350000],
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: "Actual",
          data: [420000, 400000, 600000, 480000, 320000],
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
      ],
    });

    // Team Metrics Data
    setTeamMetrics({
      totalUsers: 23,
      admins: 8,
      members: 15,
      activeSubcontractors: 12,
      onSiteSubcontractors: 6,
      tasksAssigned: 87,
      completedTasks: 45,
      documents: 247,
      storageUsed: "12.4 GB",
    });

    // Mark data as loaded
    setIsDataLoaded(true);
  }, []);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Budget Variance by Trade",
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

  // Handle approval actions
  const handleApproval = (id, action) => {
    setPendingApprovals((prev) =>
      prev.filter((approval) => approval.id !== id)
    );
  };

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
            ? selectedCollaborators.map(c => c.name).join(', ')
            : null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        
        // Handle specific RLS error
        if (error.code === '42501') {
          setSubmitError("Database permission error. Please run RLS policies in Supabase SQL Editor. Check the supabase-project-rls-fix.sql file.");
        } else if (error.code === '42P01') {
          setSubmitError("Project table not found. Please create the project table in Supabase.");
        } else if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          setSubmitError("Table structure error. Please check project table columns.");
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

  return (
    <div>
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
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-50 transition-colors">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <span className="font-medium">Manage Users</span>
            </button>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-50 transition-colors">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Full system control and management access</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Project Completion Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-medium">Project Completion</h3>
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.round(
              (teamMetrics.completedTasks / teamMetrics.tasksAssigned) * 100
            )}
            %
          </div>
          <div className="text-sm text-green-600">+3% this week</div>
          <div className="text-sm text-green-600">On schedule</div>
        </div>

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
            {dailyReports.length}
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
          <div className="text-3xl font-bold text-green-600 mb-2">$2.3M</div>
          <div className="text-sm text-green-600">-2.1% variance</div>
          <div className="text-sm text-green-600">Under budget</div>
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
            {teamMetrics.totalUsers}
          </div>
          <div className="text-sm text-blue-600">Current crew size</div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-orange-600"
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
            <h3 className="text-lg font-semibold text-gray-800">
              Pending Approvals
            </h3>
          </div>
          <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {pendingApprovals.length}
          </div>
        </div>
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <div
              key={approval.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                    {approval.type}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">
                      {approval.description}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Submitted by {approval.submittedBy} •{" "}
                      {approval.submittedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-orange-600">
                      {approval.amount}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproval(approval.id, "approve")}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(approval.id, "reject")}
                      className="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Lookahead and Recent Photos Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 2-Week Schedule Lookahead */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            2-Week Schedule Lookahead
          </h3>
          <div className="space-y-4">
            {scheduleTasks.map((task) => (
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
                        : "bg-orange-100 text-orange-800"
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
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {task.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Photos */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Photos
            </h3>
            <span className="text-sm text-gray-500">
              {currentPhotoIndex + 1}/{recentPhotos.length}
            </span>
          </div>
          {recentPhotos.length > 0 && recentPhotos[currentPhotoIndex] ? (
            <div className="relative">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={recentPhotos[currentPhotoIndex].imageUrl}
                  alt={recentPhotos[currentPhotoIndex].title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-3">
                <h4 className="font-medium text-gray-800">
                  {recentPhotos[currentPhotoIndex].title}
                </h4>
                <p className="text-sm text-gray-500">
                  {recentPhotos[currentPhotoIndex].date} •{" "}
                  {recentPhotos[currentPhotoIndex].location}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Loading photos...
            </div>
          )}
        </div>
      </div>

      {/* Daily Reports and Budget Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Daily Reports */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Daily Reports
          </h3>
          <div className="space-y-4">
            {dailyReports.map((report) => (
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
            ))}
          </div>
        </div>

        {/* Budget Variance Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Budget Variance by Trade
            </h3>
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
              Edit Budget
            </button>
          </div>
          <div className="h-64">
            {isDataLoaded && budgetData.labels.length > 0 ? (
              <Bar data={budgetData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading chart...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Team Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {teamMetrics.totalUsers}
            </div>
            <div className="text-gray-600 font-medium">Total Users</div>
            <div className="text-sm text-gray-500">
              {teamMetrics.admins} Admins, {teamMetrics.members} Members
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {teamMetrics.activeSubcontractors}
            </div>
            <div className="text-gray-600 font-medium">
              Active Subcontractors
            </div>
            <div className="text-sm text-gray-500">
              {teamMetrics.onSiteSubcontractors} currently on-site
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {teamMetrics.tasksAssigned}
            </div>
            <div className="text-gray-600 font-medium">Tasks Assigned</div>
            <div className="text-sm text-gray-500">
              {teamMetrics.completedTasks} completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {teamMetrics.documents}
            </div>
            <div className="text-gray-600 font-medium">Documents</div>
            <div className="text-sm text-gray-500">
              {teamMetrics.storageUsed} storage
            </div>
          </div>
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
  
  if (!isOpen) return null;

  // Available collaborators list
  const availableCollaborators = [
    { id: "u1", name: "Sarah Chen", email: "sarah@company.com" },
    { id: "u2", name: "Mike Rodriguez", email: "mike@company.com" },
    { id: "u3", name: "John Martinez", email: "john@company.com" },
    { id: "u4", name: "Anita Gupta", email: "anita@company.com" },
    { id: "u5", name: "Samuel Lee", email: "samuel@company.com" },
    { id: "u6", name: "Emma Wilson", email: "emma@company.com" },
    { id: "u7", name: "David Kim", email: "david@company.com" },
    { id: "u8", name: "Lisa Thompson", email: "lisa@company.com" },
  ];

  // Filter collaborators based on search query
  const filteredCollaborators = availableCollaborators.filter(collab => 
    collab.name.toLowerCase().includes(collaboratorQuery.toLowerCase()) &&
    !selectedCollaborators.find(selected => selected.id === collab.id)
  );

  const handleCollaboratorSelect = (collaborator) => {
    setSelectedCollaborators(prev => [...prev, collaborator]);
    setCollaboratorQuery("");
    setShowSuggestions(false);
  };

  const handleCollaboratorRemove = (collaboratorId) => {
    setSelectedCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
  };

  const handleInputChange = (e) => {
    setCollaboratorQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
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
          <h3 className="text-xl font-semibold text-card-foreground">Create New Project</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

          {/* Collaborators */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Collaborators
            </label>
            <div className="relative">
              <input
                type="text"
                value={collaboratorQuery}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(collaboratorQuery.length > 0)}
                placeholder="Search and select collaborators..."
                className="w-full border border-input rounded-lg px-3 py-2 bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              
              {/* Searchable Dropdown */}
              {showSuggestions && filteredCollaborators.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-input rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCollaborators.map((collab) => (
                    <div
                      key={collab.id}
                      onClick={() => handleCollaboratorSelect(collab)}
                      className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-card-foreground">{collab.name}</div>
                        <div className="text-sm text-muted-foreground">{collab.email}</div>
                      </div>
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No results message */}
              {showSuggestions && collaboratorQuery.length > 0 && filteredCollaborators.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-input rounded-lg shadow-lg px-3 py-2 text-muted-foreground">
                  No collaborators found
                </div>
              )}
            </div>

            {/* Selected Collaborators */}
            {selectedCollaborators.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-card-foreground mb-2">
                  Selected Collaborators:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCollaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{collab.name}</span>
                      <button
                        onClick={() => handleCollaboratorRemove(collab.id)}
                        className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
