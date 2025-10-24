// // "use client";

// // import { useState, useEffect } from "react";
// // import { Button } from "@/components/ui/button";
// // import toast from "react-hot-toast";
// // import { parseExcelFileFirstSheet } from "@/lib/excelUtils";
// // import { upsertProjectJson, fetchProjectJson } from "@/lib/supabaseHelpers";
// // import { Bar } from "react-chartjs-2";
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";

// // ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// // export default function BudgetUploader({ projectId }) {
// //   const [file, setFile] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [budgetData, setBudgetData] = useState([]);
// //   const [recordId, setRecordId] = useState(null);
// //   const [budgetRecord, setBudgetRecord] = useState(null);
// //   const [hasExistingData, setHasExistingData] = useState(false);

// //   useEffect(() => {
// //     if (projectId) {
// //       console.log("Loading budget for project ID:", projectId, "(type:", typeof projectId, ")");
// //       loadFromSupabase();
// //     }
// //   }, [projectId]);

// //   const loadFromSupabase = async () => {
// //     setLoading(true);
// //     try {
// //       console.log("Loading budget for project ID:", projectId);

// //       const { data, error } = await fetchProjectJson({
// //         table: "project_budgets",
// //         projectId,
// //       });

// //       if (error) {
// //         console.error("fetchProjectJson returned error:", error);
// //         throw error;
// //       }

// //       console.log("fetchProjectJson returned data:", data);

// //       setBudgetRecord(data);
// //       setBudgetData(data?.data || []);
// //       setRecordId(data?.id || null);
// //       setHasExistingData(!!(data && data.data && data.data.length > 0));

// //       if (data && data.data && data.data.length > 0) {
// //         console.log("✅ Found existing budget data:", data.data.length, "items");
// //         console.log("Sample budget item:", data.data[0]);
// //         // Don't show toast on initial load, only on manual refresh
// //         if (loading) {
// //           toast.success(`Loaded ${data.data.length} existing budget items`);
// //         }
// //       } else {
// //         console.log("❌ No existing budget data found for project:", projectId);
// //         console.log("Data structure:", data);
// //       }
// //     } catch (err) {
// //       console.error("Load error:", err);
// //       toast.error("Failed to load budget data");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleFile = (e) => setFile(e.target.files?.[0] || null);

// //   const handleUpload = async (replace = false) => {
// //     if (!file) {
// //       toast.error("No file selected");
// //       return;
// //     }
// //     setLoading(true);
// //     try {
// //       const rows = await parseExcelFileFirstSheet(file);
// //       // Expect rows to have: item, amount
// //       const converted = rows.map((r, idx) => ({
// //         id: r.id || `b-${idx}`,
// //         item: r.item || r.Item || r.name || `Item ${idx + 1}`,
// //         amount: Number(r.amount || r.Amount || r.value || 0),
// //       }));

// //       const { data, error } = await upsertProjectJson({
// //         table: "project_budgets",
// //         projectId,
// //         jsonData: converted,
// //         id: replace ? recordId : undefined,
// //       });
// //       if (error) throw error;
// //       toast.success("Budget saved");
// //       setBudgetData(converted);
// //       setRecordId(data?.id || recordId);
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to save budget");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const chartData = {
// //     labels: budgetData.map((b) => b.item),
// //     datasets: [
// //       {
// //         label: "Budget",
// //         data: budgetData.map((b) => b.amount),
// //         backgroundColor: "rgba(54, 162, 235, 0.5)",
// //       },
// //     ],
// //   };

// //   const formatCurrency = (amount) => {
// //     return new Intl.NumberFormat('en-US', {
// //       style: 'currency',
// //       currency: 'USD',
// //     }).format(amount);
// //   };

// //   const totalBudget = budgetData.reduce((sum, item) => sum + (item.amount || 0), 0);

