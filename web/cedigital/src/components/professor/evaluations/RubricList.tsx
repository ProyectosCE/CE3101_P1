import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'
import RubricModal from './RubricModal'

interface Rubric {
  id: string
  name: string
  weight: number
}

const initialRubrics: Rubric[] = [
  { id: uuidv4(), name: 'Quices', weight: 30 },
  { id: uuidv4(), name: 'Exámenes', weight: 30 },
  { id: uuidv4(), name: 'Proyectos', weight: 40 },
]

const RubricList: React.FC = () => {
  const [rubrics, setRubrics] = useState<Rubric[]>(initialRubrics)
  const [showModal, setShowModal] = useState(false)
  const [editingRubric, setEditingRubric] = useState<Rubric | null>(null)

  const handleAdd = () => {
    setEditingRubric(null)
    setShowModal(true)
  }

  const handleEdit = (rubric: Rubric) => {
    setEditingRubric(rubric)
    setShowModal(true)
  }

  const handleSave = (rubric: Rubric) => {
    const otherWeights = rubrics
      .filter(r => r.id !== rubric.id)
      .reduce((sum, r) => sum + r.weight, 0)
    
    if (otherWeights + rubric.weight > 100) {
      alert('La suma de los porcentajes no puede exceder 100%')
      return
    }

    if (editingRubric) {
      setRubrics(prev => prev.map(r => r.id === rubric.id ? rubric : r))
    } else {
      setRubrics(prev => [...prev, { ...rubric, id: uuidv4() }])
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este rubro?')) {
      setRubrics(prev => prev.filter(r => r.id !== id))
    }
  }

  const totalWeight = rubrics.reduce((sum, r) => sum + r.weight, 0)

  return (
    <div className="rubric-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Rubros del Curso</h3>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FaPlus className="me-2" /> Nuevo Rubro
        </button>
      </div>

      <div className="row g-3">
        {rubrics.map(rubric => (
          <div key={rubric.id} className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{rubric.name}</h5>
                <p className="card-text">
                  <span className={`badge ${
                    totalWeight > 100 ? 'bg-danger' : 'bg-primary'
                  }`}>
                    {rubric.weight}%
                  </span>
                </p>
              </div>
              <div className="card-footer bg-transparent border-top-0">
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEdit(rubric)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(rubric.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalWeight > 0 && (
        <div className="mt-4 text-end">
          <h5 className={totalWeight > 100 ? 'text-danger' : 'text-muted'}>
            Total: {totalWeight}%
          </h5>
        </div>
      )}

      <RubricModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        rubric={editingRubric}
      />
    </div>
  )
}

export default RubricList
