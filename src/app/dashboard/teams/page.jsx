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

  // Load initial data
  useEffect(() => {
    loadProjects();
    loadTeamMembers();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectTeam();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase.from("project").select("*");
      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      // Log error to console for debugging only
      console.log("Error loading projects:", error?.message || "Unknown error");
      toast.error("Failed to load projects");
    }
  };

  const loadTeamMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await teamMembersApi.getTeamMembers();
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      // Log error to console for debugging only
      console.log(
        "Error loading team members:",
        error?.message || "Unknown error"
      );
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTeam = async () => {
    if (!selectedProject) return;

    try {
      const { data, error } = await projectTeamApi.getProjectTeam(
        selectedProject.id
      );
      if (error) throw error;
      setProjectTeam(data || []);
    } catch (error) {
      console.log(
        "Error loading project team:",
        error?.message || "Unknown error"
      );
      toast.error("Failed to load project team");
    }
  };

  // Generate mock data for demo
  const generateMockData = () => {
    const mkId = (fallback) =>
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : fallback;
    const mockTeamMembers = [
      {
        id: mkId("00000000-0000-4000-8000-000000000101"),
        first_name: "John",
        last_name: "Smith",
        email: "john.smith@company.com",
        phone_number: "+1-555-0101",
        role: "project_manager",
        specialization: "Construction Management",
        hourly_rate: 75.0,
        availability_status: "available",
        skills: ["Project Planning", "Team Leadership", "Budget Management"],
        certifications: ["PMP Certification", "Safety Management"],
        join_date: "2024-01-15",
      },
      {
        id: mkId("00000000-0000-4000-8000-000000000102"),
        first_name: "Sarah",
        last_name: "Johnson",
        email: "sarah.johnson@company.com",
        phone_number: "+1-555-0102",
        role: "engineer",
        specialization: "Civil Engineering",
        hourly_rate: 85.0,
        availability_status: "available",
        skills: ["Structural Design", "CAD", "Project Engineering"],
        certifications: ["PE License", "AutoCAD Certified"],
        join_date: "2024-01-20",
      },
      {
        id: mkId("00000000-0000-4000-8000-000000000103"),
        first_name: "Mike",
        last_name: "Rodriguez",
        email: "mike.rodriguez@company.com",
        phone_number: "+1-555-0103",
        role: "architect",
        specialization: "Architecture",
        hourly_rate: 90.0,
        availability_status: "busy",
        skills: ["Architectural Design", "3D Modeling", "Building Codes"],
        certifications: ["Licensed Architect", "LEED Certified"],
        join_date: "2024-01-10",
      },
      {
        id: mkId("00000000-0000-4000-8000-000000000104"),
        first_name: "Lisa",
        last_name: "Chen",
        email: "lisa.chen@company.com",
        phone_number: "+1-555-0104",
        role: "supervisor",
        specialization: "Construction Supervision",
        hourly_rate: 65.0,
        availability_status: "available",
        skills: ["Site Supervision", "Quality Control", "Safety Management"],
        certifications: ["OSHA 30", "First Aid Certified"],
        join_date: "2024-01-25",
      },
      {
        id: mkId("00000000-0000-4000-8000-000000000105"),
        first_name: "David",
        last_name: "Wilson",
        email: "david.wilson@company.com",
        phone_number: "+1-555-0105",
        role: "contractor",
        specialization: "General Contracting",
        hourly_rate: 70.0,
        availability_status: "available",
        skills: [
          "General Construction",
          "Subcontractor Management",
          "Cost Estimation",
        ],
        certifications: ["General Contractor License"],
        join_date: "2024-02-01",
      },
    ];

    setTeamMembers(mockTeamMembers);

    // Mock project team data
    const projectOwnerId = mockTeamMembers[0].id;
    const mockProjectTeam = [
      {
        id: mkId("00000000-0000-4000-8000-000000000201"),
        team_member_id: mockTeamMembers[0].id,
        assigned_role: "project_manager",
        hourly_rate: 75.0,
        allocation_percentage: 100,
        status: "active",
        start_date: "2024-01-15",
        project_members: mockTeamMembers[0],
      },
      {
        id: mkId("00000000-0000-4000-8000-000000000202"),
        team_member_id: mockTeamMembers[1].id,
        assigned_role: "lead_engineer",
        hourly_rate: 85.0,
        allocation_percentage: 80,
        status: "active",
        start_date: "2024-01-20",
        project_members: mockTeamMembers[1],
      },
    ];

    setProjectTeam(mockProjectTeam);
  };

  // Initialize with mock data
  useEffect(() => {
    generateMockData();
  }, []);

  const filteredTeamMembers = teamMembers.filter(
    (member) =>
      `${member.first_name} ${member.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTeamCost = teamUtils.calculateTeamCost(projectTeam);

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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setSelectedMember(null);
    setNewMember({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      role: "",
      specialization: "",
      hourly_rate: "",
      skills: [],
      certifications: [],
    });
  };

  const handleAddMember = async () => {
    try {
      const { data, error } = await teamMembersApi.createTeamMember({
        ...newMember,
        hourly_rate: parseFloat(newMember.hourly_rate),
        created_by: "current-user-id", // Replace with actual user ID
      });

      if (error) throw error;

      toast.success("Team member added successfully!");
      loadTeamMembers();
      closeModal();
    } catch (error) {
      toast.error("Failed to add team member");
    }
  };

  const handleUpdateMember = async () => {
    try {
      const { data, error } = await teamMembersApi.updateTeamMember(
        selectedMember.id,
        {
          ...newMember,
          hourly_rate: parseFloat(newMember.hourly_rate),
        }
      );

      if (error) throw error;

      toast.success("Team member updated successfully!");
      loadTeamMembers();
      closeModal();
    } catch (error) {
      toast.error("Failed to update team member");
    }
  };

  const handleDeleteMember = async (member) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${teamUtils.formatTeamMemberName(
          member.first_name,
          member.last_name
        )}?`
      )
    ) {
      try {
        const { error } = await teamMembersApi.deleteTeamMember(member.id);
        if (error) throw error;

        toast.success("Team member deleted successfully!");
        loadTeamMembers();
      } catch (error) {
        toast.error("Failed to delete team member");
      }
    }
  };

  const handleAssignMember = (member) => {
    toast.success(
      `Assign ${teamUtils.formatTeamMemberName(
        member.first_name,
        member.last_name
      )} modal would open here`
    );
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

      {/* Project Info */}
      <ProjectInfoCard project={selectedProject} />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg w-full sm:w-fit">
        {[
          { id: "members", label: "Team Members", shortLabel: "Members" },
          {
            id: "assignments",
            label: "Project Assignments",
            shortLabel: "Assignments",
          },
          {
            id: "availability",
            label: "Availability",
            shortLabel: "Availability",
          },
          {
            id: "skills",
            label: "Skills & Certifications",
            shortLabel: "Skills",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Team Members Tab */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {/* Search and Add */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Button onClick={() => openModal("add-member")}>
              Add Team Member
            </Button>
          </div>

          {/* Team Statistics */}
          <TeamStatistics teamMembers={teamMembers} totalCost={totalTeamCost} />

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                teamMember={member}
                onEdit={(member) => openModal("edit-member", member)}
                onDelete={handleDeleteMember}
                onAssign={handleAssignMember}
              />
            ))}
          </div>

          {filteredTeamMembers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                {searchTerm
                  ? "No team members found matching your search."
                  : "No team members found."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Assignments Tab */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Project Team:{" "}
                {selectedProject?.projectName || "Select a Project"}
              </h2>
              <p className="text-muted-foreground">
                Manage team assignments for the selected project
              </p>
            </div>
            <Button
              onClick={() =>
                toast.success("Assign Team Member modal would open here")
              }
            >
              Assign Team Member
            </Button>
          </div>

          {selectedProject && (
            <>
              {/* Project Team Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Team Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projectTeam.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Assigned members
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Estimated Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${totalTeamCost.toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Per hour</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {
                        projectTeam.filter(
                          (member) => member.status === "active"
                        ).length
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        projectTeam.filter(
                          (member) => member.status !== "active"
                        ).length
                      }{" "}
                      inactive
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Project Team Members */}
              <div className="space-y-4">
                {projectTeam.map((assignment) => (
                  <Card
                    key={assignment.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                            {teamUtils.getInitials(
                              assignment.project_members.first_name,
                              assignment.project_members.last_name
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {teamUtils.formatTeamMemberName(
                                assignment.project_members.first_name,
                                assignment.project_members.last_name
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {assignment.project_members.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              ${assignment.hourly_rate}/hr
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {assignment.allocation_percentage}% allocation
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${teamUtils.getRoleColor(
                            assignment.assigned_role
                          )}`}
                        >
                          {assignment.assigned_role
                            .replace("_", " ")
                            .toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${teamUtils.getAvailabilityColor(
                            assignment.status
                          )}`}
                        >
                          {assignment.status.toUpperCase()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {projectTeam.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    No team members assigned to this project yet.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card text-card-foreground rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="flex items-center justify-between p-4">
              <h3 className="text-xl font-semibold text-card-foreground p-4">
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
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({ ...newMember, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                    required
                    defaultValue={'Select Role'}
                  >
                    <option value="owner">Owner</option>
                    <option value="client">Client</option>
                    <option value="pm">Pm</option>
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

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={closeModal}>
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
