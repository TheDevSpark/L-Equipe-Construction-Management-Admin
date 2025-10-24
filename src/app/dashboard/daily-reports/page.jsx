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
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

// // Removed duplicate fetchReports - using loadReports instead

//   // Modal states
//   const [isFormModalOpen, setIsFormModalOpen] = useState(false);
//   const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);

//   // Report details modal
//   const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
//   const [reportMessages, setReportMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");

//   // Load initial data
//   useEffect(() => {
//     loadProjects();
//     loadReports();
//   }, []);

//   useEffect(() => {
//     if (
//       selectedProject &&
//       typeof selectedProject.id === "string" &&
//       selectedProject.id.includes("-")
//     ) {
//       loadReports(selectedProject.id);
//     }
//   }, [selectedProject]);

//   const loadProjects = async () => {
//     try {
//       const { data, error } = await supabase.from("project").select("*");
//       if (error) throw error;
//       setProjects(data || []);
//       if (data && data.length > 0) {
//         setSelectedProject(data[0]);
//       }
//     } catch (error) {
//       console.error("Error loading projects:", error);
//       toast.error("Failed to load projects");
//     }
//   };

//   const loadReports = async (projectId = null) => {
//     setLoading(true);
//     try {
//       const { data, error } = await dailyReportsApi.getDailyReports(projectId);
//       if (error) throw error;
//       setReports(data || []);
//       console.log("Loaded reports:", data?.length || 0, "reports");
//     } catch (error) {
//       console.error("Error loading reports:", error);
//       toast.error("Failed to load reports");
//       setReports([]); // Set empty array on error
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadReportMessages = async (reportId) => {
//     try {
//       const { data, error } = await dailyReportMessagesApi.getReportMessages(
//         reportId
//       );
//       if (error) throw error;
//       setReportMessages(data || []);
//     } catch (error) {
//       console.error("Error loading messages:", error);
//     }
//   };

//   // Generate mock data for demo
//   const generateMockData = () => {
//     const mkId = (fallback) =>
//       typeof crypto !== "undefined" && crypto.randomUUID
//         ? crypto.randomUUID()
//         : fallback;
//     // Use valid-looking UUID fallbacks so server/client validation doesn't treat them as simple numeric ids
//     const projectId = mkId("11111111-1111-4111-8111-111111111111");
//     const mockReports = [
//       {
//         id: mkId("22222222-2222-4222-8222-222222222222"),
//         project_id: projectId,
//         report_date: "2024-01-15",
//         work_summary: "Completed foundation work and started framing",
//         work_completed:
//           "Finished concrete foundation, started steel framing for first floor",
//         work_in_progress: "Steel framing installation",
//         work_scheduled:
//           "Complete first floor framing and begin electrical rough-in",
//         materials_used:
//           "Concrete (50 cubic yards), Steel beams (25 pieces), Rebar (500 lbs)",
//         equipment_used: "Concrete mixer, Crane, Welding equipment",
//         safety_incidents: "None",
//         quality_issues: "Minor concrete surface irregularities on foundation",
//         delays_reasons: "Weather delay on Monday (2 hours)",
//         photos_urls: ["photo1.jpg", "photo2.jpg"],
//         total_workers: 15,
//         total_work_hours: 120,
//         progress_percentage: 25,
//         status: "submitted",
//         created_at: "2024-01-15T17:00:00Z",
//         projectName: "Downtown Office Complex",
//         reporter_first_name: "John",
//         reporter_last_name: "Smith",
//         message_count: 2,
//         attachment_count: 3,
//       },
//       {
//         id: mkId("33333333-3333-4333-8333-333333333333"),
//         project_id: projectId,
//         report_date: "2024-01-14",
//         work_summary: "Foundation preparation and concrete pouring",
//         work_completed:
//           "Excavated foundation area, installed rebar, poured concrete",
//         work_in_progress: "Foundation curing",
//         work_scheduled: "Begin steel framing after foundation inspection",
//         materials_used: "Concrete (45 cubic yards), Rebar (450 lbs), Forms",
//         equipment_used: "Excavator, Concrete pump, Vibrators",
//         safety_incidents: "None",
//         quality_issues: "None",
//         delays_reasons: "None",
//         photos_urls: ["photo3.jpg"],
//         total_workers: 12,
//         total_work_hours: 96,
//         progress_percentage: 20,
//         status: "approved",
//         created_at: "2024-01-14T17:00:00Z",
//         projectName: "Downtown Office Complex",
//         reporter_first_name: "Sarah",
//         reporter_last_name: "Johnson",
//         message_count: 1,
//         attachment_count: 2,
//       },
//       {
//         id: mkId("44444444-4444-4444-8444-444444444444"),
//         project_id: projectId,
//         report_date: "2024-01-13",
//         work_summary: "Site preparation and excavation",
//         work_completed:
//           "Cleared site, marked foundation layout, began excavation",
//         work_in_progress: "Excavation completion",
//         work_scheduled: "Complete excavation and begin foundation work",
//         materials_used: "Survey stakes, Marking paint",
//         equipment_used: "Bulldozer, Excavator, Survey equipment",
//         safety_incidents: "None",
//         quality_issues: "None",
//         delays_reasons: "None",
//         photos_urls: [],
//         total_workers: 8,
//         total_work_hours: 64,
//         progress_percentage: 15,
//         status: "approved",
//         created_at: "2024-01-13T17:00:00Z",
//         projectName: "Downtown Office Complex",
//         reporter_first_name: "Mike",
//         reporter_last_name: "Rodriguez",
//         message_count: 0,
//         attachment_count: 1,
//       },
//     ];

//     setReports(mockReports);
//   };

//   // Initialize with mock data only for demo purposes
//   // Remove this useEffect to disable dummy data
//   // useEffect(() => {
//   //   generateMockData();
//   // }, []);

//   const filteredReports = Array.isArray(reports)
//     ? reports.filter((report) => {
//         const q = (searchTerm || "").toLowerCase();
//         const workSummary = (report?.work_summary || "")
//           .toString()
//           .toLowerCase();
//         const projectName = (report?.projectName || "")
//           .toString()
//           .toLowerCase();
//         const reporterName = `${report?.reporter_first_name || ""} ${
//           report?.reporter_last_name || ""
//         }`.toLowerCase();
//         return (
//           workSummary.includes(q) ||
//           projectName.includes(q) ||
//           reporterName.includes(q)
//         );
//       })
//     : [];

//   const handleCreateReport = () => {
//     setSelectedReport({});
//     setIsEditing(false);
//     setIsFormModalOpen(true);
//   };

//   const handleEditReport = (report) => {
//     setSelectedReport(report);
//     setIsEditing(true);
//     setIsFormModalOpen(true);
//   };

//   const handleViewReport = async (report) => {
//     setSelectedReport(report);
//     await loadReportMessages(report.id);
//     setIsDetailsModalOpen(true);
//   };

//   const handleApproveReport = (report) => {
//     setSelectedReport(report);
//     setIsApprovalModalOpen(true);
//   };

//   const handleRejectReport = (report) => {
//     setSelectedReport(report);
//     setIsApprovalModalOpen(true);
//   };

//   const handleSubmitReport = async (reportData) => {
//     try {
//       if (isEditing) {
//         const { data, error } = await dailyReportsApi.updateDailyReport(
//           selectedReport.id,
//           reportData
//         );
//         if (error) throw error;
//         toast.success("Report updated successfully!");
//       } else {
//         const { data, error } = await dailyReportsApi.createDailyReport(
//           reportData
//         );
//         if (error) throw error;
//         toast.success("Report created successfully!");
//         // return result so callers (forms) can inspect it
//         return { data, error: null };
//       }
//       loadReports(selectedProject?.id);
//     } catch (error) {
//       console.error(error);
//       // If the API returned an error object with a message, show it
//       const msg =
//         error && error.message ? error.message : "Failed to save report";
//       toast.error(msg);
//     }
//   };

//   const handleApprove = async (reportId, adminNotes) => {
//     try {
//       await dailyReportsApi.approveDailyReport(
//         reportId,
//         "current-admin-id",
//         adminNotes
//       );
//       toast.success("Report approved successfully!");
//       loadReports(selectedProject?.id);
//     } catch (error) {
//       toast.error("Failed to approve report");
//     }
//   };

//   const handleReject = async (reportId, rejectionReason, adminNotes) => {
//     try {
//       await dailyReportsApi.rejectDailyReport(
//         reportId,
//         "current-admin-id",
//         rejectionReason,
//         adminNotes
//       );
//       toast.success("Report rejected");
//       loadReports(selectedProject?.id);
//     } catch (error) {
//       toast.error("Failed to reject report");
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!newMessage.trim() || !selectedReport) return;

