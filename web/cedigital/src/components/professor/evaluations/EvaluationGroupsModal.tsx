import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { useGroupsStore } from '@/stores/groupsStore'
import { useStudentsStore } from '@/stores/studentsStore'
import type { Group, Student } from '@/types/groups'
import GroupModal from '../groups/GroupModal'

interface EvaluationGroupsModalProps {
  show: boolean
  onHide: () => void
  groupTypeId: string
  groupTypeName: string
  mode?: 'edit' | 'create'
  onComplete?: () => void
}

const EvaluationGroupsModal: React.FC<EvaluationGroupsModalProps> = ({
  show,
  onHide,
  groupTypeId,
  groupTypeName,
  mode = 'edit',
  onComplete
}) => {
  const { groups, getGroupsByType, addGroup, updateGroup, deleteGroup } = useGroupsStore()
  const { students } = useStudentsStore()
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [typeGroups, setTypeGroups] = useState<Group[]>([])

  useEffect(() => {
    if (show) {
      refreshGroups()
    }
  }, [show, groupTypeId])

  const refreshGroups = () => {
    const currentGroups = getGroupsByType(groupTypeId)
    setTypeGroups(currentGroups)
  }

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
    // Set the editing group with all its current data
    setEditingGroup({
      ...group,
      activityId: groupTypeId
    })
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
      activityId: groupTypeId
    }
    
    if (editingGroup?.id) {
      updateGroup(updatedGroup)
    } else {
      addGroup(updatedGroup)
    }
    
    refreshGroups()
    setShowGroupModal(false)
    setEditingGroup(null)
  }

  const getAvailableStudents = (activityId: string | null, excludeGroupId?: string) => {
    // Get only students assigned to groups in this specific category
    const studentsInThisCategory = groups
      .filter(g => g.activityId === groupTypeId && g.id !== excludeGroupId)
      .flatMap(g => g.members.map(m => m.carnet))

    // If we're editing a group, include its current members in available list
    const currentGroupMembers = excludeGroupId 
      ? groups.find(g => g.id === excludeGroupId)?.members.map(m => m.carnet) || []
      : []

    const assignedSet = new Set(studentsInThisCategory)

    // Return students that:
    // 1. Are not in other groups of this category
    // 2. Or are in the current group being edited
    return students.filter(student => 
      !assignedSet.has(student.carnet) || currentGroupMembers.includes(student.carnet)
    )
  }

  const handleClose = () => {
    if (onComplete) {
      onComplete()
    } else {
      onHide()
    }
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {mode === 'create' ? 'Crear Grupos - ' : 'Grupos - '}
            {groupTypeName}
          </Modal.Title>
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

      {showGroupModal && (
        <GroupModal
          show={true}
          onHide={() => {
            setShowGroupModal(false)
            setEditingGroup(null)
          }}
          onSave={handleSave}
          group={editingGroup}
          getAvailableStudents={getAvailableStudents}
          mode={editingGroup ? 'editEvaluationStatic' : 'newEvaluationStatic'}
        />
      )}
    </>
  )
}

export default EvaluationGroupsModal
