import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaSearch, FaTimes } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'
import type { Student, GroupActivity, Group } from '@/types/groups'
import { useGroupsStore } from '@/stores/groupsStore'

interface GroupModalProps {
  show: boolean
  onHide: () => void
  onSave: (group: Group) => void
  group: Group | null
  getAvailableStudents: (activityId: string | null, excludeGroupId?: string) => Student[]
  mode: 'newManager' | 'editManager' | 'newEvaluationStatic' | 'editEvaluationStatic'
}

const GroupModal: React.FC<GroupModalProps> = ({
  show,
  onHide,
  onSave,
  group,
  getAvailableStudents,
  mode
}) => {
  const { groupTypes } = useGroupsStore()
  
  const [form, setForm] = useState<Group>({
    id: uuidv4(),
    name: '',
    activityId: null,
    members: []
  })

  const [search, setSearch] = useState('')
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])

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

  const addMember = (student: Student) => {
    // Check if student is already in the group
    if (form.members.some(m => m.carnet === student.carnet)) {
      return; // Don't add if student is already in the group
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

  const handleTypeChange = (activityId: string) => {
    setForm(prev => ({
      ...prev,
      activityId,
      members: [] // Clear members when changing group type
    }))
    // Immediately load students for the selected type
    const availableStudentsList = getAvailableStudents(activityId)
    setAvailableStudents(availableStudentsList)
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

          {/* Type selector - show and enable based on mode */}
          {!mode.endsWith('Static') && (
            <div className="col-12">
              <label className="form-label">Tipo de Grupo</label>
              <select
                className="form-select"
                value={form.activityId || ''}
                onChange={e => handleTypeChange(e.target.value)}
                disabled={mode.startsWith('edit')}
              >
                <option value="">Seleccionar tipo...</option>
                <option value="general">Grupo General</option>
                {groupTypes
                  .filter(t => t.id !== 'general')
                  .map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
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
                    {filteredStudents.map(student => (
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
          onClick={() => onSave(form)}
          disabled={!form.name || form.members.length === 0}
        >
          Guardar
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default GroupModal
