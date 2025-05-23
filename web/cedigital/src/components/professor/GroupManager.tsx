import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import GroupModal from './groups/GroupModal'
import GroupTypeModal from './groups/GroupTypeModal'
import { categoryApi, minigroupApi } from '@/Functions/Professor/groupManagerApi'
import type { Category, Minigroup} from '@/Functions/Professor/groupManagerApi'
import type { Group, GroupActivity } from '@/types/groups'

// Update Student interface to match API data
interface Student {
  carnet: string
  nombre: string
}

interface StudentInfo {
  carnet: string
  nombre: string
}

interface GroupManagerProps {
  initialGroups?: Minigroup[]
  categoryId?: string | null
  categoryName?: string
  onSave?: (groups: Minigroup[]) => void
  standalone?: boolean
  singleCategory?: boolean
}

// Update type conversion functions
const categoryToGroupType = (category: Category): GroupActivity => ({
  id: category.id,
  name: category.nombre
})

const groupTypeToNewCategory = (groupType: GroupActivity): Omit<Category, 'id'> => ({
  nombre: groupType.name
})

const minigroupToGroup = (mini: Minigroup): Group => ({
  id: mini.id,
  name: mini.nombre,
  activityId: mini.idCat,
  members: mini.estudiantes.map(student => ({
    carnet: student.carnet,
    nombre: student.nombre,
    apellido1: '',
    apellido2: ''
  }))
})

const groupToMinigroup = (group: Group): Minigroup => ({
  id: group.id,
  idCat: group.activityId || '',
  nombre: group.name,
  estudiantes: group.members.map(m => ({ 
    carnet: m.carnet,
    nombre: m.nombre
  }))
})