// //   return (
// //     <div className="space-y-6">
// //       {/* HEADER */}
// //       <div className="flex items-center justify-between flex-wrap gap-3">
// //         <div>
// //           <h2 className="text-2xl font-semibold">💰 Project Budget</h2>
// //           <p className="text-sm text-muted-foreground">
// //             {hasExistingData
// //               ? `Existing budget loaded with ${budgetData.length} items. Upload new file to update.`
// //               : "Upload Excel to visualize and manage project budgets."
// //             }
// //           </p>

// //         </div>
// //         <div className="flex flex-wrap items-center gap-2">
// //           <input
// //             type="file"
// //             accept=".xlsx,.xls"
// //             onChange={handleFile}
// //             className="text-sm border-green-600 bg-green-500 text-white rounded-md px-2 w-fit py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
// //           />
// //           <Button onClick={() => handleUpload(false)} disabled={loading}>
// //             {loading ? "Uploading..." : "Upload New"}
// //           </Button>
// //           <Button
// //             onClick={() => handleUpload(true)}
// //             variant="secondary"
// //             disabled={loading}
// //           >
// //             {hasExistingData ? "Replace Existing" : "Update"}
// //           </Button>
// //           <Button onClick={loadFromSupabase} variant="outline">
// //             Refresh
// //           </Button>
// //         </div>
// //       </div>

// //       {/* EXISTING DATA INFO */}

// //       {/* BUDGET SUMMARY */}
// //       {budgetData.length > 0 && (
// //         <div className="bg-card rounded-xl shadow-sm border p-4">
// //           <h3 className="font-semibold text-lg mb-4">📊 Budget Summary</h3>
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //             <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
// //               <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{budgetData.length}</div>
// //               <div className="text-sm text-blue-700 dark:text-blue-300">Total Items</div>
// //             </div>
// //             <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
// //               <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalBudget)}</div>
// //               <div className="text-sm text-green-700 dark:text-green-300">Total Budget</div>
// //             </div>
// //             <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
// //               <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
// //                 {formatCurrency(totalBudget / budgetData.length)}
// //               </div>
// //               <div className="text-sm text-purple-700 dark:text-purple-300">Average per Item</div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* CHART */}
// //       <div className="bg-card rounded-xl shadow-sm border p-4">
// //         {budgetData.length === 0 ? (
// //           <div className="text-center py-8">
// //             <div className="text-4xl mb-4">📊</div>
// //             <p className="text-muted-foreground mb-2">
// //               {hasExistingData
// //                 ? "No budget items found in existing data."
// //                 : "No budget data available for this project."
// //               }
// //             </p>
// //             <p className="text-sm text-muted-foreground">
// //               Upload an Excel file to create your project budget.
// //             </p>
// //           </div>
// //         ) : (
// //           <div>
// //             <div className="mb-4 flex items-center justify-between">
// //               <h3 className="text-lg font-semibold text-foreground">
// //                 📈 Budget Breakdown - {budgetData.length} Items
// //               </h3>
// //               <div className="text-sm text-muted-foreground">
// //                 Interactive Chart
// //               </div>
// //             </div>
// //             <div className="h-[400px] overflow-x-auto border rounded-lg p-4">
// //               <Bar data={chartData} options={{
// //                 responsive: true,
// //                 maintainAspectRatio: false,
// //                 plugins: {
// //                   legend: {
// //                     position: 'bottom',
// //                   },
// //                   tooltip: {
// //                     callbacks: {
// //                       label: function(context) {
// //                         return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
// //                       }
// //                     }
// //                   }
// //                 },
// //                 scales: {
// //                   y: {
// //                     beginAtZero: true,
// //                     ticks: {
// //                       callback: function(value) {
// //                         return formatCurrency(value);
// //                       }
// //                     }
// //                   }
// //                 }
// //               }} />
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {/* BUDGET TABLE */}
// //       {budgetData.length > 0 && (
// //         <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
// //           <div className="p-4 border-b bg-muted/20">
// //             <h3 className="font-medium text-sm text-muted-foreground">
// //               📋 Detailed Budget List ({budgetData.length} items)
// //             </h3>
// //           </div>
// //           <table className="w-full text-sm border-collapse">
// //             <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
// //               <tr>
// //                 <th className="p-3 text-left">ID</th>
// //                 <th className="p-3 text-left">Item</th>
// //                 <th className="p-3 text-left">Amount</th>
// //                 <th className="p-3 text-left">Percentage</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {budgetData.map((b) => (
// //                 <tr key={b.id} className="border-t hover:bg-muted/30">
// //                   <td className="p-3 font-mono text-xs">{b.id}</td>
// //                   <td className="p-3 font-medium">{b.item}</td>
// //                   <td className="p-3 font-semibold">{formatCurrency(b.amount || 0)}</td>
// //                   <td className="p-3">
// //                     <div className="flex items-center gap-2">
// //                       <span className="text-xs">{(totalBudget > 0 ? ((b.amount || 0) / totalBudget * 100) : 0).toFixed(1)}%</span>
// //                       <div className="w-16 bg-muted rounded-full h-2">
// //                         <div
// //                           className="bg-blue-600 h-2 rounded-full"
// //                           style={{ width: `${totalBudget > 0 ? ((b.amount || 0) / totalBudget * 100) : 0}%` }}
// //                         ></div>
// //                       </div>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import toast from "react-hot-toast";
// import { parseExcelFileFirstSheet } from "@/lib/excelUtils";
// import { upsertProjectJson, fetchProjectJson } from "@/lib/supabaseHelpers";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// export default function BudgetUploader({ projectId }) {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [budgetData, setBudgetData] = useState([]);
//   const [recordId, setRecordId] = useState(null);
//   const [budgetRecord, setBudgetRecord] = useState(null);
//   const [hasExistingData, setHasExistingData] = useState(false);

