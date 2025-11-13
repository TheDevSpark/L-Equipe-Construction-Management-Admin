"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Calendar, Users, DollarSign, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import supabase from "@/lib/supabaseClinet";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId;
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [projectId]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status || 'planning'] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'on_hold':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/dashboard/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <CheckCircle className="w-4 h-4" /> },
    { id: "timeline", label: "Timeline", icon: <Calendar className="w-4 h-4" /> },
    { id: "team", label: "Team", icon: <Users className="w-4 h-4" /> },
    { id: "budget", label: "Budget", icon: <DollarSign className="w-4 h-4" /> },
    { id: "documents", label: "Documents", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: "Projects", href: "/dashboard/admin" },
          { label: project.projectName }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{project.projectName}</h1>
            <p className="text-muted-foreground">Project Details & Management</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Project Status Banner */}
      <Card className={`border-l-4 ${getStatusColor(project.status).split(' ')[2]}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Project Status: {(project.status || 'planning').replace('_', ' ').toUpperCase()}
                </h3>
                <p className="text-muted-foreground">
                  {project.description || 'No description available'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(project.budget)}</p>
              <p className="text-sm text-muted-foreground">Total Budget</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg w-full sm:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="hidden sm:inline">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{project.projectLocation || 'No location specified'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="text-foreground">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="text-foreground">{formatDate(project.endDate)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Collaborators</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{project.projectCollabrate || 'No collaborators assigned'}</p>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Project ID</p>
                    <p className="text-foreground font-mono">{project.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Created Date</p>
                    <p className="text-foreground">{formatDate(project.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Last Updated</p>
                    <p className="text-foreground">{formatDate(project.updated_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Created By</p>
                    <p className="text-foreground">{project.created_by || 'System'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "timeline" && (
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Key milestones and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">Project Start</p>
                    <p className="text-sm text-muted-foreground">{formatDate(project.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">Project End</p>
                    <p className="text-sm text-muted-foreground">{formatDate(project.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">Project Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(project.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "team" && (
          <Card>
            <CardHeader>
              <CardTitle>Project Team</CardTitle>
              <CardDescription>Team members and collaborators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <p className="font-medium text-foreground mb-2">Collaborators</p>
                  <p className="text-muted-foreground">{project.projectCollabrate || 'No team members assigned yet'}</p>
                </div>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Team management features coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "budget" && (
          <Card>
            <CardHeader>
              <CardTitle>Project Budget</CardTitle>
              <CardDescription>Financial overview and budget tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Total Budget</span>
                    <span className="text-2xl font-bold text-foreground">{formatCurrency(project.budget)}</span>
                  </div>
                </div>
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Budget tracking features coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "documents" && (
          <Card>
            <CardHeader>
              <CardTitle>Project Documents</CardTitle>
              <CardDescription>Files, drawings, and project documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Document management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
