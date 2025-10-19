"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { parseExcelFileFirstSheet } from "@/lib/excelUtils";
import { upsertProjectJson, fetchProjectJson } from "@/lib/supabaseHelpers";
import dynamic from "next/dynamic";

// Dynamically load Gantt to avoid build-time default export issues and prevent SSR import
const Gantt = dynamic(() => import("wx-react-gantt").then(mod => mod.Gantt || mod.default || mod), { ssr: false });

/**
 * ScheduleUploader
 * Props:
 * - projectId (string)
 */
export default function ScheduleUploader({ projectId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    loadFromSupabase();
  }, [projectId]);

  const loadFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchProjectJson({
        table: "project_schedules",
        projectId,
      });
      if (error) throw error;
      if (data && data.data) {
        setTasks(data.data);
        setRecordId(data.id);
      } else {
        setTasks([]);
        setRecordId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => setFile(e.target.files?.[0] || null);

  const handleUpload = async (replace = false) => {
    if (!file) {
      toast.error("No file selected");
      return;
    }
    setLoading(true);
    try {
      const rows = await parseExcelFileFirstSheet(file);
      // Convert rows into Gantt tasks format expected by wx-react-gantt
      // Expect rows to have: id, name, start, end, progress, dependencies
      const converted = rows.map((r, idx) => ({
        id: r.id || `t-${idx}`,
        name: r.name || r.Task || r.task || `Task ${idx + 1}`,
        start: r.start || r.Start || r.startDate,
        end: r.end || r.End || r.endDate,
        progress: Number(r.progress || r.Progress || 0),
        dependencies: r.dependencies || r.Dependencies || null,
      }));

      // Save to Supabase
      const { data, error } = await upsertProjectJson({
        table: "project_schedules",
        projectId,
        jsonData: converted,
        id: replace ? recordId : undefined,
      });
      if (error) throw error;
      toast.success("Schedule saved");
      setTasks(converted);
      setRecordId(data?.id || recordId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
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

      <div className="border p-2 rounded">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedule tasks to display</p>
        ) : (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm table-auto border-collapse">
                <thead>
                  <tr className="bg-muted text-xs text-muted-foreground">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Start</th>
                    <th className="p-2 text-left">End</th>
                    <th className="p-2 text-left">Progress</th>
                    <th className="p-2 text-left">Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="p-2 align-top">{t.id}</td>
                      <td className="p-2 align-top">{t.name}</td>
                      <td className="p-2 align-top">{String(t.start || '')}</td>
                      <td className="p-2 align-top">{String(t.end || '')}</td>
                      <td className="p-2 align-top">{t.progress ?? 0}%</td>
                      <td className="p-2 align-top">{String(t.dependencies || '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ height: 400 }}>
              <Gantt data={tasks} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
