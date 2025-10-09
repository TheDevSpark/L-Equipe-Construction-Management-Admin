'use client';

import { useState, useEffect } from 'react';

export default function PunchListPage() {
  const [punchListItems, setPunchListItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Generate dynamic punch list data
  useEffect(() => {
    const mockData = [
      {
        id: 'PI-045',
        priority: 'Low',
        status: 'Open',
        location: 'Building A - Level 2, Room 204',
        description: 'Outlet cover plate missing in conference room.',
        trade: 'Electrical',
        assignedTo: 'Johnson Electric',
        dueDate: 'Oct 1, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=300&fit=crop',
        priorityColor: 'gray',
        statusColor: 'red'
      },
      {
        id: 'PI-044',
        priority: 'Medium',
        status: 'In Progress',
        location: 'Building B - Level 1, Lobby',
        description: 'Tile grout needs repair - 3 locations.',
        trade: 'Flooring',
        assignedTo: 'Premier Flooring',
        dueDate: 'Sep 30, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
        priorityColor: 'yellow',
        statusColor: 'orange'
      },
      {
        id: 'PI-043',
        priority: 'Low',
        status: 'Closed',
        location: 'Building A - Level 3, East Corridor',
        description: 'Touch-up required on wall near elevator.',
        trade: 'Painting',
        assignedTo: 'Metro Paint Co.',
        dueDate: 'Sep 28, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop',
        priorityColor: 'gray',
        statusColor: 'green'
      },
      {
        id: 'PI-042',
        priority: 'High',
        status: 'In Progress',
        location: 'Building A - Mechanical Room',
        description: 'Ductwork insulation incomplete.',
        trade: 'HVAC',
        assignedTo: 'Climate Control Systems',
        dueDate: 'Sep 27, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop',
        priorityColor: 'red',
        statusColor: 'orange'
      },
      {
        id: 'PI-041',
        priority: 'Medium',
        status: 'Open',
        location: 'Building B - Level 2, Restroom',
        description: 'Faucet dripping - requires washer replacement.',
        trade: 'Plumbing',
        assignedTo: 'Johnson Plumbing',
        dueDate: 'Sep 26, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop',
        priorityColor: 'yellow',
        statusColor: 'red'
      },
      {
        id: 'PI-040',
        priority: 'Low',
        status: 'Closed',
        location: 'Building A - Level 1, Entry',
        description: 'Door closer adjustment needed.',
        trade: 'Doors/Hardware',
        assignedTo: 'Metro Hardware',
        dueDate: 'Sep 25, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=300&fit=crop',
        priorityColor: 'gray',
        statusColor: 'green'
      }
    ];

    setPunchListItems(mockData);
    setFilteredItems(mockData);
    setIsDataLoaded(true);
  }, []);

  // Filter items based on search and status
  useEffect(() => {
    let filtered = punchListItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'All Statuses') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  }, [searchTerm, statusFilter, punchListItems]);

  // Get status counts
  const getStatusCounts = () => {
    const counts = {
      'Open': 0,
      'In Progress': 0,
      'Closed': 0
    };

    punchListItems.forEach(item => {
      counts[item.status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Handle status change
  const handleStatusChange = (itemId, newStatus) => {
    setPunchListItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  // Get priority color classes
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color classes
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
          <p className="text-gray-600 mt-1">Track and manage project deficiencies and completion items.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Item</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Open Items</h3>
              <p className="text-2xl font-bold text-red-600">{statusCounts['Open']}</p>
            </div>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">In Progress</h3>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts['In Progress']}</p>
            </div>
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Closed</h3>
              <p className="text-2xl font-bold text-green-600">{statusCounts['Closed']}</p>
            </div>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by location or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Punch List Items Grid */}
      {isDataLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex space-x-4">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.description}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800">{item.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-1 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{item.location}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-3">{item.description}</p>

                  {/* Details */}
                  <div className="space-y-1 mb-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">Trade:</span>
                      <span className="ml-1 text-gray-800">{item.trade}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">Assigned:</span>
                      <span className="ml-1 text-gray-800">{item.assignedTo}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">Due:</span>
                      <span className="ml-1 text-gray-800">{item.dueDate}</span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex justify-end">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`px-3 py-1 rounded text-xs font-medium border-0 ${getStatusColor(item.status)}`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading Teams items...</div>
        </div>
      )}

      {/* No Results */}
      {isDataLoaded && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
