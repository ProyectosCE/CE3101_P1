import React, { useState, useEffect } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import { FaSearch, FaTimes } from 'react-icons/fa'
import type { Student, GroupActivity, Group } from '@/types/groups'
import type { Category, Minigroup } from '@/Functions/Professor/groupManagerApi'
import { useGroupsStore } from '@/stores/groupsStore'
import { useRelationshipStore } from '@/stores/relationshipsStore'
import { v4 as uuidv4 } from 'uuid'
import { getAllStudentsByCourse } from '@/Functions/Professor/studentsApi'

// Update Props interface
interface GroupModalProps {
  show: boolean
  onHide: () => void
  onSave: (group: Group) => void
  group: Group | null
  getAvailableStudents: (activityId: string | null, excludeGroupId?: string) => Student[]
  mode: 'newManager' | 'editManager' | 'newEvaluationStatic' | 'editEvaluationStatic'
  availableCategories: Category[]
  selectedCategoryId?: string
  courseId: string;
  minigroups: Minigroup[];
}

const GroupModal: React.FC<GroupModalProps> = ({
  show,
  onHide,
  onSave,
  group,
  getAvailableStudents,
  mode,
  availableCategories,
  selectedCategoryId,
  courseId,
  minigroups
}) => {
  const { groupTypes } = useGroupsStore()
  const relationships = useRelationshipStore()
  
  const [form, setForm] = useState<Group>({
    id: uuidv4(),
    name: '',
    activityId: null,
    members: []
  })

  const [search, setSearch] = useState('')
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)

  // Helper function to get students in a category
  const getStudentsInCategory = (categoryId: string) => {
    return new Set(
      minigroups
        .filter(g => g.idCat === categoryId && g.id !== form.id)
        .flatMap(g => g.estudiantes)
        .map(s => s.carnet)
    )
  }

  // Modified function to update available students
  const updateAvailableStudents = async () => {
    if (!form.activityId) {
      setAvailableStudents([])
      return
    }

    try {
      setIsLoadingStudents(true)
      // Get all course students
      const allCourseStudents = await getAllStudentsByCourse(courseId)
      
      // Get set of students already in groups for this category
      const studentsInGroups = new Set(
        minigroups
          .filter(g => g.idCat === form.activityId && g.id !== form.id)
          .flatMap(g => g.estudiantes)
          .map(s => s.carnet)
      )

      // Filter available students:
      // 1. Not in other groups of this category
      // 2. Or is a current member of this group (when editing)
      const availableStuds = allCourseStudents.filter(student => {
        const isInOtherGroup = studentsInGroups.has(student.carnet)
        const isCurrentMember = form.members.some(m => m.carnet === student.carnet)
        return !isInOtherGroup || isCurrentMember
      })

      setAvailableStudents(availableStuds)
    } catch (error) {
      console.error('Error updating available students:', error)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  // Reset form and available students when modal is shown/hidden
  useEffect(() => {
    if (!show) {
      setForm({
        id: uuidv4(),
        name: '',
        activityId: null,
        members: []
      })
      setAvailableStudents([])
    }
  }, [show])

  // Update when editing a group
  useEffect(() => {
    if (show && group) {
      setForm({
        ...group,
        activityId: group.activityId || selectedCategoryId || ''
      })
    }
  }, [show, group, selectedCategoryId])

  // Update useEffect to watch for activityId changes
  useEffect(() => {
    if (show && form.activityId) {
      updateAvailableStudents()
    }
  }, [show, form.activityId, courseId])

  useEffect(() => {
    if (show) {
      if (mode.startsWith('edit') && group) {
        // When editing, preserve all existing group data and merge with current members
        setForm({
          ...group,
          activityId: group.activityId || 'general'
        })
        
        // Get available students and merge with current group members
        const availableStudentsList = getAvailableStudents(group.activityId || null, group.id)
        setAvailableStudents(availableStudentsList)
      } else {
        // For new groups, start fresh
        setForm({
          id: uuidv4(),
          name: '',
          activityId: mode === 'newEvaluationStatic' ? group?.activityId || null : null,
          members: []
        })
        // Get all available students for this category
        const availableStudentsList = getAvailableStudents(
          mode === 'newEvaluationStatic' ? group?.activityId || null : null
        )
        setAvailableStudents(availableStudentsList)
      }
      setSearch('')
    }
  }, [show, group, mode, getAvailableStudents])

  // Load all students when modal opens
  useEffect(() => {
    const loadAllStudents = async () => {
      if (show) {
        try {
          setIsLoadingStudents(true)
          const students = await getAllStudentsByCourse(courseId)
          setAllStudents(students)
          updateAvailableStudents()
        } catch (error) {
          console.error('Error loading students:', error)
        } finally {
          setIsLoadingStudents(false)
        }
      }
    }
    loadAllStudents()
  }, [show, courseId])

  const addMember = (student: Student) => {
    // Check if student is already in the group
    if (form.members.some(m => m.carnet === student.carnet)) {
      return;
    }
    
    // Double check student is still available
    const studentsInCategory = getStudentsInCategory(form.activityId || '')
    if (studentsInCategory.has(student.carnet)) {
      return // Student was added to another group
    }

    setForm(prev => ({
      ...prev,
      members: [...prev.members, student]
    }))
    setAvailableStudents(prev => prev.filter(s => s.carnet !== student.carnet))
  }

  const removeMember = (student: Student) => {
    setForm(prev => ({
      ...prev,
      members: prev.members.filter(m => m.carnet !== student.carnet)
    }))
    setAvailableStudents(prev => [...prev, student].sort((a, b) => 
      a.apellido1.localeCompare(b.apellido1)
    ))
  }

  const filteredStudents = availableStudents.filter(student => 
    student.carnet.includes(search) ||
    `${student.apellido1} ${student.apellido2} ${student.nombre}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // Update handleTypeChange
  const handleTypeChange = (activityId: string) => {
    setForm(prev => ({
      ...prev,
      activityId,
      members: [] // Clear members when changing category
    }))
    updateAvailableStudents() // Update available students immediately
  }

  const handleSave = () => {
    // Get current and new member IDs
    const oldMemberIds = mode.startsWith('edit') ? 
      relationships.getStudentsInGroup(form.id) : []
    const newMemberIds = form.members.map(m => m.carnet)

    // Save the group first
    onSave(form)

    // Update student-group relationships
    // Remove old relationships
    oldMemberIds.forEach(studentId => {
      relationships.removeStudentFromGroup(studentId, form.id)
    })

    // Add new relationships
    newMemberIds.forEach(studentId => {
      relationships.addStudentToGroup(studentId, form.id)
    })

    // Ensure group-category relationship
    if (form.activityId) {
      relationships.linkGroupToCategory(form.id, form.activityId)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode.startsWith('edit') ? 'Editar Grupo' : 'Nuevo Grupo'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Nombre del Grupo</label>
            <input
              type="text"
              className="form-control"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Category selector - show only if not in single category mode */}
          {!selectedCategoryId && (
            <div className="col-12">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={form.activityId || ''}
                onChange={e => handleTypeChange(e.target.value)}
                required
              >
                <option value="">Seleccionar categoría...</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Show students section when appropriate */}
          {((mode.endsWith('Static') && form.activityId) || (!mode.endsWith('Static') && form.activityId)) && (
            <div className="col-12">
              <label className="form-label">Buscar Estudiantes</label>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por carnet o nombre..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h6>Estudiantes Disponibles</h6>
                  <div className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {isLoadingStudents ? (
                      <div className="text-center p-3">
                        <Spinner animation="border" role="status" size="sm">
                          <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                        <span className="ms-2">Verificando estudiantes disponibles...</span>
                      </div>
                    ) : filteredStudents.map(student => (
                      <button
                        key={student.carnet}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => addMember(student)}
                      >
                        <small>{student.carnet}</small>
                        <br />
                        {student.apellido1} {student.apellido2}, {student.nombre}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>Integrantes del Grupo</h6>
                  <div className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {form.members.map(member => (
                      <div
                        key={member.carnet}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <small>{member.carnet}</small>
                          <br />
                          {member.apellido1} {member.apellido2}, {member.nombre}
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeMember(member)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!form.name || form.members.length === 0}
        >
          Guardar
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default GroupModal