//   useEffect(() => {
//     if (projectId) {
//       console.log("Loading budget for project ID:", projectId);
//       loadFromSupabase();
//     }
//   }, [projectId]);

//   const loadFromSupabase = async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await fetchProjectJson({
//         table: "project_budgets",
//         projectId,
//       });

//       if (error) throw error;

//       setBudgetRecord(data);
//       setBudgetData(data?.data || []);
//       setRecordId(data?.id || null);
//       setHasExistingData(!!(data && data.data && data.data.length > 0));

//       if (data && data.data && data.data.length > 0) {
//         console.log("✅ Found existing budget data:", data.data.length);
//       } else {
//         console.log("❌ No existing budget data found for project:", projectId);
//       }
//     } catch (err) {
//       console.error("Load error:", err);
//       toast.error("Failed to load budget data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFile = (e) => setFile(e.target.files?.[0] || null);

//   const handleUpload = async (replace = false) => {
//     if (!file) {
//       toast.error("No file selected");
//       return;
//     }
//     setLoading(true);
//     try {
//       const rows = await parseExcelFileFirstSheet(file);

//       // 🧠 Convert dynamically to keep all columns
//       const converted = rows.map((r, idx) => {
//         const obj = { id: r.id || `b-${idx}` };
//         for (const key in r) {
//           obj[key.trim()] = r[key];
//         }
//         return obj;
//       });

//       const { data, error } = await upsertProjectJson({
//         table: "project_budgets",
//         projectId,
//         jsonData: converted,
//         id: replace ? recordId : undefined,
//       });
//       if (error) throw error;

//       toast.success("Budget saved");
//       setBudgetData(converted);
//       setRecordId(data?.id || recordId);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save budget");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🧮 Helper for charts (optional)
//   const formatCurrency = (amount) =>
//     new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(Number(amount) || 0);

//   // ✅ Compute total (only if there's a numeric column)
//   const amountKey =
//     budgetData.length > 0
//       ? Object.keys(budgetData[0]).find((k) =>
//           k.toLowerCase().includes("amount")
//         )
//       : null;
//   const totalBudget = amountKey
//     ? budgetData.reduce((sum, item) => sum + (Number(item[amountKey]) || 0), 0)
//     : 0;

