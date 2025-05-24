import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { v4 as uuidv4 } from 'uuid'
import { GroupActivity } from '@/types/groups'

interface GroupTypeModalProps {
  show: boolean
  onHide: () => void
  onSave: (groupType: GroupActivity) => void
  editingType?: GroupActivity | null // Nuevo prop opcional para edición
}

const GroupTypeModal: React.FC<GroupTypeModalProps> = ({ show, onHide, onSave, editingType = null }) => {
  const [name, setName] = useState('')
  const [isEditingType, setIsEditingType] = useState(false)

  // Efecto para inicializar el modal según si es edición o nuevo
  useEffect(() => {
    if (show) {
      if (editingType) {
        setName(editingType.name)
        setIsEditingType(true)
      } else {
        setName('')
        setIsEditingType(false)
      }
    }
  }, [show, editingType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: editingType ? editingType.id : uuidv4(),
      name: name.trim()
    })
    setName('')
    setIsEditingType(false)
    onHide()
  }

  return (
    <Modal show={show} onHide={onHide}>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditingType ? 'Editar Categoría' : 'Nuevo Tipo de Grupo'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Proyecto Final, Trabajo en Clase..."
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={onHide}>
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!name.trim()}
          >
            Guardar
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default GroupTypeModal
