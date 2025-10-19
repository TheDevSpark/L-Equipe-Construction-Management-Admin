# Team Management System Setup Guide

## 🎯 Overview
Complete team management system with project assignments, availability tracking, skills management, and real-time team coordination.

## 🚀 Quick Setup

### 1. Database Setup
Run the following SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content from: team-management-setup.sql
-- This creates all necessary tables, indexes, triggers, and RLS policies
```

### 2. Test the System
1. Navigate to `/dashboard/teams`
2. View team members and project assignments
3. Try adding new team members
4. Assign team members to projects

## 📊 Features Implemented

### ✅ Team Member Management
- **Member Profiles**: Complete team member profiles with contact info, roles, and skills
- **Role Management**: Project Manager, Engineer, Architect, Contractor, Supervisor, Worker
- **Skill Tracking**: Detailed skill levels and certifications
- **Availability Status**: Available, Busy, Unavailable, On Leave

### ✅ Project Team Assignments
- **Team Assignment**: Assign team members to specific projects
- **Role Assignment**: Define specific roles for each project
- **Allocation Tracking**: Percentage allocation per team member
- **Cost Management**: Hourly rates and project cost calculations

### ✅ Availability Management
- **Date-based Availability**: Set availability for specific dates
- **Time Slots**: Define working hours and time slots
- **Status Tracking**: Real-time availability status
- **Leave Management**: Track time off and leave requests

### ✅ Skills & Certifications
- **Skill Levels**: Beginner, Intermediate, Advanced, Expert
- **Certification Tracking**: Professional certifications and licenses
- **Experience Years**: Track years of experience per skill
- **Skill Search**: Find team members by skills

## 🗄️ Database Tables

### 1. `team_members`
- Core team member information
- Fields: id, first_name, last_name, email, phone_number, role, specialization, hourly_rate, availability_status, skills, certifications

### 2. `project_team_assignments`
- Project team assignments and roles
- Fields: id, project_id, team_member_id, assigned_role, hourly_rate, allocation_percentage, status, start_date, end_date

### 3. `team_member_skills`
- Detailed skill tracking
- Fields: id, team_member_id, skill_name, skill_level, years_experience, certified

### 4. `team_member_availability`
- Availability and scheduling
- Fields: id, team_member_id, date, start_time, end_time, status, notes

## 🎨 UI Components

### Core Components
- **TeamMemberCard**: Displays team member info with actions
- **ProjectTeamCard**: Shows project team assignments
- **TeamMemberSearch**: Searchable team member selection
- **TeamStatistics**: Team overview and metrics
- **TeamAssignmentModal**: Modal for assigning team members

### Features
- **Role-based Colors**: Color-coded roles and statuses
- **Availability Indicators**: Visual availability status
- **Skill Badges**: Display skills and certifications
- **Cost Calculations**: Real-time cost calculations

## 🔧 API Functions

### Team Members API
```javascript
import { teamMembersApi } from '@/lib/teamApi';

// Get all team members
const { data } = await teamMembersApi.getTeamMembers();

// Create team member
const { data } = await teamMembersApi.createTeamMember(teamMemberData);

// Search team members
const { data } = await teamMembersApi.searchTeamMembers(searchTerm);
```

### Project Team API
```javascript
import { projectTeamApi } from '@/lib/teamApi';

// Get project team
const { data } = await projectTeamApi.getProjectTeam(projectId);

// Assign team member
const { data } = await projectTeamApi.assignTeamMemberToProject(assignmentData);

// Remove team member
await projectTeamApi.removeTeamMemberFromProject(assignmentId);
```

### Team Skills API
```javascript
import { teamSkillsApi } from '@/lib/teamApi';

// Get team member skills
const { data } = await teamSkillsApi.getTeamMemberSkills(teamMemberId);

// Add skill
const { data } = await teamSkillsApi.addTeamMemberSkill(skillData);
```

### Team Availability API
```javascript
import { teamAvailabilityApi } from '@/lib/teamApi';

// Get availability
const { data } = await teamAvailabilityApi.getTeamMemberAvailability(teamMemberId, startDate, endDate);

