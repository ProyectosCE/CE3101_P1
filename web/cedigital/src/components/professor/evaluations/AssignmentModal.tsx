import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaFileUpload, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { useGroupsStore } from '@/stores/groupsStore'
import { useRelationshipStore } from '@/stores/relationshipsStore'
import type { Assignment, Rubric } from '@/types/evaluation'
import type { Group, GroupActivity } from '@/types/groups'
import EvaluationGroupsModal from './EvaluationGroupsModal'

interface GroupCreationResult {
  exists: boolean
  groupType?: GroupActivity
}

interface AssignmentModalProps {
  show: boolean
  onHide: () => void
  onSave: (assignment: Assignment) => void
  assignment: Assignment | null
  rubrics: Rubric[]
  groups: Group[]
  groupTypes: GroupActivity[]
  onCreateGroups: (activityName: string) => GroupCreationResult
  onEditGroups: (groupTypeId: string) => void
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  show,
  onHide,
  onSave,
  assignment,
  rubrics,
  onCreateGroups,
  onEditGroups
}) => {
  const relationships = useRelationshipStore()
  const { groupTypes, getGroupsByType } = useGroupsStore()
  const [form, setForm] = useState<Assignment>({
    id: '',
    title: '',
    description: '',
    rubricId: '',
    weight: 0,
    dueDate: '',
    dueTime: '',
    isGroupWork: false,
    instructionsFile: null,
    groupTypeId: undefined,
    groupOption: undefined
  })
  const [showGroupsModal, setShowGroupsModal] = useState(false)
  const [isModalHidden, setIsModalHidden] = useState(false)

  useEffect(() => {
    if (show) {
      if (assignment) {
        setForm({
          ...assignment,
          groupTypeId: assignment.groupTypeId || undefined,
          groupOption: assignment.groupOption || undefined
        })
      } else {
        setForm({
          id: '',
          title: '',
          description: '',
          rubricId: '',
          weight: 0,
          dueDate: '',
          dueTime: '',
          isGroupWork: false,
          instructionsFile: null,
          groupTypeId: undefined,
          groupOption: undefined
        })
      }
    }
  }, [show, assignment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Save the assignment first
    onSave(form)

    // Si es trabajo grupal y tiene una categoría asignada
    if (form.isGroupWork && form.groupTypeId) {
      // Solo vinculamos la categoría con la evaluación
      relationships.linkCategoryToAssignment(form.groupTypeId, form.id)
    }
  }

  // Get the number of groups in a category using relationships
  const getGroupCount = (categoryId: string) => {
    return relationships.getGroupsInCategory(categoryId).length
  }

  // Get the current group type name
  const getCurrentGroupTypeName = () => {
    return groupTypes.find(t => t.id === form.groupTypeId)?.name || ''
  }

  const handleCreateGroups = () => {
    const result = onCreateGroups(form.title)
    if (result.exists && result.groupType) {
      const groupTypeId = result.groupType.id
      setForm(prev => ({ 
        ...prev, 
        groupTypeId,
        groupOption: 'existing'
      }))
    } else if (!result.exists) {
      setIsModalHidden(true)
      setShowGroupsModal(true)
    }
  }

  const handleEditGroups = (typeId: string) => {
    setIsModalHidden(true)
    setShowGroupsModal(true)
  }

  const handleGroupsModalClose = () => {
    setShowGroupsModal(false)
    setIsModalHidden(false)
  }

  const handleEditComplete = () => {
    // Refresh groups data
    setShowGroupsModal(false)
    setIsModalHidden(false)
  }

  return (
    <>
      <Modal show={show && !isModalHidden} onHide={onHide} size="lg">
        <form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {assignment ? 'Editar Evaluación' : 'Nueva Evaluación'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Rubro</label>
                <select
                  className="form-select"
                  value={form.rubricId}
                  onChange={e => setForm({ ...form, rubricId: e.target.value })}
                >
                  <option value="">Seleccionar rubro...</option>
                  {rubrics.map(rubric => (
                    <option key={rubric.id} value={rubric.id}>
                      {rubric.name} ({rubric.weight}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Peso (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.weight}
                  onChange={e => setForm({ ...form, weight: Number(e.target.value) })}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Fecha de entrega</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Hora de entrega</label>
                <input
                  type="time"
                  className="form-control"
                  value={form.dueTime}
                  onChange={e => setForm({ ...form, dueTime: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Instrucciones (PDF)</label>
                <div className="input-group">
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf"
                    onChange={e => setForm({ 
                      ...form, 
                      instructionsFile: e.target.files ? e.target.files[0] : null 
                    })}
                  />
                  <span className="input-group-text">
                    <FaFileUpload />
                  </span>
                </div>
              </div>

              <div className="col-12">
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="groupWork"
                    checked={form.isGroupWork}
                    onChange={e => {
                      setForm(prev => ({ 
                        ...prev, 
                        isGroupWork: e.target.checked,
                        groupOption: undefined,
                        groupTypeId: undefined 
                      }))
                    }}
                  />
                  <label className="form-check-label" htmlFor="groupWork">
                    Trabajo grupal
                  </label>
                </div>

                {form.isGroupWork && (
                  <div className="card mt-2">
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label d-block">Configuración de grupos</label>
                        <div className="btn-group" role="group">
                          <input
                            type="radio"
                            className="btn-check"
                            name="groupOption"
                            id="existing"
                            checked={form.groupOption === 'existing'}
                            onChange={() => setForm(prev => ({ ...prev, groupOption: 'existing' }))
                            }
                          />
                          <label className="btn btn-outline-primary" htmlFor="existing">
                            Usar grupos existentes
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name="groupOption"
                            id="new"
                            checked={form.groupOption === 'new'}
                            onChange={() => setForm(prev => ({ ...prev, groupOption: 'new' }))
                            }
                          />
                          <label className="btn btn-outline-primary" htmlFor="new">
                            Crear nuevos grupos
                          </label>
                        </div>
                      </div>

                      {form.groupOption === 'existing' && (
                        <div className="mb-3">
                          <select
                            className="form-select mb-2"
                            value={form.groupTypeId || ''}
                            onChange={e => setForm(prev => ({ ...prev, groupTypeId: e.target.value }))}
                          >
                            <option value="">Seleccionar categoría de grupos...</option>
                            {groupTypes.map(type => {
                              const groupCount = getGroupCount(type.id)
                              return (
                                <option key={type.id} value={type.id}>
                                  {type.name} ({groupCount} grupos)
                                </option>
                              )
                            })}
                          </select>
                          {form.groupTypeId && (
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleEditGroups(form.groupTypeId!)}
                              >
                                <FaEdit className="me-1" /> Editar grupos
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                              >
                                <FaTrash className="me-1" /> Cambiar categoría
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {form.groupOption === 'new' && (
                        <div>
                          <p className="text-muted">
                            Se creará una nueva categoría de grupos llamada "{form.title}"
                          </p>
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={handleCreateGroups}
                          >
                            <FaPlus className="me-1" /> Gestionar grupos
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      {showGroupsModal && (
        <EvaluationGroupsModal
          show={true}
          onHide={handleGroupsModalClose}
          groupTypeId={form.groupTypeId || ''}
          groupTypeName={getCurrentGroupTypeName()}
          onComplete={handleGroupsModalClose}
          mode="edit"
        />
      )}
    </>
  )
}

export default AssignmentModal
