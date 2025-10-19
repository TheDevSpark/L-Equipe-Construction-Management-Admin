import supabase from '../../lib/supabaseClinet.js';

// Team Members API
export const teamMembersApi = {
  // Get all team members
  async getTeamMembers() {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      // Log error to console for debugging only
      console.log('API Error (getTeamMembers):', error?.message || 'Unknown error');
      return { data: null, error: error?.message || 'Failed to fetch project members' };
    }
  },

  // Get team member by ID
  async getTeamMember(teamMemberId) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          project_member_skills (*),
          project_member_availability (*)
        `)
        .eq('id', teamMemberId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (getTeamMember):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Create a new team member
  async createTeamMember(teamMemberData) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .insert([teamMemberData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (createTeamMember):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Update a team member
  async updateTeamMember(teamMemberId, updates) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .update(updates)
        .eq('id', teamMemberId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (updateTeamMember):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Delete a team member
  async deleteTeamMember(teamMemberId) {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', teamMemberId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.log('API Error (deleteTeamMember):', error?.message || 'Unknown error');
      return { error };
    }
  },

  // Search team members by role or specialization
  async searchTeamMembers(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`)
        .order('first_name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (searchTeamMembers):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Get available team members
  async getAvailableTeamMembers() {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('availability_status', 'available')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (getAvailableTeamMembers):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  }
};

// Project Team Assignments API
export const projectTeamApi = {
  // Get team members for a project
  async getProjectTeam(projectId) {
    try {
      const { data, error } = await supabase
        .rpc('get_project_team', { project_uuid: projectId });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (getProjectTeam):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Assign team member to project
  async assignTeamMemberToProject(assignmentData) {
    try {
      const { data, error } = await supabase
        .from('project_team_assignments')
        .insert([assignmentData])
        .select(`
          *,
          project_members (
            first_name,
            last_name,
            email,
            role,
            specialization
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (assignTeamMember):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Update team member assignment
  async updateTeamAssignment(assignmentId, updates) {
    try {
      const { data, error } = await supabase
        .from('project_team_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select(`
          *,
          project_members (
            first_name,
            last_name,
            email,
            role,
            specialization
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (updateTeamAssignment):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Remove team member from project
  async removeTeamMemberFromProject(assignmentId) {
    try {
      const { error } = await supabase
        .from('project_team_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.log('API Error (removeTeamMember):', error?.message || 'Unknown error');
      return { error };
    }
  },

  // Get projects for a team member
  async getTeamMemberProjects(teamMemberId) {
    try {
      const { data, error } = await supabase
        .from('project_team_assignments')
        .select(`
          *,
          project (
            id,
            projectName,
            projectLocation
          )
        `)
        .eq('team_member_id', teamMemberId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (getTeamMemberProjects):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  }
};

// Team Member Skills API
export const teamSkillsApi = {
  // Get skills for a team member
  async getTeamMemberSkills(teamMemberId) {
    try {
      const { data, error } = await supabase
        .from('team_member_skills')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .order('skill_name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (getTeamMemberSkills):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Add skill to team member
  async addTeamMemberSkill(skillData) {
    try {
      const { data, error } = await supabase
        .from('team_member_skills')
        .insert([skillData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (addTeamMemberSkill):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Update team member skill
  async updateTeamMemberSkill(skillId, updates) {
    try {
      const { data, error } = await supabase
        .from('team_member_skills')
        .update(updates)
        .eq('id', skillId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (updateTeamMemberSkill):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Remove skill from team member
  async removeTeamMemberSkill(skillId) {
    try {
      const { error } = await supabase
        .from('team_member_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.log('API Error (removeTeamMemberSkill):', error?.message || 'Unknown error');
      return { error };
    }
  }
};

// Team Member Availability API
export const teamAvailabilityApi = {
  // Get availability for a team member
  async getTeamMemberAvailability(teamMemberId, startDate, endDate) {
    try {
      let query = supabase
        .from('team_member_availability')
        .select('*')
        .eq('team_member_id', teamMemberId);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (getTeamMemberAvailability):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Set availability for a team member
  async setTeamMemberAvailability(availabilityData) {
    try {
      const { data, error } = await supabase
        .from('team_member_availability')
        .upsert([availabilityData], { onConflict: 'team_member_id,date' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (setTeamMemberAvailability):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Update team member availability
  async updateTeamMemberAvailability(availabilityId, updates) {
    try {
      const { data, error } = await supabase
        .from('team_member_availability')
        .update(updates)
        .eq('id', availabilityId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.log('API Error (updateTeamMemberAvailability):', error?.message || 'Unknown error');
      return { data: null, error };
    }
  },

  // Remove availability record
  async removeTeamMemberAvailability(availabilityId) {
    try {
      const { error } = await supabase
        .from('team_member_availability')
        .delete()
        .eq('id', availabilityId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.log('API Error (removeTeamMemberAvailability):', error?.message || 'Unknown error');
      return { error };
    }
  }
};

// Utility functions
export const teamUtils = {
  // Format team member name
  formatTeamMemberName: (firstName, lastName) => {
    return `${firstName} ${lastName}`;
  },

  // Get role color
  getRoleColor: (role) => {
    const roleColors = {
      'project_manager': 'bg-blue-100 text-blue-800',
      'engineer': 'bg-green-100 text-green-800',
      'architect': 'bg-purple-100 text-purple-800',
      'contractor': 'bg-orange-100 text-orange-800',
      'supervisor': 'bg-yellow-100 text-yellow-800',
      'worker': 'bg-gray-100 text-gray-800',
      'admin': 'bg-red-100 text-red-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  },

  // Get availability status color
  getAvailabilityColor: (status) => {
    const statusColors = {
      'available': 'bg-green-100 text-green-800',
      'busy': 'bg-yellow-100 text-yellow-800',
      'unavailable': 'bg-red-100 text-red-800',
      'on_leave': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  },

  // Get skill level color
  getSkillLevelColor: (level) => {
    const levelColors = {
      'beginner': 'bg-red-100 text-red-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-blue-100 text-blue-800',
      'expert': 'bg-green-100 text-green-800'
    };
    return levelColors[level] || 'bg-gray-100 text-gray-800';
  },

  // Calculate total team cost
  calculateTeamCost: (teamMembers) => {
    return teamMembers.reduce((total, member) => {
      const hourlyRate = member.hourly_rate || 0;
      const allocation = member.allocation_percentage || 100;
      return total + (hourlyRate * allocation / 100);
    }, 0);
  },

  // Get team member initials
  getInitials: (firstName, lastName) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`.toUpperCase();
  }
};



