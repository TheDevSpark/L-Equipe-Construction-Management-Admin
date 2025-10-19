"use client";
import React, { useState, useMemo } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

export default function BudgetGantt({ data }) {
  if (!data || data.length === 0) return <p>No schedule data</p>;

  // 🔹 Convert to Gantt format
  const allTasks = useMemo(
    () =>
      data.map((t, i) => ({
        start: new Date(t.start || new Date()),
        end: new Date(t.end || new Date()),
        name: t.name || `Task ${i + 1}`,
        id: String(i),
        progress: t.progress || 0,
        type: "task",
      })),
    [data]
  );

  // 🔹 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(allTasks.length / itemsPerPage);

  const currentTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [allTasks, currentPage, itemsPerPage]);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handleItemsChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // 🔹 Dynamic chart height
  const chartHeight = Math.max(currentTasks.length * 45 + 100, 300);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#fff",
      }}
    >
      {/* Chart */}
      <div style={{ height: chartHeight }}>
        <Gantt
          tasks={currentTasks}
          viewMode={ViewMode.Week}
          listCellWidth="180px"
          columnWidth={65}
        />
      </div>

      {/* Pagination controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "0.5rem",
        }}
      >
        {/* 🔸 Items per page selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "14px" }}>Rows per page:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsChange}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* 🔸 Page navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: currentPage === 1 ? "#f0f0f0" : "white",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ⬅ Prev
          </button>

          <span style={{ fontSize: "14px" }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: currentPage === totalPages ? "#f0f0f0" : "white",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next ➡
          </button>
        </div>
      </div>
    </div>
  );
}
