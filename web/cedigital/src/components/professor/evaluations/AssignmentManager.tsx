import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import AssignmentModal from './AssignmentModal'
import { rubrosApi, evaluacionesApi } from '@/Functions/Professor/evaluationsApi'
import type { Assignment, Rubric, EvaluacionGrupo } from '@/types/evaluation'

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

const AssignmentManager: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

  // Load data
  useEffect(() => {
    Promise.all([
      rubrosApi.getRubros(),
      evaluacionesApi.getEvaluaciones(),
      evaluacionesApi.getEvaluacionesXGrupo()
    ]).then(([rubricsRes, assignmentsRes, relationshipsRes]) => {
      // Convert rubrics
      const convertedRubrics = rubricsRes.data.rubros.map((r: Rubro) => ({
        id: r.id,
        name: r.nombre,
        weight: r.porcentaje
      }))
      setRubrics(convertedRubrics)

      // Get relationships map
      const relationshipsMap = new Map(
        relationshipsRes.data.evaluacionesXgrupo.map((r: EvaluacionGrupo) => [r.idEvaluacion, r.idCategoria])
      )

      // Convert assignments with relationships and ensure type safety
      const convertedAssignments: Assignment[] = assignmentsRes.data.evaluaciones.map((a: Evaluacion) => ({
        id: a.id,
        title: a.nombreRubro,
        description: a.descripcion,
        rubricId: a.idRubro,
        weight: a.porcentaje,
        dueDate: a.fechaEntrega,
        dueTime: a.horaEntrega,
        isGroupWork: a.trabajoGrupal,
        instructionsFile: null,
        linkedCategoryId: relationshipsMap.get(a.id),
        groupOption: relationshipsMap.has(a.id) ? 'existing' as const : undefined,
        groupTypeId: relationshipsMap.get(a.id)
      }))
      setAssignments(convertedAssignments)
    }).finally(() => setLoading(false))
  }, [])

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingAssignment(null)
    setShowModal(true)
  }

  const handleSave = async (assignment: Assignment) => {
    const apiAssignment = {
      idRubro: assignment.rubricId,
      nombreRubro: assignment.title,
      porcentaje: assignment.weight,
      descripcion: assignment.description,
      fechaEntrega: assignment.dueDate,
      horaEntrega: assignment.dueTime,
      trabajoGrupal: assignment.isGroupWork,
      idDocumentoInstrucciones: ''
    }

    try {
      if (editingAssignment) {
        await evaluacionesApi.updateEvaluacion(assignment.id, apiAssignment)
      } else {
        const { data } = await evaluacionesApi.createEvaluacion(apiAssignment)
        assignment.id = data.evaluacion.id
      }

      if (assignment.instructionsFile) {
        await evaluacionesApi.uploadInstrucciones(assignment.id, assignment.instructionsFile)
      }

      setAssignments(prev => editingAssignment 
        ? prev.map(a => a.id === assignment.id ? assignment : a)
        : [...prev, assignment]
      )
      setShowModal(false)
    } catch (error) {
      console.error('Error saving assignment:', error)
      alert('Error al guardar la evaluación')
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
      />
    </div>
  )
}

export default AssignmentManager
