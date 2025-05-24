import React, { useEffect, useState } from 'react'
import { rubrosApi, evaluacionesApi } from '@/Functions/Professor/evaluationsApi'
import { entregasApi } from '@/Functions/Professor/entregasApi'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/stores/authStore'
import { FaEye } from 'react-icons/fa'
import EvaluationDetailModal from './EvaluationDetailModal'
import { getEntregaEstudiante, getEntregaEstudianteGrupal } from '@/Functions/Professor/gradesAPI'

interface EvalEntrega {
  id: string
  title: string
  dueDate: string
  type: 'Individual' | 'Grupal'
  entregado: boolean
  fileName?: string
  entregaId?: string
  entregaData?: any
  description?: string
  grade?: number
  feedback?: string
  feedbackFiles?: { name: string, url: string }[]
  dateSubmitted?: string
}

interface RubroGroup {
  id: string
  nombre: string
  evaluaciones: EvalEntrega[]
}

const EvaluationUploader: React.FC = () => {
  const router = useRouter()
  const { id_curso, group } = router.query
  const groupId = id_curso || group
  const user = useAuthStore(state => state.user)
  const [rubros, setRubros] = useState<RubroGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [viewEntrega, setViewEntrega] = useState<EvalEntrega | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId || !user?.username) return
      setLoading(true)
      try {
        // 1. Obtener rubros y evaluaciones
        const rubrosRes = await rubrosApi.getRubros(Number(groupId))
        const evaluacionesRes = await evaluacionesApi.getEvaluaciones(Number(groupId))

        // 2. Agrupar evaluaciones por rubro
        const rubrosWithEvals: RubroGroup[] = await Promise.all(
          rubrosRes.data.map(async (rubric: any) => {
            const rubroEvaluaciones = (evaluacionesRes.data || []).find((r: any) => r.id === rubric.id)
            const evaluaciones = rubroEvaluaciones?.evaluaciones || []

            // 3. Para cada evaluación, buscar la entrega del estudiante usando las nuevas APIs
            const evals: EvalEntrega[] = await Promise.all(
              evaluaciones.map(async (evaluation: any) => {
                let entregaEst: any = null

                if (evaluation.trabajoGrupal) {
                  try {
                    entregaEst = await getEntregaEstudianteGrupal(user.username, evaluation.id)
                  } catch {
                    entregaEst = null
                  }
                } else {
                  try {
                    entregaEst = await getEntregaEstudiante(user.username, evaluation.id)
                  } catch {
                    entregaEst = null
                  }
                }

                // No hay fecha/hora de entrega en el API, pero si existiera, agregar aquí
                // dateSubmitted = entregaEst?.fechaEntrega || entregaEst?.fecha_entrega

                return {
                  id: evaluation.id,
                  title: evaluation.nombre,
                  dueDate: evaluation.fechaEntrega,
                  type: evaluation.trabajoGrupal ? 'Grupal' : 'Individual',
                  entregado: !!entregaEst && !!entregaEst.idDocumentoEntrega,
                  fileName: entregaEst?.idDocumentoEntrega,
                  entregaId: undefined,
                  entregaData: entregaEst,
                  description: evaluation.descripcion,
                  grade: entregaEst?.calificacion,
                  feedback: entregaEst?.comentario,
                  feedbackFiles: [],
                  dateSubmitted: undefined
                }
              })
            )

            return {
              id: rubric.id,
              nombre: rubric.nombre,
              evaluaciones: evals
            }
          })
        )
        setRubros(rubrosWithEvals)
      } catch (error) {
        setRubros([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [groupId, user])

  return (
    <div>
      <h2 className="mb-4">Entregables</h2>
      {loading ? (
        <div className="text-center text-muted">Cargando...</div>
      ) : (
        rubros.map(rubro => (
          <div key={rubro.id} className="mb-4">
            <h5 className="border-bottom pb-2">{rubro.nombre}</h5>
            <ul className="list-group">
              {rubro.evaluaciones.length === 0 && (
                <li className="list-group-item text-muted">No hay evaluaciones en este rubro.</li>
              )}
              {rubro.evaluaciones.map(ev => (
                <li key={ev.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div>
                      <strong>{ev.title}</strong> <small>({ev.type})</small>
                    </div>
                    <small className="text-muted">Entrega: {ev.dueDate}</small>
                  </div>
                  <div>
                    {ev.entregado ? (
                      <>
                        <span className="badge bg-success me-2">Entregado</span>
                        {ev.fileName && (
                          <span className="me-2">{ev.fileName}</span>
                        )}
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => setViewEntrega(ev)}
                          title="Ver detalles de entrega"
                        >
                          <FaEye />
                        </button>
                      </>
                    ) : (
                      <span className="badge bg-secondary">Sin entregar</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      }

      {/* Modal para ver detalles de la entrega */}
      {viewEntrega && (
        <EvaluationDetailModal
          open={!!viewEntrega}
          onClose={() => setViewEntrega(null)}
          evalItem={{
            id: viewEntrega.id,
            name: viewEntrega.title,
            description: viewEntrega.description,
            value: 0,
            rubricEnabled: false,
            dueDate: viewEntrega.dueDate,
            allowLate: false,
            groupSize: viewEntrega.type === 'Grupal' ? 2 : 1,
            groupMembers: [],
            submitted: viewEntrega.entregado,
            fileName: viewEntrega.fileName,
            fileUrl: undefined,
            dateSubmitted: viewEntrega.dateSubmitted,
            grade: viewEntrega.grade,
            feedback: viewEntrega.feedback,
            feedbackFiles: viewEntrega.feedbackFiles,
            comments: viewEntrega.feedback
          }}
        />
      )}
    </div>
  )
}

export default EvaluationUploader
