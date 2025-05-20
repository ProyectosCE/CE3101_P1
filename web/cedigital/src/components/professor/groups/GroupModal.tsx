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
}

const GroupModal: React.FC<GroupModalProps> = ({
  show,
  onHide,
  onSave,
  group,
  getAvailableStudents
}) => {
  const { groupTypes } = useGroupsStore()
  const [form, setForm] = useState<Group>({
    id: '',
    name: '',
    activityId: null,
    members: []
  })

  const [search, setSearch] = useState('')
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])

  useEffect(() => {
    if (show) {
      if (group) {
        setForm(group)
        setAvailableStudents(getAvailableStudents(group.activityId, group.id))
      } else {
        const newGroup = {
          id: uuidv4(),
          name: '',
          activityId: null,
          members: []
        }
        setForm(newGroup)
        setAvailableStudents(getAvailableStudents(null))
      }
    }
  }, [show, group])

  const handleActivityChange = (activityId: string) => {
    setForm(prev => ({
      ...prev,
      activityId: activityId || null,
      members: []
    }))
    setAvailableStudents(getAvailableStudents(activityId || null, form.id))
  }

  const addMember = (student: Student) => {
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

  const showStudents = form.activityId !== null && form.activityId !== '';

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {group ? 'Editar Grupo' : 'Nuevo Grupo'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre del Grupo</label>
            <input
              type="text"
              className="form-control"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Tipo de Grupo</label>
            <select
              className="form-select"
              value={form.activityId || ''}
              onChange={e => handleActivityChange(e.target.value)}
            >
              <option value="">Seleccionar tipo...</option>
              <option value="general">Grupo General</option>
              {groupTypes.filter(t => t.id !== 'general').map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {showStudents ? (
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
          ) : (
            <div className="col-12">
              <div className="alert alert-info">
                Seleccione un tipo de grupo para ver los estudiantes disponibles
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
