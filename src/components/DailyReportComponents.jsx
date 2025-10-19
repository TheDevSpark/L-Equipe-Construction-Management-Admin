"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { dailyReportsUtils } from "@/lib/dailyReportsApi";
import { validateUuid } from "@/lib/supabaseHelpers";
import toast from "react-hot-toast";

// Daily Report Card Component
export function DailyReportCard({ report, onView, onEdit, onApprove, onReject }) {
  const router = useRouter();
  const status = (report?.status) || 'draft';
  const statusColor = dailyReportsUtils.getStatusColor(status);
  const statusIcon = dailyReportsUtils.getStatusIcon(status);
  const completeness = dailyReportsUtils.calculateCompleteness(report);

  const handleProjectClick = (projectId) => {
    if (projectId) {
      router.push(`/dashboard/projects/${projectId}`);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-y-auto max-h-[400px]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {dailyReportsUtils.formatDate(report.report_date)}
            </CardTitle>
            <CardDescription>
              Project: 
              <button
                key={report.project_id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleProjectClick(report.project_id);
                }}
                className="ml-1 text-primary hover:underline font-medium"
              >
                {report.projectName || 'Unknown Project'}
              </button>
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {statusIcon} {String(status).toUpperCase()}
            </span>
            <div className="text-right">
              <div className="text-sm font-medium">{completeness}% Complete</div>
              <div className="text-xs text-muted-foreground">{report.progress_percentage}% Progress</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground mb-1">Work Summary</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {report.work_summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Workers:</span>
              <span className="ml-2 font-medium">{report.total_workers}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Hours:</span>
              <span className="ml-2 font-medium">{report.total_work_hours}h</span>
            </div>
          </div>

          {report.photos_urls && report.photos_urls.length > 0 && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-muted-foreground">
                {report.photos_urls.length} photo{report.photos_urls.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="text-sm text-muted-foreground">
              By: {report.reporter_first_name} {report.reporter_last_name}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onView(report)}>
                View
              </Button>
              {status === 'submitted' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => onApprove(report)}>
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onReject(report)}>
                    Reject
                  </Button>
                </>
              )}
              {status === 'draft' && (
                <Button variant="outline" size="sm" onClick={() => onEdit(report)}>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Daily Report Form Component
export function DailyReportForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  reportData = {}, 
  isEditing = false,
  projects = [],
  templates = []
}) {
  const [formData, setFormData] = useState({
        new_project_name: '',
    report_date: reportData?.report_date || new Date().toISOString().split('T')[0],
    weather_condition: reportData?.weather_condition || '',
    work_summary: reportData?.work_summary || '',
    work_completed: reportData?.work_completed || '',
    work_in_progress: reportData?.work_in_progress || '',
    work_scheduled: reportData?.work_scheduled || '',
    materials_used: reportData?.materials_used || '',
    equipment_used: reportData?.equipment_used || '',
    safety_incidents: reportData?.safety_incidents || '',
    quality_issues: reportData?.quality_issues || '',
    delays_reasons: reportData?.delays_reasons || '',
    total_workers: reportData?.total_workers || 0,
    total_work_hours: reportData?.total_work_hours || 0,
    progress_percentage: reportData?.progress_percentage || 0
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...imageFiles]);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = dailyReportsUtils.validateReportData(formData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    // If project is not selected, we'll allow submit and server will create the project when possible
    // If user selected the __new__ option, ensure there's at least some name provided or warn
    // if (formData.project_id === '__new__' && (!formData.new_project_name || formData.new_project_name.trim() === '')) {
    //   toast.error('Please enter a name for the new project');
    //   return;
    // }

    setIsSubmitting(true);
    try {
      // Build payload and include projectName when creating a new project
      const payload = {
        // copy only the meaningful report fields (avoid sending raw project_id when invalid)
        report_date: formData.report_date,
        weather_condition: formData.weather_condition,
        work_summary: formData.work_summary,
        work_completed: formData.work_completed,
        work_in_progress: formData.work_in_progress,
        work_scheduled: formData.work_scheduled,
        materials_used: formData.materials_used,
        equipment_used: formData.equipment_used,
        safety_incidents: formData.safety_incidents,
        quality_issues: formData.quality_issues,
        delays_reasons: formData.delays_reasons,

        total_workers: formData.total_workers,
        total_work_hours: formData.total_work_hours,
        progress_percentage: formData.progress_percentage,
        reporter_id: "current-user-id", // Replace with actual user ID
        status: isEditing ? (formData.status || 'draft') : 'draft'
      };

      // If user explicitly selected an existing project and it's a valid UUID, include it.
    

      console.debug('Submitting daily report payload:', payload);
      const result = await onSubmit(payload);
      console.debug('CreateDailyReport result:', result);
      onClose();
    } catch (error) {
      console.error('CreateDailyReport error:', error);
      const msg = (error && (error.message || error.toString())) || 'Failed to save report';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit for approval (saves with status 'submitted')
  const handleSubmitForApproval = async () => {
    const errors = dailyReportsUtils.validateReportData(formData);

    // if (formData.project_id === '__new__' && (!formData.new_project_name || formData.new_project_name.trim() === '')) {
    //   toast.error('Please enter a name for the new project');
    //   return;
    // }

    setIsSubmitting(true);
    try {
      const payload = {
        report_date: formData.report_date,
        weather_condition: formData.weather_condition,
        work_summary: formData.work_summary,
        work_completed: formData.work_completed,
        work_in_progress: formData.work_in_progress,
        work_scheduled: formData.work_scheduled,
        materials_used: formData.materials_used,
        equipment_used: formData.equipment_used,
        safety_incidents: formData.safety_incidents,
        quality_issues: formData.quality_issues,
        delays_reasons: formData.delays_reasons,
        total_workers: formData.total_workers,
        total_work_hours: formData.total_work_hours,
        progress_percentage: formData.progress_percentage,
        status: 'submitted'
      };

     
      console.debug('Submitting (for approval) daily report payload:', payload);
      const result = await onSubmit(payload);
      console.debug('SubmitForApproval result:', result);
      onClose();
    } catch (error) {
      console.error('SubmitForApproval error:', error);
      const msg = (error && (error.message || error.toString())) || 'Failed to submit report';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-card text-card-foreground rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border my-3 p-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-card-foreground">
            {isEditing ? 'Edit Daily Report' : 'Create Daily Report'}
          </h3>
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
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="project_id">Project</Label>
              <select
                id="project_id"
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
              >
                <option value="">Select Project</option>
                <option value="__new__">-- Create new project --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName}
                  </option>
                ))}
              </select>
              {formData.project_id === '__new__' && (
                <div className="mt-2">
                  <Label htmlFor="new_project_name">New Project Name</Label>
                  <Input
                    id="new_project_name"
                    name="new_project_name"
                    value={formData.new_project_name}
                    onChange={handleInputChange}
                    placeholder="Enter new project name (optional)"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="report_date">Report Date *</Label>
              <Input
                id="report_date"
                name="report_date"
                type="date"
                value={formData.report_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="weather_condition">Weather</Label>
              <select
                id="weather_condition"
                name="weather_condition"
                value={formData.weather_condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
              >
                <option value="">Select Weather</option>
                <option value="sunny">Sunny</option>
                <option value="cloudy">Cloudy</option>
                <option value="rainy">Rainy</option>
                <option value="stormy">Stormy</option>
                <option value="foggy">Foggy</option>
              </select>
            </div>
          </div>

          {/* Work Summary */}
          <div>
            <Label htmlFor="work_summary">Work Summary *</Label>
            <textarea
              id="work_summary"
              name="work_summary"
              value={formData.work_summary}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
              rows="3"
              placeholder="Brief summary of today's work..."
              required
            />
          </div>

          {/* Work Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="work_completed">Work Completed Today *</Label>
              <textarea
                id="work_completed"
                name="work_completed"
                value={formData.work_completed}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                rows="4"
                placeholder="Detail what work was completed today..."
                required
              />
            </div>
            <div>
              <Label htmlFor="work_in_progress">Work In Progress</Label>
              <textarea
                id="work_in_progress"
                name="work_in_progress"
                value={formData.work_in_progress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                rows="4"
                placeholder="Work currently in progress..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="work_scheduled">Work Scheduled for Tomorrow</Label>
            <textarea
              id="work_scheduled"
              name="work_scheduled"
              value={formData.work_scheduled}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
              rows="3"
              placeholder="Planned work for tomorrow..."
            />
          </div>

          {/* Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="materials_used">Materials Used</Label>
              <textarea
                id="materials_used"
                name="materials_used"
                value={formData.materials_used}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                rows="3"
                placeholder="List materials used today..."
              />
            </div>
            <div>
              <Label htmlFor="equipment_used">Equipment Used</Label>
              <textarea
                id="equipment_used"
                name="equipment_used"
                value={formData.equipment_used}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                rows="3"
                placeholder="List equipment used today..."
              />
            </div>
          </div>

          {/* Issues and Delays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="safety_incidents">Safety Incidents</Label>
              <textarea
                id="safety_incidents"
                name="safety_incidents"
                value={formData.safety_incidents}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                rows="3"
                placeholder="Report any safety incidents..."
              />
            </div>
            <div>
              <Label htmlFor="quality_issues">Quality Issues</Label>
              <textarea
                id="quality_issues"
                name="quality_issues"
                value={formData.quality_issues}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                rows="3"
                placeholder="Report any quality issues..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="delays_reasons">Delays and Reasons</Label>
            <textarea
              id="delays_reasons"
              name="delays_reasons"
              value={formData.delays_reasons}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
              rows="3"
              placeholder="Report any delays and their reasons..."
            />
          </div>

          {/* Progress and Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="total_workers">Total Workers *</Label>
              <Input
                id="total_workers"
                name="total_workers"
                type="number"
                min="0"
                value={formData.total_workers}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="total_work_hours">Total Work Hours</Label>
              <Input
                id="total_work_hours"
                name="total_work_hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.total_work_hours}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="progress_percentage">Progress Percentage *</Label>
              <Input
                id="progress_percentage"
                name="progress_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          {/* <div>
            <Label htmlFor="images">Upload Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="mb-2"
            />
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div> */}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Report' : 'Save as Draft')}
            </Button>
            {!isEditing && (
              <Button 
                type="button" 
                onClick={() => {
                  // Submit for approval
                  handleSubmitForApproval();
                }}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit for Approval
              </Button>
            )}
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Message Component
export function MessageCard({ message, onDelete, canDelete = false }) {
  const senderName = message.auth?.users?.raw_user_meta_data?.first_name || 'Unknown';
  const isAdmin = message.is_admin_message;

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isAdmin 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">{senderName}</span>
          {canDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ×
            </button>
          )}
        </div>
        <p className="text-sm">{message.message}</p>
        <span className="text-xs opacity-70">
          {new Date(message.created_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

// Approval Modal Component
export function ApprovalModal({ 
  isOpen, 
  onClose, 
  onApprove, 
  onReject, 
  report, 
  isProcessing = false 
}) {
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen || !report) return null;

  const handleApprove = () => {
    onApprove(report.id, adminNotes);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    onReject(report.id, rejectionReason, adminNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card text-card-foreground rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-card-foreground">
            Review Daily Report
          </h3>
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
          <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <div className="font-medium">Report Date: {dailyReportsUtils.formatDate(report.report_date)}</div>
            <div className="text-muted-foreground">By: {report.reporter_first_name} {report.reporter_last_name}</div>
            <div className="text-muted-foreground mt-1">{report.work_summary}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="admin_notes">Admin Notes</Label>
            <textarea
              id="admin_notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
              rows="3"
              placeholder="Add notes for the reporter..."
            />
          </div>

          <div>
            <Label htmlFor="rejection_reason">Rejection Reason (if rejecting)</Label>
            <textarea
              id="rejection_reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
              rows="2"
              placeholder="Reason for rejection..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleReject} 
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700"
          >
            Reject
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            Approve
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