//   const chartData =
//     amountKey && budgetData.length > 0
//       ? {
//           labels: budgetData.map(
//             (b) => b["TRADER /VENDOR NAME"] || b.item || b.name
//           ),
//           datasets: [
//             {
//               label: "Amount",
//               data: budgetData.map((b) => Number(b[amountKey]) || 0),
//               backgroundColor: "rgba(54, 162, 235, 0.5)",
//             },
//           ],
//         }
//       : null;

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between flex-wrap gap-3">
//         <div>
//           <h2 className="text-2xl font-semibold">💰 Project Budget</h2>
//           <p className="text-sm text-muted-foreground">
//             {hasExistingData
//               ? `Existing budget loaded with ${budgetData.length} items. Upload new file to update.`
//               : "Upload Excel to visualize and manage project budgets."}
//           </p>
//         </div>
//         <div className="flex flex-wrap items-center gap-2">
//           <input
//             type="file"
//             accept=".xlsx,.xls"
//             onChange={handleFile}
//             className="text-sm border-green-600 bg-green-500 text-white rounded-md px-2 w-fit py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
//           />
//           <Button onClick={() => handleUpload(false)} disabled={loading}>
//             {loading ? "Uploading..." : "Upload New"}
//           </Button>
//           <Button
//             onClick={() => handleUpload(true)}
//             variant="secondary"
//             disabled={loading}
//           >
//             {hasExistingData ? "Replace Existing" : "Update"}
//           </Button>
//           <Button onClick={loadFromSupabase} variant="outline">
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* SUMMARY */}
//       {budgetData.length > 0 && amountKey && (
//         <div className="bg-card rounded-xl shadow-sm border p-4">
//           <h3 className="font-semibold text-lg mb-4">📊 Budget Summary</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
//               <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                 {budgetData.length}
//               </div>
//               <div className="text-sm text-blue-700 dark:text-blue-300">
//                 Total Items
//               </div>
//             </div>
//             <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
//               <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//                 {formatCurrency(totalBudget)}
//               </div>
//               <div className="text-sm text-green-700 dark:text-green-300">
//                 Total Budget
//               </div>
//             </div>
//             <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
//               <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//                 {formatCurrency(totalBudget / budgetData.length)}
//               </div>
//               <div className="text-sm text-purple-700 dark:text-purple-300">
//                 Average per Item
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CHART */}
//       <div className="bg-card rounded-xl shadow-sm border p-4">
//         {chartData ? (
//           <div>
//             <div className="mb-4 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-foreground">
//                 📈 Budget Breakdown
//               </h3>
//               <div className="text-sm text-muted-foreground">
//                 Interactive Chart
//               </div>
//             </div>
//             <div className="h-[400px] overflow-x-auto border rounded-lg p-4">
//               <Bar
//                 data={chartData}
//                 options={{
//                   responsive: true,
//                   maintainAspectRatio: false,
//                   plugins: {
//                     legend: { position: "bottom" },
//                     tooltip: {
//                       callbacks: {
//                         label: (ctx) =>
//                           `${ctx.dataset.label}: ${formatCurrency(
//                             ctx.parsed.y
//                           )}`,
//                       },
//                     },
//                   },
//                   scales: {
//                     y: {
//                       beginAtZero: true,
//                       ticks: {
//                         callback: (val) => formatCurrency(val),
//                       },
//                     },
//                   },
//                 }}
//               />
//             </div>
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <div className="text-4xl mb-4">📊</div>
//             <p className="text-muted-foreground mb-2">
//               No numeric data found for chart.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* TABLE */}
//       {budgetData.length > 0 && (
//         <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
//           <div className="p-4 border-b bg-muted/20">
//             <h3 className="font-medium text-sm text-muted-foreground">
//               📋 Detailed Budget List ({budgetData.length} items)
//             </h3>
//           </div>
//           <table className="w-full text-sm border-collapse">
//             <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
//               <tr>
//                 {Object.keys(budgetData[0]).map((key) => (
//                   <th key={key} className="p-3 text-left">
//                     {key}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {budgetData.map((row, i) => (
//                 <tr key={i} className="border-t hover:bg-muted/30">
//                   {Object.values(row).map((value, j) => (
//                     <td key={j} className="p-3 whitespace-nowrap">
//                       {String(value)}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
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
  const [budgetRecord, setBudgetRecord] = useState(null);
  const [hasExistingData, setHasExistingData] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadFromSupabase();
    }
  }, [projectId]);

  const loadFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchProjectJson({
        table: "project_budgets",
        projectId,
      });

      if (error) throw error;

      setBudgetRecord(data);
      setBudgetData(data?.data || []);
      setRecordId(data?.id || null);
      setHasExistingData(!!(data && data.data && data.data.length > 0));
    } catch (err) {
      console.error("Load error:", err);
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

      // 🧠 Find the real header row (the one containing 'TRADER /VENDOR NAME')
      let headerIndex = rows.findIndex((r) =>
        Object.values(r).some((v) =>
          String(v || "")
            .toUpperCase()
            .includes("TRADER")
        )
      );

      if (headerIndex === -1) headerIndex = 0;

      const headerRow = rows[headerIndex];
      const headers = Object.values(headerRow)
        .map((h) => String(h || "").trim())
        .filter((h) => h && !h.startsWith("__EMPTY"));

      // 🧹 Get only the data rows after the header row
      const dataRows = rows.slice(headerIndex + 1);

      // 🔄 Convert to structured JSON
      const converted = dataRows.map((r, idx) => {
        const obj = { id: `b-${idx}` };
        const values = Object.values(r);
        headers.forEach((h, i) => {
          const value = values[i];
          obj[h] =
            value === null ||
            value === undefined ||
            value === "" ||
            value === "null"
              ? "--"
              : value;
        });
        return obj;
      });

      // 🚀 Upload to Supabase
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
      toast.error("Failed to process file");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount) || 0);

  // 🧮 Find a numeric column automatically (for chart)
  const amountKey =
    budgetData.length > 0
      ? Object.keys(budgetData[0]).find((k) =>
          k.toLowerCase().includes("amount")
        )
      : null;

  const totalBudget = amountKey
    ? budgetData.reduce((sum, item) => sum + (Number(item[amountKey]) || 0), 0)
    : 0;

  const chartData =
    amountKey && budgetData.length > 0
      ? {
          labels: budgetData.map(
            (b) =>
              b["TRADER /VENDOR NAME"] ||
              b["Vendor Name"] ||
              b.item ||
              b.name ||
              `Item ${b.id}`
          ),
          datasets: [
            {
              label: amountKey,
              data: budgetData.map((b) => Number(b[amountKey]) || 0),
              backgroundColor: "rgba(54, 162, 235, 0.5)",
            },
          ],
        }
      : null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold">💰 Project Budget</h2>
          <p className="text-sm text-muted-foreground">
            {hasExistingData
              ? `Existing budget loaded with ${budgetData.length} items. Upload new file to update.`
              : "Upload Excel to visualize and manage project budgets."}
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

      {/* TABLE */}
      {budgetData.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
          {/* <div className="p-4 border-b bg-muted/20">
            <h3 className="font-medium text-sm text-muted-foreground">
              📋 Detailed Budget List ({budgetData.length} items)
            </h3>
          </div> */}
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
              <tr>
                {Object.keys(budgetData[0]).map((key) => (
                  <th key={key} className="p-3 text-left">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgetData.map((row, i) => (
                <tr key={i} className="border-t hover:bg-muted/30">
                  {Object.values(row).map((value, j) => (
                    <td key={j} className="p-3 whitespace-nowrap">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CHART (optional) */}
      {chartData && (
        <div className="bg-card rounded-xl shadow-sm border p-4">
          <div className="h-[400px] overflow-x-auto border rounded-lg p-4">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (val) => formatCurrency(val),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
