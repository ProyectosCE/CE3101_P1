import React, { useState } from 'react'
import { FaDownload, FaCheck, FaTimes } from 'react-icons/fa'

interface Student {
  id: string
  carnet: string
  name: string
  submission?: {
    file: string
    submittedAt: string
  }
  grade?: number
  feedback?: string
  published: boolean
}

interface Activity {
  id: string
  name: string
  published: boolean
  students: Student[]
}

interface Rubric {
  id: string
  name: string
  activities: Activity[]
}

// Mock data - replace with API calls
const mockData: Rubric[] = [
  {
    id: '1',
    name: 'Quices',
    activities: [
      {
        id: 'q1',
        name: 'Quiz 1',
        published: false,
        students: [
          {
            id: 's1',
            carnet: '2020123456',
            name: 'Juan Pérez',
            submission: {
              file: 'quiz1.pdf',
              submittedAt: '2023-10-15T14:30:00Z'
            },
            grade: 85,
            feedback: 'Buen trabajo',
            published: false
          },
          // ...more students
        ]
      }
    ]
  }
]

const SubmissionManager: React.FC = () => {
  const [expandedRubric, setExpandedRubric] = useState<string | null>(null)
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)

  const handleDownloadAll = (activityId: string) => {
    // API call to download all submissions
    console.log('Downloading all submissions for:', activityId)
  }

  const handleGradeChange = (
    studentId: string,
    activityId: string,
    value: number
  ) => {
    // API call to update grade
    console.log('Updating grade:', { studentId, activityId, value })
  }

  const handleFeedbackChange = (
    studentId: string,
    activityId: string,
    feedback: string
  ) => {
    // API call to update feedback
    console.log('Updating feedback:', { studentId, activityId, feedback })
  }

  const togglePublishActivity = (activityId: string) => {
    // API call to toggle activity publication
    console.log('Toggling activity publication:', activityId)
  }

  const togglePublishStudent = (studentId: string, activityId: string) => {
    // API call to toggle student grade publication
    console.log('Toggling student publication:', { studentId, activityId })
  }

  return (
    <div className="submission-manager">
      {mockData.map(rubric => (
        <div key={rubric.id} className="card mb-3">
          <div 
            className="card-header cursor-pointer"
            onClick={() => setExpandedRubric(
              expandedRubric === rubric.id ? null : rubric.id
            )}
          >
            <h5 className="mb-0">{rubric.name}</h5>
          </div>

          {expandedRubric === rubric.id && (
            <div className="card-body">
              {rubric.activities.map(activity => (
                <div 
                  key={activity.id} 
                  className="card mb-3 cursor-pointer"
                  onClick={() => setExpandedActivity(
                    expandedActivity === activity.id ? null : activity.id
                  )}
                >
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{activity.name}</h6>
                      <div onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => handleDownloadAll(activity.id)}
                        >
                          <FaDownload className="me-1" /> Descargar Todo
                        </button>
                        <button
                          className={`btn btn-${activity.published ? 'success' : 'outline-success'} btn-sm`}
                          onClick={() => togglePublishActivity(activity.id)}
                        >
                          {activity.published ? 'Publicado' : 'Publicar Todo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedActivity === activity.id && (
                    <div className="card-body" onClick={e => e.stopPropagation()}>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Carnet</th>
                              <th>Nombre</th>
                              <th>Entrega</th>
                              <th>Nota</th>
                              <th>Retroalimentación</th>
                              <th>Publicar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.students.map(student => (
                              <tr key={student.id}>
                                <td>{student.carnet}</td>
                                <td>{student.name}</td>
                                <td>
                                  {student.submission ? (
                                    <div className="d-flex align-items-center">
                                      <a 
                                        href={`/api/submissions/${student.submission.file}`}
                                        className="me-2"
                                      >
                                        {student.submission.file}
                                      </a>
                                      <small className="text-muted">
                                        {new Date(student.submission.submittedAt)
                                          .toLocaleString()}
                                      </small>
                                    </div>
                                  ) : (
                                    <span className="text-muted">Sin entrega</span>
                                  )}
                                </td>
                                <td style={{ width: '100px' }}>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={student.grade || ''}
                                    onChange={(e) => handleGradeChange(
                                      student.id,
                                      activity.id,
                                      Number(e.target.value)
                                    )}
                                    min="0"
                                    max="100"
                                  />
                                </td>
                                <td>
                                  <div className="input-group input-group-sm">
                                    <input
                                      type="file"
                                      className="form-control"
                                      accept=".pdf"
                                      onChange={(e) => {
                                        // Handle feedback file upload
                                      }}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <button
                                    className={`btn btn-sm btn-${
                                      student.published ? 'success' : 'outline-success'
                                    }`}
                                    onClick={() => togglePublishStudent(
                                      student.id,
                                      activity.id
                                    )}
                                  >
                                    {student.published ? <FaCheck /> : <FaTimes />}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default SubmissionManager
