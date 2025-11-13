"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectSelector } from "@/components/ProjectSelector";
import toast from "react-hot-toast";
import supabase from "@/lib/supabaseClinet";

export default function ClientsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectClients, setProjectClients] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Client selection states
  const [clientQuery, setClientQuery] = useState("");
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  // Load available clients from Supabase
  const getAllClients = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "client");

    if (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } else {
      console.log("Clients fetched:", data);
      // Map Supabase data to client format
      const clients = (data || []).map((user) => ({
        id: user.id,
        name: `${user.full_name || ""}`.trim(),
        email: user.email || "",
      }));
      setAvailableClients(clients);
    }
  };

  // Load existing clients when project is selected
  const loadProjectClients = async (projectId) => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from("project")
        .select("clients")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error loading clients:", error.message);
        return;
      }

      if (data && data.clients) {
        setProjectClients(data.clients);
        // Map to display format with user details
        const clientsWithDetails = data.clients
          .map((clientId) => {
            return availableClients.find((u) => u.id === clientId);
          })
          .filter(Boolean);

        setSelectedClients(clientsWithDetails);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  useEffect(() => {
    getAllClients();
  }, []);

  useEffect(() => {
    if (selectedProject?.id) {
      loadProjectClients(selectedProject.id);
    }
  }, [selectedProject?.id, availableClients]);

  // Filter clients based on search input
  const filteredClients = availableClients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientQuery.toLowerCase()) &&
      !selectedClients.some((sel) => sel.id === client.id)
  );

  const handleClientSelect = (client) => {
    setSelectedClients((prev) => [...prev, client]);
    setClientQuery("");
    setShowClientSuggestions(false);
  };

  const handleClientRemove = (clientId) => {
    setSelectedClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  const handleClientInputChange = (e) => {
    setClientQuery(e.target.value);
    setShowClientSuggestions(e.target.value.trim().length > 0);
  };

  // Function to handle saving clients
  const handleSaveClients = async () => {
    try {
      setLoading(true);

      if (!selectedProject?.id) {
        toast.error("Please select a project first");
        return;
      }

      // Prepare the clients array with just the client IDs
      const clientsArray = selectedClients.map((client) => client.id);

      // Update the project with new clients
      const { error } = await supabase
        .from("project")
        .update({
          clients: clientsArray,
        })
        .eq("id", selectedProject.id);

      if (error) {
        throw error.message;
      }

      toast.success("Clients saved successfully!");
      setProjectClients(clientsArray);
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
    setClientQuery("");
    setShowClientSuggestions(false);
  };

  // Get client details for display
  const getClientDetails = (clientId) => {
    return availableClients.find((user) => user.id === clientId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Client Management
          </h1>
          <p className="text-muted-foreground">
            Manage clients for your projects
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
          <ProjectSelector
            onProjectSelect={setSelectedProject}
            selectedProject={selectedProject}
          />
          <Button onClick={openModal} disabled={!selectedProject}>
            Manage Clients
          </Button>
        </div>
      </div>

      {/* Project Clients */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {selectedProject ? selectedProject.name : 'Select a project'}
          </h2>
        </div>

        {selectedProject ? (
          <div className="space-y-4">
            {projectClients.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Assigned Clients</h3>
                <div className="grid gap-2">
                  {projectClients.map((clientId) => {
                    const client = getClientDetails(clientId);
                    return client ? (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      >
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.email}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No clients assigned to this project yet.</p>
                <Button variant="link" onClick={openModal} className="mt-2">
                  Add Clients
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Please select a project to view or manage clients.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Clients Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Manage Clients</h2>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="client-search">Add Clients</Label>
                <div className="relative">
                  <Input
                    id="client-search"
                    placeholder="Search clients..."
                    value={clientQuery}
                    onChange={handleClientInputChange}
                    onFocus={() =>
                      clientQuery && setShowClientSuggestions(true)
                    }
                  />
                  {showClientSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <div
                            key={client.id}
                            className="p-2 hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleClientSelect(client)}
                          >
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.email}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-muted-foreground">
                          No clients found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Selected Clients</h3>
                {selectedClients.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {selectedClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded"
                      >
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.email}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClientRemove(client.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded">
                    No clients selected
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveClients}
                  disabled={loading || selectedClients.length === 0}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}