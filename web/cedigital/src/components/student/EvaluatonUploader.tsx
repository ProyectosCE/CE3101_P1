import React, { useState } from 'react'

interface EvalAssign {
  id: string
  title: string
  dueDate: string
  type: 'Individual' | 'Grupal'
  uploadedUrl?: string
}

const dummyEvals: EvalAssign[] = [
  { id: 'e1', title: 'Examen Parcial', dueDate: '2025-05-20', type: 'Individual' },
  { id: 'e2', title: 'Proyecto Final', dueDate: '2025-06-10', type: 'Grupal', uploadedUrl: '/uploads/proy.pdf' },
]

const EvaluationUploader: React.FC = () => {
  const [evals, setEvals] = useState<EvalAssign[]>(dummyEvals)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setEvals(es =>
      es.map(ev =>
        ev.id === id
          ? { ...ev, uploadedUrl: URL.createObjectURL(file) }
          : ev
      )
    )
  }

  return (
    <div>
      <h2 className="mb-4">Entregables</h2>
      <ul className="list-group">
        {evals.map(ev => (
          <li key={ev.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div><strong>{ev.title}</strong> <small>({ev.type})</small></div>
              <small className="text-muted">Entrega: {ev.dueDate}</small>
            </div>
            <div>
              {ev.uploadedUrl ? (
                <a href={ev.uploadedUrl} className="btn btn-sm btn-success me-2" download>
                  Entregado ✓
                </a>
              ) : (
                <label className="btn btn-sm btn-primary mb-0 me-2">
                  Subir
                  <input
                    type="file"
                    hidden
                    onChange={e => handleFileChange(e, ev.id)}
                  />
                </label>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default EvaluationUploader