const GroupManager: React.FC<GroupManagerProps> = ({
  categoryId = null,
  categoryName = '',
  onSave,
  standalone = true,
  singleCategory = false
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [minigroups, setMinigroups] = useState<Minigroup[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Minigroup | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Load categories and minigroups
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [categoriesRes, minigroupsRes] = await Promise.all([
          categoryApi.getCategories(),
          categoryId ? minigroupApi.getMinigroupsByCategory(categoryId) : null
        ])

        setCategories(categoriesRes.data.categorias)
        if (minigroupsRes) {
          setMinigroups(minigroupsRes.data.minigrupos)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [categoryId])

  // Modify loadMinigroupsForCategory to handle student info
  const loadMinigroupsForCategory = async (categoryId: string) => {
    try {
      const { data } = await minigroupApi.getMinigroupsByCategory(categoryId)
      setMinigroups(data.minigrupos)
    } catch (error) {
      console.error('Error loading minigroups:', error)
    }
  }

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    if (expandedType === categoryId) {
      setExpandedType(null);
    } else {
      setExpandedType(categoryId);
      loadMinigroupsForCategory(categoryId);
    }
  };

  const handleAddCategory = async (category: Category) => {
    try {
      const { data } = await categoryApi.createCategory({
        nombre: category.nombre
      })
      setCategories(prev => [...prev, data.categoria])
      setShowTypeModal(false)
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error al crear la categoría')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Está seguro de eliminar esta categoría y todos sus grupos?')) return

    try {
      await categoryApi.deleteCategory(categoryId)
      setCategories(prev => prev.filter(c => c.id !== categoryId))
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error al eliminar la categoría')
    }
  }

  const handleAdd = () => {
    setEditingGroup({
      id: '',
      idCat: categoryId || '', // Use current category if in single category mode
      nombre: '',
      estudiantes: []
    })
    setShowModal(true)
  }

  const handleEdit = (group: Minigroup) => {
    setEditingGroup(group)
    setShowModal(true)
  }

  // Update type before saving
  const handleSaveMinigroup = async (group: Group) => {
    const minigroup = groupToMinigroup(group)
    try {
      if (editingGroup) {
        await minigroupApi.updateMinigroup(
          minigroup.idCat,
          minigroup.id,
          {
            nombre: minigroup.nombre,
            estudiantes: minigroup.estudiantes
          }
        )
        setMinigroups(prev => prev.map(g => g.id === minigroup.id ? minigroup : g))
      } else {
        const { data } = await minigroupApi.createMinigroup(
          minigroup.idCat,
          {
            nombre: minigroup.nombre,
            estudiantes: minigroup.estudiantes,
            idCat: minigroup.idCat
          }
        )
        setMinigroups(prev => [...prev, data.minigrupo])
      }
      setShowModal(false)
      setEditingGroup(null)
    } catch (error) {
      console.error('Error saving minigroup:', error)
      alert('Error al guardar el grupo')
    }
  }

  const getAvailableStudents = (activityId: string | null, excludeGroupId?: string) => {
    // TODO: Implement this with real student data from API
    return [{
      carnet: '',
      nombre: '',
      apellido1: '',
      apellido2: ''
    }] // Return empty array with correct type
  }

  const handleDeleteMinigroup = async (categoryId: string, groupId: string) => {
    if (!confirm('¿Está seguro de eliminar este grupo?')) return
    try {
      await minigroupApi.deleteMinigroup(categoryId, groupId)
      setMinigroups(prev => prev.filter(g => g.id !== groupId))
    } catch (error) {
      console.error('Error deleting minigroup:', error)
      alert('Error al eliminar el grupo')
    }
  }

  // Refresh categories after creation
  const refreshCategories = async () => {
    try {
      const { data } = await categoryApi.getCategories()
      setCategories(data.categorias)
    } catch (error) {
      console.error('Error refreshing categories:', error)
    }
  }

  // Update category type
  const handleAddType = async (groupType: GroupActivity) => {
    try {
      await categoryApi.createCategory({
        nombre: groupType.name
      })
      // Refresh categories to get the new one with server-generated ID
      await refreshCategories()
      setShowTypeModal(false)
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error al crear la categoría')
    }
  }

  // Use existing categories from state for list
  const groupTypesList = React.useMemo(() => {
    if (singleCategory) {
      return [{ id: categoryId || '', nombre: categoryName || 'Grupos' }]
    }
    
    // Return categories directly without general group
    return categories
  }, [singleCategory, categoryId, categoryName, categories])

  if (loading) {
    return <div className="text-center">Cargando...</div>
  }

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
                <FaPlus className="me-1" /> Nueva Categoría
              </button>
              <button className="btn btn-primary" onClick={handleAdd}>
                <FaPlus className="me-2" /> Nuevo Grupo
              </button>
            </div>
          </div>

          {groupTypesList.map(type => {
            const typeGroups = minigroups.filter(g => g.idCat === type.id)
            console.log(`Groups for ${type.nombre}:`, typeGroups) // Debug logging using nombre instead of name

            return (
              <div key={type.id} className="mb-4">
                <div className="card">
                  <div 
                    className="card-header bg-light d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCategoryClick(type.id)}
                  >
                    <div className="d-flex align-items-center">
                      <h6 className="mb-0">{type.nombre}</h6>
                      <span className="badge bg-secondary ms-2">
                        {typeGroups.length} grupo{typeGroups.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {type.id !== 'general' && (
                      <button
                        className="btn btn-outline-danger btn-sm ms-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCategory(type.id)
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
                                    {group.nombre}
                                    <span className="badge bg-info">
                                      {group.estudiantes.length} {group.estudiantes.length === 1 ? 'miembro' : 'miembros'}
                                    </span>
                                  </h6>
                                  <div className="small text-muted mt-2">
                                    {group.estudiantes.map(student => (
                                      <div key={student.carnet} className="d-flex justify-content-between align-items-center mb-1">
                                        <span>{student.nombre}</span>
                                        <span className="text-secondary">{student.carnet}</span>
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
                                      onClick={() => handleDeleteMinigroup(type.id, group.id)}
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
            onSave={handleSaveMinigroup}
            group={editingGroup ? minigroupToGroup(editingGroup) : null}
            mode={editingGroup?.id ? 'editManager' : 'newManager'}
            getAvailableStudents={getAvailableStudents}
            availableCategories={categories} // Pass existing categories
            selectedCategoryId={categoryId || undefined} // Pass current category if any
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
            {minigroups.map(group => (
              <div key={group.id} className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title d-flex justify-content-between">
                      {group.nombre}
                      <span className="badge bg-info">
                        {group.estudiantes.length} {group.estudiantes.length === 1 ? 'miembro' : 'miembros'}
                      </span>
                    </h6>
                    <div className="small text-muted mt-2">
                      {group.estudiantes.map(student => (
                        <div key={student.carnet} className="d-flex justify-content-between align-items-center mb-1">
                          <span>{student.nombre}</span>
                          <span className="text-secondary">{student.carnet}</span>
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
                        onClick={() => handleDeleteMinigroup(group.idCat, group.id)}
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
            onSave={handleSaveMinigroup}
            group={editingGroup ? minigroupToGroup(editingGroup) : null}
            mode={editingGroup?.id ? 'editManager' : 'newManager'}
            getAvailableStudents={getAvailableStudents}
            availableCategories={categories} // Pass existing categories
            selectedCategoryId={categoryId || undefined} // Pass current category if any
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
