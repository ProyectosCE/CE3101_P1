import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaFileUpload } from 'react-icons/fa'
import type { Assignment, Rubric } from '@/types/evaluation'
import { evaluacionesApi } from '@/Functions/Professor/evaluationsApi'
import { categoryApi } from '@/Functions/Professor/groupManagerApi'
import type { Category } from '@/Functions/Professor/groupManagerApi'

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
  rubrics,
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
    instructionsFile: null,
    groupTypeId: undefined
  })
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (show) {
      if (assignment) {
        // When editing, preserve the linked category
        setForm({
          ...assignment,
          groupTypeId: assignment.linkedCategoryId || assignment.groupTypeId || undefined,
        })
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
          instructionsFile: null,
          groupTypeId: undefined
        })
      }

      // Load categories
      categoryApi.getCategories()
        .then(response => {
          setCategories(response.data.categorias)
        })
        .catch(error => {
          console.error('Error loading categories:', error)
        })
    }
  }, [show, assignment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Convert Assignment to API format
      const apiAssignment = {
        idRubro: form.rubricId,
        nombreRubro: form.title,
        porcentaje: form.weight,
        descripcion: form.description,
        fechaEntrega: form.dueDate,
        horaEntrega: form.dueTime,
        trabajoGrupal: form.isGroupWork,
        idDocumentoInstrucciones: ''
      }

      // Save the assignment
      if (form.id) {
        await evaluacionesApi.updateEvaluacion(form.id, apiAssignment)
      } else {
        const { data } = await evaluacionesApi.createEvaluacion(apiAssignment)
        form.id = data.evaluacion.id
      }

      // Handle file upload if present
      if (form.instructionsFile) {
        await evaluacionesApi.uploadInstrucciones(form.id, form.instructionsFile)
      }

      // Handle group category relationship
      if (form.isGroupWork && form.groupTypeId) {
        // If there's an existing relationship but category changed, delete old one
        if (form.linkedCategoryId && form.linkedCategoryId !== form.groupTypeId) {
          await evaluacionesApi.deleteEvaluacionXGrupo(form.id)
        }
        
        // Create new relationship if needed
        if (!form.linkedCategoryId || form.linkedCategoryId !== form.groupTypeId) {
          await evaluacionesApi.createEvaluacionXGrupo({
            idEvaluacion: form.id,
            idCategoria: form.groupTypeId
          })
        }
      } else if (!form.isGroupWork && form.linkedCategoryId) {
        // Remove relationship if evaluation is no longer group work
        await evaluacionesApi.deleteEvaluacionXGrupo(form.id)
      }

      onSave(form)
    } catch (error) {
      console.error('Error saving assignment:', error)
      alert('Error al guardar la evaluación')
    }
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
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="groupWork"
                  checked={form.isGroupWork}
                  onChange={e => {
                    setForm(prev => ({ 
                      ...prev, 
                      isGroupWork: e.target.checked,
                      groupTypeId: undefined 
                    }))
                  }}
                />
                <label className="form-check-label" htmlFor="groupWork">
                  Trabajo grupal
                </label>
              </div>

              {form.isGroupWork && (
                <div className="mb-3">
                  <label className="form-label">Categoría de grupos</label>
                  <select
                    className="form-select"
                    value={form.groupTypeId || ''}
                    onChange={e => setForm(prev => ({ 
                      ...prev, 
                      groupTypeId: e.target.value 
                    }))}
                    required
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={onHide}>
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={form.isGroupWork && !form.groupTypeId}
          >
            Guardar
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default AssignmentModal
