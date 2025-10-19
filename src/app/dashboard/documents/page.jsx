'use client';

import { useState, useEffect } from 'react';
import { ProjectSelector, ProjectInfoCard } from "@/components/ProjectSelector";
import { ThemeToggle } from "@/components/theme-toggle";
import supabase from "../../../../lib/supabaseClinet";

export default function DocumentsPage() {
  // Project state
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load projects
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase.from("project").select("*");
      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  // Generate dynamic document data
  useEffect(() => {
    const mockDocuments = [
      {
        id: 1,
        name: 'Structural Drawings - Rev 3',
        category: 'Drawings',
        version: 'v3.0',
        uploadDate: 'Oct 1, 2025',
        uploadedBy: 'Sarah Chen',
        size: '15.2 MB',
        icon: 'red'
      },
      {
        id: 2,
        name: 'MEP Coordination Model',
        category: 'BIM Models',
        version: 'v2.1',
        uploadDate: 'Sep 28, 2025',
        uploadedBy: 'Mike Rodriguez',
        size: '142 MB',
        icon: 'blue'
      },
      {
        id: 3,
        name: 'Site Safety Plan',
        category: 'Safety',
        version: 'v1.2',
        uploadDate: 'Sep 25, 2025',
        uploadedBy: 'John Martinez',
        size: '3.4 MB',
        icon: 'red'
      },
      {
        id: 4,
        name: 'Change Order #007',
        category: 'RFIs & COs',
        version: 'v1.0',
        uploadDate: 'Oct 2, 2025',
        uploadedBy: 'Emily Watson',
        size: '856 KB',
        icon: 'red'
      },
      {
        id: 5,
        name: 'Concrete Test Reports',
        category: 'Testing',
        version: 'v1.0',
        uploadDate: 'Sep 30, 2025',
        uploadedBy: 'David Kim',
        size: '2.1 MB',
        icon: 'red'
      },
      {
        id: 6,
        name: 'Electrical Submittals Package',
        category: 'Submittals',
        version: 'v1.3',
        uploadDate: 'Sep 27, 2025',
        uploadedBy: 'Sarah Chen',
        size: '8.7 MB',
        icon: 'yellow'
      },
      {
        id: 7,
        name: 'Project Schedule - Updated',
        category: 'Schedule',
        version: 'v4.2',
        uploadDate: 'Oct 3, 2025',
        uploadedBy: 'John Martinez',
        size: '1.2 MB',
        icon: 'blue'
      },
      {
        id: 8,
        name: 'Foundation Photos - East Wing',
        category: 'Photos',
        version: 'v1.0',
        uploadDate: 'Oct 2, 2025',
        uploadedBy: 'Mike Rodriguez',
        size: '24.5 MB',
        icon: 'yellow'
      }
    ];

    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
    setIsDataLoaded(true);
  }, []);

  // Filter documents based on search term and category
  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    setFilteredDocuments(filtered);
  }, [searchTerm, selectedCategory, documents]);

  const categories = ['All Categories', 'Drawings', 'BIM Models', 'Safety', 'RFIs & COs', 'Testing', 'Submittals', 'Schedule', 'Photos'];

  const getDocumentIcon = (iconType) => {
    const iconClass = `w-4 h-4 ${
      iconType === 'red' ? 'text-red-500' :
      iconType === 'blue' ? 'text-blue-500' :
      iconType === 'yellow' ? 'text-yellow-500' :
      'text-gray-500'
    }`;
    
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    );
  };

  const handleUploadDocument = () => {
    alert('Upload Document functionality would be implemented here!');
  };

  const handleDownload = (documentName) => {
    alert(`Downloading ${documentName}...`);
  };

  const handleView = (documentName) => {
    alert(`Viewing ${documentName}...`);
  };

  return (
    <div>
      {/* Header Section */}
      {/* Project Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Documents</h1>
          <p className="text-muted-foreground">Centralized repository for drawings, submittals, RFIs, and project documents</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
          <div className="flex-1 lg:flex-none">
            <ProjectSelector
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onProjectCreate={(newProject) => {
                console.log("Project created:", newProject);
              }}
              showCreateButton={true}
              className="w-full lg:w-auto"
            />
          </div>
          <button
            onClick={handleUploadDocument}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden sm:inline">Upload Document</span>
            <span className="sm:hidden">Upload</span>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Project Info */}
      <ProjectInfoCard project={selectedProject} />

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-input rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent w-full sm:w-auto sm:min-w-[180px]"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Document Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getDocumentIcon(document.icon)}
                      <span className="ml-2 text-sm font-medium text-gray-900">{document.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {document.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.uploadedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDownload(document.name)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleView(document.name)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Version Control Section */}
      <div className="mt-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Version Control</h2>
          
          {/* Version Control Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Active Documents</h3>
              <p className="text-3xl font-bold text-gray-800">247</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Archived Versions</h3>
              <p className="text-3xl font-bold text-gray-800">89</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Storage Used</h3>
              <p className="text-3xl font-bold text-gray-800">12.4 GB</p>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Version Control:</span> When uploading a new version of an existing document, the previous version is automatically archived and accessible through the document history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
