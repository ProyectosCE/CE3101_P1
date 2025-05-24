import React, { useEffect, useState } from 'react'
import EvaluationDetailModal from './EvaluationDetailModal'
import { rubrosApi, evaluacionesApi } from '@/Functions/Professor/evaluationsApi'
import { entregasApi } from '@/Functions/Professor/entregasApi'
import { getEntregaEstudiante, getEntregaEstudianteGrupal } from '@/Functions/Professor/gradesAPI'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/stores/authStore'

interface GroupMember {
  id: string
  name: string
  avatarUrl?: string
}

interface EvalItem {
  id: string
  name: string
  description?: string
  value: number
  rubricEnabled: boolean
  rubricUrl?: string
  dueDate: string
  allowLate: boolean
  groupSize: number
  groupMembers?: GroupMember[]
  submitted: boolean
  fileName?: string
  fileUrl?: string
  dateSubmitted?: string
  grade?: number
  feedback?: string
  feedbackFiles?: { name: string, url: string }[]
  comments?: string
}

interface Rubro {
  id: string
  name: string
  weight: number
  evaluations: EvalItem[]
}

const StudentEvaluations: React.FC = () => {
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [openRubro, setOpenRubro] = useState<string | null>(null)
  const [selectedEval, setSelectedEval] = useState<EvalItem | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id_curso, group } = router.query
  const groupId = id_curso || group
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId || !user?.username) return
      setLoading(true)
      try {
        // 1. Obtener rubros y evaluaciones
        const rubrosRes = await rubrosApi.getRubros(Number(groupId))
        const evaluacionesRes = await evaluacionesApi.getEvaluaciones(Number(groupId))

        // 2. Agrupar evaluaciones por rubro
        const rubrosWithEvals: Rubro[] = await Promise.all(
          rubrosRes.data.map(async (rubric: any) => {
            const rubroEvaluaciones = (evaluacionesRes.data || []).find((r: any) => r.id === rubric.id)
            const evaluaciones = rubroEvaluaciones?.evaluaciones || []

            // 3. Para cada evaluación, buscar la entrega del estudiante usando las nuevas APIs
            const evals: EvalItem[] = await Promise.all(
              evaluaciones.map(async (evaluation: any) => {
                let entregaEst: any = null
                let groupMembers: GroupMember[] | undefined = undefined
                let dateSubmitted: string | undefined = undefined

                if (evaluation.trabajoGrupal) {
                  try {
                    entregaEst = await getEntregaEstudianteGrupal(user.username, evaluation.id)
                    if (entregaEst && Array.isArray(entregaEst.integrantes)) {
                      groupMembers = entregaEst.integrantes.map((name: string, idx: number) => ({
                        id: `${idx}`,
                        name
                      }))
                    }
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
                  name: evaluation.nombre,
                  description: evaluation.descripcion,
                  value: evaluation.valor ?? 0,
                  rubricEnabled: !!evaluation.idRubro,
                  rubricUrl: evaluation.rubricaUrl || undefined,
                  dueDate: evaluation.fechaEntrega,
                  allowLate: evaluation.entregaTardia ?? false,
                  groupSize: evaluation.trabajoGrupal ? (groupMembers?.length || 2) : 1,
                  groupMembers,
                  submitted: !!entregaEst && !!entregaEst.idDocumentoEntrega,
                  fileName: entregaEst?.idDocumentoEntrega,
                  fileUrl: undefined,
                  dateSubmitted,
                  grade: entregaEst?.calificacion,
                  feedback: entregaEst?.comentario,
                  feedbackFiles: [],
                  comments: entregaEst?.comentario
                }
              })
            )

            return {
              id: rubric.id,
              name: rubric.nombre,
              weight: rubric.porcentaje,
              evaluations: evals
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

  // Nota final ponderada
  const total = rubros.reduce((acc, r) => {
    const rubroTotal = r.evaluations.reduce((sum, ev) => sum + (ev.grade ?? 0), 0)
    const rubroMax = r.evaluations.reduce((sum, ev) => sum + (ev.value ?? 0), 0)
    return acc + (rubroMax ? (rubroTotal / rubroMax) * r.weight : 0)
  }, 0)

  return (
    <div>
      {/* Perfil estudiante */}
      <div className="d-flex align-items-center mb-4">
        {/* Puedes obtener el nombre/avatar del usuario si lo tienes */}
        <img src="/images/avatar-default.png" alt="Estudiante" className="rounded-circle me-3" style={{ width: 60, height: 60 }} />
        <div>
          <div className="fw-bold">{user?.nombre || user?.username || 'Estudiante'}</div>
          <div className="text-muted">Estudiante</div>
        </div>
        <div className="ms-auto">
          <span className="badge bg-primary fs-5">Nota final: {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Rubros */}
      <div className="accordion" id="rubrosAccordion">
        {loading ? (
          <div className="text-center text-muted mb-3">Cargando...</div>
        ) : rubros.map(r => (
          <div className="accordion-item" key={r.id}>
            <h2 className="accordion-header" id={`heading-${r.id}`}>
              <button
                className={`accordion-button ${openRubro === r.id ? '' : 'collapsed'}`}
                type="button"
                onClick={() => setOpenRubro(openRubro === r.id ? null : r.id)}
              >
                {r.name} <span className="ms-2 text-muted">({r.weight}%)</span>
              </button>
            </h2>
            <div className={`accordion-collapse collapse ${openRubro === r.id ? 'show' : ''}`}>
              <div className="accordion-body">
                <ul className="list-group">
                  {r.evaluations.map(ev => (
                    <li key={ev.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{ev.name}</strong>
                        <span className="ms-2 text-muted">({ev.value} pts)</span>
                        {ev.submitted && <span className="badge bg-success ms-2">Entregado</span>}
                        {ev.grade !== undefined && <span className="badge bg-info ms-2">Nota: {ev.grade}</span>}
                      </div>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => setSelectedEval(ev)}>
                        Ver detalles
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalles */}
      {selectedEval && (
        <EvaluationDetailModal
          open={!!selectedEval}
          onClose={() => setSelectedEval(null)}
          evalItem={selectedEval}
        />
      )}
    </div>
  )
}

export default StudentEvaluations
