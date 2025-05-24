import React, { useState, useEffect } from 'react'
import { FaDownload, FaCheck, FaTimes, FaComment } from 'react-icons/fa'
import FeedbackModal from './FeedbackModal'
import GroupMembersModal from './GroupMembersModal'
import { getFileType, getFileIcon } from '../../../utils/fileIcons'
import { entregasApi } from '@/Functions/Professor/entregasApi'
import { rubrosApi, evaluacionesApi } from '@/Functions/Professor/evaluationsApi'
import type { Evaluacion } from '@/Functions/Professor/evaluationsApi'
import type { Entrega } from '@/Functions/Professor/entregasApi'

// Interfaces that match the desired UI structure
interface GroupMember {
  carnet: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  members: GroupMember[];
}

interface Student {
  id: string;
  carnet: string;
  name: string;
  submission?: {
    file: string;
    submittedAt: string;
  };
  grade?: number;
  feedback?: string;
  published: boolean;
  group?: Group;
}

interface Activity {
  id: string;
  name: string;
  published: boolean;
  isGroupWork: boolean;
  students: Student[];
}

interface Rubric {
  id: string;
  name: string;
  activities: Activity[];
}

// Helper function to convert Entrega to Student
const convertEntregaToStudent = (entrega: Entrega): Student => ({
  id: entrega.identrega,
  carnet: entrega.grupal ? entrega.grupo!.idGrupo : entrega.estudiante!.carnet,
  name: entrega.grupal ? entrega.grupo!.nombreGrupo : entrega.estudiante!.nombre,
  submission: entrega.entregado ? {
    file: entrega.idDocumentoEntrega!,
    submittedAt: `${entrega.fechaEntrega}T${entrega.horaEntrega}`
  } : undefined,
  grade: entrega.calificacion,
  feedback: entrega.comentario,
  published: entrega.calificacionPublicada,
  group: entrega.grupal ? {
    id: entrega.grupo!.idGrupo,
    name: entrega.grupo!.nombreGrupo,
    members: entrega.grupo!.estudiantes.map(est => ({
      carnet: est.carnet,
      name: est.nombre
    }))
  } : undefined
});

interface SubmissionManagerProps {
  groupId?: string
}

const SubmissionManager: React.FC<SubmissionManagerProps> = (groupId) => {
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showGroupModal, setShowGroupModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Obtener rubros y evaluaciones por separado
    const [rubrosRes, evaluacionesRes] = await Promise.all([
      rubrosApi.getRubros(Number(groupId.groupId)),
      evaluacionesApi.getEvaluaciones(Number(groupId.groupId))
    ]);

    const rubricsWithActivities = await Promise.all(
      rubrosRes.data.map(async (rubric: any) => {
        const rubroEvaluaciones = (evaluacionesRes.data || []).find((r: any) => r.id === rubric.id);
        const evaluaciones = rubroEvaluaciones?.evaluaciones || [];

        const activities = await Promise.all(
          evaluaciones.map(async (evaluation: any) => {
            const { data } = await entregasApi.getEntregasByEvaluacion(evaluation.id);

            // data es un array de entregas con la nueva estructura
            const students: Student[] = (data || []).map((entrega: any) => ({
              id: entrega.idEntrega,
              carnet: entrega.carnetEstudiante,
              name: entrega.carnetEstudiante, // No hay nombre, se usa carnet
              submission: {
                file: entrega.nombreArchivo,
                submittedAt: `${entrega.fechaEntrega}T${entrega.horaEntrega}`
              },
              grade: undefined,
              feedback: undefined,
              published: false,
              group: undefined
            }));

            return {
              id: evaluation.id,
              name: evaluation.nombre,
              published: false,
              isGroupWork: evaluation.trabajoGrupal,
              students
            };
          })
        );

        return {
          id: rubric.id,
          name: rubric.nombre,
          activities: activities
        };
      })
    );

    setRubrics(rubricsWithActivities);
  };

  const handleDownloadAll = async (activityId: string) => {
    // Implementation pending
  }

  const handleGradeChange = async (studentId: string, activityId: string, value: number) => {
    try {
      await entregasApi.updateCalificacion(studentId, { calificacion: value });
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  }

  const handleFeedback = (student: Student) => {
    setSelectedStudent(student);
    setShowFeedbackModal(true);
  }

  const handleSaveFeedback = async ({ comment, file }: { comment: string; file: File | null }) => {
    if (!selectedStudent) return;

    try {
      await entregasApi.updateCalificacion(selectedStudent.id, {
        calificacion: selectedStudent.grade || 0,
        comentario: comment
      });

      if (file) {
        await entregasApi.uploadRetroalimentacion(selectedStudent.id, file);
      }

      await loadData();
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  }

  const togglePublishActivity = async (activityId: string) => {
    // Implementation pending
  }

  const togglePublishStudent = async (studentId: string, activityId: string) => {
    try {
      await entregasApi.togglePublicacion(studentId);
      await loadData();
    } catch (error) {
      console.error('Error toggling publication:', error);
    }
  }

  const handleViewGroup = (group: Group | undefined) => {
    if (group) {
      setSelectedGroup(group);
      setShowGroupModal(true);
    }
  }

  return (
    <div className="submission-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Gestión de Entregas</h3>
      </div>

      {rubrics.map(rubric => (
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
                                          onClick={() => handleViewGroup(student.group)}
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
                                    <button
                                      className="btn btn-outline-secondary btn-sm text-start"
                                      style={{ minWidth: '200px' }}
                                      onClick={() => entregasApi.downloadEntrega(student.id)}
                                    >
                                      <i className={`${getFileIcon(getFileType(student.submission.file))} me-2`}></i>
                                      {student.submission.file}
                                    </button>
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
                                    onClick={() => togglePublishStudent(student.id, activity.id)}
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

      {/* Modals */}
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
  );
};

export default SubmissionManager;
