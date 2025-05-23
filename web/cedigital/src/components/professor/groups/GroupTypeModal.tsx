import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { v4 as uuidv4 } from 'uuid'
import { GroupActivity } from '@/types/groups'

interface GroupTypeModalProps {
  show: boolean
  onHide: () => void
  onSave: (groupType: GroupActivity) => void
}

const GroupTypeModal: React.FC<GroupTypeModalProps> = ({ show, onHide, onSave }) => {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: uuidv4(),
      name: name.trim()
    })
    setName('')
    onHide()
  }

  return (
    <Modal show={show} onHide={onHide}>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Tipo de Grupo</Modal.Title>
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
