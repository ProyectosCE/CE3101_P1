import React, { useState, useEffect } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import { FaSearch, FaTimes } from 'react-icons/fa'
import type { Student, GroupActivity, Group } from '@/types/groups'
import type { Category, Minigroup } from '@/Functions/Professor/groupManagerApi'
import { useGroupsStore } from '@/stores/groupsStore'
import { useRelationshipStore } from '@/stores/relationshipsStore'
import { v4 as uuidv4 } from 'uuid'
import { getStudentsByCourse } from '@/Functions/Professor/studentsApi'

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
  // Modified function to update available students
const updateAvailableStudents = async () => {
  if (!form.activityId) {
    setAvailableStudents([])
    return
  }

  try {
    setIsLoadingStudents(true)
    const allCourseStudents = await getStudentsByCourse(courseId)

    // Convertir form.activityId a string para comparación consistente
    const activityIdStr = String(form.activityId)
    
    const studentsInGroups = new Set(
      minigroups
        .filter(g => String(g.idCat) === activityIdStr && g.id !== form.id)
        .flatMap(g => g.estudiantes)
        .map(s => s.carnet)
    )

    const availableStuds = allCourseStudents.filter(student => {
      const isInGroup = studentsInGroups.has(student.carnet)
      return !isInGroup
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

  useEffect(() => {
  console.log('Available categories:', availableCategories);
  console.log('Selected category ID:', selectedCategoryId);
}, [availableCategories, selectedCategoryId]);

  // Update useEffect to watch for activityId changes
  useEffect(() => {
    if (show && form.activityId) {
      updateAvailableStudents()
    }
  }, [show, form.activityId, courseId])

  // Inicialización del formulario según modo
  useEffect(() => {
    if (show) {
      if (mode.startsWith('edit') && group) {
        // Editar: cargar datos del grupo existente
        setForm({
          ...group,
          activityId: group.activityId || selectedCategoryId || ''
        })
        // Cargar estudiantes disponibles para edición
        const availableStudentsList = getAvailableStudents(group.activityId || null, group.id)
        setAvailableStudents(availableStudentsList)
      } else if (mode.startsWith('new')) {
        // Nuevo: limpiar formulario
        setForm({
          id: uuidv4(),
          name: '',
          activityId: mode === 'newEvaluationStatic' ? group?.activityId || null : null,
          members: []
        })
        // Cargar estudiantes disponibles para nuevo grupo
        const availableStudentsList = getAvailableStudents(
          mode === 'newEvaluationStatic' ? group?.activityId || null : null
        )
        setAvailableStudents(availableStudentsList)
      }
      setSearch('')
    }
    if (!show) {
      // Limpiar al cerrar
      setForm({
        id: uuidv4(),
        name: '',
        activityId: null,
        members: []
      })
      setAvailableStudents([])
    }
  }, [show, group, mode, getAvailableStudents, selectedCategoryId])

  // Load all students when modal opens
  useEffect(() => {
    const loadAllStudents = async () => {
      if (show) {
        try {
          setIsLoadingStudents(true)
          const studentsRaw = await getStudentsByCourse(courseId)
          // Prefer nombre + apellidos if available, else use name
          const students = studentsRaw.map(s => {
            let nombreCompleto = s.name
            if ('nombre' in s && 'apellidos' in s) {
              nombreCompleto = `${(s as any).nombre} ${(s as any).apellidos}`.trim()
            }
            return {
              carnet: s.carnet,
              nombre: nombreCompleto
            }
          })
          // Exclude students already in any group for this category (by carnet)
          const activityIdStr = String(form.activityId ?? '')
          const carnetsInCategory = new Set(
            minigroups
              .filter(g => String(g.idCat) === activityIdStr)
              .flatMap(g => g.estudiantes)
              .map(s => s.carnet)
          )
          // Exclude also those already selected in this group (form.members)
          const selectedCarnets = new Set(form.members.map(m => m.carnet))
          const filteredStudents = students.filter(
            s => !carnetsInCategory.has(s.carnet) && !selectedCarnets.has(s.carnet)
          )
          setAllStudents(filteredStudents)
          setAvailableStudents(filteredStudents)
        } catch (error) {
          console.error('Error loading students:', error)
        } finally {
          setIsLoadingStudents(false)
        }
      }
    }
    loadAllStudents()
  }, [show, courseId, form.activityId, form.members, minigroups])

  const addMember = (student: Student) => {
    // Check if student is already in the group
    if (form.members.some(m => m.carnet === student.carnet)) {
      return;
    }
    
    // Double check student is still available
    // 5. También verificar que getStudentsInCategory maneje tipos correctamente
const getStudentsInCategory = (categoryId: string) => {
  return new Set(
    minigroups
      .filter(g => String(g.idCat) === String(categoryId) && g.id !== form.id)
      .flatMap(g => g.estudiantes)
      .map(s => s.carnet)
  )
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
  }

  const filteredStudents = availableStudents.filter(student => 
    student.carnet.includes(search) ||
    `${student.nombre}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // Update handleTypeChange
  const handleTypeChange = (activityId: string) => {
  console.log('Changing activity ID to:', activityId);
  setForm(prev => ({
    ...prev,
    activityId: activityId || null, // Asegurar que vacío se convierta a null
    members: [] // Clear members when changing category
  }))
  updateAvailableStudents() // Update available students immediately
}

  // Guardar: distinguir entre nuevo y editar
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

          {!selectedCategoryId && (
            <div className="col-12">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={form.activityId ? String(form.activityId) : ''}
                onChange={e => handleTypeChange(e.target.value)}
                required
              >
                <option value="">Seleccionar categoría...</option>
                {availableCategories && availableCategories.length > 0 ? (
                  availableCategories.map(cat => (
                    <option key={cat.id_categoria} value={String(cat.id_categoria)}>
                      {cat.nombre_categoria || 'Categoría sin nombre'}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay categorías disponibles</option>
                )}
              </select>
              {/* Debug info - remover en producción */}
              <small className="text-muted">
                Categorías cargadas: {availableCategories?.length || 0}
              </small>
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
                        {student.nombre}
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
                          {member.nombre}
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
