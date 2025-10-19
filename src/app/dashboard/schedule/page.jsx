"use client";

import { useState, useEffect } from "react";
import { ProjectSelector, ProjectInfoCard } from "@/components/ProjectSelector";
import ScheduleUploader from "@/components/ScheduleUploader";
import { ThemeToggle } from "@/components/theme-toggle";
import supabase from "../../../../lib/supabaseClinet";

export default function SchedulePage() {
  // Project state
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

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

  return (
    <div>
      {/* Project Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Schedule</h1>
          <p className="text-muted-foreground">Project scheduling and timeline management</p>
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

      <div className="bg-card border border-border rounded-lg p-6">
        {selectedProject ? (
          <ScheduleUploader projectId={selectedProject.id} />
        ) : (
          <p className="text-sm text-muted-foreground">Select a project to view or upload a schedule.</p>
        )}
      </div>
    </div>
  );
}
