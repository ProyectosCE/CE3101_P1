import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import GroupModal from './groups/GroupModal'
import GroupTypeModal from './groups/GroupTypeModal'
import { categoryApi, minigroupApi } from '@/Functions/Professor/groupManagerApi'
import { getStudentsByCourse } from '@/Functions/Professor/studentsApi'
import type { Category, Minigroup} from '@/Functions/Professor/groupManagerApi'
import type { Group, GroupActivity } from '@/types/groups'
import type { Student as GroupStudent } from '@/types/groups'

// Update Student interface to match API data
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
  courseId?: string;
}

// Update type conversion functions
const categoryToGroupType = (category: Category): GroupActivity => ({
  id: category.id_categoria.toString(),
  name: category.nombre_categoria
})

const groupTypeToNewCategory = (groupType: GroupActivity): Omit<Category, 'id_categoria' | 'id_grupo'> => ({
  nombre_categoria: groupType.name
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
  singleCategory = false,
  courseId
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [minigroups, setMinigroups] = useState<Minigroup[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Minigroup | null>(null)
  const [isEditingGroup, setIsEditingGroup] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Modified loadData function that can be reused
  const loadData = async () => {
    setLoading(true)
    try {
      const { data: categoriesData } = await categoryApi.getCategories(Number(courseId))
      setCategories(categoriesData)

      if (categoryId) {
        let minigroupsData = []
        try {
          const { data } = await minigroupApi.getMinigroupsByCategory(Number(categoryId))
          minigroupsData = data
        } catch (err: any) {
          // Si es 404, simplemente deja minigroupsData vacío
          if (!(err?.response && err.response.status === 404)) {
            console.error('Error loading minigroups:', err)
          }
          minigroupsData = []
        }
        // Map API minigrupos to internal Minigroup structure
        const mappedMinigroups = Array.isArray(minigroupsData)
          ? minigroupsData.map((mg: any) => ({
              id: mg.id.toString(),
              idCat: mg.idCategoria?.toString() ?? '',
              nombre: mg.nombre,
              estudiantes: mg.estudiantes.map((est: any) => ({
                carnet: est.carnet,
                nombre: `${est.nombre} ${est.apellidos}`.trim()
              }))
            }))
          : []
        setMinigroups(mappedMinigroups)
      } else {
        const minigroupPromises = categoriesData.map(async category => {
          try {
            const response = await minigroupApi.getMinigroupsByCategory(category.id_categoria)
            return response.data
          } catch (err: any) {
            // Si es 404, retorna array vacío
            if (err?.response && err.response.status === 404) {
              return []
            }
            console.error('Error loading minigroups:', err)
            return []
          }
        })
        const minigroupResponses = await Promise.all(minigroupPromises)
        const allMinigroups = minigroupResponses.flatMap(response =>
          Array.isArray(response)
            ? response.map((mg: any) => ({
                id: mg.id.toString(),
                idCat: mg.idCategoria?.toString() ?? '',
                nombre: mg.nombre,
                estudiantes: mg.estudiantes.map((est: any) => ({
                  carnet: est.carnet,
                  nombre: `${est.nombre} ${est.apellidos}`.trim()
                }))
              }))
            : []
        )
        // Remove potential duplicates by ID
        const uniqueMinigroups = Array.from(
          new Map(allMinigroups.map(group => [group.id, group])).values()
        )
        setMinigroups(uniqueMinigroups)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  // Load categories and minigroups
  useEffect(() => {
    loadData()
  }, [categoryId])

  // Remove loadMinigroupsForCategory since we load all data at once
  const handleCategoryClick = (categoryId: string) => {
    setExpandedType(expandedType === categoryId ? null : categoryId)
  }

  const handleAddCategory = async (category: Category) => {
    try {
      const { data } = await categoryApi.createCategory({
        nombre_categoria: category.nombre_categoria,
        id_grupo: Number(courseId)
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
    await refreshCategories()

  }

  const handleAdd = () => {
    setEditingGroup({
      id: '',
      idCat: categoryId || '', // Use current category if in single category mode
      nombre: '',
      estudiantes: []
    })
    setIsEditingGroup(false)
    setShowModal(true)
  }

  const handleEdit = (group: Minigroup) => {
    setEditingGroup(group)
    setIsEditingGroup(true)
    setShowModal(true)
  }

  // Update type before saving
  const handleSaveMinigroup = async (group: Group) => {
    const minigroup = groupToMinigroup(group)
    try {
      if (isEditingGroup) {
        // Editar: PATCH
        await minigroupApi.updateMinigroup(
          minigroup.idCat,
          minigroup.id,
          {
            nombre: minigroup.nombre,
            estudiantes: minigroup.estudiantes.map(e => e.carnet)
          }
        )
        setMinigroups(prev => prev.map(g => g.id === minigroup.id ? minigroup : g))
      } else {
        // Nuevo: POST
        await minigroupApi.createMinigroup(
          Number(minigroup.idCat),
          {
            idCategoria: Number(minigroup.idCat),
            nombreGrupo: minigroup.nombre,
            estudiantes: minigroup.estudiantes.map(e => e.carnet)
          }
        )
        await loadData()
      }
      setShowModal(false)
      setEditingGroup(null)
      setIsEditingGroup(false)
    } catch (error) {
      console.error('Error saving minigroup:', error)
      alert('Error al guardar el grupo')
    }
  }

  const getAvailableStudents = (activityId: string | null, excludeGroupId?: string): GroupStudent[] => {
    // Just return empty array - actual filtering happens in GroupModal
    return []
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
    await refreshCategories()
  }

  // Update refreshCategories to use loadData
  const refreshCategories = () => loadData()

  // Update category type
  const handleAddType = async (groupType: GroupActivity) => {
    try {
      await categoryApi.createCategory({
        nombre_categoria: groupType.name,
        id_grupo: Number(courseId)
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
      return [{ id_categoria: categoryId || '', nombre_categoria: categoryName || 'Grupos', id_grupo: '' }]
    }
    return categories
  }, [singleCategory, categoryId, categoryName, categories])

  // Prepare a list of categories with id and nombre_categoria for the dropdown
  const categoryOptions = categories.map(cat => ({
    id_categoria: cat.id_categoria,
    nombre_categoria: cat.nombre_categoria
  }))

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
            const typeGroups = minigroups.filter(g => g.idCat === type.id_categoria.toString())
            console.log(`Groups for ${type.nombre_categoria}:`, typeGroups) // Debug logging using nombre instead of name

            return (
              <div key={type.id_categoria} className="mb-4">
                <div className="card">
                  <div 
                    className="card-header bg-light d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCategoryClick(type.id_categoria.toString())}
                  >
                    <div className="d-flex align-items-center">
                      <h6 className="mb-0">{type.nombre_categoria}</h6>
                      <span className="badge bg-secondary ms-2">
                        {typeGroups.length} grupo{typeGroups.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {type.id_categoria !== 'general' && (
                      <button
                        className="btn btn-outline-danger btn-sm ms-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCategory(type.id_categoria.toString())
                        }}
                      >
                        <FaTrash /> Eliminar Categoría
                      </button>
                    )}
                  </div>

                  {expandedType === type.id_categoria.toString() && (
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
                                      onClick={() => handleDeleteMinigroup(type.id_categoria.toString(), group.id)}
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
            onHide={() => {
              setShowModal(false)
              setEditingGroup(null)
              setIsEditingGroup(false)
            }}
            onSave={handleSaveMinigroup}
            group={editingGroup ? minigroupToGroup(editingGroup) : null}
            mode={isEditingGroup ? 'editManager' : 'newManager'}
            getAvailableStudents={getAvailableStudents}
            availableCategories={categoryOptions}
            selectedCategoryId={categoryId || undefined}
            courseId={courseId}
            minigroups={minigroups}
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
            mode={isEditingGroup ? 'editManager' : 'newManager'}
            getAvailableStudents={getAvailableStudents}
            availableCategories={categoryOptions}
            selectedCategoryId={categoryId || undefined}
            courseId={courseId}
            minigroups={minigroups}
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
