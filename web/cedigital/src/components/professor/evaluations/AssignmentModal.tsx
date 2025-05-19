import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaFileUpload } from 'react-icons/fa'
import type { Assignment, Rubric } from '@/types/evaluation'

interface AssignmentModalProps {
  show: boolean
  onHide: () => void
  onSave: (assignment: Assignment) => void
  assignment: Assignment | null
  rubrics: Rubric[]
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  show,
  onHide,
  onSave,
  assignment,
  rubrics
}) => {
  const [form, setForm] = useState<Assignment>({
    id: '',
    title: '',
    description: '',
    rubricId: '',
    weight: 0,
    dueDate: '',
    dueTime: '',
    isGroupWork: false,
    instructionsFile: null
  })

  useEffect(() => {
    if (assignment) {
      setForm(assignment)
    } else {
      setForm({
        id: '',
        title: '',
        description: '',
        rubricId: '',
        weight: 0,
        dueDate: '',
        dueTime: '',
        isGroupWork: false,
        instructionsFile: null
      })
    }
  }, [assignment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {assignment ? 'Editar Evaluación' : 'Nueva Evaluación'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Título</label>
              <input
                type="text"
                className="form-control"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Rubro</label>
              <select
                className="form-select"
                value={form.rubricId}
                onChange={e => setForm({ ...form, rubricId: e.target.value })}
              >
                <option value="">Seleccionar rubro...</option>
                {rubrics.map(rubric => (
                  <option key={rubric.id} value={rubric.id}>
                    {rubric.name} ({rubric.weight}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Peso (%)</label>
              <input
                type="number"
                className="form-control"
                value={form.weight}
                onChange={e => setForm({ ...form, weight: Number(e.target.value) })}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Fecha de entrega</label>
              <input
                type="date"
                className="form-control"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Hora de entrega</label>
              <input
                type="time"
                className="form-control"
                value={form.dueTime}
                onChange={e => setForm({ ...form, dueTime: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Instrucciones (PDF)</label>
              <div className="input-group">
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf"
                  onChange={e => setForm({ 
                    ...form, 
                    instructionsFile: e.target.files ? e.target.files[0] : null 
                  })}
                />
                <span className="input-group-text">
                  <FaFileUpload />
                </span>
              </div>
            </div>

            <div className="col-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="groupWork"
                  checked={form.isGroupWork}
                  onChange={e => setForm({ ...form, isGroupWork: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="groupWork">
                  Trabajo grupal
                </label>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={onHide}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default AssignmentModal