//     try {
//       await dailyReportMessagesApi.addMessage({
//         report_id: selectedReport.id,
//         sender_id: "current-user-id",
//         message: newMessage,
//         message_type: "comment",
//         is_admin_message: true, // Assuming admin is sending
//       });

//       setNewMessage("");
//       await loadReportMessages(selectedReport.id);
//       toast.success("Message sent");
//     } catch (error) {
//       toast.error("Failed to send message");
//     }
//   };

//   const getReportsByStatus = (status) => {
//     return filteredReports.filter((report) => report.status === status);
//   };

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
//         <div className="flex-1">
//           <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
//             Daily Reports
//           </h1>
//           <p className="text-muted-foreground">
//             Track daily progress and communicate with your team
//           </p>
//         </div>
//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
//           <div className="flex-1 lg:flex-none">
//             <ProjectSelector
//               selectedProject={selectedProject}
//               onProjectSelect={setSelectedProject}
//               onProjectCreate={(newProject) => {
//                 toast.success(
//                   `Project "${newProject.projectName}" created successfully!`
//                 );
//               }}
//               showCreateButton={true}
//               className="w-full lg:w-auto"
//             />
//           </div>
//           <ThemeToggle />
//         </div>
//       </div>

//       {/* Project Info */}
//       <ProjectInfoCard project={selectedProject} />

