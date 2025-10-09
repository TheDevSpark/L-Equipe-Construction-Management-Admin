'use client';

import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [reportData, setReportData] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Generate dynamic report data
  useEffect(() => {
    setReportData({
      projectInfo: {
        name: 'Downtown Office Complex',
        projectNumber: '2025-DOC-001',
        reportPeriod: 'Sep 27 - Oct 3, 2025',
        company: 'ProBuild Construction LLC',
        address: '123 Builder Ave, Cityville, ST 12345'
      },
      metrics: {
        overallProgress: 68,
        budgetStatus: 2300000,
        activeWorkers: 45,
        openItems: 12
      },
      accomplishments: [
        'Foundation pour completed on east wing - passed inspection',
        'Steel delivery received and stored on-site',
        'MEP rough-in inspection approved for Level 2',
        'Site drainage improvements completed ahead of schedule'
      ],
      issues: [
        {
          priority: 'Medium',
          description: 'Underground utilities work at risk due to unforeseen conflicts',
          color: 'orange'
        },
        {
          priority: 'High',
          description: 'Steel delivery delayed by 3 days - may impact erection schedule',
          color: 'red'
        }
      ],
      dailyReports: [
        {
          date: 'Oct 3, 2025',
          weather: 'Sunny',
          temperature: '72°F',
          description: 'Foundation work completed. Steel erection began.',
          crewSize: 48
        },
        {
          date: 'Oct 2, 2025',
          weather: 'Partly Cloudy',
          temperature: '68°F',
          description: 'Concrete pour completed successfully.',
          crewSize: 45
        },
        {
          date: 'Oct 1, 2025',
          weather: 'Light Rain',
          temperature: '65°F',
          description: 'Rain delayed exterior work. Interior work continued.',
          crewSize: 42
        }
      ],
      budgetData: {
        totalBudget: 4230000,
        committed: 4250000,
        actualSpent: 2540000,
        variance: 5000
      },
      scheduleData: {
        totalTasks: 87,
        completedTasks: 45,
        inProgressTasks: 25,
        delayedTasks: 3
      },
      punchListData: {
        totalItems: 24,
        openItems: 12,
        inProgressItems: 8,
        closedItems: 4
      }
    });

    setIsDataLoaded(true);
  }, []);

  // Handle export functions
  const handleExportPDF = (reportType) => {
    console.log(`Exporting ${reportType} as PDF...`);
    // Here you would implement actual PDF export functionality
    alert(`${reportType} PDF export initiated!`);
  };

  const handleExportExcel = (reportType) => {
    console.log(`Exporting ${reportType} as Excel...`);
    // Here you would implement actual Excel export functionality
    alert(`${reportType} Excel export initiated!`);
  };

  const handlePreviewReport = (reportType) => {
    setSelectedReport(reportType);
    setShowPreview(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const reportTypes = [
    {
      id: 'daily',
      title: 'Daily Report Summary',
      description: 'Comprehensive daily activities, weather, crew count, and progress',
      icon: '📄',
      color: 'blue',
      data: reportData.dailyReports
    },
    {
      id: 'budget',
      title: 'Budget Status Report',
      description: 'Detailed financial breakdown with variance analysis',
      icon: '💰',
      color: 'green',
      data: reportData.budgetData
    },
    {
      id: 'schedule',
      title: 'Schedule Report',
      description: 'Full project schedule with milestones and critical path',
      icon: '📅',
      color: 'purple',
      data: reportData.scheduleData
    },
    {
      id: 'teams',
      title: 'Teams Report',
      description: 'Complete Teams with photos and status updates',
      icon: '✅',
      color: 'orange',
      data: reportData.punchListData
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Exporting</h1>
        <p className="text-gray-600 mt-1">Generate and export project reports in multiple formats</p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            {/* Report Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                report.color === 'blue' ? 'bg-blue-100' :
                report.color === 'green' ? 'bg-green-100' :
                report.color === 'purple' ? 'bg-purple-100' :
                'bg-orange-100'
              }`}>
                <span className="text-2xl">{report.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{report.title}</h3>
                <p className="text-sm text-gray-600">{report.description}</p>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleExportPDF(report.title)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => handleExportExcel(report.title)}
                className="flex-1 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Excel</span>
              </button>
            </div>

            {/* Preview Button */}
            <button
              onClick={() => handlePreviewReport(report.id)}
              className="w-full mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Preview Report →
            </button>
          </div>
        ))}
      </div>

      {/* Report Preview Section */}
      <div className="mt-12">
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Report Preview - Weekly Summary</h2>
          
          {/* Project Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{reportData.projectInfo?.name}</h1>
              <p className="text-gray-600">Project #: {reportData.projectInfo?.projectNumber}</p>
              <p className="text-gray-600">Report Period: {reportData.projectInfo?.reportPeriod}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-800">{reportData.projectInfo?.company}</p>
              <p className="text-sm text-gray-600">{reportData.projectInfo?.address}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Overall Progress</h3>
              <p className="text-2xl font-bold text-gray-800">{reportData.metrics?.overallProgress}%</p>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">On Track</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Budget Status</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(reportData.metrics?.budgetStatus)}</p>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">Under Budget</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Active Workers</h3>
              <p className="text-2xl font-bold text-gray-800">{reportData.metrics?.activeWorkers}</p>
              <p className="text-xs text-gray-500">Avg this week</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Open Items</h3>
              <p className="text-2xl font-bold text-gray-800">{reportData.metrics?.openItems}</p>
              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">Attention</span>
            </div>
          </div>

          {/* Key Accomplishments */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Accomplishments This Week</h3>
            <ul className="space-y-2">
              {reportData.accomplishments?.map((accomplishment, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{accomplishment}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Issues & Concerns */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Issues & Concerns</h3>
            <ul className="space-y-3">
              {reportData.issues?.map((issue, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    issue.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {issue.priority}
                  </span>
                  <span className="text-gray-700">{issue.description}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Report</span>
            </button>
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email to Team</span>
            </button>
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {showPreview && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Report Preview - {reportTypes.find(r => r.id === selectedReport)?.title}
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Project Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{reportData.projectInfo?.name}</h1>
                  <p className="text-gray-600">Project #: {reportData.projectInfo?.projectNumber}</p>
                  <p className="text-gray-600">Report Period: {reportData.projectInfo?.reportPeriod}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">{reportData.projectInfo?.company}</p>
                  <p className="text-sm text-gray-600">{reportData.projectInfo?.address}</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Overall Progress</h3>
                  <p className="text-2xl font-bold text-gray-800">{reportData.metrics?.overallProgress}%</p>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">On Track</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Budget Status</h3>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(reportData.metrics?.budgetStatus)}</p>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">Under Budget</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Active Workers</h3>
                  <p className="text-2xl font-bold text-gray-800">{reportData.metrics?.activeWorkers}</p>
                  <p className="text-xs text-gray-500">Avg this week</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Open Items</h3>
                  <p className="text-2xl font-bold text-gray-800">{reportData.metrics?.openItems}</p>
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">Attention</span>
                </div>
              </div>

              {/* Report Content Based on Type */}
              {selectedReport === 'daily' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Daily Reports</h3>
                    <div className="space-y-3">
                      {reportData.dailyReports?.map((report, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">{report.date}</h4>
                              <p className="text-gray-600">{report.description}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {report.weather}, {report.temperature} • {report.crewSize} crew
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === 'budget' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Budget Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Total Budget</h4>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(reportData.budgetData?.totalBudget)}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Actual Spent</h4>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(reportData.budgetData?.actualSpent)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Schedule Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Total Tasks</h4>
                        <p className="text-xl font-bold text-purple-600">{reportData.scheduleData?.totalTasks}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Completed</h4>
                        <p className="text-xl font-bold text-green-600">{reportData.scheduleData?.completedTasks}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === 'punchlist' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Team Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Total Items</h4>
                        <p className="text-xl font-bold text-orange-600">{reportData.punchListData?.totalItems}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Open Items</h4>
                        <p className="text-xl font-bold text-red-600">{reportData.punchListData?.openItems}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Accomplishments */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Accomplishments This Week</h3>
                <ul className="space-y-2">
                  {reportData.accomplishments?.map((accomplishment, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{accomplishment}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Issues & Concerns */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Issues & Concerns</h3>
                <ul className="space-y-3">
                  {reportData.issues?.map((issue, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {issue.priority}
                      </span>
                      <span className="text-gray-700">{issue.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Report</span>
              </button>
              <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email to Team</span>
              </button>
              <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
