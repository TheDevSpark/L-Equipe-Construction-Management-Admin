"use client";

import { useState } from "react";
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
import { teamUtils } from "@/lib/teamApi";
import toast from "react-hot-toast";

// Team Member Card Component
export function TeamMemberCard({ teamMember, onEdit, onDelete, onAssign }) {
  const initials = teamUtils.getInitials(
    teamMember.first_name,
    teamMember.last_name
  );
  const fullName = teamUtils.formatTeamMemberName(
    teamMember.first_name,
    teamMember.last_name
  );
  const roleColor = teamUtils.getRoleColor(teamMember.role);
  const availabilityColor = teamUtils.getAvailabilityColor(
    teamMember.availability_status
  );

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 rounded-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex gap items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(teamMember)}
              className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 text-xs px-2 py-1 min-w-[60px]"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssign(teamMember)}
              className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 text-xs px-2 py-1 min-w-[60px]"
            >
              Assign
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(teamMember)}
              className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 text-xs px-2 py-1 min-w-[60px]"
            >
              Delete
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Role:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                teamMember.role === "project_manager"
                  ? "bg-blue-500"
                  : teamMember.role === "engineer"
                  ? "bg-green-500"
                  : teamMember.role === "architect"
                  ? "bg-purple-500"
                  : "bg-gray-500"
              }`}
            >
              {teamMember.role.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {teamMember.specialization && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Specialization:</span>
              <span className="font-semibold text-gray-900">
                {teamMember.specialization}
              </span>
            </div>
          )}

          {teamMember.hourly_rate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Hourly Rate:</span>
              <span className="font-semibold text-gray-900">
                ${teamMember.hourly_rate}/hr
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                teamMember.availability_status === "available"
                  ? "bg-green-500"
                  : teamMember.availability_status === "busy"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {teamMember?.availability_status?.toUpperCase()}
            </span>
          </div>

          {teamMember.phone_number && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Phone:</span>
              <span className="font-medium text-gray-900">
                {teamMember.phone_number}
              </span>
            </div>
          )}

          {teamMember.skills && teamMember.skills.length > 0 && (
            <div>
              <span className="text-sm text-gray-500 block mb-2">Skills:</span>
              <div className="flex flex-wrap gap-2">
                {teamMember.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {teamMember.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    +{teamMember.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Project Team Assignment Card
export function ProjectTeamCard({ assignment, onEdit, onRemove }) {
  const teamMember = assignment.project_members;
  const initials = teamUtils.getInitials(
    teamMember.first_name,
    teamMember.last_name
  );
  const fullName = teamUtils.formatTeamMemberName(
    teamMember.first_name,
    teamMember.last_name
  );
  const roleColor = teamUtils.getRoleColor(assignment.assigned_role);
  const statusColor = teamUtils.getAvailabilityColor(assignment.status);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{fullName}</h3>
              <p className="text-sm text-gray-500">{teamMember.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                ${assignment.hourly_rate}/hr
              </div>
              <div className="text-xs text-gray-500">
                {assignment.allocation_percentage}% allocation
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(assignment)}
                className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 text-xs px-2 py-1 min-w-[70px]"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(assignment)}
                className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 text-xs px-2 py-1 min-w-[70px]"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
              assignment.assigned_role === "project_manager"
                ? "bg-blue-500"
                : assignment.assigned_role === "engineer"
                ? "bg-green-500"
                : assignment.assigned_role === "architect"
                ? "bg-purple-500"
                : "bg-gray-500"
            }`}
          >
            {assignment.assigned_role.replace("_", " ").toUpperCase()}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
              assignment.status === "active"
                ? "bg-green-500"
                : assignment.status === "busy"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            {assignment.status.toUpperCase()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Team Member Assignment Modal
export function TeamAssignmentModal({
  isOpen,
  onClose,
  teamMember,
  projectId,
  onAssign,
}) {
  const [assignmentData, setAssignmentData] = useState({
    assigned_role: "",
    hourly_rate: teamMember?.hourly_rate || "",
    allocation_percentage: 100,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    notes: "",
  });

  if (!isOpen || !teamMember) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const assignment = {
      project_id: projectId,
      team_member_id: teamMember.id,
      ...assignmentData,
      hourly_rate: parseFloat(assignmentData.hourly_rate),
      allocation_percentage: parseInt(assignmentData.allocation_percentage),
    };

    onAssign(assignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card text-card-foreground rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-card-foreground">
            Assign Team Member
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

        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
              {teamUtils.getInitials(
                teamMember.first_name,
                teamMember.last_name
              )}
            </div>
            <div>
              <h4 className="font-medium">
                {teamUtils.formatTeamMemberName(
                  teamMember.first_name,
                  teamMember.last_name
                )}
              </h4>
              <p className="text-sm text-muted-foreground">
                {teamMember.specialization}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="assigned_role">Project Role</Label>
              <select
                id="assigned_role"
                value={assignmentData.assigned_role}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    assigned_role: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                required
              >
                <option value="">Select Role</option>
                <option value="owner">Owner</option>
                <option value="Client">Client</option>
                <option value="pm">Pm</option>
              </select>
            </div>

            <div>
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                value={assignmentData.hourly_rate}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    hourly_rate: e.target.value,
                  })
                }
                placeholder="Enter hourly rate"
                required
              />
            </div>

            <div>
              <Label htmlFor="allocation_percentage">
                Allocation Percentage
              </Label>
              <Input
                id="allocation_percentage"
                type="number"
                min="1"
                max="100"
                value={assignmentData.allocation_percentage}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    allocation_percentage: e.target.value,
                  })
                }
                placeholder="100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={assignmentData.start_date}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      start_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={assignmentData.end_date}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      end_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={assignmentData.notes}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    notes: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-input text-card-foreground"
                rows="3"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Assign Team Member</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Team Member Search Component