//       {/* Navigation Tabs */}
//       <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg w-full sm:w-fit">
//         {[
//           { id: "reports", label: "All Reports", shortLabel: "All" },
//           { id: "pending", label: "Pending Review", shortLabel: "Pending" },
//           { id: "approved", label: "Approved", shortLabel: "Approved" },
//           { id: "draft", label: "Drafts", shortLabel: "Drafts" },
//         ].map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none ${
//               activeTab === tab.id
//                 ? "bg-background text-foreground shadow-sm"
//                 : "text-muted-foreground hover:text-foreground"
//             }`}
//           >
//             <span className="hidden sm:inline">{tab.label}</span>
//             <span className="sm:hidden">{tab.shortLabel}</span>
//           </button>
//         ))}
//       </div>

//       {/* Search and Actions */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex items-center space-x-4">
//           <Input
//             type="text"
//             placeholder="Search reports..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full sm:w-64"
//           />
//         </div>
//         <Button onClick={handleCreateReport} className="w-full sm:w-auto">
//           <span className="hidden sm:inline">Create Daily Report</span>
//           <span className="sm:hidden">Create Report</span>
//         </Button>
//       </div>

//       {/* Reports Grid */}
//       {loading ? (
//         <div className="text-center py-12">
//           <div className="text-muted-foreground">Loading reports...</div>
//         </div>
//       ) : (activeTab === "reports"
//         ? filteredReports
//         : getReportsByStatus(activeTab)
//       ).length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {(activeTab === "reports"
//             ? filteredReports
//             : getReportsByStatus(activeTab)
//           ).map((report, index) => (
//             <DailyReportCard
//               key={report.id || index}
//               report={report}
//               onView={handleViewReport}
//               onEdit={handleEditReport}
//               onApprove={handleApproveReport}
//               onReject={handleRejectReport}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <div className="text-4xl mb-4">📋</div>
//           <h3 className="text-lg font-semibold text-foreground mb-2">
//             No Daily Reports Found
//           </h3>
//           <p className="text-muted-foreground mb-4">
//             {activeTab === "reports" 
//               ? "No reports have been created yet. Create your first daily report to get started."
//               : `No ${activeTab} reports found.`
//             }
//           </p>
//           <Button onClick={handleCreateReport}>
//             Create Your First Report
//           </Button>
//         </div>
//       )}

//       {/* Create/Edit Report Modal */}
//       <DailyReportForm
//         isOpen={isFormModalOpen}
//         onClose={() => setIsFormModalOpen(false)}
//         onSubmit={handleSubmitReport}
//         reportData={selectedReport}
//         isEditing={isEditing}
//         projects={projects}
//       />

