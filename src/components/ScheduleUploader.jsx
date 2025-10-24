"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { parseExcelFileFirstSheet } from "@/lib/excelUtils";
import { upsertProjectJson, fetchProjectJson } from "@/lib/supabaseHelpers";
import dynamic from "next/dynamic";
import ClientGantt from "./ClientGantt";

// Dynamically load Gantt chart to avoid SSR errors
// const Gantt = dynamic(
//   () => import("wx-react-gantt").then((mod) => mod.Gantt || mod.default || mod),
//   { ssr: false }
// );

export default function ScheduleUploader({ projectId }) {
  const [file, setFile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [hasExistingData, setHasExistingData] = useState(false);

  useEffect(() => {
    if (projectId) {
      console.log("Loading schedule for project ID:", projectId, "(type:", typeof projectId, ")");
      loadFromSupabase();
    }
  }, [projectId]);

  // 🔹 Load existing JSON schedule from Supabase
  const loadFromSupabase = async () => {
    setLoading(true);
    try {
      console.log("Loading schedule for project ID:", projectId);
      
      const { data, error } = await fetchProjectJson({
        table: "project_schedules",
        projectId,
      });
      
      if (error) {
        console.error("fetchProjectJson returned error:", error);
        throw error;
      }
      
      console.log("fetchProjectJson returned data:", data);
      
      setScheduleData(data);
      setTasks(data?.data || []);
      setHasExistingData(!!(data && data.data && data.data.length > 0));
      
      if (data && data.data && data.data.length > 0) {
        console.log("✅ Found existing schedule data:", data.data.length, "tasks");
        console.log("Sample task:", data.data[0]);
        // Don't show toast on initial load, only on manual refresh
        if (loading) {
          toast.success(`Loaded ${data.data.length} existing schedule tasks`);
        }
      } else {
        console.log("❌ No existing schedule data found for project:", projectId);
        console.log("Data structure:", data);
      }
    } catch (err) {
      console.error("Load error:", err);
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Excel file selection
  const handleFile = (e) => setFile(e.target.files?.[0] || null);

  // 🔹 Upload Excel → Convert → Save JSON
  const handleUpload = async (replace = false) => {
    if (!file) return toast.error("Please select an Excel file");
    if (!projectId) return toast.error("No project selected");

    setLoading(true);
    try {
      // Step 1: Parse Excel
      const rows = await parseExcelFileFirstSheet(file);

      // Step 2: Convert Excel rows → Gantt format
      const converted = rows.map((r, i) => ({
        id: r.id || `task-${i}`, // internal key for chart only (not DB id)
        name:
          r.name || r.Task || r["Task Name"] || r.task_name || `Task ${i + 1}`,
        start: r.start || r.Start || r["Planned Start Date"] || null,
        end: r.end || r.End || r["Planned Finish Date"] || null,
        progress: Number(
          r.progress || r.Progress || r["Percent Complete"] || 0
        ),
        dependencies:
          r.dependencies ||
          r.Dependencies ||
          r["Linked From"] ||
          r["Linked To"] ||
          null,
      }));

      // Step 3: Save JSON in Supabase — no manual id sent
      const { error } = await upsertProjectJson({
        table: "project_schedules",
        projectId,
        jsonData: converted,
      });
      if (error) throw error;

      setTasks(converted);
      toast.success(replace ? "Schedule updated!" : "Schedule saved!");
    } catch (err) {
      console.error("Error uploading schedule:", err);
      toast.error("Failed to process schedule file");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="space-y-4">
    //   {/* Upload Controls */}
    //   <div className="flex flex-wrap items-center gap-3">
    //     <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
    //     <Button onClick={() => handleUpload(false)} disabled={loading}>
    //       Upload
    //     </Button>
    //     <Button onClick={() => handleUpload(true)} disabled={loading}>
    //       Update
    //     </Button>
    //     <Button onClick={loadFromSupabase} variant="outline">
    //       Refresh
    //     </Button>
    //   </div>

    //   {/* Display Table + Gantt Chart */}
    //   <div className="border p-3 rounded-md">
    //     {tasks.length === 0 ? (
    //       <p className="text-sm text-muted-foreground">
    //         No schedule tasks available.
    //       </p>
    //     ) : (
    //       <>
    //         <div className="overflow-x-auto mb-4">
    //           <table className="w-full text-sm border-collapse">
    //             <thead>
    //               <tr className="bg-muted text-xs text-muted-foreground">
    //                 <th className="p-2 text-left">Task</th>
    //                 <th className="p-2 text-left">Start</th>
    //                 <th className="p-2 text-left">End</th>
    //                 <th className="p-2 text-left">Progress</th>
    //                 <th className="p-2 text-left">Dependencies</th>
    //               </tr>
    //             </thead>
    //             <tbody>
    //               {tasks.map((t) => (
    //                 <tr key={t.id} className="border-t">
    //                   <td className="p-2">{t.name}</td>
    //                   <td className="p-2">{String(t.start || "")}</td>
    //                   <td className="p-2">{String(t.end || "")}</td>
    //                   <td className="p-2">{t.progress ?? 0}%</td>
    //                   <td className="p-2">{String(t.dependencies || "")}</td>
    //                 </tr>
    //               ))}
    //             </tbody>
    //           </table>
    //         </div>

    //         {/* <div style={{ height: 400 }}>
    //           <Gantt data={tasks} />
    //         </div> */}
    //         <div style={{ height: 400 }}>
    //           <ClientGantt data={tasks} />
    //         </div>
    //       </>
    //     )}
    //   </div>
    // </div>
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold">📅 Project Schedule</h2>
          <p className="text-sm text-muted-foreground">
            {hasExistingData 
              ? `Existing schedule loaded with ${tasks.length} tasks. Upload new file to update.`
              : "Upload Excel to visualize and manage project timelines."
            }
          </p>
        
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="text-sm border-green-600 bg-green-500 text-white rounded-md px-2 w-fit py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
          />
          <Button onClick={() => handleUpload(false)} disabled={loading}>
            {loading ? "Uploading..." : "Upload New"}
          </Button>
          <Button
            onClick={() => handleUpload(true)}
            variant="secondary"
            disabled={loading}
          >
            {hasExistingData ? "Replace Existing" : "Update"}
          </Button>
          <Button onClick={loadFromSupabase} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* DEBUG INFO - Remove this in production */}
      

      {/* EXISTING DATA INFO */}
      {hasExistingData && scheduleData && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-600 dark:text-green-400 text-xl">📊</span>
            <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg">Schedule Data Loaded Successfully</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800 dark:text-green-200">
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <p className="font-medium text-green-700 dark:text-green-300">📋 Total Tasks</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{tasks.length}</p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <p className="font-medium text-green-700 dark:text-green-300">🕒 Last Updated</p>
              <p className="text-sm">{scheduleData.updated_at ? new Date(scheduleData.updated_at).toLocaleDateString() : 'Unknown'}</p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <p className="font-medium text-green-700 dark:text-green-300">🆔 Database ID</p>
              <p className="text-sm font-mono">{scheduleData.id}</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ <strong>Data is ready!</strong> Your schedule is already loaded and displayed below. No upload needed.
            </p>
          </div>
        </div>
      )}

      {/* GANTT CHART */}
      <div className="bg-card rounded-xl shadow-sm border p-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-muted-foreground mb-2">
              {hasExistingData 
                ? "No schedule tasks found in existing data." 
                : "No schedule data available for this project."
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Upload an Excel file to create your project schedule.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                📈 Project Timeline - {tasks.length} Tasks
              </h3>
              <div className="text-sm text-muted-foreground">
                Interactive Gantt Chart
              </div>
            </div>
            <div className="h-[400px] overflow-x-auto border rounded-lg">
              <ClientGantt data={tasks} />
            </div>
          </div>
        )}
      </div>

      {/* TASK SUMMARY */}
      {tasks.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold text-lg mb-4">📊 Schedule Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tasks.length}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Tasks</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tasks.filter(t => t.progress === 100).length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {tasks.filter(t => t.progress > 0 && t.progress < 100).length}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">In Progress</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {tasks.filter(t => t.progress === 0).length}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">Not Started</div>
            </div>
          </div>
        </div>
      )}

      {/* TASK TABLE */}
      {tasks.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
          <div className="p-4 border-b bg-muted/20">
            <h3 className="font-medium text-sm text-muted-foreground">
              📋 Detailed Task List ({tasks.length} items)
            </h3>
          </div>
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="p-3 text-left">Task</th>
                <th className="p-3 text-left">Start</th>
                <th className="p-3 text-left">End</th>
                <th className="p-3 text-left">Progress</th>
                <th className="p-3 text-left">Dependencies</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3">{String(t.start || "")}</td>
                  <td className="p-3">{String(t.end || "")}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>{t.progress ?? 0}%</span>
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${t.progress ?? 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{String(t.dependencies || "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