export function TeamMemberSearch({
  onSelect,
  placeholder = "Search team members...",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (term) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Mock search results for now
      const mkId = (fallback) =>
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : fallback;
      const mockResults = [
        {
          id: mkId("00000000-0000-4000-8000-000000001001"),
          first_name: "John",
          last_name: "Smith",
          email: "john.smith@company.com",
          role: "project_manager",
          specialization: "Construction Management",
          hourly_rate: 75.0,
          availability_status: "available",
        },
        {
          id: mkId("00000000-0000-4000-8000-000000001002"),
          first_name: "Sarah",
          last_name: "Johnson",
          email: "sarah.johnson@company.com",
          role: "engineer",
          specialization: "Civil Engineering",
          hourly_rate: 85.0,
          availability_status: "available",
        },
      ];

      const filtered = mockResults.filter(
        (member) =>
          `${member.first_name} ${member.last_name}`
            .toLowerCase()
            .includes(term.toLowerCase()) ||
          member.specialization.toLowerCase().includes(term.toLowerCase()) ||
          member.role.toLowerCase().includes(term.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.log("Search error:", error?.message || "Unknown error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const handleSelect = (member) => {
    onSelect(member);
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        className="w-full"
      />

      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((member) => (
            <div
              key={member.id}
              onClick={() => handleSelect(member)}
              className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-xs">
                  {teamUtils.getInitials(member.first_name, member.last_name)}
                </div>
                <div>
                  <div className="font-medium text-card-foreground">
                    {teamUtils.formatTeamMemberName(
                      member.first_name,
                      member.last_name
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.specialization} • ${member.hourly_rate}/hr
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${teamUtils.getAvailabilityColor(
                  member.availability_status
                )}`}
              >
                {member.availability_status}
              </span>
            </div>
          ))}
        </div>
      )}

      {isSearching && (
        <div className="absolute right-3 top-3">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

// Team Statistics Component
export function TeamStatistics({ teamMembers, totalCost }) {
  const roleCounts = teamMembers.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {});

  const availabilityCounts = teamMembers.reduce((acc, member) => {
    acc[member.availability_status] =
      (acc[member.availability_status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Team Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamMembers.length}</div>
          <p className="text-xs text-muted-foreground">Total members</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalCost.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">Per hour</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {availabilityCounts.available || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {teamMembers.length - (availabilityCounts.available || 0)}{" "}
            unavailable
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
