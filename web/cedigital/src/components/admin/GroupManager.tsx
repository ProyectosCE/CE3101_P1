import React, { useState } from 'react'

interface GroupEntry {
  courseCode: string
  groupNumber: string
  professorIds: string[]
  disabled?: boolean
  semesterId: string
  year: number
}

const overlayStyle: React.CSSProperties = {
  // ...existing code...
}

const modalStyle: React.CSSProperties = {
  // ...existing code...
}

const GroupManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newGroup, setNewGroup] = useState<GroupEntry>({
    courseCode: '',
    groupNumber: '',
    professorIds: [''],
    semesterId: '',
    year: new Date().getFullYear()
  })
  const [createdGroups, setCreatedGroups] = useState<GroupEntry[]>([])

  const isValidCourseCode = (code: string) => /^[A-Z]{2}\d{4}$/.test(code)
  const isValidGroupNumber = (num: string) => /^\d{2}$/.test(num)
  const isValidProfessorId = (id: string) => /^\d+$/.test(id)
  const isValidYear = (year: number) => year >= 2000 && year <= 2100

  const allFieldsFilled = (g: GroupEntry) =>
    isValidCourseCode(g.courseCode) &&
    isValidGroupNumber(g.groupNumber) &&
    g.professorIds.length > 0 &&
    g.professorIds.every(id => isValidProfessorId(id)) &&
    g.semesterId &&
    isValidYear(g.year)

  const addProfessorField = () => {
    setNewGroup({
      ...newGroup,
      professorIds: [...newGroup.professorIds, '']
    })
  }

  const removeProfessorField = (index: number) => {
    setNewGroup({
      ...newGroup,
      professorIds: newGroup.professorIds.filter((_, i) => i !== index)
    })
  }

  const updateProfessorId = (index: number, value: string) => {
    const newProfessorIds = [...newGroup.professorIds]
    newProfessorIds[index] = value
    setNewGroup({
      ...newGroup,
      professorIds: newProfessorIds
    })
  }

  const updateField = (field: keyof Omit<GroupEntry, 'professorIds'>, value: string | number) => {
    setNewGroup({
      ...newGroup,
      [field]: value
    })
  }

  const resetForm = () => {
    setNewGroup({
      courseCode: '',
      groupNumber: '',
      professorIds: [''],
      semesterId: '',
      year: new Date().getFullYear()
    })
    setShowForm(false)
  }

  const createGroup = () => {
    if (!allFieldsFilled(newGroup)) return
    setCreatedGroups([...createdGroups, newGroup])
    resetForm()
  }

  // Group by course code
  const groupsByCourse = createdGroups.reduce((acc, group) => {
    const courseCode = group.courseCode
    if (!acc[courseCode]) {
      acc[courseCode] = []
    }
    acc[courseCode].push(group)
    return acc
  }, {} as Record<string, GroupEntry[]>)

  // Filter groups based on search
  const filteredGroupsByCourse = Object.entries(groupsByCourse)
    .filter(([courseCode, groups]) => 
      courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      groups.some(g => 
        g.groupNumber.includes(searchQuery) ||
        g.professorIds.some(id => id.includes(searchQuery))
      )
    )
    .reduce((acc, [courseCode, groups]) => {
      acc[courseCode] = groups
      return acc
    }, {} as Record<string, GroupEntry[]>)

  return (
    <div>
      <h2 className="mb-4">Gestión de Grupos</h2>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar grupos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <button
          className={`btn ${showForm ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '- Cancelar' : '+ Crear Grupo'}
        </button>
      </div>

      {showForm && (
        <div className="border rounded p-3 mb-3">
          <div className="row mb-3">
            <div className="col-md-4 mb-3">
              <label className="form-label">Año</label>
              <input
                type="number"
                className="form-control"
                value={newGroup.year}
                onChange={(e) => updateField('year', Number(e.target.value) || new Date().getFullYear())}
                min="2000"
                max="2100"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Periodo</label>
              <select
                className="form-select"
                value={newGroup.semesterId}
                onChange={(e) => updateField('semesterId', e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="1">I Semestre</option>
                <option value="2">II Semestre</option>
                <option value="V">Verano</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Código del Curso</label>
              <input
                type="text"
                className="form-control"
                value={newGroup.courseCode}
                onChange={(e) => updateField('courseCode', e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="Ej: CE3101"
              />
              {newGroup.courseCode && !isValidCourseCode(newGroup.courseCode) && (
                <div className="text-danger small">Formato inválido. Debe ser 2 letras seguidas de 4 números</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label d-flex justify-content-between align-items-center">
              <span>Profesores</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={addProfessorField}
              >
                + Agregar Profesor
              </button>
            </label>
            
            {newGroup.professorIds.map((id, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={id}
                  onChange={(e) => updateProfessorId(index, e.target.value)}
                  placeholder="Número de profesor"
                />
                {newGroup.professorIds.length > 1 && (
                  <button
                    className="btn btn-outline-danger"
                    type="button"
                    onClick={() => removeProfessorField(index)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            className="btn btn-success"
            disabled={!allFieldsFilled(newGroup)}
            onClick={createGroup}
          >
            Crear Grupo
          </button>
        </div>
      )}

      {/* Display groups table */}
      {Object.entries(filteredGroupsByCourse).map(([courseCode, groups]) => (
        <div key={courseCode} className="mb-4">
          <h3 className="border-bottom pb-2">Curso: {courseCode}</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Profesores</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, i) => (
                <tr key={i} className={group.disabled ? 'opacity-50' : ''}>
                  <td>{group.groupNumber}</td>
                  <td>
                    {group.professorIds.join(', ')}
                  </td>
                  <td>
                    {group.disabled && (
                      <span className="text-danger border border-danger rounded px-1 ms-2 small" 
                            style={{ fontSize: '0.7em' }}>
                        Deshabilitado
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-1"
                      onClick={() => {/* TODO: Implement edit */}}
                      disabled={group.disabled}
                    >
                      Editar
                    </button>
                    <button
                      className={`btn btn-sm ${group.disabled ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => {/* TODO: Implement toggle */}}
                    >
                      {group.disabled ? 'Habilitar' : 'Deshabilitar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

export default GroupManager
