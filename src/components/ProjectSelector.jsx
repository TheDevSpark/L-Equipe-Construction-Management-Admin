"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientOnly } from "@/components/ClientOnly";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import supabase from "../../lib/supabaseClinet.js";

// Project Selector Component
export function ProjectSelector({ 
  selectedProject, 
  onProjectSelect, 
  onProjectCreate,
  showCreateButton = true,
  className = ""
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("project").select("*").order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    onProjectSelect(project || null);
  };

  return (
    <ClientOnly>
      <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Label htmlFor="project-select" className="text-sm font-medium whitespace-nowrap">
            Project:
          </Label>
          <select
            id="project-select"
            value={selectedProject?.id || ""}
            onChange={(e) => handleProjectChange(e.target.value)}
            disabled={loading}
            className="px-3 py-2 border border-input rounded-lg bg-input text-card-foreground w-full sm:min-w-[200px] lg:min-w-[250px]"
          >
            <option value="">{loading ? "Loading..." : "Select Project"}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>

       

        {/* Project Creation Modal */}
        <ProjectCreationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onProjectCreated={(newProject) => {
            setProjects(prev => [newProject, ...prev]);
            onProjectSelect(newProject);
            onProjectCreate?.(newProject);
            setIsCreateModalOpen(false);
          }}
        />
      </div>
    </ClientOnly>
  );
}

// Project Creation Modal Component
function ProjectCreationModal({ isOpen, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    projectName: "",
    budget: "",
    projectLocation: "",
    projectCollabrate: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "planning"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.projectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("project")
        .insert([{
          projectName: formData.projectName,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          projectLocation: formData.projectLocation,
          projectCollabrate: formData.projectCollabrate,
          description: formData.description,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          status: formData.status,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Project created successfully!");
      onProjectCreated(data);
      
      // Reset form
      setFormData({
        projectName: "",
        budget: "",
        projectLocation: "",
        projectCollabrate: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "planning"
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClientOnly>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-card text-card-foreground rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-card-foreground">
            Create New Project
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
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <Label htmlFor="budget">Budget (USD)</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              step="0.01"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="Enter budget amount"
            />
          </div>

          <div>
            <Label htmlFor="projectLocation">Project Location</Label>
            <Input
              id="projectLocation"
              name="projectLocation"
              value={formData.projectLocation}
              onChange={handleInputChange}
              placeholder="Enter project location"
            />
          </div>

          <div>
            <Label htmlFor="projectCollabrate">Collaborators</Label>
            <Input
              id="projectCollabrate"
              name="projectCollabrate"
              value={formData.projectCollabrate}
              onChange={handleInputChange}
              placeholder="Enter collaborators"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
              rows="3"
              placeholder="Enter project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
          </form>
        </div>
      </div>
      </div>
    </ClientOnly>
  );
}

// Project Info Card Component
export function ProjectInfoCard({ project }) {
  const router = useRouter();

  const handleProjectClick = () => {
    if (project && project.id) {
      router.push(`/dashboard/projects/${project.id}`);
    }
  };

  if (!project) {
  return (
    <ClientOnly>
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>Please select a project to view details</p>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  );
  }

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status || 'planning'] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <ClientOnly>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/50"
        onClick={handleProjectClick}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center space-x-2">
                <span>{project.projectName}</span>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </CardTitle>
              <CardDescription>{project.projectLocation || 'No location specified'}</CardDescription>
              <p className="text-xs text-muted-foreground mt-1">Click to view project details</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {(project.status || 'planning').replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.description && (
              <div>
                <h4 className="font-medium text-foreground mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">Budget</h4>
                <p className="text-sm text-muted-foreground">{formatCurrency(project.budget)}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Collaborators</h4>
                <p className="text-sm text-muted-foreground">{project.projectCollabrate || 'None specified'}</p>
              </div>
            </div>

            {(project.startDate || project.endDate) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.startDate && (
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Start Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <h4 className="font-medium text-foreground mb-1">End Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="font-medium text-foreground mb-1">Created</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  );
}