//       {/* Approval Modal */}
//       <ApprovalModal
//         isOpen={isApprovalModalOpen}
//         onClose={() => setIsApprovalModalOpen(false)}
//         onApprove={handleApprove}
//         onReject={handleReject}
//         report={selectedReport}
//       />

//       {/* Report Details Modal */}
//       {isDetailsModalOpen && selectedReport && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="bg-card text-card-foreground rounded-lg w-full max-w-4xl p-6 shadow-xl border max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-semibold text-card-foreground">
//                 Daily Report -{" "}
//                 {dailyReportsUtils.formatDate(selectedReport.report_date)}
//               </h3>
//               <button
//                 onClick={() => setIsDetailsModalOpen(false)}
//                 className="text-muted-foreground hover:text-foreground transition-colors"
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>

//             {/* Report Content */}
//             <div className="space-y-6 mb-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Work Summary</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm">{selectedReport.work_summary}</p>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Progress</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-2">
//                       <div className="flex justify-between">
//                         <span className="text-sm text-muted-foreground">
//                           Overall Progress:
//                         </span>
//                         <span className="font-medium">
//                           {selectedReport.progress_percentage}%
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-sm text-muted-foreground">
//                           Workers:
//                         </span>
//                         <span className="font-medium">
//                           {selectedReport.total_workers}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-sm text-muted-foreground">
//                           Work Hours:
//                         </span>
//                         <span className="font-medium">
//                           {selectedReport.total_work_hours}h
//                         </span>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {selectedReport.work_completed && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Work Completed</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm whitespace-pre-wrap">
//                       {selectedReport.work_completed}
//                     </p>
//                   </CardContent>
//                 </Card>
//               )}

//               {selectedReport.work_in_progress && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Work In Progress</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm whitespace-pre-wrap">
//                       {selectedReport.work_in_progress}
//                     </p>
//                   </CardContent>
//                 </Card>
//               )}

//               {selectedReport.work_scheduled && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg">Work Scheduled</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm whitespace-pre-wrap">
//                       {selectedReport.work_scheduled}
//                     </p>
//                   </CardContent>
//                 </Card>
//               )}
//             </div>

//             {/* Messages Section */}
//             <div className="border-t border-border pt-6">
//               <h4 className="font-semibold text-foreground mb-4">
//                 Messages & Comments
//               </h4>

//               <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
//                 {reportMessages.map((message) => (
//                   <MessageCard
//                     key={message.id}
//                     message={message}
//                     canDelete={true}
//                     onDelete={(messageId) => {
//                       toast.success("Message deleted");
//                       loadReportMessages(selectedReport.id);
//                     }}
//                   />
//                 ))}
//                 {reportMessages.length === 0 && (
//                   <div className="text-center text-muted-foreground py-4">
//                     No messages yet
//                   </div>
//                 )}
//               </div>

//               <div className="flex space-x-2">
//                 <Input
//                   type="text"
//                   placeholder="Type a message..."
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//                 />
//                 <Button
//                   onClick={handleSendMessage}
//                   disabled={!newMessage.trim()}
//                 >
//                   Send
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectSelector, ProjectInfoCard } from "@/components/ProjectSelector";
import {
  DailyReportCard,
  DailyReportForm,
  ApprovalModal,
  MessageCard,
} from "@/components/DailyReportComponents";
import toast from "react-hot-toast";
import supabase from "../../../../lib/supabaseClinet";
import {
  dailyReportsApi,
  dailyReportMessagesApi,
  dailyReportsUtils,
} from "@/lib/dailyReportsApi";

