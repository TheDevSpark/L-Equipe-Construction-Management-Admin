"use client";
import React, { useState, useMemo } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

export default function ClientGantt({ data }) {
  if (!data || data.length === 0) return <p>No schedule data</p>;

  // Convert to Gantt format
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

  // Pagination logic
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allTasks.length / itemsPerPage);

  const currentTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [allTasks, currentPage]);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // Dynamically set height based on tasks per page
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
      }}
    >
      <div style={{ height: chartHeight }}>
        <Gantt
          tasks={currentTasks}
          viewMode={ViewMode.Week}
          listCellWidth="180px"
          columnWidth={65}
        />
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
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
          ⬅ Previous
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
  );
}
