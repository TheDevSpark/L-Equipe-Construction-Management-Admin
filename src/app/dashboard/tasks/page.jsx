"use client";
import { ProjectSelector } from "@/components/ProjectSelector";
import { TaskCreationModal } from "@/components/TaskCreationModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import supabase from "@/lib/supabaseClinet";
import { ArrowUpRightIcon, PlusIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

function page() {
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [creationModal, setCreationModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      // Refresh tasks after successful deletion
      await getTasks();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };
  useEffect(() => {
    if (selectedProject) {
      console.log(selectedProject);
      console.log(tasks);
    }
  }, [selectedProject, tasks]);
  const getUserProfiles = async (userIds) => {
    if (!userIds || userIds.length === 0) return {};

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("id", userIds);

    if (error) {
      console.error("Error fetching user profiles:", error);
      return {};
    }

    // Convert array to object with user IDs as keys
    return data.reduce(
      (acc, user) => ({
        ...acc,
        [user.id]: user,
      }),
      {}
    );
  };

  const getTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", selectedProject.id);

    if (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
      return;
    }

    // Get all unique user IDs from all tasks
    const allUserIds = [
      ...new Set(data.flatMap((task) => task.assigned_to || [])),
    ];

    // Fetch user profiles for all assigned users
    const profiles = await getUserProfiles(allUserIds);
    setUserProfiles(profiles);
    setTasks(data);
  };
  useEffect(() => {
    if (selectedProject) {
      getTasks();
    }
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div>
        <ProjectSelector
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
          showCreateButton={false}
        />

        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PlusIcon />
            </EmptyMedia>
            <EmptyTitle>No Project Selected</EmptyTitle>
            <EmptyDescription>
              Please select a project to view its tasks.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }
  return (
    <div>
      <div className="w-full flex justify-between items-center">
        <div className="font-bold text-3xl">
          <h2>Tasks:</h2>
        </div>
        <div className="flex ">
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
            showCreateButton={false}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-10 flex items-center"
            onClick={() => setCreationModal(true)}
          >
            Add Task
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {tasks.length > 0 ? (
        <div className="flex flex-row flex-wrap gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="w-1/3">
              <CardHeader>
                <CardTitle className="w-full flex justify-between">
                  {task.title}
                  <Badge
                    variant="outline"
                    className={
                      task.status === "pending"
                        ? "bg-amber-400"
                        : task.status === "completed"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }
                  >
                    {task.status}
                  </Badge>
                </CardTitle>
                <CardDescription>{task.description}</CardDescription>
                <CardFooter className="flex justify-between items-center">
                  <div className="space-x-2">
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">View Task</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{task.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {task.description}
                          <br />
                          <br />
                          <div className="mt-2">
                            <span className="font-bold">Assigned To:</span>
                            <div className="mt-2 space-y-2">
                              {task.assigned_to &&
                              task.assigned_to.length > 0 ? (
                                task.assigned_to.map((userId) => {
                                  const user = userProfiles[userId];
                                  return (
                                    <div
                                      key={userId}
                                      className="flex items-center gap-2"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                                      <span>
                                        {user?.full_name ||
                                          user?.email ||
                                          `User (${userId})`}
                                      </span>
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-muted-foreground">
                                  No one assigned
                                </span>
                              )}
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={isDeleting}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </CardHeader>
          </Card>
        ))}
      </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PlusIcon />
            </EmptyMedia>
            <EmptyTitle>No Tasks Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any tasks yet. Get started by creating
              your first task.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button onClick={() => setCreationModal(true)}>
                Create Task
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      )}
      <TaskCreationModal
        open={creationModal}
        onOpenChange={setCreationModal}
        project={selectedProject}
      />
    </div>
  );
}

export default page;
