import React, { useState } from 'react'
import EvaluationDetailModal from './EvaluationDetailModal'

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

const dummyProfile = {
  name: 'Juan Pérez',
  avatarUrl: '/images/avatar-default.png',
}

const dummyRubros: Rubro[] = [
  {
    id: 'rubro1',
    name: 'Rubro 1',
    weight: 40,
    evaluations: [
      {
        id: 'eval1',
        name: 'Evaluación 1',
        description: 'Descripción de la evaluación 1',
        value: 10,
        rubricEnabled: true,
        rubricUrl: '/rubrics/rubro1_eval1.pdf',
        dueDate: '2023-10-10',
        allowLate: true,
        groupSize: 2,
        groupMembers: [
          { id: '1', name: 'Juan' },
          { id: '2', name: 'María' },
        ],
        submitted: true,
        fileName: 'evaluacion1_juan_maria.pdf',
        fileUrl: '/uploads/evaluacion1_juan_maria.pdf',
        dateSubmitted: '2023-10-01',
        grade: 8.5,
        feedback: 'Buen trabajo',
        feedbackFiles: [
          { name: 'comentarios.pdf', url: '/uploads/comentarios.pdf' },
        ],
        comments: 'Entregado a tiempo',
      },
      {
        id: 'eval2',
        name: 'Evaluación 2',
        value: 10,
        rubricEnabled: false,
        dueDate: '2023-10-15',
        allowLate: false,
        groupSize: 1,
        submitted: false,
      },
    ],
  },
  {
    id: 'rubro2',
    name: 'Rubro 2',
    weight: 60,
    evaluations: [
      {
        id: 'eval3',
        name: 'Evaluación 3',
        value: 20,
        rubricEnabled: true,
        rubricUrl: '/rubrics/rubro2_eval3.pdf',
        dueDate: '2023-10-20',
        allowLate: true,
        groupSize: 3,
        groupMembers: [
          { id: '1', name: 'Juan' },
          { id: '3', name: 'Pedro' },
          { id: '4', name: 'Ana' },
        ],
        submitted: true,
        fileName: 'evaluacion3_juan_pedro_ana.pdf',
        fileUrl: '/uploads/evaluacion3_juan_pedro_ana.pdf',
        dateSubmitted: '2023-10-10',
        grade: 18,
        feedback: 'Excelente trabajo',
        feedbackFiles: [
          { name: 'rubrica_evaluacion3.pdf', url: '/uploads/rubrica_evaluacion3.pdf' },
        ],
        comments: 'Muy bien presentado',
      },
      {
        id: 'eval4',
        name: 'Evaluación 4',
        value: 20,
        rubricEnabled: false,
        dueDate: '2023-10-25',
        allowLate: false,
        groupSize: 1,
        submitted: false,
      },
    ],
  },
]

const StudentEvaluations: React.FC = () => {
  const [rubros, setRubros] = useState<Rubro[]>(dummyRubros)
  const [openRubro, setOpenRubro] = useState<string | null>(null)
  const [selectedEval, setSelectedEval] = useState<EvalItem | null>(null)

  // Nota final ponderada
  const total = rubros.reduce((acc, r) => {
    const rubroTotal = r.evaluations.reduce((sum, ev) => sum + (ev.grade ?? 0), 0)
    const rubroMax = r.evaluations.reduce((sum, ev) => sum + ev.value, 0)
    return acc + (rubroMax ? (rubroTotal / rubroMax) * r.weight : 0)
  }, 0)

  return (
    <div>
      {/* Perfil estudiante */}
      <div className="d-flex align-items-center mb-4">
        <img src={dummyProfile.avatarUrl} alt={dummyProfile.name} className="rounded-circle me-3" style={{ width: 60, height: 60 }} />
        <div>
          <div className="fw-bold">{dummyProfile.name}</div>
          <div className="text-muted">Estudiante</div>
        </div>
        <div className="ms-auto">
          <span className="badge bg-primary fs-5">Nota final: {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Rubros */}
      <div className="accordion" id="rubrosAccordion">
        {rubros.map(r => (
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
