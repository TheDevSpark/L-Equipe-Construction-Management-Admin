'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function BudgetPage() {
  const [budgetMetrics, setBudgetMetrics] = useState({});
  const [budgetLineItems, setBudgetLineItems] = useState([]);
  const [changeOrders, setChangeOrders] = useState([]);
  const [budgetChartData, setBudgetChartData] = useState({});
  const [pieChartData, setPieChartData] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Generate dynamic budget data
  useEffect(() => {
    // Budget Metrics
    setBudgetMetrics({
      totalBudget: 4230000,
      committed: 4250000,
      actualSpent: 2540000,
      variance: 5000
    });

    // Budget Line Items
    setBudgetLineItems([
      {
        category: 'Site Work & Earthwork',
        planned: 450000,
        committed: 445000,
        actual: 425000,
        variance: 20000,
        percentComplete: 85
      },
      {
        category: 'Foundation & Concrete',
        planned: 380000,
        committed: 375000,
        actual: 360000,
        variance: 15000,
        percentComplete: 78
      },
      {
        category: 'Structural Steel',
        planned: 650000,
        committed: 655000,
        actual: 620000,
        variance: 35000,
        percentComplete: 82
      },
      {
        category: 'MEP Systems',
        planned: 1200000,
        committed: 1180000,
        actual: 800000,
        variance: 380000,
        percentComplete: 65
      },
      {
        category: 'Interior Finishes',
        planned: 350000,
        committed: 345000,
        actual: 280000,
        variance: 65000,
        percentComplete: 70
      },
      {
        category: 'Exterior Envelope',
        planned: 400000,
        committed: 395000,
        actual: 320000,
        variance: 75000,
        percentComplete: 75
      }
    ]);

    // Change Orders
    setChangeOrders([
      {
        coNumber: 'CO-007',
        description: 'Additional steel reinforcement - Foundation',
        amount: 15000,
        status: 'Approved',
        date: 'Oct 1, 2025',
        approvedBy: "Owner's Rep"
      },
      {
        coNumber: 'CO-006',
        description: 'Upgraded HVAC system specifications',
        amount: 25000,
        status: 'Pending',
        date: 'Sep 28, 2025',
        approvedBy: 'Project Manager'
      },
      {
        coNumber: 'CO-005',
        description: 'Additional electrical outlets in conference rooms',
        amount: 8500,
        status: 'Approved',
        date: 'Sep 25, 2025',
        approvedBy: "Owner's Rep"
      },
      {
        coNumber: 'CO-004',
        description: 'Premium flooring material upgrade',
        amount: 18000,
        status: 'Rejected',
        date: 'Sep 22, 2025',
        approvedBy: 'Budget Committee'
      },
      {
        coNumber: 'CO-003',
        description: 'Additional parking lot lighting',
        amount: 12000,
        status: 'Approved',
        date: 'Sep 20, 2025',
        approvedBy: "Owner's Rep"
      }
    ]);

    // Budget vs Actual Chart Data
    setBudgetChartData({
      labels: ['Site Work & Earthwork', 'Foundation & Concrete', 'Structural Steel', 'MEP Systems', 'Interior Finishes', 'Exterior Envelope'],
      datasets: [
        {
          label: 'Planned',
          data: [450000, 380000, 650000, 1200000, 350000, 400000],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
        {
          label: 'Actual',
          data: [425000, 360000, 620000, 800000, 280000, 320000],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
      ],
    });

    // Pie Chart Data
    setPieChartData({
      labels: ['MEP', 'Steel', 'Foundation', 'Finishes', 'Site Work', 'Envelope'],
      datasets: [
        {
          data: [29, 19, 16, 14, 11, 11],
          backgroundColor: [
            'rgba(147, 51, 234, 0.8)', // Purple
            'rgba(249, 115, 22, 0.8)', // Orange
            'rgba(34, 197, 94, 0.8)',  // Green
            'rgba(236, 72, 153, 0.8)', // Pink
            'rgba(59, 130, 246, 0.8)', // Blue
            'rgba(6, 182, 212, 0.8)',  // Cyan
          ],
          borderColor: [
            'rgba(147, 51, 234, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(6, 182, 212, 1)',
          ],
          borderWidth: 2,
        },
      ],
    });

    setIsDataLoaded(true);
  }, []);

  // Chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Budget vs Actual by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + (value / 1000) + 'K';
          }
        }
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Budget Distribution',
      },
    },
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = budgetLineItems.reduce((acc, item) => {
      acc.planned += item.planned;
      acc.committed += item.committed;
      acc.actual += item.actual;
      acc.variance += item.variance;
      return acc;
    }, { planned: 0, committed: 0, actual: 0, variance: 0 });
    return totals;
  };

  const totals = calculateTotals();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budget & Financials</h1>
          <p className="text-gray-600 mt-1">Track costs, commitments, and change orders.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export Report</span>
        </button>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(budgetMetrics.totalBudget)}</p>
            </div>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Committed</h3>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(budgetMetrics.committed)}</p>
            </div>
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Actual Spent</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(budgetMetrics.actualSpent)}</p>
            </div>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Variance</h3>
              <p className="text-2xl font-bold text-green-600">+{formatCurrency(budgetMetrics.variance)}</p>
              <p className="text-xs text-green-600">0.12% under budget</p>
            </div>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Budget vs Actual Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="h-80">
            {isDataLoaded && budgetChartData.labels ? (
              <Bar data={budgetChartData} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading chart...
              </div>
            )}
          </div>
        </div>

        {/* Budget Distribution Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="h-80">
            {isDataLoaded && pieChartData.labels ? (
              <Doughnut data={pieChartData} options={pieChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading chart...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Line Items Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Planned</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Committed</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Actual</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Variance</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">% Complete</th>
              </tr>
            </thead>
            <tbody>
              {budgetLineItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{item.category}</td>
                  <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(item.planned)}</td>
                  <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(item.committed)}</td>
                  <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(item.actual)}</td>
                  <td className={`py-3 px-4 text-right font-medium ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-800">{item.percentComplete}%</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="py-3 px-4 text-gray-800">Total</td>
                <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(totals.planned)}</td>
                <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(totals.committed)}</td>
                <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(totals.actual)}</td>
                <td className={`py-3 px-4 text-right font-medium ${totals.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totals.variance >= 0 ? '+' : ''}{formatCurrency(totals.variance)}
                </td>
                <td className="py-3 px-4 text-right text-gray-800">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Change Orders</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Change Order</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">CO Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {changeOrders.map((order, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800 font-medium">{order.coNumber}</td>
                  <td className="py-3 px-4 text-gray-800">{order.description}</td>
                  <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(order.amount)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800">{order.date}</td>
                  <td className="py-3 px-4 text-gray-800">{order.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
