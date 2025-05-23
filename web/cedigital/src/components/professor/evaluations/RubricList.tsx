import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import RubricModal from './RubricModal'
import { rubrosApi, type Rubric as ApiRubric } from '@/Functions/Professor/evaluationsApi'
import type { Rubric as ComponentRubric } from '@/types/evaluation'

const RubricList: React.FC = () => {
  const [rubrics, setRubrics] = useState<ApiRubric[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingRubric, setEditingRubric] = useState<ComponentRubric | null>(null)
  const [loading, setLoading] = useState(true)

  // Load rubrics on mount
  useEffect(() => {
    loadRubrics()
  }, [])

  const loadRubrics = async () => {
    setLoading(true)
    try {
      const { data } = await rubrosApi.getRubros()
      setRubrics(data.rubros)
    } catch (error) {
      console.error('Error loading rubrics:', error)
      alert('Error al cargar los rubros')
    } finally {
      setLoading(false)
    }
  }

  // Transform API rubric to component rubric
  const apiToComponentRubric = (apiRubric: ApiRubric): ComponentRubric => ({
    id: apiRubric.id,
    name: apiRubric.nombre,
    weight: apiRubric.porcentaje
  })

  // Transform component rubric to API rubric
  const componentToApiRubric = (compRubric: ComponentRubric): Omit<ApiRubric, 'id'> => ({
    nombre: compRubric.name,
    porcentaje: compRubric.weight
  })

  const handleAdd = () => {
    setEditingRubric(null)
    setShowModal(true)
  }

  const handleEdit = (rubric: ApiRubric) => {
    setEditingRubric(apiToComponentRubric(rubric))
    setShowModal(true)
  }

  const handleSave = (rubric: ComponentRubric) => {
    const apiRubric = componentToApiRubric(rubric)
    
    if (editingRubric) {
      rubrosApi.updateRubro(rubric.id, apiRubric)
        .then(() => loadRubrics())
        .catch(error => {
          console.error('Error updating rubric:', error)
          alert('Error al actualizar el rubro')
        })
    } else {
      rubrosApi.createRubro(apiRubric)
        .then(() => loadRubrics())
        .catch(error => {
          console.error('Error creating rubric:', error)
          alert('Error al crear el rubro')
        })
    }
    setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este rubro?')) return
    
    try {
      await rubrosApi.deleteRubro(id)
      await loadRubrics() // Reload rubrics after delete
    } catch (error) {
      console.error('Error deleting rubric:', error)
      alert('Error al eliminar el rubro')
    }
  }

  const totalWeight = rubrics.reduce((sum, r) => sum + r.porcentaje, 0)

  if (loading) {
    return <div className="text-center">Cargando rubros...</div>
  }

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
                <h5 className="card-title">{rubric.nombre}</h5>
                <p className="card-text">
                  <span className={`badge ${
                    totalWeight > 100 ? 'bg-danger' : 'bg-primary'
                  }`}>
                    {rubric.porcentaje}%
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
