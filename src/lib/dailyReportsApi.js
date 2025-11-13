import supabase from "./supabaseClinet.js";

// Utility functions
export const dailyReportsUtils = {
  // Format date for display
  formatDate: (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // Get status color based on status
  getStatusColor: (status) => {
    const statusColors = {
      draft: "bg-yellow-100 text-yellow-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  },

  // Get status icon
  getStatusIcon: (status) => {
    const statusIcons = {
      draft: "📝",
      submitted: "⏳",
      approved: "✅",
      rejected: "❌",
    };
    return statusIcons[status] || "📄";
  },

  // Calculate report completeness percentage
  calculateCompleteness: (report) => {
    if (!report) return 0;
    
    const requiredFields = [
      'work_summary',
      'work_completed',
      'total_workers',
      'total_work_hours'
    ];

    const completedFields = requiredFields.filter(
      field => report[field] !== null && report[field] !== undefined && report[field] !== ''
    ).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }
};


/**
 * Fetch all daily reports with related project name
 */
export async function getDailyReportsWithProjectName() {
  const { data, error } = await supabase
    .from("daily_reports")
    .select(
      `
      *,
      projects:project_id ( projectName )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching daily reports:", error);
    throw error;
  }

  // Flatten projectName for easy access in frontend
  const reports = data.map((r) => ({
    ...r,
    projectName: r.projects?.projectName || "Unknown Project",
  }));

  return reports;
}

// Daily Reports API
export const dailyReportsApi = {
  // Get all daily reports
  async getDailyReports(projectId = null, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from("daily_reports")
        .select("*")
        .order("report_date", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      if (startDate) {
        query = query.gte("report_date", startDate);
      }
      if (endDate) {
        query = query.lte("report_date", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching daily reports:", error);
      return { data: null, error };
    }
  },

  // Get daily report by ID
  async getDailyReport(reportId) {
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .select("*")
        .eq("id", reportId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching daily report:", error);
      return { data: null, error };
    }
  },

  // Create a new daily report with only valid fields from the schema
  async createDailyReport(reportData) {
    try {
      // Filter to only include fields that exist in the database schema
      const validFields = [
        'report_date', 'weather_condition', 'work_summary', 'created_by',
        'work_completed', 'work_in_progress', 'work_scheduled', 'safety_incidents',
        'quality_issues', 'delays_reasons', 'total_workers', 'total_work_hours',
        'progress_percentage', 'next_day_plan', 'status', 'weather_conditions',
        'reporter_id', 'project_id', 'id', 'photos_urls'
      ];
      
      const filteredData = {};
      Object.keys(reportData).forEach(key => {
        if (validFields.includes(key)) {
          filteredData[key] = reportData[key];
        }
      });
      
      // Ensure required fields have default values
      if (!filteredData.status) {
        filteredData.status = 'draft';
      }
      
      if (!filteredData.created_at) {
        filteredData.created_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from("daily_reports")
        .insert([filteredData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error creating daily report:", error);
      return { data: null, error };
    }
  },

  // Update a daily report
  async updateDailyReport(reportId, updates) {
    try {
      // Filter to only include valid fields
      const validFields = [
        'report_date', 'weather_condition', 'work_summary', 'created_by',
        'work_completed', 'work_in_progress', 'work_scheduled', 'safety_incidents',
        'quality_issues', 'delays_reasons', 'total_workers', 'total_work_hours',
        'progress_percentage', 'next_day_plan', 'status', 'weather_conditions',
        'reporter_id', 'project_id', 'photos_urls'
      ];
      
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (validFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const { data, error } = await supabase
        .from("daily_reports")
        .update(filteredUpdates)
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error updating daily report:", error);
      return { data: null, error };
    }
  },

  // Delete a daily report
  async deleteDailyReport(reportId) {
    try {
      const { error } = await supabase
        .from("daily_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error deleting daily report:", error);
      return { error };
    }
  },

  // Submit daily report
  async submitDailyReport(reportId) {
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .update({ status: "submitted" })
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error submitting daily report:", error);
      return { data: null, error };
    }
  },

  // Approve daily report
  async approveDailyReport(reportId) {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .update({
          status: 'approved',
        })
        .eq('id', reportId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error approving daily report:', error);
      return { data: null, error };
    }
  },

  // Reject daily report - marks the report as 'rejected' instead of deleting
  async rejectDailyReport(reportId) {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .update({
          status: 'rejected',

        })
        .eq('id', reportId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error rejecting daily report:', error);
      return { data: null, error };
    }
  },

  // Delete a daily report permanently
  async deleteDailyReport(reportId) {
    try {
      const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error deleting daily report:', error);
      return { data: null, error };
    }
  },

  // Get reports by status
  async getReportsByStatus(status, projectId = null) {
    try {
      let query = supabase
        .from("daily_reports")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching reports by status:", error);
      return { data: null, error };
    }
  },
  
  // Get all reports for a project
  async getProjectReports(projectId) {
    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .select("*")
        .eq("project_id", projectId)
        .order("report_date", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching project reports:", error);
      return { data: null, error };
    }
  },
};

// Daily Report Attachments API
export const dailyReportAttachmentsApi = {
  // Get attachments for a report
  async getReportAttachments(reportId) {
    try {
      const { data, error } = await supabase
        .from("daily_report_attachments")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching report attachments:", error);
      return { data: null, error };
    }
  },

  // Upload attachment
  async uploadAttachment(file, fileName, reportId) {
    try {
      const fileExt = fileName.split(".").pop();
      const filePath = `daily-reports/${reportId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("daily-report-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("daily-report-files").getPublicUrl(filePath);

      // Save attachment record
      const { data, error } = await supabase
        .from("daily_report_attachments")
        .insert([
          {
            report_id: reportId,
            file_name: fileName,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: "current-user-id", // Replace with actual user ID
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error uploading attachment:", error);
      return { data: null, error };
    }
  },

  // Delete attachment
  async deleteAttachment(attachmentId) {
    try {
      // Get attachment info first
      const { data: attachment, error: fetchError } = await supabase
        .from("daily_report_attachments")
        .select("file_url")
        .eq("id", attachmentId)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL
      const filePath = attachment.file_url.split("/").slice(-2).join("/");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("daily-report-files")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from("daily_report_attachments")
        .delete()
        .eq("id", attachmentId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error deleting attachment:", error);
      return { error };
    }
  },
};

// Daily Report Templates API
export const dailyReportTemplatesApi = {
  // Get templates
  async getTemplates(projectId = null) {
    try {
      let query = supabase
        .from("daily_report_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.or(`project_id.eq.${projectId},project_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching templates:", error);
      return { data: null, error };
    }
  },

  // Create template
  async createTemplate(templateData) {
    try {
      const { data, error } = await supabase
        .from("daily_report_templates")
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error creating template:", error);
      return { data: null, error };
    }
  },
};

// Daily Report Categories API
export const dailyReportCategoriesApi = {
  // Get categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from("daily_report_categories")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { data: null, error };
    }
  },
};

// Utility functions
// const dailyReportsUtils = {
//   // Format date for display
//   formatDate: (date) => {
//     return new Date(date).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   },

//   // Get status color
//   getStatusColor: (status) => {
//     const statusColors = {
//       draft: "bg-gray-100 text-gray-800",
//       submitted: "bg-yellow-100 text-yellow-800",
//       approved: "bg-green-100 text-green-800",
//       rejected: "bg-red-100 text-red-800",
//       needs_revision: "bg-orange-100 text-orange-800",
//     };
//     return statusColors[status] || "bg-gray-100 text-gray-800";
//   },

//   // Get status icon
//   getStatusIcon: (status) => {
//     const statusIcons = {
//       draft: "📝",
//       submitted: "⏳",
//       approved: "✅",
//       rejected: "❌",
//       needs_revision: "🔄",
//     };
//     return statusIcons[status] || "📄";
//   },

//   // Calculate report completeness
//   calculateCompleteness: (report) => {
//     const fields = [
//       "work_summary",
//       "work_completed",
//       "total_workers",
//       "progress_percentage",
//     ];

//     const completedFields = fields.filter(
//       (field) => report[field] && report[field].toString().trim() !== ""
//     ).length;

//     return Math.round((completedFields / fields.length) * 100);
//   },

//   // Validate report data
//   validateReportData: (reportData) => {
//     const errors = [];

//     if (!reportData.report_date) {
//       errors.push("Report date is required");
//     }

//     if (!reportData.work_summary || reportData.work_summary.trim() === "") {
//       errors.push("Work summary is required");
//     }

//     if (!reportData.work_completed || reportData.work_completed.trim() === "") {
//       errors.push("Work completed is required");
//     }

//     if (!reportData.total_workers || reportData.total_workers <= 0) {
//       errors.push("Total workers must be greater than 0");
//     }

//     if (
//       reportData.progress_percentage < 0 ||
//       reportData.progress_percentage > 100
//     ) {
//       errors.push("Progress percentage must be between 0 and 100");
//     }

//     return errors;
//   },
// };
