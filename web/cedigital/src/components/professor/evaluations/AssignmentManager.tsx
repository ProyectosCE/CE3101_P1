import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import AssignmentModal from './AssignmentModal'
import { rubrosApi, evaluacionesApi } from '@/Functions/Professor/evaluationsApi'
import type { Assignment, Rubric, EvaluacionGrupo } from '@/types/evaluation'
import { useRouter } from 'next/router'

interface Rubro {
  id: string;
  nombre: string;
  porcentaje: number;
}

interface Evaluacion {
  id: string;
  nombreRubro: string;
  descripcion: string;
  idRubro: string;
  porcentaje: number;
  fechaEntrega: string;
  horaEntrega: string;
  trabajoGrupal: boolean;
  idDocumentoInstrucciones: string;
}

interface AssignmentManagerProps {
  groupId?: string
}

const AssignmentManager: React.FC<AssignmentManagerProps> = ({ groupId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter();
  const { code, semester } = router.query; // code = codigo_curso, semester = id_semestre

  // Load data
  useEffect(() => {
    if (!groupId) {
      console.error('No groupId provided')
      setLoading(false)
      return
    }

    evaluacionesApi.getEvaluaciones(Number(groupId)) // Use groupId in API call
      .then(response => {
        const rubricsData = response.data

        // Convert rubrics and assignments
        const convertedRubrics = rubricsData.map((r: Rubro) => ({
          id: r.id,
          name: r.nombre,
          weight: r.porcentaje,
          assignments: r.evaluaciones.map((a: Evaluacion) => ({
            id: a.id,
            title: a.nombre,
            description: a.descripcion,
            rubricId: a.idRubro,
            weight: r.porcentaje, // Use the rubric's percentage
            dueDate: a.fechaEntrega,
            dueTime: a.horaEntrega,
            isGroupWork: a.trabajoGrupal,
            instructionsFile: null,
            linkedCategoryId: a.idCategoriaTrabajo, // Ensure this is passed
            groupOption: a.idCategoriaTrabajo ? 'existing' as const : undefined,
            groupTypeId: a.idCategoriaTrabajo // Ensure this is passed
          }))
        }))

        setRubrics(convertedRubrics)
        setAssignments(convertedRubrics.flatMap(r => r.assignments)) // Flatten assignments for easier access
      })
      .catch(error => {
        console.error('Error loading data:', error)
      })
      .finally(() => setLoading(false))
  }, [groupId]) // Add groupId as a dependency

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingAssignment(null)
    setShowModal(true)
  }

  const handleSave = async (assignment: Assignment) => {
    // Validar datos obligatorios antes de crear o actualizar
    if (
      !assignment.title.trim() ||
      !assignment.rubricId ||
      !assignment.dueDate ||
      !assignment.dueTime
      // El peso puede ser 0, así que no se valida aquí
    ) {
      alert('Complete todos los campos obligatorios antes de guardar.')
      return
    }

    // PREVENIR INSERCIONES MÚLTIPLES: deshabilitar el botón de guardar mientras se guarda
    if (loading) return

    setLoading(true)
    try {
      const apiAssignment = {
        nombreRubro: assignment.title,
        porcentaje: assignment.weight,
        fechaEntrega: `${assignment.dueDate}T${assignment.dueTime}:00.000Z`,
        descripcion: assignment.description,
        idDocumentoInstrucciones: assignment.idDocumentoInstrucciones !== undefined && assignment.idDocumentoInstrucciones !== null && assignment.idDocumentoInstrucciones !== ''
          ? Number(assignment.idDocumentoInstrucciones)
          : null,
        idRubro: assignment.rubricId,
        idcategoria: assignment.isGroupWork ? assignment.groupTypeId ? Number(assignment.groupTypeId) : null : null
      }

      if (editingAssignment) {
        await evaluacionesApi.updateEvaluacion(assignment.id, apiAssignment)
      } else {
        const { data } = await evaluacionesApi.createEvaluacion(apiAssignment)
        if (data?.evaluacion && data.evaluacion.id) {
          assignment.id = data.evaluacion.id
        } else if (data?.id) {
          assignment.id = data.id
        } else {
          const newId = data?.id || data?.evaluacion_id || data?.evaluacionId
          if (newId) assignment.id = newId
        }
      }

      // Refrescar la lista de evaluaciones desde el backend para evitar duplicados y mostrar datos actualizados
      if (groupId) {
        const response = await evaluacionesApi.getEvaluaciones(Number(groupId))
        const rubricsData = response.data
        const convertedRubrics = rubricsData.map((r: any) => ({
          id: r.id,
          name: r.nombre,
          weight: r.porcentaje,
          assignments: r.evaluaciones.map((a: any) => ({
            id: a.id,
            title: a.nombre,
            description: a.descripcion,
            rubricId: a.idRubro,
            weight: r.porcentaje,
            dueDate: a.fechaEntrega,
            dueTime: a.horaEntrega,
            isGroupWork: a.trabajoGrupal,
            instructionsFile: null,
            linkedCategoryId: a.idCategoriaTrabajo,
            groupOption: a.idCategoriaTrabajo ? 'existing' as const : undefined,
            groupTypeId: a.idCategoriaTrabajo
          }))
        }))
        setRubrics(convertedRubrics)
        setAssignments(convertedRubrics.flatMap(r => r.assignments))
      }

      setShowModal(false)
    } catch (error) {
      console.error('Error saving assignment:', error)
      alert('Error al guardar la evaluación')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta evaluación?')) return
    
    try {
      await evaluacionesApi.deleteEvaluacion(id)
      setAssignments(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error deleting assignment:', error)
      alert('Error al eliminar la evaluación')
    }
  }

  // Group assignments by rubric
  const assignmentsByRubric = rubrics.map(rubric => ({
    ...rubric,
    assignments: assignments.filter(a => a.rubricId === rubric.id)
  }))

  if (loading) {
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="assignment-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Evaluaciones</h3>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FaPlus className="me-2" /> Nueva Evaluación
        </button>
      </div>

      {assignmentsByRubric.map(rubric => (
        <div key={rubric.id} className="mb-4">
          <h5 className="border-bottom pb-2">{rubric.name} ({rubric.weight}%)</h5>
          <div className="row g-3">
            {rubric.assignments.length === 0 ? (
              <div className="text-muted">No hay evaluaciones asignadas a este rubro.</div>
            ) : (
              rubric.assignments.map(assignment => (
                <div key={assignment.id} className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">{assignment.title}</h6>
                      <p className="card-text text-muted">
                        Entrega: {assignment.dueDate} {assignment.dueTime}
                      </p>
                    </div>
                    <div className="card-footer bg-transparent border-top-0">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEdit(assignment)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      <AssignmentModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        assignment={editingAssignment}
        rubrics={rubrics}
        id_grupo={Number(groupId)}
        codigo_curso={typeof code === 'string' ? code : ''}
        id_semestre={typeof semester === 'string' ? semester : ''}
        loading={loading}
      />
    </div>
  )
}

export default AssignmentManager