export default function DailyReportsPage() {
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [reportMessages, setReportMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // 🔹 Load projects initially
  useEffect(() => {
    loadProjects();
  }, []);

  // 🔹 Load reports when project changes
  useEffect(() => {
    if (selectedProject?.id) {
      loadReports(selectedProject.id);
    } else {
      setReports([]);
    }
  }, [selectedProject]);

  // ✅ Load projects
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

  // ✅ Load reports for specific project (with project name)
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
      console.log("✅ Reports loaded:", reportsWithProjectName.length);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load messages
  const loadReportMessages = async (reportId) => {
    try {
      const { data, error } = await dailyReportMessagesApi.getReportMessages(
        reportId
      );
      if (error) throw error;
      setReportMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // ✅ Filter reports by search
  const filteredReports = reports.filter((report) => {
    const q = searchTerm.toLowerCase();
    const workSummary = (report?.work_summary || "").toLowerCase();
    const projectName = (report?.projectName || "").toLowerCase();
    const reporterName = `${report?.reporter_first_name || ""} ${
      report?.reporter_last_name || ""
    }`.toLowerCase();
    return (
      workSummary.includes(q) ||
      projectName.includes(q) ||
      reporterName.includes(q)
    );
  });

  // Handlers
  const handleCreateReport = () => {
    setSelectedReport({});
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleViewReport = async (report) => {
    setSelectedReport(report);
    await loadReportMessages(report.id);
    setIsDetailsModalOpen(true);
  };

  const handleApproveReport = (report) => {
    setSelectedReport(report);
    setIsApprovalModalOpen(true);
  };

  const handleRejectReport = (report) => {
    setSelectedReport(report);
    setIsApprovalModalOpen(true);
  };

  const handleSubmitReport = async (reportData) => {
    try {
      if (isEditing) {
        const { error } = await dailyReportsApi.updateDailyReport(
          selectedReport.id,
          reportData
        );
        if (error) throw error;
        toast.success("Report updated successfully!");
      } else {
        const { error } = await dailyReportsApi.createDailyReport(reportData);
        if (error) throw error;
        toast.success("Report created successfully!");
      }
      loadReports(selectedProject?.id);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save report");
    }
  };

  const handleApprove = async (reportId, adminNotes) => {
    try {
      await dailyReportsApi.approveDailyReport(reportId, "admin", adminNotes);
      toast.success("Report approved");
      loadReports(selectedProject?.id);
    } catch {
      toast.error("Failed to approve report");
    }
  };

  const handleReject = async (reportId, reason, notes) => {
    try {
      await dailyReportsApi.rejectDailyReport(reportId, "admin", reason, notes);
      toast.success("Report rejected");
      loadReports(selectedProject?.id);
    } catch {
      toast.error("Failed to reject report");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedReport) return;
    try {
      await dailyReportMessagesApi.addMessage({
        report_id: selectedReport.id,
        sender_id: "current-user",
        message: newMessage,
        message_type: "comment",
        is_admin_message: true,
      });
      setNewMessage("");
      await loadReportMessages(selectedReport.id);
      toast.success("Message sent");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const getReportsByStatus = (status) =>
    filteredReports.filter((r) => r.status === status);

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
          { id: "pending", label: "Pending" },
          { id: "approved", label: "Approved" },
          { id: "draft", label: "Drafts" },
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
        <Input
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:w-64"
        />
        <Button onClick={handleCreateReport}>Create Daily Report</Button>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading reports...
        </div>
      ) : (activeTab === "reports"
          ? filteredReports
          : getReportsByStatus(activeTab)
        ).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === "reports"
            ? filteredReports
            : getReportsByStatus(activeTab)
          ).map((report) => (
            <DailyReportCard
              key={report.id}
              report={report}
              onView={handleViewReport}
              onEdit={handleEditReport}
              onApprove={handleApproveReport}
              onReject={handleRejectReport}
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
          <Button onClick={handleCreateReport}>Create Report</Button>
        </div>
      )}

      {/* Modals */}
      <DailyReportForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitReport}
        reportData={selectedReport}
        isEditing={isEditing}
        projects={projects}
      />

      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        report={selectedReport}
      />

      {/* Details Modal */}
      {isDetailsModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg w-full max-w-4xl p-6 shadow-xl border max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {selectedReport.projectName || "--"} -{" "}
                {dailyReportsUtils.formatDate(selectedReport.report_date)}
              </h3>
              <button onClick={() => setIsDetailsModalOpen(false)}>✖</button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Work Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{selectedReport.work_summary || "--"}</p>
              </CardContent>
            </Card>

            <div className="border-t mt-6 pt-4">
              <h4 className="font-semibold mb-4">Messages</h4>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {reportMessages.length > 0 ? (
                  reportMessages.map((msg) => (
                    <MessageCard key={msg.id} message={msg} />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">
                    No messages yet
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  disabled={!newMessage.trim()}
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
