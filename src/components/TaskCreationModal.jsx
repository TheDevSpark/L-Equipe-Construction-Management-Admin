"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import supabase from "@/lib/supabaseClinet";

export function TaskCreationModal({ open, onOpenChange, project }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Collaborator selection states
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [showCollaboratorSuggestions, setShowCollaboratorSuggestions] =
    useState(false);
  const [availableCollaborators, setAvailableCollaborators] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  // Load available collaborators from the project's team members
  useEffect(() => {
    const loadProjectTeamMembers = async () => {
      if (!project?.id) return;

      try {
        setLoading(true);

        // First, get the project's team members
        const { data: projectData, error: projectError } = await supabase
          .from("project")
          .select("team_members")
          .eq("id", project.id)
          .single();

        if (projectError) throw projectError;

        if (projectData?.team_members?.length > 0) {
          // Get user details for each team member
          const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("id, full_name, email, role")
            .in(
              "id",
              projectData.team_members.map((tm) => tm.id)
            );

          if (usersError) throw usersError;

          setAvailableCollaborators(users || []);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
        toast.error("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    loadProjectTeamMembers();
  }, [project]);

  // Filter collaborators based on search input
  const filteredCollaborators = availableCollaborators.filter(
    (collab) =>
      (collab.full_name
        ?.toLowerCase()
        .includes(collaboratorQuery.toLowerCase()) ||
        collab.email
          ?.toLowerCase()
          .includes(collaboratorQuery.toLowerCase())) &&
      !selectedCollaborators.some((sel) => sel.id === collab.id)
  );

  const handleCollaboratorSelect = (collaborator) => {
    setSelectedCollaborators((prev) => [...prev, collaborator]);
    setCollaboratorQuery("");
    setShowCollaboratorSuggestions(false);
  };

  const handleCollaboratorRemove = (collaboratorId) => {
    setSelectedCollaborators((prev) =>
      prev.filter((c) => c.id !== collaboratorId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      setLoading(true);

      const taskData = {
        title,
        description,
        project_id: project.id,
        status: "pending",
        created_at: new Date().toISOString(),
        assigned_to: selectedCollaborators.map((c) => c.id),
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert([taskData])
        .select();

      if (error) throw error;

      toast.success("Task created successfully!");
      onOpenChange(false);

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedCollaborators([]);
      setCollaboratorQuery("");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(`Failed to create task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Please select a project first</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task and assign it to team members
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2 relative">
              <Label>Assign To</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search team members..."
                  value={collaboratorQuery}
                  onChange={(e) => {
                    setCollaboratorQuery(e.target.value);
                    setShowCollaboratorSuggestions(
                      e.target.value.trim().length > 0
                    );
                  }}
                  onFocus={() => setShowCollaboratorSuggestions(true)}
                  disabled={loading}
                />
                {showCollaboratorSuggestions &&
                  filteredCollaborators.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCollaborators.map((collaborator) => (
                        <div
                          key={collaborator.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCollaboratorSelect(collaborator)}
                        >
                          <div className="font-medium">
                            {collaborator.full_name || collaborator.email}
                          </div>
                          {collaborator.email && collaborator.full_name && (
                            <div className="text-sm text-gray-500">
                              {collaborator.email}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Selected collaborators */}
              {selectedCollaborators.length > 0 && (
                <div className="mt-2 space-y-2">
                  {selectedCollaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {collaborator.full_name || collaborator.email}
                        </div>
                        {collaborator.email && collaborator.full_name && (
                          <div className="text-sm text-gray-500">
                            {collaborator.email}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCollaboratorRemove(collaborator.id)
                        }
                        className="text-red-500 hover:text-red-700"
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
