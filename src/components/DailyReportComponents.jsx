"use client";

import { useState, useRef, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { dailyReportsUtils } from "@/lib/dailyReportsApi";
import { validateUuid } from "@/lib/supabaseHelpers";
import toast from "react-hot-toast";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Daily Report Card Component
export function DailyReportCard({
  report,
  onView,
  onEdit,
  onApprove,
  onReject,
  onDelete,
}) {
  const router = useRouter();
  const status = report?.status || "submitted";
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
                {report.projectName || "Unknown Project"}
              </button>
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
            >
              {statusIcon} {String(status).toUpperCase()}
            </span>
            <div className="text-right">
              <div className="text-sm font-medium">
                {completeness}% Complete
              </div>
              <div className="text-xs text-muted-foreground">
                {report.progress_percentage}% Progress
              </div>
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
              <span className="ml-2 font-medium">
                {report.total_work_hours}h
              </span>
            </div>
          </div>

          {report.photos_urls && report.photos_urls.length > 0 && (
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-muted-foreground">
                {report.photos_urls.length} photo
                {report.photos_urls.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="text-sm text-muted-foreground">
              By: {report.reporter_first_name} {report.reporter_last_name}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(report)}
              >
                View
              </Button>
              {status === "submitted" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(report)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(report)}
                  >
                    Reject
                  </Button>
                </>
              )}
              {status === "draft" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(report)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "Are you sure you want to delete this report? This action cannot be undone."
                        )
                      ) {
                        onDelete(report.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </>
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
  isOpen = false,
  onClose,
  onSubmit,
  reportData = {},
  isEditing = false,
  isViewing = false,
  projects = [],
  templates = [],
}) {
  if (!isOpen) return null;
  const [formData, setFormData] = useState({
    new_project_name: "",
    report_date:
      reportData?.report_date || new Date().toISOString().split("T")[0],
    weather_condition: reportData?.weather_condition || "",
    work_summary: reportData?.work_summary || "",
    work_completed: reportData?.work_completed || "",
    work_in_progress: reportData?.work_in_progress || "",
    work_scheduled: reportData?.work_scheduled || "",
    safety_incidents: reportData?.safety_incidents || "",
    quality_issues: reportData?.quality_issues || "",
    delays_reasons: reportData?.delays_reasons || "",
    total_workers: reportData?.total_workers || 0,
    total_work_hours: reportData?.total_work_hours || 0,
    photos_urls: reportData?.photos_urls || [],
    project_id: reportData?.project_id || "",
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://image.lequipepm.com/upload.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        return data.url; // the uploaded image URL from PHP
      } else {
        toast.error(data.message || "Upload failed");
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading image");
      return null;
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const uploadPromises = [];

      // Convert FileList to array and filter for images only
      const imageFiles = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`Skipped ${file.name}: Not an image file`);
          return false;
        }
        if (file.size > MAX_SIZE) {
          toast.error(`Skipped ${file.name}: File is too large (max 5MB)`);
          return false;
        }
        return true;
      });

      if (imageFiles.length === 0) {
        toast.error("No valid images to upload");
        return;
      }

      // Upload each image
      for (const file of imageFiles) {
        try {
          const imageUrl = await uploadImage(file);
          if (imageUrl) {
            uploadPromises.push(imageUrl);
          }
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}`);
        }
      }

      if (uploadPromises.length > 0) {
        setFormData((prev) => ({
          ...prev,
          photos_urls: [...(prev.photos_urls || []), ...uploadPromises],
        }));
        toast.success(`Successfully added ${uploadPromises.length} image(s)`);
      }
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error("Failed to process images");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos_urls: prev.photos_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isViewing) return;

    setIsSubmitting(true);

    try {
      const reportData = {
        ...formData,
        status: "submitted",
        total_workers: Number(formData.total_workers) || 0,
        total_work_hours: Number(formData.total_work_hours) || 0,
        report_date:
          formData.report_date || new Date().toISOString().split("T")[0],
        photos_urls: formData.photos_urls || [],
      };

      // Remove any empty strings
      Object.keys(reportData).forEach((key) => {
        if (
          reportData[key] === "" ||
          (Array.isArray(reportData[key]) && reportData[key].length === 0)
        ) {
          delete reportData[key];
        }
      });

      await onSubmit(reportData);
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // State for fullscreen image view
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle keyboard navigation for image gallery
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "ArrowLeft") {
        handlePrevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentImageIndex]);

  const openImage = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    const newIndex =
      (currentImageIndex - 1 + formData.photos_urls.length) %
      formData.photos_urls.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(formData.photos_urls[newIndex]);
  };

  const handleNextImage = () => {
    const newIndex = (currentImageIndex + 1) % formData.photos_urls.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(formData.photos_urls[newIndex]);
  };

  return (
    <>
      {/* Fullscreen Image Viewer */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={handlePrevImage}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div className="max-w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={selectedImage}
              alt={`Report image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          <button
            onClick={handleNextImage}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Next image"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-4 text-white text-sm">
            {currentImageIndex + 1} of {formData.photos_urls.length}
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-card text-card-foreground rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border my-3 p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-card-foreground">
              {isViewing
                ? "View Daily Report"
                : isEditing
                ? "Edit Daily Report"
                : "Create Daily Report"}
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Gallery */}
              {formData.photos_urls && formData.photos_urls.length > 0 && (
                <div className="space-y-2">
                  <Label>Report Photos</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.photos_urls.map((url, index) => (
                      <div key={index} className="relative group">
                        <button
                          type="button"
                          onClick={() => openImage(url, index)}
                          className="w-full h-24 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
                        >
                          <img
                            src={url}
                            alt={`Report photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        {!isViewing && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="project_id">Project</Label>
                  <select
                    id="project_id"
                    name="project_id"
                    value={formData.project_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        project_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    disabled={isViewing}
                  >
                    <option value="" className="bg-background text-foreground">
                      Select Project
                    </option>
                    {projects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                        className="bg-background text-foreground"
                      >
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="report_date">Report Date *</Label>
                  <Input
                    id="report_date"
                    name="report_date"
                    type="date"
                    value={formData.report_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        report_date: e.target.value,
                      }))
                    }
                    disabled={isViewing}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weather_condition">Weather</Label>
                  <select
                    id="weather_condition"
                    name="weather_condition"
                    value={formData.weather_condition}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        weather_condition: e.target.value,
                      }))
                    }
                    disabled={isViewing}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-75"
                  >
                    <option value="" className="bg-background text-foreground">
                      Select Weather
                    </option>
                    <option
                      value="sunny"
                      className="bg-background text-foreground"
                    >
                      Sunny
                    </option>
                    <option
                      value="cloudy"
                      className="bg-background text-foreground"
                    >
                      Cloudy
                    </option>
                    <option
                      value="rainy"
                      className="bg-background text-foreground"
                    >
                      Rainy
                    </option>
                    <option
                      value="stormy"
                      className="bg-background text-foreground"
                    >
                      Stormy
                    </option>
                    <option
                      value="foggy"
                      className="bg-background text-foreground"
                    >
                      Foggy
                    </option>
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      work_summary: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground disabled:opacity-75"
                  rows="3"
                  placeholder="Brief summary of today's work..."
                  disabled={isViewing}
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        work_completed: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground disabled:opacity-75"
                    rows="4"
                    placeholder="Detail what work was completed today..."
                    disabled={isViewing}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="work_in_progress">Work In Progress</Label>
                  <textarea
                    id="work_in_progress"
                    name="work_in_progress"
                    value={formData.work_in_progress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        work_in_progress: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground disabled:opacity-75"
                    rows="4"
                    placeholder="Work currently in progress..."
                    disabled={isViewing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="work_scheduled">
                  Work Scheduled for Tomorrow
                </Label>
                <textarea
                  id="work_scheduled"
                  name="work_scheduled"
                  value={formData.work_scheduled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      work_scheduled: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground disabled:opacity-75"
                  rows="3"
                  placeholder="Planned work for tomorrow..."
                  disabled={isViewing}
                />
              </div>

              {/* Resources */}

              <div>
                <Label htmlFor="delays_reasons">Delays and Reasons</Label>
                <textarea
                  id="delays_reasons"
                  name="delays_reasons"
                  value={formData.delays_reasons}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      delays_reasons: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground disabled:opacity-75"
                  rows="3"
                  placeholder="Report any delays and their reasons..."
                  disabled={isViewing}
                />
              </div>

              {/* Photo Upload */}
              {!isViewing && (
                <div className="space-y-2">
                  <Label>Upload Photos</Label>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload photos of the work progress (max 5MB per image)
                    </p>
                  </div>
                </div>
              )}

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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        total_workers: e.target.value,
                      }))
                    }
                    disabled={isViewing}
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        total_work_hours: e.target.value,
                      }))
                    }
                    disabled={isViewing}
                  />
                </div>
              </div>

              {/* Form Actions */}
              {!isViewing && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : isEditing
                      ? "Update Report"
                      : "Save as Draft"}
                  </Button>
                </div>
              )}
              {isViewing && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