// Set availability
const { data } = await teamAvailabilityApi.setTeamMemberAvailability(availabilityData);
```

## 📱 Pages & Routes

### Main Team Dashboard
- **Route**: `/dashboard/teams`
- **Features**: Complete team management interface
- **Tabs**: Team Members, Project Assignments, Availability, Skills & Certifications

### Team Management Features
- **Member Management**: Add, edit, delete team members
- **Project Assignment**: Assign members to projects with roles
- **Availability Tracking**: Set and track member availability
- **Skills Management**: Manage skills and certifications

## 🎯 Usage Examples

### Adding a Team Member
```javascript
const teamMemberData = {
  first_name: "John",
  last_name: "Smith",
  email: "john.smith@company.com",
  phone_number: "+1-555-0101",
  role: "project_manager",
  specialization: "Construction Management",
  hourly_rate: 75.00,
  skills: ["Project Planning", "Team Leadership"],
  certifications: ["PMP Certification"],
  created_by: currentUser.id
};

const { data, error } = await teamMembersApi.createTeamMember(teamMemberData);
```

### Assigning Team Member to Project
```javascript
const assignmentData = {
  project_id: projectId,
  team_member_id: teamMemberId,
  assigned_role: "project_manager",
  hourly_rate: 75.00,
  allocation_percentage: 100,
  start_date: "2024-01-15",
  assigned_by: currentUser.id
};

const { data, error } = await projectTeamApi.assignTeamMemberToProject(assignmentData);
```

### Setting Team Member Availability
```javascript
const availabilityData = {
  team_member_id: teamMemberId,
  date: "2024-01-15",
  start_time: "09:00",
  end_time: "17:00",
  status: "available",
  notes: "Regular working hours"
};

const { data, error } = await teamAvailabilityApi.setTeamMemberAvailability(availabilityData);
```

## 🔐 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Authenticated users can manage team data
- Proper permissions for CRUD operations

### Data Validation
- Email uniqueness validation
- Role and status constraints
- Date and time validation
- Skill level validation

## 📊 Analytics & Reporting

### Team Statistics
```javascript
// Calculate team cost
const totalCost = teamUtils.calculateTeamCost(teamMembers);

// Get role distribution
const roleCounts = teamMembers.reduce((acc, member) => {
  acc[member.role] = (acc[member.role] || 0) + 1;
  return acc;
}, {});
```

### Project Team Overview
```javascript
// Get project team with costs
const { data } = await projectTeamApi.getProjectTeam(projectId);
const totalProjectCost = teamUtils.calculateTeamCost(data);
```

## 🚨 Notifications & Alerts

### Team Alerts
- Team member availability changes
- Project assignment updates
- Skill certification expirations
- Cost overrun warnings

### Alert Types
- **Info**: General team updates
- **Warning**: Availability conflicts
- **Success**: Successful assignments
- **Error**: Assignment conflicts

## 🎨 Theming

### Dark/Light Mode Support
- All components support theme switching
- CSS variables for consistent theming
- Role-based color coding
- Status indicators

### Color Coding
- **Blue**: Project Managers, Available
- **Green**: Engineers, Active
- **Purple**: Architects, Certified
- **Orange**: Contractors, Busy
- **Yellow**: Supervisors, Pending
- **Gray**: Workers, Unavailable
- **Red**: Admin, Overdue

## 📱 Mobile Responsive

### Responsive Features
- Mobile-friendly team cards
- Touch-friendly assignment modals
- Responsive team statistics
- Mobile-optimized search

## 🔄 Real-time Updates

### Live Data Sync
- Automatic team member updates
- Real-time availability changes
- Live project assignment updates
- Instant cost calculations

## 🎯 Integration with Project Creation

### Enhanced Project Modal
The project creation modal now includes:
- Team member assignment during project creation
- Role-based team selection
- Cost estimation with team rates
- Availability checking

### Project Team Management
- Assign team members during project creation
- Set project-specific roles and rates
- Track team allocation percentages
- Monitor project team costs

## 🎯 Next Steps

1. **Run Database Setup**: Execute `team-management-setup.sql`
2. **Test Team Features**: Navigate to team dashboard
3. **Add Team Members**: Create initial team member profiles
4. **Assign to Projects**: Assign team members to existing projects
5. **Set Availability**: Configure team member availability
6. **Train Team**: Show team how to use the system

## 🆘 Troubleshooting

### Common Issues
1. **RLS Policy Errors**: Run the database setup script
2. **Team Assignment Fails**: Check project and member IDs
3. **Availability Not Saving**: Verify date format and constraints
4. **Skills Not Displaying**: Check array field formatting

### Support
- Check browser console for errors
- Verify Supabase connection
- Ensure all dependencies are installed
- Check team member data format

---

**Team Management System is now fully functional and ready for production use!** 🎉👥📊



