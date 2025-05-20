import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { useGroupsStore } from '@/stores/groupsStore'
import type { Group, Student } from '@/types/groups'
import GroupModal from '../groups/GroupModal'

// Mock data - replace with API call
const mockStudents: Student[] = [
  { carnet: '2020123456', apellido1: 'Pérez', apellido2: 'García', nombre: 'Juan' },
  { carnet: '2020654321', apellido1: 'Rodríguez', apellido2: 'López', nombre: 'María' },
  { carnet: '2020111222', apellido1: 'González', apellido2: 'Martínez', nombre: 'Ana' },
]

interface EvaluationGroupsModalProps {
  show: boolean
  onHide: () => void
  groupTypeId: string
  groupTypeName: string
}

const EvaluationGroupsModal: React.FC<EvaluationGroupsModalProps> = ({
  show,
  onHide,
  groupTypeId,
  groupTypeName
}) => {
  const { groups, getGroupsByType, addGroup, updateGroup, deleteGroup } = useGroupsStore()
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  // Add state to track groups of this type
  const [typeGroups, setTypeGroups] = useState<Group[]>([])

  // Update local groups when store groups change or when modal opens
  useEffect(() => {
    if (show) {
      const currentTypeGroups = getGroupsByType(groupTypeId)
      setTypeGroups(currentTypeGroups)
    }
  }, [show, groupTypeId, groups, getGroupsByType])

  const handleAdd = () => {
    setEditingGroup({
      id: '', // Will be replaced with UUID in GroupModal
      name: '',
      activityId: groupTypeId, // Pre-set the activity ID for the selected type
      members: []
    })
    setShowGroupModal(true)
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setShowGroupModal(true)
  }

  const handleDelete = (groupId: string) => {
    if (confirm('¿Está seguro de eliminar este grupo?')) {
      deleteGroup(groupId)
      // Update local state
      setTypeGroups(prev => prev.filter(g => g.id !== groupId))
    }
  }

  const handleSave = (group: Group) => {
    const updatedGroup = {
      ...group,
      activityId: groupTypeId // Ensure the group is assigned to the correct category
    }
    
    if (editingGroup?.id) {
      updateGroup(updatedGroup)
      // Update local state
      setTypeGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g))
    } else {
      addGroup(updatedGroup)
      // Add to local state
      setTypeGroups(prev => [...prev, updatedGroup])
    }
    setShowGroupModal(false)
    setEditingGroup(null)
  }

  const getAvailableStudents = (activityId: string | null, excludeGroupId?: string) => {
    // Obtener todos los estudiantes asignados a grupos del mismo tipo
    const assignedStudents = groups
      .filter(g => g.activityId === groupTypeId && g.id !== excludeGroupId)
      .flatMap(g => g.members.map(m => m.carnet))

    // Crear un conjunto para búsqueda rápida
    const assignedSet = new Set(assignedStudents)

    // Filtrar estudiantes que no están asignados a ningún grupo del tipo actual
    return mockStudents.filter((student: Student) => !assignedSet.has(student.carnet))
  }

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Grupos - {groupTypeName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <button className="btn btn-primary" onClick={handleAdd}>
              <FaPlus className="me-2" /> Nuevo Grupo
            </button>
          </div>

          <div className="row g-3">
            {typeGroups.map(group => (
              <div key={group.id} className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title d-flex justify-content-between">
                      {group.name}
                      <span className="badge bg-info">
                        {group.members.length} {group.members.length === 1 ? 'miembro' : 'miembros'}
                      </span>
                    </h6>
                    <div className="small text-muted mt-2">
                      {group.members.map(member => (
                        <div key={member.carnet}>
                          {member.apellido1} {member.apellido2}, {member.nombre}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card-footer bg-transparent border-top-0">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(group)}
                      >
                        <FaEdit className="me-1" /> Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(group.id)}
                      >
                        <FaTrash className="me-1" /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>

      <GroupModal
        show={showGroupModal}
        onHide={() => {
          setShowGroupModal(false)
          setEditingGroup(null)
        }}
        onSave={handleSave}
        group={editingGroup || { id: '', name: '', activityId: groupTypeId, members: [] }}
        getAvailableStudents={getAvailableStudents}
        mode={editingGroup?.id ? 'editEvaluationStatic' : 'newEvaluationStatic'}
      />
    </>
  )
}

export default EvaluationGroupsModal
