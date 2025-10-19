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

  useEffect(() => {
    if (projectId) loadFromSupabase();
  }, [projectId]);

  // 🔹 Load existing JSON schedule from Supabase
  const loadFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchProjectJson({
        table: "project_schedules",
        projectId,
      });
      if (error) throw error;
      setTasks(data?.data || []);
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
    <div className="space-y-4">
      {/* Upload Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
        <Button onClick={() => handleUpload(false)} disabled={loading}>
          Upload
        </Button>
        <Button onClick={() => handleUpload(true)} disabled={loading}>
          Update
        </Button>
        <Button onClick={loadFromSupabase} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Display Table + Gantt Chart */}
      <div className="border p-3 rounded-md">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No schedule tasks available.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted text-xs text-muted-foreground">
                    <th className="p-2 text-left">Task</th>
                    <th className="p-2 text-left">Start</th>
                    <th className="p-2 text-left">End</th>
                    <th className="p-2 text-left">Progress</th>
                    <th className="p-2 text-left">Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="p-2">{t.name}</td>
                      <td className="p-2">{String(t.start || "")}</td>
                      <td className="p-2">{String(t.end || "")}</td>
                      <td className="p-2">{t.progress ?? 0}%</td>
                      <td className="p-2">{String(t.dependencies || "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* <div style={{ height: 400 }}>
              <Gantt data={tasks} />
            </div> */}
            <div style={{ height: 400 }}>
              <ClientGantt data={tasks} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
