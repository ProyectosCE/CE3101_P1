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
    id: 'r1',
    name: 'Tareas',
    weight: 30,
    evaluations: [
      {
        id: 't1',
        name: 'Tarea #1',
        description: 'Resolver ejercicios del capítulo 1.',
        value: 10,
        rubricEnabled: true,
        rubricUrl: '/docs/rubrica-tarea1.pdf',
        dueDate: '2025-05-25',
        allowLate: false,
        groupSize: 1,
        submitted: true,
        fileName: 'tarea1.pdf',
        fileUrl: '/uploads/tarea1.pdf',
        dateSubmitted: '2025-05-24',
        grade: 9,
        comments: 'Buen trabajo.',
        feedbackFiles: [{ name: 'retro_tarea1.pdf', url: '/uploads/retro_tarea1.pdf' }],
      },
      {
        id: 't2',
        name: 'Tarea #2',
        value: 10,
        rubricEnabled: false,
        dueDate: '2025-06-01',
        allowLate: true,
        groupSize: 1,
        submitted: false,
      },
    ],
  },
  {
    id: 'r2',
    name: 'Proyecto',
    weight: 40,
    evaluations: [
      {
        id: 'p1',
        name: 'Proyecto Final',
        description: 'Desarrollar una aplicación web.',
        value: 40,
        rubricEnabled: true,
        rubricUrl: '/docs/rubrica-proyecto.pdf',
        dueDate: '2025-06-20',
        allowLate: true,
        groupSize: 3,
        groupMembers: [
          { id: 'u1', name: 'Juan Pérez', avatarUrl: '/images/avatar-default.png' },
          { id: 'u2', name: 'Ana López' },
          { id: 'u3', name: 'Carlos Ruiz' },
        ],
        submitted: false,
      },
    ],
  },
  {
    id: 'r3',
    name: 'Quices',
    weight: 30,
    evaluations: [
      {
        id: 'q1',
        name: 'Quiz 1',
        value: 10,
        rubricEnabled: false,
        dueDate: '2025-05-30',
        allowLate: false,
        groupSize: 1,
        submitted: true,
        fileName: 'quiz1.pdf',
        fileUrl: '/uploads/quiz1.pdf',
        dateSubmitted: '2025-05-30',
        grade: 8,
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