"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectSelector } from "@/components/ProjectSelector";
import toast from "react-hot-toast";
import supabase from "@/lib/supabaseClinet";

export default function TeamsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectTeamMembers, setProjectTeamMembers] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Team member selection states
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [showCollaboratorSuggestions, setShowCollaboratorSuggestions] =
    useState(false);
  const [availableCollaborators, setAvailableCollaborators] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  // Load available collaborators from Supabase
  const getAllUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "team");

    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load team members");
    } else {
      console.log("Users fetched:", data);
      // Map Supabase data to collaborator format
      const collaborators = (data || []).map((user) => ({
        id: user.id,
        name: `${user.full_name || ""}`.trim(),
        email: user.email || "",
        role: user.role || "",
      }));
      setAvailableCollaborators(collaborators);
    }
  };

  // Load existing team members when project is selected
  const loadProjectTeamMembers = async (projectId) => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from("project")
        .select("team_members")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error loading team members:", error.message);
        return;
      }

      if (data && data.team_members) {
        setProjectTeamMembers(data.team_members);

        // Map to display format with user details
        const teamMembersWithDetails = data.team_members
          .map((tm) => {
            const user = availableCollaborators.find((u) => u.id === tm.id);
            return user ? { ...user, teamRole: tm.role } : null;
          })
          .filter(Boolean);

        setSelectedCollaborators(teamMembersWithDetails);
      }
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (selectedProject?.id) {
      loadProjectTeamMembers(selectedProject.id);
    }
  }, [selectedProject?.id, availableCollaborators]);

  // Filter collaborators based on search input
  const filteredCollaborators = availableCollaborators.filter(
    (collab) =>
      collab.name.toLowerCase().includes(collaboratorQuery.toLowerCase()) &&
      !selectedCollaborators.some((sel) => sel.id === collab.id)
  );

  const handleCollaboratorSelect = (collaborator) => {
    // Add collaborator with default role
    const collaboratorWithRole = {
      ...collaborator,
      teamRole: "team_member", // Default role
    };
    setSelectedCollaborators((prev) => [...prev, collaboratorWithRole]);
    setCollaboratorQuery("");
    setShowCollaboratorSuggestions(false);
  };

  const handleCollaboratorRemove = (collaboratorId) => {
    setSelectedCollaborators((prev) =>
      prev.filter((c) => c.id !== collaboratorId)
    );
  };

  const handleCollaboratorRoleChange = (collaboratorId, newRole) => {
    setSelectedCollaborators((prev) =>
      prev.map((collab) =>
        collab.id === collaboratorId ? { ...collab, teamRole: newRole } : collab
      )
    );
  };

  const handleCollaboratorInputChange = (e) => {
    setCollaboratorQuery(e.target.value);
    setShowCollaboratorSuggestions(e.target.value.trim().length > 0);
  };

  // Function to handle saving team members
  const handleSaveTeamMembers = async () => {
    try {
      setLoading(true);

      if (!selectedProject?.id) {
        toast.error("Please select a project first");
        return;
      }

      // Prepare the team_members array in the required format
      const teamMembersArray = selectedCollaborators.map((collab) => ({
        id: collab.id,
        role: collab.teamRole,
      }));

      // Update the project with new team members
      const { error } = await supabase
        .from("project")
        .update({
          team_members: teamMembersArray,
        })
        .eq("id", selectedProject.id);

      if (error) {
        throw error.message;
      }

      toast.success("Team members saved successfully!");
      setProjectTeamMembers(teamMembersArray);
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    if (!selectedProject?.id) {
      toast.error("Please select a project first");
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCollaboratorQuery("");
    setShowCollaboratorSuggestions(false);
    // Don't reset selectedCollaborators - keep them for next time modal opens
  };

  // Get user details for display
  const getTeamMemberDetails = (teamMember) => {
    return availableCollaborators.find((user) => user.id === teamMember.id);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Team Management
          </h1>
          <p className="text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
          <div className="flex-1 lg:flex-none">
            <ProjectSelector
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onProjectCreate={(newProject) => {
                toast.success(
                  `Project "${newProject.projectName}" created successfully!`
                );
              }}
              showCreateButton={true}
              className="w-full lg:w-auto"
            />
          </div>
          <ThemeToggle />

          {/* Add Team Members Button */}
          <Button
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!selectedProject}
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Manage Team Members
          </Button>
        </div>
      </div>

      {/* Current Team Members Display */}
      {selectedProject && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Current Team Members - {selectedProject.projectName}
          </h3>
          {projectTeamMembers.length > 0 ? (
            <div className="space-y-3">
              {projectTeamMembers.map((teamMember, index) => {
                const userDetails = getTeamMemberDetails(teamMember);
                return (
                  <div
                    key={`${teamMember.id}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {userDetails?.name || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {userDetails?.email || "No email"} • Role:{" "}
                        {teamMember.role}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {teamMember.role}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No team members assigned to this project yet.
            </div>
          )}
        </div>
      )}

      {/* Team Members Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card text-card-foreground rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="flex items-center justify-between p-4">
              <h3 className="text-xl font-semibold text-card-foreground">
                Manage Team Members - {selectedProject?.projectName}
              </h3>
              <button
                onClick={closeModal}
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
              <div className="space-y-4">
                {/* Team Member Selection */}
                <div>
                  <Label htmlFor="collaborators">Add Team Members</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={collaboratorQuery}
                      onChange={handleCollaboratorInputChange}
                      onFocus={() =>
                        setShowCollaboratorSuggestions(
                          collaboratorQuery.length > 0
                        )
                      }
                      placeholder="Search and select team members..."
                      className="w-full border border-input rounded-lg px-3 py-2 bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />

                    {/* Searchable Dropdown */}
                    {showCollaboratorSuggestions &&
                      filteredCollaborators.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-input rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredCollaborators.map((collab) => (
                            <div
                              key={collab.id}
                              onClick={() => handleCollaboratorSelect(collab)}
                              className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium text-card-foreground">
                                  {collab.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {collab.email}
                                </div>
                              </div>
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
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* No results message */}
                    {showCollaboratorSuggestions &&
                      collaboratorQuery.length > 0 &&
                      filteredCollaborators.length === 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-input rounded-lg shadow-lg px-3 py-2 text-muted-foreground">
                          No team members found
                        </div>
                      )}
                  </div>

                  {/* Selected Team Members with Role Selection */}
                  {selectedCollaborators.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-card-foreground mb-2">
                        Selected Team Members ({selectedCollaborators.length}):
                      </div>
                      <div className="space-y-2">
                        {selectedCollaborators.map((collab) => (
                          <div
                            key={collab.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-card-foreground">
                                {collab.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {collab.email}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <select
                                value={collab.teamRole || "team_member"}
                                onChange={(e) =>
                                  handleCollaboratorRoleChange(
                                    collab.id,
                                    e.target.value
                                  )
                                }
                                className="px-3 py-1 border border-input rounded text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              >
                                <option value="team_member">Team Member</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="coordinator">Coordinator</option>
                                <option value="specialist">Specialist</option>
                                <option value="assistant">Assistant</option>
                                <option value="lead">Lead</option>
                                <option value="manager">Manager</option>
                              </select>

                              <button
                                type="button"
                                onClick={() =>
                                  handleCollaboratorRemove(collab.id)
                                }
                                className="text-destructive hover:text-destructive/80 p-1"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTeamMembers}
                    disabled={loading || selectedCollaborators.length === 0}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save Team Members"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
