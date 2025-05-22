import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { useGroupsStore } from '@/stores/groupsStore'
import { useStudentsStore } from '@/stores/studentsStore'
import { useRelationshipStore } from '@/stores/relationshipsStore'
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
  const { groups, getGroupsByType, addGroup, updateGroup, deleteGroup, subscribeToGroupsByCategory } = useGroupsStore()
  const { students } = useStudentsStore()
  const relationships = useRelationshipStore()
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [typeGroups, setTypeGroups] = useState<Group[]>([])

  useEffect(() => {
    if (show) {
      // Suscribirse a cambios en los grupos de esta categoría
      const unsubscribe = subscribeToGroupsByCategory(groupTypeId, (categoryGroups) => {
        setTypeGroups(categoryGroups)
      })

      // Cargar grupos iniciales
      const initialGroups = getGroupsByType(groupTypeId)
      setTypeGroups(initialGroups)

      return () => unsubscribe()
    }
  }, [show, groupTypeId])

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

  const refreshGroups = () => {
    const groupIds = relationships.getGroupsInCategory(groupTypeId)
    const categoryGroups = groups.filter(g => groupIds.includes(g.id))
    setTypeGroups(categoryGroups)
  }

  const handleDelete = (groupId: string) => {
    if (confirm('¿Está seguro de eliminar este grupo?')) {
      // First remove all student relationships
      const studentsInGroup = relationships.getStudentsInGroup(groupId)
      studentsInGroup.forEach(studentId => {
        relationships.removeStudentFromGroup(studentId, groupId)
      })

      // Remove group from category
      relationships.unlinkGroupFromCategory(groupId, groupTypeId)
      
      // Finally delete the group
      deleteGroup(groupId)
      refreshGroups()
    }
  }

  const handleSave = (group: Group) => {
    const isNewGroup = !editingGroup?.id
    const updatedGroup = {
      ...group,
      activityId: groupTypeId
    }
    
    // Handle group creation/update
    if (isNewGroup) {
      addGroup(updatedGroup, groupTypeId)
    } else {
      updateGroup(updatedGroup)
    }

    // Update student relationships
    const oldMemberIds = isNewGroup ? [] : 
      relationships.getStudentsInGroup(updatedGroup.id)
    const newMemberIds = updatedGroup.members.map(m => m.carnet)

    // Remove old relationships
    oldMemberIds.forEach(studentId => {
      relationships.removeStudentFromGroup(studentId, updatedGroup.id)
    })

    // Add new relationships
    newMemberIds.forEach(studentId => {
      relationships.addStudentToGroup(studentId, updatedGroup.id)
    })

    // Ensure group-category relationship
    relationships.linkGroupToCategory(updatedGroup.id, groupTypeId)
    
    refreshGroups()
    setShowGroupModal(false)
    setEditingGroup(null)
  }

  const getAvailableStudents = (activityId: string | null, excludeGroupId?: string) => {
    // Get students already in any group of this category
    const groupIds = relationships.getGroupsInCategory(groupTypeId)
    const takenStudentIds = new Set(
      groupIds
        .filter(gId => gId !== excludeGroupId)
        .flatMap(gId => relationships.getStudentsInGroup(gId))
    )

    // If editing, include current group members as available
    if (excludeGroupId) {
      const currentMembers = relationships.getStudentsInGroup(excludeGroupId)
      currentMembers.forEach(studentId => takenStudentIds.delete(studentId))
    }

    // Return all students that aren't in other groups
    return students.filter(student => !takenStudentIds.has(student.carnet))
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
