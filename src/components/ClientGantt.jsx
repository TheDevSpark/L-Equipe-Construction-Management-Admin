"use client";
import React, { useState, useMemo } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

// ✅ Helper to convert Excel serial date to JS Date
function excelDateToJSDate(serial) {
  if (typeof serial !== "number") return new Date(serial);
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  return dateInfo;
}

export default function ClientGantt({ data }) {
  if (!data || data.length === 0) return <p>No schedule data</p>;

  // Convert to Gantt format
  const allTasks = useMemo(
    () =>
      data.map((t, i) => {
        const start = t.start ? excelDateToJSDate(t.start) : new Date();
        const end = t.end ? excelDateToJSDate(t.end) : new Date();

        return {
          start,
          end,
          name: t.name || `Task ${i + 1}`,
          id: String(i),
          progress: t.progress || 0,
          type: "task",
        };
      }),
    [data]
  );

  // Set height based on all tasks
  const chartHeight = Math.max(allTasks.length * 45 + 100, 600); // Increased minimum height
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    const elem = document.getElementById("gantt-container");
    if (!document.fullscreenElement) {
      elem?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    // Get the current scroll position
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    // Temporarily make the container full width and height for printing
    const ganttContainer = document.getElementById("gantt-container");
    const originalStyles = {
      width: ganttContainer.style.width,
      height: ganttContainer.style.height,
      overflow: ganttContainer.style.overflow,
      padding: ganttContainer.style.padding,
      border: ganttContainer.style.border,
      borderRadius: ganttContainer.style.borderRadius,
    };

    // Apply print styles
    ganttContainer.style.width = '100%';
    ganttContainer.style.height = 'auto';
    ganttContainer.style.overflow = 'visible';
    ganttContainer.style.padding = '0';
    ganttContainer.style.border = 'none';
    ganttContainer.style.borderRadius = '0';

    // Get the Gantt chart container and adjust its styles
    const ganttChart = ganttContainer.querySelector('.gantt-container');
    if (ganttChart) {
      ganttChart.style.height = 'auto';
      ganttChart.style.overflow = 'visible';
      ganttChart.style.width = '100%';
    }

    // Create print window
    const newWindow = window.open('', '_blank');
    
    // Add print styles
    newWindow.document.write(`
      <html>
        <head>
          <title>Project Gantt Chart</title>
          <link rel="stylesheet" href="https://unpkg.com/gantt-task-react/dist/index.css" />
          <style>
            @page { 
              size: auto;  /* auto is the initial value */
              margin: 0mm; /* this affects the margin in the printer settings */
            }
            body { 
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .gantt-container {
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              transform: none !important;
            }
            .gantt-task-content {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .gantt-task-list-item {
              page-break-inside: avoid;
            }
            @media print {
              .no-print {
                display: none !important;
              }
              .gantt-container {
                overflow: visible !important;
                height: auto !important;
              }
              .gantt-vertical-scroll {
                overflow: visible !important;
                height: auto !important;
              }
              .gantt-horizontal-scroll {
                overflow: visible !important;
                width: 100% !important;
              }
              .gantt-task-list {
                width: 100% !important;
              }
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; overflow: visible;">
            ${ganttContainer.outerHTML}
          </div>
          <script>
            // Wait for fonts and images to load
            window.onload = function() {
              // Set a small delay to ensure everything is rendered
              setTimeout(() => {
                window.print();
                // Close the window after printing
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    // Close the document to finish loading
    newWindow.document.close();
    
    // Restore original styles after a delay
    setTimeout(() => {
      if (ganttContainer) {
        Object.assign(ganttContainer.style, originalStyles);
      }
      if (ganttChart) {
        ganttChart.style.height = '';
        ganttChart.style.overflow = '';
        ganttChart.style.width = '';
      }
      window.scrollTo(scrollX, scrollY);
    }, 1000);
  };

  return (
    <div
      id="gantt-container"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "white",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <h4 style={{ fontSize: "16px", fontWeight: "600" }}>📊 Gantt Chart</h4>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleFullscreen}
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div 
        style={{ 
          height: '70vh',
          background: "white",
          overflowY: 'auto',
          overflowX: 'auto',
          border: '1px solid #eee',
          borderRadius: '4px',
          position: 'relative',
          width: '100%',
          minWidth: 'fit-content'
        }}
        className="gantt-print-container"
      >
        <Gantt
          tasks={allTasks}
          viewMode={ViewMode.Week}
          listCellWidth="180px"
          columnWidth={65}
          barFill={60}
          barCornerRadius={4}
          rowHeight={45}
        />
      </div>
    </div>
  );
}
