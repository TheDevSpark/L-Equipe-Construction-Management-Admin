import supabase from "./supabaseClinet";

export const getUserProfiles = async (userIds) => {
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

export const getTasks = async (projectId) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to load tasks");
  }

  // Get all unique user IDs from all tasks
  const allUserIds = [
    ...new Set(data.flatMap((task) => task.assigned_to || [])),
  ];

  // Fetch user profiles for all assigned users
  const profiles = await getUserProfiles(allUserIds);

  return {
    tasks: data,
    userProfiles: profiles,
  };
};
