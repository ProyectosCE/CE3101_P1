import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaFileUpload } from 'react-icons/fa'
import type { Assignment, Rubric } from '@/types/evaluation'
import { evaluacionesApi } from '@/Functions/Professor/evaluationsApi'
import { categoryApi } from '@/Functions/Professor/groupManagerApi'
import type { Category } from '@/Functions/Professor/groupManagerApi'
import { uploadEvaluationInstructions } from '@/Functions/Professor/documentsApi'

interface AssignmentModalProps {
  show: boolean
  onHide: () => void
  onSave: (assignment: Assignment) => void
  assignment: Assignment | null
  rubrics: Rubric[]
  id_grupo: number
  codigo_curso: string
  id_semestre: string
  loading?: boolean
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  show,
  onHide,
  onSave,
  assignment,
  rubrics,
  id_grupo,
  codigo_curso,
  id_semestre,
  loading = false
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
    instructionsFile: '',
    groupTypeId: undefined,
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
          instructionsFile: '',
          groupTypeId: undefined
        })
      }

      // Load categories
      categoryApi.getCategories(id_grupo)
        .then(response => {
          const categorias = response.data || [];
          const mappedCategories = categorias.map((cat: any) => ({
            id: cat.id_categoria.toString(), // Convert to string since we're using string IDs
            nombre: cat.nombre_categoria
          }));
          setCategories(mappedCategories);
        })
        .catch(error => {
          console.error('Error loading categories:', error);
          setCategories([]); // Set an empty array if there's an error
        })
    }
  }, [show, assignment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let idDocumentoInstrucciones: number | null = null;

      // Subir archivo si hay uno seleccionado usando uploadEvaluationInstructions
      if (form.instructionsFile) {
        const result = await uploadEvaluationInstructions(
          id_grupo,
          form.instructionsFile,
          codigo_curso,
          id_semestre
        );
        idDocumentoInstrucciones = result.id_documento;
      }

      // El body debe tener exactamente los nombres requeridos por el API
      const apiAssignment = {
        nombreRubro: form.title,
        porcentaje: form.weight,
        fechaEntrega: `${form.dueDate}T${form.dueTime}:00.000Z`,
        descripcion: form.description,
        idDocumentoInstrucciones: idDocumentoInstrucciones,
        idRubro: form.rubricId,
        idcategoria: form.isGroupWork ? (form.groupTypeId ? Number(form.groupTypeId) : null) : null
      }

      // Save the assignment
      if (form.id) {
        await evaluacionesApi.updateEvaluacion(form.id, apiAssignment)
      } else {
        const { data } = await evaluacionesApi.createEvaluacion(apiAssignment)
        if (data?.evaluacion && data.evaluacion.id) {
          form.id = data.evaluacion.id
        } else if (data?.id) {
          form.id = data.id
        } else {
          const newId = data?.id || data?.evaluacion_id || data?.evaluacionId
          if (newId) form.id = newId
        }
      }

      // NO USAR createEvaluacionXGrupo, solo usa el mismo createEvaluacion con idcategoria
      // Ya no se debe llamar a ninguna función adicional para crear la relación grupo-categoría

      // Si se está editando y se quitó la categoría, elimina la relación
      if (!form.isGroupWork && form.linkedCategoryId) {
        await evaluacionesApi.updateEvaluacion(form.id, {
          ...apiAssignment,
          idcategoria: null
        })
      }

      onSave({ ...form, idDocumentoInstrucciones })
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
                    value={form.groupTypeId || ''} // Ensure correct value is selected
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
            disabled={loading || (form.isGroupWork && !form.groupTypeId)}
          >
            Guardar
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default AssignmentModal
