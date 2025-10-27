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
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectSelector, ProjectInfoCard } from "@/components/ProjectSelector";
import {
  TeamMemberCard,
  TeamMemberSearch,
  TeamStatistics,
} from "@/components/TeamComponents";
import { teamMembersApi, projectTeamApi, teamUtils } from "@/lib/teamApi";
import toast from "react-hot-toast";
import supabase from "../../../../lib/supabaseClinet";

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState("members");
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTeam, setProjectTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'add-member', 'edit-member'
  const [selectedMember, setSelectedMember] = useState(null);

  // Form states
  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "",
    specialization: "",
    hourly_rate: "",
  });

  // ✅ Collaborator selection states
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
      toast.error("Failed to load collaborators");
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

  useEffect(() => {
    getAllUsers();
  }, []);

  // Filter collaborators based on search input
  const filteredCollaborators = availableCollaborators.filter(
    (collab) =>
      collab.name.toLowerCase().includes(collaboratorQuery.toLowerCase()) &&
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

  const handleCollaboratorInputChange = (e) => {
    setCollaboratorQuery(e.target.value);
    setShowCollaboratorSuggestions(e.target.value.trim().length > 0);
  };

  // ... rest of your existing code (loadProjects, loadTeamMembers, etc.)

  const openModal = (type, member = null) => {
    setModalType(type);
    setSelectedMember(member);
    setIsModalOpen(true);

    if (type === "edit-member" && member) {
      setNewMember({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone_number: member.phone_number || "",
        role: member.role,
        specialization: member.specialization || "",
        hourly_rate: member.hourly_rate || "",
      });
    }

    // Reset collaborators when opening modal
    if (type === "add-member") {
      setSelectedCollaborators([]);
      setCollaboratorQuery("");
    }
  };

  // ... rest of your existing functions (handleAddMember, handleUpdateMember, etc.)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Team Management
          </h1>
          <p className="text-muted-foreground">
            Manage team members and project assignments
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
        </div>
      </div>

      {/* ... rest of your existing JSX ... */}

      {/* Add/Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card text-card-foreground rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="flex items-center justify-between p-4">
              <h3 className="text-xl font-semibold text-card-foreground">
                {modalType === "add-member"
                  ? "Add Team Member"
                  : "Edit Team Member"}
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (modalType === "add-member") {
                    handleAddMember();
                  } else {
                    handleUpdateMember();
                  }
                }}
                className="space-y-4"
              >
                {/* Basic Info Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={newMember.first_name}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          first_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={newMember.last_name}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          last_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={newMember.phone_number}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={newMember.role || ""}
                    onChange={(e) =>
                      setNewMember({ ...newMember, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  >
                    <option value="" className="bg-background text-foreground">
                      Select Role
                    </option>
                    <option
                      value="project_manager"
                      className="bg-background text-foreground"
                    >
                      Project Manager
                    </option>
                    <option
                      value="lead"
                      className="bg-background text-foreground"
                    >
                      Lead
                    </option>
                    <option
                      value="logistics"
                      className="bg-background text-foreground"
                    >
                      Logistics
                    </option>
                    <option
                      value="assistant_pm"
                      className="bg-background text-foreground"
                    >
                      Assistant PM
                    </option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={newMember.specialization}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        specialization: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    value={newMember.hourly_rate}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        hourly_rate: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ✅ Collaborator Selection - Only show in add member mode */}
                {modalType === "add-member" && (
                  <div>
                    <Label htmlFor="collaborators">Collaborators</Label>
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
                        placeholder="Search and select collaborators..."
                        className="w-full"
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
                            No collaborators found
                          </div>
                        )}
                    </div>

                    {/* Selected Collaborators */}
                    {selectedCollaborators.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-card-foreground mb-2">
                          Selected Collaborators:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedCollaborators.map((collab) => (
                            <div
                              key={collab.id}
                              className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm flex items-center space-x-2"
                            >
                              <span>{collab.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCollaboratorRemove(collab.id)
                                }
                                className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                              >
                                <svg
                                  className="w-3 h-3"
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {modalType === "add-member"
                      ? "Add Member"
                      : "Update Member"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
