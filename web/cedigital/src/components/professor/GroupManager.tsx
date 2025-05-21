import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import GroupModal from './groups/GroupModal'
import GroupTypeModal from './groups/GroupTypeModal'
import type { Student, GroupActivity, Group } from '@/types/groups'
import { useGroupsStore } from '@/stores/groupsStore'
import { useStudentsStore } from '@/stores/studentsStore'

interface GroupManagerProps {
  initialGroups?: Group[]
  activityId?: string | null
  activityName?: string
  onSave?: (groups: Group[]) => void
  standalone?: boolean
  singleCategory?: boolean
}

const GroupManager: React.FC<GroupManagerProps> = ({
  initialGroups = [],
  activityId = null,
  activityName = '',
  onSave,
  standalone = true,
  singleCategory = false
}) => {
  const { students } = useStudentsStore()
  const { groups: allGroups, groupTypes, addGroup, updateGroup, deleteGroup, getGroupsByType, addGroupType, deleteGroupType } = useGroupsStore()
  const [groups, setGroups] = useState<Group[]>(
    singleCategory ? initialGroups : allGroups
  )
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [showTypeModal, setShowTypeModal] = useState(false)

  const handleAdd = () => {
    setEditingGroup(null)
    setShowModal(true)
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setShowModal(true)
  }

  const getAvailableStudents = (activityId: string | null, excludeGroupId?: string) => {
    const currentGroup = groups.find(g => g.id === excludeGroupId);
    const currentMembers = new Set(currentGroup?.members.map(m => m.carnet) || []);

    const assignedStudentsInCategory = groups
      .filter(g => {
        if (!activityId || activityId === 'general') {
          return g.activityId === null && g.id !== excludeGroupId;
        }
        return g.activityId === activityId && g.id !== excludeGroupId;
      })
      .flatMap(g => g.members.map(m => m.carnet));

    const assignedSet = new Set(assignedStudentsInCategory);

    return students.filter(student => 
      !assignedSet.has(student.carnet) && !currentMembers.has(student.carnet)
    );
  };

  const handleSave = (group: Group) => {
    const updatedGroup = {
      ...group,
      activityId: activityId || (group.activityId === 'general' ? null : group.activityId)
    }
    
    if (editingGroup) {
      if (standalone) {
        updateGroup(updatedGroup)
      }
      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g))
    } else {
      if (standalone) {
        addGroup(updatedGroup)
      }
      setGroups(prev => [...prev, updatedGroup])
    }
    setShowModal(false)

    // If being used as sub-component, notify parent of changes
    if (!standalone && onSave) {
      onSave([...groups, updatedGroup])
    }
  }

  const handleDelete = (groupId: string) => {
    if (confirm('¿Está seguro de eliminar este grupo?')) {
      if (standalone) {
        deleteGroup(groupId)
      }
      setGroups(prev => prev.filter(g => g.id !== groupId))
    }
  }

  const handleDeleteType = (typeId: string) => {
    if (confirm('¿Está seguro de eliminar esta categoría y todos sus grupos?')) {
      deleteGroupType(typeId)
      const groupsToDelete = getGroupsByType(typeId)
      groupsToDelete.forEach(group => deleteGroup(group.id))
    }
  }

  // Replace handleAddType to use store's addGroupType
  const handleAddType = (newType: GroupActivity) => {
    addGroupType(newType)
  }

  // Use groupTypes from store instead of activities
  const groupTypesList = singleCategory 
    ? [{ id: activityId || 'general', name: activityName || 'Grupos' }]
    : [{ id: 'general', name: 'Grupos Generales' }, ...groupTypes.filter(t => t.id !== 'general')]

  return (
    <div className="group-manager">
      {standalone ? (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Gestión de Grupos</h3>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setShowTypeModal(true)}
              >
                <FaPlus className="me-1" /> Nuevo Tipo
              </button>
              <button className="btn btn-primary" onClick={handleAdd}>
                <FaPlus className="me-2" /> Nuevo Grupo
              </button>
            </div>
          </div>

          {groupTypesList.map(type => {
            const typeGroups = getGroupsByType(type.id)
            console.log(`Groups for ${type.name}:`, typeGroups) // Debug logging

            return (
              <div key={type.id} className="mb-4">
                <div className="card">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <div 
                      className="flex-grow-1 cursor-pointer"
                      onClick={() => setExpandedType(expandedType === type.id ? null : type.id)}
                    >
                      <div className="d-flex align-items-center">
                        <h6 className="mb-0">{type.name}</h6>
                        <span className="badge bg-secondary ms-2">
                          {typeGroups.length} grupo{typeGroups.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {type.id !== 'general' && (
                      <button
                        className="btn btn-outline-danger btn-sm ms-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteType(type.id)
                        }}
                      >
                        <FaTrash /> Eliminar Categoría
                      </button>
                    )}
                  </div>

                  {expandedType === type.id && (
                    <div className="card-body">
                      {typeGroups.length > 0 ? (
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
                      ) : (
                        <p className="text-muted text-center mb-0">
                          No hay grupos creados en esta categoría
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <GroupModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onSave={handleSave}
            group={editingGroup}
            getAvailableStudents={getAvailableStudents}
            mode={editingGroup ? 'editManager' : 'newManager'}
          />

          <GroupTypeModal
            show={showTypeModal}
            onHide={() => setShowTypeModal(false)}
            onSave={handleAddType}
          />
        </div>
      ) : (
        // Simplified view for modal usage
        <div className="p-4">
          <div className="mb-4">
            <button className="btn btn-primary" onClick={handleAdd}>
              <FaPlus className="me-2" /> Nuevo Grupo
            </button>
          </div>

          {/* Single category view shows groups directly */}
          <div className="row g-3">
            {groups.map(group => (
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

          <GroupModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onSave={handleSave}
            group={editingGroup}
            getAvailableStudents={getAvailableStudents}
            mode={editingGroup ? 'editManager' : 'newManager'}
          />

          <GroupTypeModal
            show={showTypeModal}
            onHide={() => setShowTypeModal(false)}
            onSave={handleAddType}
          />
        </div>
      )}
    </div>
  )
}

export default GroupManager
