import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'
import AssignmentModal from './AssignmentModal'

interface Rubric {
  id: string
  name: string
  weight: number
}

interface Assignment {
  id: string
  title: string
  description: string
  rubricId: string
  weight: number
  dueDate: string
  dueTime: string
  isGroupWork: boolean
  instructionsFile: File | null
}

// Mock data - replace with API call
const mockRubrics: Rubric[] = [
  { id: '1', name: 'Quices', weight: 30 },
  { id: '2', name: 'Exámenes', weight: 30 },
  { id: '3', name: 'Proyectos', weight: 40 },
]

const initialAssignments: Assignment[] = [
  {
    id: uuidv4(),
    title: 'Quiz 1 - Introducción a Bases de Datos',
    description: 'Evaluación sobre conceptos básicos de bases de datos, modelo relacional y SQL básico.',
    rubricId: '1', // Quices
    weight: 10,
    dueDate: '2024-03-15',
    dueTime: '23:59',
    isGroupWork: false,
    instructionsFile: null
  },
  {
    id: uuidv4(),
    title: 'Primer Examen Parcial',
    description: 'Evaluación comprensiva sobre los temas vistos en la primera mitad del curso.',
    rubricId: '2', // Exámenes
    weight: 15,
    dueDate: '2024-04-20',
    dueTime: '11:00',
    isGroupWork: false,
    instructionsFile: null
  },
  {
    id: uuidv4(),
    title: 'Proyecto 1 - Diseño de Base de Datos',
    description: 'Implementación de una base de datos relacional para un sistema de gestión académica.',
    rubricId: '3', // Proyectos
    weight: 20,
    dueDate: '2024-05-10',
    dueTime: '23:59',
    isGroupWork: true,
    instructionsFile: null
  }
]

const AssignmentManager: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [showModal, setShowModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingAssignment(null)
    setShowModal(true)
  }

  const handleSave = (assignment: Assignment) => {
    if (editingAssignment) {
      setAssignments(prev => prev.map(a => 
        a.id === assignment.id ? assignment : a
      ))
    } else {
      setAssignments(prev => [...prev, { ...assignment, id: uuidv4() }])
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta evaluación?')) {
      setAssignments(prev => prev.filter(a => a.id !== id))
    }
  }

  // Group assignments by rubric
  const assignmentsByRubric = mockRubrics.map(rubric => ({
    ...rubric,
    assignments: assignments.filter(a => a.rubricId === rubric.id)
  }))

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
            {rubric.assignments.map(assignment => (
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
            ))}
          </div>
        </div>
      ))}

      <AssignmentModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        assignment={editingAssignment}
        rubrics={mockRubrics}
      />
    </div>
  )
}

export default AssignmentManager
