import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import type { Rubric } from '@/types/evaluation'

interface RubricModalProps {
  show: boolean
  onHide: () => void
  onSave: (rubric: Rubric) => void
  rubric: Rubric | null
}

const RubricModal: React.FC<RubricModalProps> = ({
  show,
  onHide,
  onSave,
  rubric
}) => {
  const [form, setForm] = useState<Rubric>({
    id: '',
    name: '',
    weight: 0
  })

  useEffect(() => {
    if (rubric) {
      setForm(rubric)
    } else {
      setForm({ id: '', name: '', weight: 0 })
    }
  }, [rubric])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal show={show} onHide={onHide}>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {rubric ? 'Editar Rubro' : 'Nuevo Rubro'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Nombre del Rubro</label>
            <input
              type="text"
              className="form-control"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Porcentaje</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                value={form.weight}
                onChange={e => setForm({ ...form, weight: Number(e.target.value) })}
                min="0"
                max="100"
                required
              />
              <span className="input-group-text">%</span>
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

export default RubricModal
