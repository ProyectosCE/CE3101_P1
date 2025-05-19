import React, { useState } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'

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

  const addRubric = () => {
    setRubrics(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      weight: 0
    }])
  }

  const updateRubric = (id: string, field: keyof Rubric, value: string | number) => {
    setRubrics(prev => prev.map(rubric => {
      if (rubric.id !== id) return rubric

      if (field === 'weight') {
        const otherWeights = prev
          .filter(r => r.id !== id)
          .reduce((sum, r) => sum + r.weight, 0)
        
        const newWeight = Number(value)
        if (otherWeights + newWeight > 100) {
          alert('La suma de los porcentajes no puede exceder 100%')
          return rubric
        }
        return { ...rubric, [field]: newWeight }
      }

      return { ...rubric, [field]: value }
    }))
  }

  const deleteRubric = (id: string) => {
    setRubrics(prev => prev.filter(r => r.id !== id))
  }

  const totalWeight = rubrics.reduce((sum, r) => sum + r.weight, 0)

  return (
    <div className="rubric-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Rubros del Curso</h3>
        <button className="btn btn-primary" onClick={addRubric}>
          <FaPlus className="me-2" /> Nuevo Rubro
        </button>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre del Rubro</th>
              <th style={{ width: '150px' }}>Porcentaje</th>
              <th style={{ width: '100px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rubrics.map(rubric => (
              <tr key={rubric.id}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={rubric.name}
                    onChange={(e) => updateRubric(rubric.id, 'name', e.target.value)}
                    placeholder="Nombre del rubro"
                  />
                </td>
                <td>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      value={rubric.weight}
                      onChange={(e) => updateRubric(rubric.id, 'weight', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteRubric(rubric.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="text-end"><strong>Total:</strong></td>
              <td>
                <strong className={totalWeight > 100 ? 'text-danger' : ''}>
                  {totalWeight}%
                </strong>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default RubricList
