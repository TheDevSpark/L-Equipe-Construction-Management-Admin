'use client';

import { useState, useEffect } from 'react';

export default function WeeklySummaryPage() {
  const [reportData, setReportData] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Generate dynamic report data
  useEffect(() => {
    setReportData({
      projectInfo: {
        name: 'Downtown Office Complex',
        projectNumber: '2025-DOC-001',
        reportPeriod: 'Sep 27 - Oct 3, 2025',
        company: 'ProBuild Construction LLC',
        address: '123 Builder Ave',
        city: 'Cityville, ST 12345'
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
      ]
    });

    setIsDataLoaded(true);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleEmailToTeam = () => {
    alert('Email to Team functionality would be implemented here!');
  };

  const handleDownloadPDF = () => {
    alert('Download PDF functionality would be implemented here!');
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{reportData.projectInfo?.name}</h1>
            <p className="text-gray-600">Project #: {reportData.projectInfo?.projectNumber}</p>
            <p className="text-gray-600">Report Period: {reportData.projectInfo?.reportPeriod}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-800">{reportData.projectInfo?.company}</p>
            <p className="text-sm text-gray-600">{reportData.projectInfo?.address}</p>
            <p className="text-sm text-gray-600">{reportData.projectInfo?.city}</p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Overall Progress</h3>
            <p className="text-3xl font-bold text-gray-800 mb-2">{reportData.metrics?.overallProgress}%</p>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">On Track</span>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Budget Status</h3>
            <p className="text-3xl font-bold text-gray-800 mb-2">{formatCurrency(reportData.metrics?.budgetStatus)}</p>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Under Budget</span>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Workers</h3>
            <p className="text-3xl font-bold text-gray-800 mb-2">{reportData.metrics?.activeWorkers}</p>
            <p className="text-xs text-gray-500">Avg this week</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Open Items</h3>
            <p className="text-3xl font-bold text-gray-800 mb-2">{reportData.metrics?.openItems}</p>
            <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Attention</span>
          </div>
        </div>

        {/* Key Accomplishments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Key Accomplishments This Week</h2>
          <ul className="space-y-3">
            {reportData.accomplishments?.map((accomplishment, index) => (
              <li key={index} className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{accomplishment}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Issues & Concerns */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Issues & Concerns</h2>
          <ul className="space-y-4">
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
        <div className="flex justify-end space-x-4">
          <button
            onClick={handlePrintReport}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Report</span>
          </button>
          
          <button
            onClick={handleEmailToTeam}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email to Team</span>
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
