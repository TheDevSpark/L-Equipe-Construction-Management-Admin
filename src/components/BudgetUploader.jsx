"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { parseExcelFileFirstSheet } from "@/lib/excelUtils";
import { upsertProjectJson, fetchProjectJson } from "@/lib/supabaseHelpers";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BudgetUploader({ projectId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [budgetData, setBudgetData] = useState([]);
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    loadFromSupabase();
  }, [projectId]);

  const loadFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchProjectJson({
        table: "project_budgets",
        projectId,
      });
      if (error) throw error;
      if (data && data.data) {
        setBudgetData(data.data);
        setRecordId(data.id);
      } else {
        setBudgetData([]);
        setRecordId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load budget data");
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
      // Expect rows to have: item, amount
      const converted = rows.map((r, idx) => ({
        id: r.id || `b-${idx}`,
        item: r.item || r.Item || r.name || `Item ${idx + 1}`,
        amount: Number(r.amount || r.Amount || r.value || 0),
      }));

      const { data, error } = await upsertProjectJson({
        table: "project_budgets",
        projectId,
        jsonData: converted,
        id: replace ? recordId : undefined,
      });
      if (error) throw error;
      toast.success("Budget saved");
      setBudgetData(converted);
      setRecordId(data?.id || recordId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: budgetData.map((b) => b.item),
    datasets: [
      {
        label: "Budget",
        data: budgetData.map((b) => b.amount),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
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
        {budgetData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No budget data to display</p>
        ) : (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm table-auto border-collapse">
                <thead>
                  <tr className="bg-muted text-xs text-muted-foreground">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="p-2 align-top">{b.id}</td>
                      <td className="p-2 align-top">{b.item}</td>
                      <td className="p-2 align-top">{b.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Bar data={chartData} />
          </>
        )}
      </div>
    </div>
  );
}
