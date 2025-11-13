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
import { ClientOnly } from "@/components/ClientOnly";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import supabase from "@/lib/supabaseClinet.js";
import { Delete } from "lucide-react";

// Project Selector Component
export function ProjectSelector({
  selectedProject,
  onProjectSelect,
  onProjectCreate,
  showCreateButton = true,
  className = "",
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
      const { data, error } = await supabase
        .from("project")
        .select("*")
        .order("created_at", { ascending: false });
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
    const project = projects.find((p) => p.id === Number(projectId));
    onProjectSelect(project || null);
  };

  return (
    <ClientOnly>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Label
          htmlFor="project-select"
          className="text-sm font-medium whitespace-nowrap"
        >
          Project:
        </Label>
        <div className="flex items-center gap-2">
          {/* Project dropdown */}
          <select
            id="project-select"
            value={selectedProject?.id || ""}
            onChange={(e) => handleProjectChange(e.target.value)}
            disabled={loading}
            className="px-3 py-2 border border-input rounded-lg bg-background text-foreground w-full sm:min-w-[200px] lg:min-w-[250px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading ? "Loading..." : "Select Project"}
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
          {/* Delete button on the left */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              if (!selectedProject) return toast.error("No project selected");
              if (confirm(`Delete project "${selectedProject.projectName}"?`)) {
                supabase
                  .from("project")
                  .delete()
                  .eq("id", selectedProject.id)
                  .then(({ error }) => {
                    if (error) {
                      console.error(error);
                      toast.error("Failed to delete project");
                    } else {
                      toast.success("Project deleted");
                      setProjects((prev) =>
                        prev.filter((p) => p.id !== selectedProject.id)
                      );
                      onProjectSelect(null);
                    }
                  });
              }
            }}
          >
            <Delete color="#fff" />
          </Button>
        </div>
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
    status: "planning",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        .insert([
          {
            projectName: formData.projectName,
            budget: formData.budget ? parseFloat(formData.budget) : null,
            projectLocation: formData.projectLocation,
            projectCollabrate: formData.projectCollabrate,
            description: formData.description,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            status: formData.status,
            created_at: new Date().toISOString(),
          },
        ])
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
        status: "planning",
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
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option
                    value="planning"
                    className="bg-background text-foreground"
                  >
                    Planning
                  </option>
                  <option
                    value="active"
                    className="bg-background text-foreground"
                  >
                    Active
                  </option>
                  <option
                    value="on_hold"
                    className="bg-background text-foreground"
                  >
                    On Hold
                  </option>
                  <option
                    value="completed"
                    className="bg-background text-foreground"
                  >
                    Completed
                  </option>
                  <option
                    value="cancelled"
                    className="bg-background text-foreground"
                  >
                    Cancelled
                  </option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
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
  const [collaboratorNames, setCollaboratorNames] = useState([]);

  useEffect(() => {
    // clear previous names immediately when project changes
    setCollaboratorNames([]);

    // if no project, nothing to do
    if (!project) return;

    // normalize ids from team_members (support both {id} or raw id values)
    const ids = (project.team_members || [])
      .map((m) => (typeof m === "object" ? m?.id : m))
      .filter(Boolean);

    // if there are no ids, leave collaboratorNames empty
    if (ids.length === 0) {
      setCollaboratorNames([]);
      return;
    }

    let mounted = true; // cancellation flag to avoid setting state on unmounted/stale fetch

    const fetchCollaboratorNames = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ids);

        if (error) throw error;

        if (!mounted) return;

        // Build a map id => displayName (prefer full_name, fallback to name or id)
        const nameMap = new Map(
          (data || []).map((u) => [u.id, u.full_name ?? u.name ?? String(u.id)])
        );

        // Preserve original project order: map ids -> names, fallback to id if missing
        const orderedNames = ids.map((id) => nameMap.get(id) ?? String(id));

        setCollaboratorNames(orderedNames);
      } catch (err) {
        console.error("Error fetching collaborator names:", err);
        if (mounted) setCollaboratorNames([]); // clear on error (optional)
      }
    };

    fetchCollaboratorNames();

    return () => {
      mounted = false;
    };
  }, [project]); // re-run whenever the project object changes

  if (!project) {
    return (
      <ClientOnly>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>Please select a project to view details</p>
          </CardContent>
        </Card>
      </ClientOnly>
    );
  }

  const formatCurrency = (amount) =>
    amount
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
      : "Not set";

  return (
    <ClientOnly>
      <Card className="hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/50">
        <CardHeader>
          <CardTitle className="text-xl">{project.projectName}</CardTitle>
          <CardDescription>
            {project.projectLocation || "No location specified"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.description && (
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Budget</h4>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(project.budget)}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Collaborators</h4>
                <p className="text-sm text-muted-foreground">
                  {collaboratorNames.length > 0
                    ? collaboratorNames.join(", ")
                    : "None specified"}
                </p>
              </div>
            </div>

            {(project.startDate || project.endDate) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.startDate && (
                  <div>
                    <h4 className="font-medium">Start Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <h4 className="font-medium">End Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="font-medium">Created</h4>
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

