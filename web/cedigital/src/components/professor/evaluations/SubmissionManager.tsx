import React, { useState } from 'react'
import { FaDownload, FaCheck, FaTimes, FaComment } from 'react-icons/fa'
import FeedbackModal from './FeedbackModal'
import GroupMembersModal from './GroupMembersModal'
import { getFileType, getFileIcon } from '../../../utils/fileIcons'

interface GroupMember {
  carnet: string
  name: string
}

interface Group {
  id: string
  name: string
  members: GroupMember[]
}

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
  group?: Group
}

interface Activity {
  id: string
  name: string
  published: boolean
  isGroupWork: boolean
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
        name: 'Quiz 1 - Introducción a Bases de Datos',
        published: false,
        isGroupWork: false,
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
          {
            id: 's2',
            carnet: '2020098765',
            name: 'María Rodríguez',
            published: false
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Tareas',
    activities: [
      {
        id: 't1',
        name: 'Tarea 1 - Modelado ER',
        published: false,
        isGroupWork: true,
        students: [
          {
            id: 'g1',
            carnet: 'GRUPO-01',
            name: 'Equipo Alpha',
            group: {
              id: 'g1',
              name: 'Equipo Alpha',
              members: [
                { carnet: '2020123456', name: 'Juan Pérez' },
                { carnet: '2020098765', name: 'María Rodríguez' },
                { carnet: '2020111222', name: 'Carlos Sánchez' }
              ]
            },
            submission: {
              file: 'tarea1.pdf',
              submittedAt: '2023-10-16T23:45:00Z'
            },
            grade: 90,
            feedback: 'Excelente trabajo en equipo',
            published: false
          }
        ]
      }
    ]
  }
]

const SubmissionManager: React.FC = () => {
  const [expandedRubric, setExpandedRubric] = useState<string | null>(null)
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showGroupModal, setShowGroupModal] = useState(false)

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

  const handleFeedback = (student: Student) => {
    setSelectedStudent(student)
    setShowFeedbackModal(true)
  }

  const handleSaveFeedback = ({ comment, file }: { comment: string; file: File | null }) => {
    if (!selectedStudent) return

    // API call to save feedback
    console.log('Saving feedback:', {
      studentId: selectedStudent.id,
      comment,
      file
    })
  }

  const handleViewGroup = (group: Group | undefined) => {
    if (group) {
      setSelectedGroup(group)
      setShowGroupModal(true)
    }
  }

  return (
    <div className="submission-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Gestión de Entregas</h3>
      </div>

      {mockData.map(rubric => (
        <div key={rubric.id} className="mb-4">
          <h5 className="border-bottom pb-2 mb-3">{rubric.name}</h5>
          
          <div className="row g-3">
            {rubric.activities.map(activity => (
              <div key={activity.id} className="col-12">
                <div className="card">
                  <div 
                    className="card-header bg-light cursor-pointer d-flex justify-content-between align-items-center"
                    onClick={() => setExpandedActivity(
                      expandedActivity === activity.id ? null : activity.id
                    )}
                  >
                    <div>
                      <h6 className="mb-0">{activity.name}</h6>
                      <small className="text-muted">
                        Estado: {activity.published ? 'Publicado' : 'Sin publicar'}
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleDownloadAll(activity.id);
                        }}
                      >
                        <FaDownload className="me-1" /> Descargar entregas
                      </button>
                      <button
                        className={`btn btn-sm ${
                          activity.published ? 'btn-success' : 'btn-outline-success'
                        }`}
                        onClick={e => {
                          e.stopPropagation();
                          togglePublishActivity(activity.id);
                        }}
                      >
                        {activity.published ? 'Publicado' : 'Publicar notas'}
                      </button>
                    </div>
                  </div>

                  {expandedActivity === activity.id && (
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>{activity.isGroupWork ? 'Grupo' : 'Carnet'}</th>
                              {!activity.isGroupWork && <th>Nombre</th>}
                              <th>Archivo</th>
                              <th>Fecha de Entrega</th>
                              <th style={{ width: '120px' }}>Nota</th>
                              <th>Retroalimentación</th>
                              <th style={{ width: '100px' }}>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.students.map(student => (
                              <tr key={student.id}>
                                <td>
                                  {activity.isGroupWork ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>{student.name}</span>
                                      {student.group && (
                                        <button
                                          className="btn btn-link btn-sm p-0"
                                          onClick={() => student.group && handleViewGroup(student.group)}
                                        >
                                          <i className="fas fa-users text-info" title="Ver integrantes"></i>
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    student.carnet
                                  )}
                                </td>
                                {!activity.isGroupWork && <td>{student.name}</td>}
                                <td>
                                  {student.submission ? (
                                    <a 
                                      href={`/api/submissions/${student.submission.file}`}
                                      className="btn btn-outline-secondary btn-sm text-start"
                                      style={{ minWidth: '200px' }}
                                    >
                                      <i className={`${getFileIcon(getFileType(student.submission.file))} me-2`}></i>
                                      {student.submission.file}
                                    </a>
                                  ) : (
                                    <span className="text-muted">
                                      <i className="fas fa-times-circle me-1"></i>
                                      Sin entrega
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {student.submission ? (
                                    <small className="text-muted">
                                      {new Date(student.submission.submittedAt).toLocaleString()}
                                    </small>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td>
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
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => handleFeedback(student)}
                                  >
                                    <FaComment className="me-1" />
                                    {student.feedback ? 'Ver/Editar' : 'Añadir'}
                                  </button>
                                </td>
                                <td className="text-center">
                                  <button
                                    className={`btn btn-sm ${
                                      student.published 
                                        ? 'btn-success' 
                                        : 'btn-outline-success'
                                    }`}
                                    onClick={() => togglePublishStudent(
                                      student.id,
                                      activity.id
                                    )}
                                    title={student.published ? 'Publicado' : 'Sin publicar'}
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
              </div>
            ))}
          </div>
        </div>
      ))}

      <FeedbackModal
        show={showFeedbackModal}
        onHide={() => setShowFeedbackModal(false)}
        onSave={handleSaveFeedback}
        studentName={selectedStudent?.name || ''}
        initialFeedback={selectedStudent?.feedback}
      />

      <GroupMembersModal
        show={showGroupModal}
        onHide={() => setShowGroupModal(false)}
        groupName={selectedGroup?.name || ''}
        members={selectedGroup?.members || []}
      />
    </div>
  )
}

export default SubmissionManager
