// src/components/admin/CourseManager.tsx
import React, { useState } from 'react'

interface GroupEntry {
  courseCode: string
  group: string
  professors: string
  studentInputMethod: 'manual' | 'excel'
  studentsManual: string
  studentsFile: File | null
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

const CourseManager: React.FC = () => {
  const [formGroups, setFormGroups] = useState<GroupEntry[]>([])
  const [createdGroups, setCreatedGroups] = useState<GroupEntry[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingGroup, setEditingGroup] = useState<GroupEntry | null>(null)

  const addGroupForm = () =>
    setFormGroups([
      ...formGroups,
      {
        courseCode: '',
        group: '',
        professors: '',
        studentInputMethod: 'manual',
        studentsManual: '',
        studentsFile: null,
      },
    ])

  const updateFormGroup = (
    idx: number,
    field: keyof GroupEntry,
    value: string | File | null
  ) => {
    const copy = [...formGroups]
    ;(copy[idx] as any)[field] = value
    setFormGroups(copy)
  }

  const removeFormGroup = (idx: number) =>
    setFormGroups(formGroups.filter((_, i) => i !== idx))

  const allFieldsFilled = (g: GroupEntry) =>
    g.courseCode.trim() !== '' &&
    g.group.trim() !== '' &&
    g.professors.trim() !== '' &&
    (g.studentInputMethod === 'manual'
      ? g.studentsManual.trim() !== ''
      : g.studentsFile !== null)

  const createGroup = (idx: number) => {
    const g = formGroups[idx]
    setCreatedGroups([...createdGroups, g])
    removeFormGroup(idx)
  }

  const handleEdit = (idx: number) => {
    setEditingIndex(idx)
    setEditingGroup({ ...createdGroups[idx] })
  }

  const updateEditingGroup = (
    field: keyof GroupEntry,
    value: string | File | null
  ) => {
    if (!editingGroup) return
    setEditingGroup({ ...editingGroup, [field]: value })
  }

  const saveEdit = () => {
    if (editingIndex === null || !editingGroup) return
    const copy = [...createdGroups]
    copy[editingIndex] = editingGroup
    setCreatedGroups(copy)
    setEditingIndex(null)
    setEditingGroup(null)
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingGroup(null)
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Cursos</h2>

      <div className="mb-4">
        <button className="btn btn-secondary" onClick={addGroupForm}>
          + Crear Grupo
        </button>
      </div>

      {formGroups.map((g, i) => (
        <div key={i} className="border rounded p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Grupo #{i + 1}</strong>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => removeFormGroup(i)}
            >
              Eliminar
            </button>
          </div>
          <div className="row mb-3">
            <div className="col-md-4 mb-2">
              <label className="form-label">Código de Curso</label>
              <input
                type="text"
                className="form-control"
                value={g.courseCode}
                onChange={(e) =>
                  updateFormGroup(i, 'courseCode', e.target.value)
                }
              />
            </div>
            <div className="col-md-4 mb-2">
              <label className="form-label">Número de Grupo</label>
              <input
                type="text"
                className="form-control"
                value={g.group}
                onChange={(e) => updateFormGroup(i, 'group', e.target.value)}
              />
            </div>
            <div className="col-md-4 mb-2">
              <label className="form-label">Profesor(es)</label>
              <input
                type="text"
                className="form-control"
                value={g.professors}
                onChange={(e) =>
                  updateFormGroup(i, 'professors', e.target.value)
                }
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6 mb-2">
              <label className="form-label">Método de Estudiantes</label>
              <select
                className="form-select"
                value={g.studentInputMethod}
                onChange={(e) =>
                  updateFormGroup(
                    i,
                    'studentInputMethod',
                    e.target.value as 'manual' | 'excel'
                  )
                }
              >
                <option value="manual">Manual</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            <div className="col-md-6 mb-2">
              {g.studentInputMethod === 'manual' ? (
                <>
                  <label className="form-label">Estudiantes (Carnet)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={g.studentsManual}
                    onChange={(e) =>
                      updateFormGroup(i, 'studentsManual', e.target.value)
                    }
                  />
                </>
              ) : (
                <>
                  <label className="form-label">
                    Cargar Excel de Estudiantes
                  </label>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="form-control"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        updateFormGroup(i, 'studentsFile', e.target.files[0])
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>
          <button
            className="btn btn-success"
            disabled={!allFieldsFilled(g)}
            onClick={() => createGroup(i)}
          >
            Crear Grupo
          </button>
        </div>
      ))}

      <h3 className="mt-5 mb-3">Grupos Creados</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Código Curso</th>
            <th>Número de Grupo</th>
            <th>Profesor(es)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {createdGroups.map((g, i) => (
            <tr key={i}>
              <td>{g.courseCode}</td>
              <td>{g.group}</td>
              <td>{g.professors}</td>
              <td>
                <button
                  className="btn btn-sm btn-info me-1"
                  onClick={() => handleEdit(i)}
                >
                  Visualizar
                </button>
                <button
                  className="btn btn-sm btn-primary me-1"
                  onClick={() => handleEdit(i)}
                >
                  Editar
                </button>
                <button className="btn btn-sm btn-danger">
                  Deshabilitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingIndex !== null && editingGroup && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Editar Grupo</h5>
              <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                X
              </button>
            </div>

            {/* Campos de edición */}
            <div className="mb-3">
              <label className="form-label">Código de Curso</label>
              <input
                type="text"
                className="form-control"
                value={editingGroup.courseCode}
                onChange={(e) =>
                  updateEditingGroup('courseCode', e.target.value)
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Número de Grupo</label>
              <input
                type="text"
                className="form-control"
                value={editingGroup.group}
                onChange={(e) => updateEditingGroup('group', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Profesor(es)</label>
              <input
                type="text"
                className="form-control"
                value={editingGroup.professors}
                onChange={(e) =>
                  updateEditingGroup('professors', e.target.value)
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Método de Estudiantes</label>
              <select
                className="form-select"
                value={editingGroup.studentInputMethod}
                onChange={(e) =>
                  updateEditingGroup(
                    'studentInputMethod',
                    e.target.value as 'manual' | 'excel'
                  )
                }
              >
                <option value="manual">Manual</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            {editingGroup.studentInputMethod === 'manual' ? (
              <div className="mb-3">
                <label className="form-label">Estudiantes (Carnet)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingGroup.studentsManual}
                  onChange={(e) =>
                    updateEditingGroup('studentsManual', e.target.value)
                  }
                />
              </div>
            ) : (
              <div className="mb-3">
                <label className="form-label">Cargar Excel de Estudiantes</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="form-control"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      updateEditingGroup('studentsFile', e.target.files[0])
                    }
                  }}
                />
              </div>
            )}

            <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-secondary me-2" onClick={cancelEdit}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={saveEdit}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseManager
