import React from 'react'
import { useJobs, useCandidates, useAssessments, useUI } from '../../hooks'

// Example component demonstrating Zustand store usage
export const StoreExample: React.FC = () => {
  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    searchJobs,
    filterByStatus,
    clearFilters: clearJobFilters
  } = useJobs()

  const {
    candidates,
    selectedCandidate,
    loading: candidatesLoading,
    selectCandidate,
    searchCandidates,
    getStageCounts
  } = useCandidates()

  const {
    currentAssessment,
    loading: assessmentsLoading,
    setCurrentAssessment,
    hasAssessment
  } = useAssessments()

  const {
    sidebarOpen,
    theme,
    notifications,
    toggleSidebar,
    toggleTheme,
    showSuccess,
    showError,
    removeNotification
  } = useUI()

  const stageCounts = getStageCounts()

  const handleShowSuccessNotification = () => {
    showSuccess('Success!', 'This is a success notification')
  }

  const handleShowErrorNotification = () => {
    showError('Error!', 'This is an error notification')
  }

  const handleJobSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchJobs(e.target.value)
  }

  const handleCandidateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchCandidates(e.target.value)
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Zustand Store Examples</h1>
      
      {/* UI Store Example */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">UI Store</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            </button>
            <span>Sidebar is {sidebarOpen ? 'open' : 'closed'}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
            </button>
            <span>Current theme: {theme}</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleShowSuccessNotification}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Show Success
            </button>
            <button
              onClick={handleShowErrorNotification}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Show Error
            </button>
          </div>
          
          {notifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Notifications:</h3>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded border-l-4 ${
                    notification.type === 'success' ? 'bg-green-50 border-green-400' :
                    notification.type === 'error' ? 'bg-red-50 border-red-400' :
                    notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      {notification.message && (
                        <p className="text-sm text-gray-600">{notification.message}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jobs Store Example */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Jobs Store</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search jobs..."
              onChange={handleJobSearch}
              className="px-3 py-2 border rounded flex-1"
            />
            <button
              onClick={() => filterByStatus('active')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Active Only
            </button>
            <button
              onClick={() => filterByStatus('archived')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Archived Only
            </button>
            <button
              onClick={clearJobFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Clear Filters
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            {jobsLoading ? 'Loading jobs...' : `${jobs.length} jobs loaded`}
            {jobsError && <span className="text-red-600 ml-2">Error: {jobsError}</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.slice(0, 6).map(job => (
              <div key={job.id} className="border rounded p-4">
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600">Status: {job.status}</p>
                <p className="text-sm text-gray-600">Tags: {job.tags.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidates Store Example */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Candidates Store</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search candidates..."
            onChange={handleCandidateSearch}
            className="px-3 py-2 border rounded w-full"
          />
          
          <div className="text-sm text-gray-600">
            {candidatesLoading ? 'Loading candidates...' : `${candidates.length} candidates loaded`}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stageCounts).map(([stage, count]) => (
              <div key={stage} className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{stage}</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.slice(0, 4).map(candidate => (
              <div
                key={candidate.id}
                className={`border rounded p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedCandidate?.id === candidate.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => selectCandidate(candidate)}
              >
                <h3 className="font-medium">{candidate.name}</h3>
                <p className="text-sm text-gray-600">{candidate.email}</p>
                <p className="text-sm text-gray-600">Stage: {candidate.stage}</p>
              </div>
            ))}
          </div>
          
          {selectedCandidate && (
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-medium">Selected Candidate:</h3>
              <p>{selectedCandidate.name} ({selectedCandidate.email})</p>
              <p>Current stage: {selectedCandidate.stage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Assessments Store Example */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Assessments Store</h2>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {assessmentsLoading ? 'Loading assessments...' : 'Assessments ready'}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentAssessment({
                id: 'demo-assessment',
                jobId: 'demo-job',
                title: 'Demo Assessment',
                sections: [],
                createdAt: new Date(),
                updatedAt: new Date()
              })}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Set Demo Assessment
            </button>
            <button
              onClick={() => setCurrentAssessment(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Assessment
            </button>
          </div>
          
          {currentAssessment && (
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-medium">Current Assessment:</h3>
              <p>{currentAssessment.title}</p>
              <p className="text-sm text-gray-600">Job ID: {currentAssessment.jobId}</p>
              <p className="text-sm text-gray-600">
                Has assessment for demo-job: {hasAssessment('demo-job') ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}