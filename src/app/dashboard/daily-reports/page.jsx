// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { ThemeToggle } from "@/components/theme-toggle";
// import { ProjectSelector, ProjectInfoCard } from "@/components/ProjectSelector";
// import {
//   DailyReportCard,
//   DailyReportForm,
//   ApprovalModal,
//   MessageCard,
// } from "@/components/DailyReportComponents";
// import {
//   dailyReportsApi,
//   dailyReportMessagesApi,
//   dailyReportsUtils,
//   getDailyReportsWithProjectName,
// } from "@/lib/dailyReportsApi";
// import toast from "react-hot-toast";
// import supabase from "../../../../lib/supabaseClinet";

// export default function DailyReportsPage() {
//   const [activeTab, setActiveTab] = useState("reports");
//   const [reports, setReports] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectSelector, ProjectInfoCard } from "@/components/ProjectSelector";
import { DailyReportCard, DailyReportForm } from "@/components/DailyReportComponents";
import toast from "react-hot-toast";
import supabase from "@/lib/supabaseClinet";
import {
  dailyReportsApi,
} from "@/lib/dailyReportsApi";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DailyReportsPage() {
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  // const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  // const [isRejecting, setIsRejecting] = useState(false);
  // const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject?.id) {
      loadReports(selectedProject.id);
    } else {
      setReports([]);
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

  const loadReports = async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .select(
          `
          *,
          project:project_id(projectName)
        `
        )
        .eq("project_id", projectId)
        .order("report_date", { ascending: false });

      if (error) throw error;

      const reportsWithProjectName = (data || []).map((r) => ({
        ...r,
        projectName: r.project?.projectName || "--",
      }));

      setReports(reportsWithProjectName);
      console.log("Reports loaded:", reportsWithProjectName.length);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = () => {
    setSelectedReport(null);
    setIsFormModalOpen(true);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsFormModalOpen(true);
  };

  const handleSaveReport = async (reportData) => {
    try {
      // Create the report with default values
      await dailyReportsApi.createDailyReport({
        ...reportData,
        status: "submitted",
        reporter_first_name: "User",
        reporter_last_name: "",
        reporter_email: ""
      });
      
      toast.success("Report submitted successfully");
      loadReports(selectedProject?.id);
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error(error.message || "Failed to submit report. Please try again.");
    }
  };

  const handleApprove = async (reportId) => {
    try {
      await dailyReportsApi.approveDailyReport(reportId);
      toast.success("Report approved");
      loadReports(selectedProject?.id);
    } catch (error) {
      console.error("Error approving report:", error);
      toast.error("Failed to approve report");
    }
  };

  const openRejectModal = (report) => {
    setSelectedReport(report);
    setIsApprovalModalOpen(true);
  };

  const handleReject = async (report) => {
    try {
      setIsRejecting(true);
      const { error } = await dailyReportsApi.rejectDailyReport(report.id);
      if (error) throw error;
      
      toast.success("Report rejected");
      loadReports(selectedProject?.id);
      setIsApprovalModalOpen(false);
      setRejectReason('');
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast.error(error.message || "Failed to reject report");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await dailyReportsApi.deleteDailyReport(reportId);
      if (error) throw error;
      
      toast.success("Report deleted successfully");
      loadReports(selectedProject?.id);
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  const getReportsByStatus = (status) =>
    reports.filter((r) => r.status === status);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Reports</h1>
          <p className="text-muted-foreground">
            Track daily progress and communicate with your team
          </p>
        </div>
        <div className="flex gap-3">
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
            onProjectCreate={(newProject) => {
              toast.success(`Project "${newProject.projectName}" created!`);
            }}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Project Info */}
      <ProjectInfoCard project={selectedProject} />

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: "reports", label: "All Reports" },
          { id: "submitted", label: "Pending" },
          { id: "approved", label: "Approved" },
          { id: "rejected", label: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Create */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button onClick={handleNewReport} className="ml-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Daily Report
        </Button>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading reports...
        </div>
      ) : (activeTab === "reports"
          ? reports
          : getReportsByStatus(activeTab)
        ).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === "reports"
            ? reports
            : getReportsByStatus(activeTab)
          ).map((report) => (
            <DailyReportCard
              key={report.id}
              report={report}
              onView={handleViewReport}
              onApprove={() => handleApprove(report.id)}
              onReject={() => openRejectModal(report)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
          <p className="text-muted-foreground mb-4">
            {selectedProject
              ? "No reports available for this project."
              : "Select a project to view its reports."}
          </p>
          <Button onClick={handleNewReport}>Create Report</Button>
        </div>
      )}

      {/* Modals */}
      <DailyReportForm
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedReport(null);
        }}
        onSubmit={handleSaveReport}
        reportData={selectedReport}
        projects={projects}
        isViewing={!!selectedReport?.id} // Enable view mode if we have a selected report with an ID
      />

      {/* Rejection Modal */}
      {isApprovalModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject Report</h3>
            <p className="mb-4">Are you sure you want to reject this report?</p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsApprovalModalOpen(false);
                  setRejectReason('');
                }}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleReject(selectedReport)}
                disabled={isRejecting}
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
