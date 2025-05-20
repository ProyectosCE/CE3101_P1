// src/components/admin/SchoolManager.tsx
import React, { useState } from 'react'

interface SchoolEntry {
  code: string
  name: string
  disabled?: boolean
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: '1.5rem',
  width: '90%',
  maxWidth: 500,
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
}

const SchoolManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [newSchool, setNewSchool] = useState<SchoolEntry>({ code: '', name: '' })
  const [createdSchools, setCreatedSchools] = useState<SchoolEntry[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingSchool, setEditingSchool] = useState<SchoolEntry | null>(null)

  const updateNewSchool = (field: keyof SchoolEntry, value: string) => {
    setNewSchool({ ...newSchool, [field]: value })
  }

  const resetForm = () => {
    setNewSchool({ code: '', name: '' })
    setShowForm(false)
  }

  const createSchool = () => {
    if (!allFieldsFilled(newSchool)) return
    setCreatedSchools([...createdSchools, newSchool])
    resetForm()
  }

  const isValidSchoolCode = (code: string) => /^[A-Z]{2}$/.test(code)

  const allFieldsFilled = (s: SchoolEntry) =>
    isValidSchoolCode(s.code) && s.name.trim() !== ''

  const handleEdit = (idx: number) => {
    setEditingIndex(idx)
    setEditingSchool({ ...createdSchools[idx] })
  }

  const updateEditingSchool = (field: keyof SchoolEntry, value: string) => {
    if (!editingSchool) return
    setEditingSchool({ ...editingSchool, [field]: value })
  }

  const saveEdit = () => {
    if (editingIndex === null || !editingSchool || !allFieldsFilled(editingSchool)) return
    const copy = [...createdSchools]
    copy[editingIndex] = editingSchool
    setCreatedSchools(copy)
    setEditingIndex(null)
    setEditingSchool(null)
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingSchool(null)
  }

  const toggleDisabled = (idx: number) => {
    const copy = [...createdSchools]
    copy[idx] = { ...copy[idx], disabled: !copy[idx].disabled }
    setCreatedSchools(copy)
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Escuelas</h2>

      <div className="mb-4">
        <button 
          className={`btn ${showForm ? 'btn-danger' : 'btn-secondary'}`} 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '- Cancelar' : '+ Crear Escuela'}
        </button>
      </div>

      {showForm && (
        <div className="border rounded p-3 mb-3">
          <div className="row mb-3">
            <div className="col-md-4 mb-2">
              <label className="form-label">Código de Escuela (2 letras)</label>
              <input
                type="text"
                className="form-control"
                value={newSchool.code}
                onChange={(e) => updateNewSchool('code', e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <div className="col-md-8 mb-2">
              <label className="form-label">Nombre de la Escuela</label>
              <input
                type="text"
                className="form-control"
                value={newSchool.name}
                onChange={(e) => updateNewSchool('name', e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn btn-success"
            disabled={!allFieldsFilled(newSchool)}
            onClick={createSchool}
          >
            Crear Escuela
          </button>
        </div>
      )}

      <h3 className="mt-5 mb-3">Escuelas Registradas</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {createdSchools.map((s, i) => (
            <tr key={i} className={s.disabled ? 'opacity-50' : ''}>
              <td>{s.code}</td>
              <td>
                {s.name}
                {s.disabled && (
                  <span className="text-danger border border-danger rounded px-1 ms-2 small" style={{ fontSize: '0.7em' }}>
                    Deshabilitada
                  </span>
                )}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-1"
                  onClick={() => handleEdit(i)}
                  disabled={s.disabled}
                >
                  Editar
                </button>
                <button 
                  className={`btn btn-sm ${s.disabled ? 'btn-success' : 'btn-danger'}`}
                  onClick={() => toggleDisabled(i)}
                >
                  {s.disabled ? 'Habilitar' : 'Deshabilitar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingIndex !== null && editingSchool && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Editar Escuela</h5>
              <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                X
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Código de Escuela (2 letras)</label>
              <input
                type="text"
                className="form-control"
                value={editingSchool.code}
                onChange={(e) => updateEditingSchool('code', e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre de la Escuela</label>
              <input
                type="text"
                className="form-control"
                value={editingSchool.name}
                onChange={(e) => updateEditingSchool('name', e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-secondary me-2" onClick={cancelEdit}>
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveEdit}
                disabled={!allFieldsFilled(editingSchool)}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchoolManager
