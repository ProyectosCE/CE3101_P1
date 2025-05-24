import React, { useState } from 'react'
import ExcelUploader from './ExcelUploader'
import {
  uploadGroupsExcel,
  getGroups,
  createGroup,
  updateGroup,
  toggleGroup,
} from '@/Functions/groupCourseApi'

interface GroupEntry {
  id: string
  courseCode: string
  groupNumber: string
  professorIds: string[]
  disabled?: boolean
  semesterId: string
  year: number
  profesores: any[] // <-- Ahora es obligatorio, nunca undefined
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
    id: '',
    courseCode: '',
    groupNumber: '',
    professorIds: [''],
    semesterId: '',
    year: new Date().getFullYear(),
    profesores: [], // <-- Añadir propiedad profesores vacía
  })
  const [createdGroups, setCreatedGroups] = useState<GroupEntry[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [profModal, setProfModal] = useState<{ open: boolean; profesores: any[] }>({ open: false, profesores: [] })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingGroup, setEditingGroup] = useState<GroupEntry | null>(null)

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
      id: '',
      courseCode: '',
      groupNumber: '',
      professorIds: [''],
      semesterId: '',
      year: new Date().getFullYear(),
      profesores: [], // <-- Añadir propiedad profesores vacía
    })
    setShowForm(false)
  }

  const createGp = async () => {
    if (!allFieldsFilled(newGroup)) return;
    try {
      await createGroup(
        newGroup.professorIds,
        newGroup.year.toString(),
        newGroup.semesterId,
        {
          numero_grupo: newGroup.groupNumber,
          estado: 'activo',
          codigo_curso: newGroup.courseCode,
        }
      );
      const updatedGroups = await getGroups();
      setCreatedGroups(
        updatedGroups.map((g: any) => ({
          id: g.id_grupo,
          courseCode: g.codigo_curso,
          groupNumber: g.numero_grupo,
          professorIds: (g.profesores || []).map((p: any) => p.cedula),
          disabled: g.estado === 'inactivo',
          semesterId: g.semestre.periodo,
          year: Number(g.semestre.anio),
          profesores: Array.isArray(g.profesores) ? g.profesores : [],
        }))
      );
      resetForm()
    }
    catch (error) { 
      alert('Error al crear escuela');
    }
    
  }

  // Cargar grupos desde el backend
  React.useEffect(() => {
    setLoading(true)
    getGroups()
      .then((data: any) => {
        // Soporta respuesta { groups: [...] } o array directo
        const arr = Array.isArray(data) ? data : data.groups ?? []
        setCreatedGroups(
          arr.map((g: any) => ({
            id: g.id_grupo,
            courseCode: g.codigo_curso,
            groupNumber: g.numero_grupo,
            professorIds: (g.profesores || []).map((p: any) => p.cedula),
            disabled: g.estado === 'inactivo',
            semesterId: g.semestre.periodo,
            year: Number(g.semestre.anio),
            profesores: Array.isArray(g.profesores) ? g.profesores : [], // Siempre array
          }))
        )
      })
      .catch(() => setCreatedGroups([]))
      .finally(() => setLoading(false))
  }, [])

  // Subida de Excel
  const handleFileSelect = (file: File) => setSelectedFile(file)

  const confirmImport = async () => {
    if (!selectedFile) {
      alert('No hay archivo seleccionado.')
      return
    }
    try {
      const res = await uploadGroupsExcel(selectedFile)
      alert(
        `Importación completada.\nImportados: ${res.importedCount ?? '-'}\nErrores: ${res.errors?.length || 0}`
      )
      setSelectedFile(null)
      // Opcional: recargar grupos desde backend aquí
    } catch (err) {
      alert('Error al subir el archivo.')
    }
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
  const filteredGroups = createdGroups.filter(group => {
    const searchLower = searchQuery.toLowerCase();
    return (
      group.year.toString().includes(searchQuery) ||
      group.semesterId.toLowerCase().includes(searchLower) ||
      group.courseCode.toLowerCase().includes(searchLower) ||
      group.groupNumber.toString().includes(searchQuery) ||
      // Search in professors array
      group.profesores.some(prof => 
        prof.cedula.toLowerCase().includes(searchLower)
      ) ||
      // Also search in professorIds array as fallback
      group.professorIds.some(id => 
        id.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleEdit = (idx: number) => {
    setEditingIndex(idx)
    setEditingGroup({ ...createdGroups[idx] })
  }

  const updateEditingGroup = (field: keyof Omit<GroupEntry, 'professorIds' | 'profesores'>, value: string | number) => {
    if (!editingGroup) return
    setEditingGroup({ ...editingGroup, [field]: value })
  }

  const updateEditingProfessorId = (index: number, value: string) => {
    if (!editingGroup) return
    const newProfessorIds = [...editingGroup.professorIds]
    newProfessorIds[index] = value
    setEditingGroup({ ...editingGroup, professorIds: newProfessorIds })
  }

  const addEditingProfessorField = () => {
    if (!editingGroup) return
    setEditingGroup({
      ...editingGroup,
      professorIds: [...editingGroup.professorIds, '']
    })
  }

  const removeEditingProfessorField = (index: number) => {
    if (!editingGroup) return
    setEditingGroup({
      ...editingGroup,
      professorIds: editingGroup.professorIds.filter((_, i) => i !== index)
    })
  }

  const saveEdit = async () => {
    if (editingIndex === null || !editingGroup) return
    try{
      await updateGroup(
        createdGroups[editingIndex].id!,
        editingGroup.professorIds, // Just pass the array of IDs
        editingGroup.year.toString(),
        editingGroup.semesterId,
        {
          id_grupo: createdGroups[editingIndex].id,
          codigo_curso: editingGroup.courseCode,
          numero_grupo: editingGroup.groupNumber,
          estado: createdGroups[editingIndex].disabled ? 'inactivo' : 'activo',
        },
      );
      const updatedGroups = await getGroups();
      setCreatedGroups(
        updatedGroups.map((g: any) => ({
          id: g.id_grupo,
          courseCode: g.codigo_curso,
          groupNumber: g.numero_grupo,
          professorIds: (g.profesores || []).map((p: any) => p.cedula),
          disabled: g.estado === 'inactivo',
          semesterId: g.semestre.periodo,
          year: Number(g.semestre.anio),
          profesores: Array.isArray(g.profesores) ? g.profesores : [],
        }))
      );
      setEditingIndex(null)
      setEditingGroup(null)
    }
    catch{
      alert('Error al guardar los cambios del grupo.')
      setEditingIndex(null)
      setEditingGroup(null)
    }
    
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingGroup(null)
  }

  const handleToggle = async (group: GroupEntry) => {
    try {
      await toggleGroup(group.id);
      const updatedGroups = await getGroups();
      setCreatedGroups(
        updatedGroups.map((g: any) => ({
          id: g.id_grupo,
          courseCode: g.codigo_curso,
          groupNumber: g.numero_grupo,
          professorIds: (g.profesores || []).map((p: any) => p.cedula),
          disabled: g.estado === 'inactivo',
          semesterId: g.semestre.periodo,
          year: Number(g.semestre.anio),
          profesores: Array.isArray(g.profesores) ? g.profesores : [],
        }))
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert('Error: Grupo no encontrado.');
        const updatedGroups = await getGroups();
        setCreatedGroups(
          updatedGroups.map((g: any) => ({
            id: g.id_grupo,
            courseCode: g.codigo_curso,
            groupNumber: g.numero_grupo,
            professorIds: (g.profesores || []).map((p: any) => p.cedula),
            disabled: g.estado === 'inactivo',
            semesterId: g.semestre.periodo,
            year: Number(g.semestre.anio),
            profesores: Array.isArray(g.profesores) ? g.profesores : [],
          }))
        );
      } else {
        alert('Error al cambiar estado del grupo.');
      }
    }
  };

  return (
    <div>
      <h2 className="mb-4">Gestión de Grupos</h2>

      {/* Temporarily disabled Excel import
      <div className="mb-4">
        <h5>Importar desde Excel</h5>
        <ExcelUploader onFileSelect={handleFileSelect} />
        {selectedFile && (
          <div className="mt-2">
            <span>Archivo listo: {selectedFile.name}</span>{' '}
            <button className="btn btn-success btn-sm ms-2" onClick={confirmImport}>
              Confirmar importación
            </button>
          </div>
        )}
      </div>
      */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por: año, periodo, curso, número de grupo o cédula de profesor..."
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
            <div className="col-md-3 mb-3">
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
            <div className="col-md-3 mb-3">
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
            <div className="col-md-3 mb-3">
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
            <div className="col-md-3 mb-3">
              <label className="form-label">Número de Grupo (2 dígitos)</label>
              <input
                type="text"
                className="form-control"
                value={newGroup.groupNumber}
                onChange={(e) => updateField('groupNumber', e.target.value)}
                maxLength={2}
                placeholder="Ej: 01"
              />
              {newGroup.groupNumber && !isValidGroupNumber(newGroup.groupNumber) && (
                <div className="text-danger small">Debe ser 2 dígitos</div>
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
            onClick={createGp}
          >
            Crear Grupo
          </button>
        </div>
      )}

      {/* Display groups table */}
      <table className="table">
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Curso</th>
            <th>Año</th>
            <th>Periodo</th>
            <th>Profesores</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center text-muted">
                Cargando...
              </td>
            </tr>
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group, i) => (
              <tr key={i} className={group.disabled ? 'opacity-50' : ''}>
                <td>{group.groupNumber}</td>
                <td>{group.courseCode}</td>
                <td>{group.year}</td>
                <td>{group.semesterId}</td>
                <td>
                  {Array.isArray(group.profesores) && group.profesores.length > 0 ? (
                    <>
                      <button
                        className="btn btn-link btn-sm p-0"
                        onClick={() => setProfModal({ open: true, profesores: group.profesores })}
                        style={{ textDecoration: 'underline' }}
                      >
                        Ver profesores ({group.profesores.length})
                      </button>
                    </>
                  ) : (
                    group.professorIds.join(', ')
                  )}
                </td>
                <td>
                  <span className={group.disabled ? "text-danger" : "text-success"}>
                    {group.disabled ? "Desactivado" : "Activo"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => handleEdit(i)}
                    //disabled={group.disabled}
                  >
                    Editar
                  </button>
                  <button
                    className={`btn btn-sm ${group.disabled ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => handleToggle(group)}
                  >
                    {group.disabled ? 'Habilitar' : 'Deshabilitar'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center text-muted">
                Sin grupos
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de profesores */}
      {profModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, maxWidth: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Profesores del grupo</h5>
              <button className="btn btn-sm btn-secondary" onClick={() => setProfModal({ open: false, profesores: [] })}>
                X
              </button>
            </div>
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                {profModal.profesores.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.cedula}</td>
                    <td>{p.nombre}</td>
                    <td>{p.apellidos}</td>
                    <td>{p.correo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {editingIndex !== null && editingGroup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, maxWidth: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Editar Grupo</h5>
              <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                X
              </button>
            </div>
            <div className="mb-3">
              <label className="form-label">Año</label>
              <input
                type="number"
                className="form-control"
                value={editingGroup.year}
                onChange={(e) => updateEditingGroup('year', Number(e.target.value) || new Date().getFullYear())}
                min="2000"
                max="2100"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Periodo</label>
              <select
                className="form-select"
                value={editingGroup.semesterId}
                onChange={(e) => updateEditingGroup('semesterId', e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="1">I Semestre</option>
                <option value="2">II Semestre</option>
                <option value="V">Verano</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Código del Curso</label>
              <input
                type="text"
                className="form-control"
                value={editingGroup.courseCode}
                onChange={(e) => updateEditingGroup('courseCode', e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="Ej: CE3101"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Número de Grupo (2 dígitos)</label>
              <input
                type="text"
                className="form-control"
                value={editingGroup.groupNumber}
                onChange={(e) => updateEditingGroup('groupNumber', e.target.value)}
                maxLength={2}
                placeholder="Ej: 01"
              />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex justify-content-between align-items-center">
                <span>Profesores</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addEditingProfessorField}
                >
                  + Agregar Profesor
                </button>
              </label>
              {editingGroup.professorIds.map((id, index) => (
                <div key={index} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={id}
                    onChange={(e) => updateEditingProfessorId(index, e.target.value)}
                    placeholder="Número de profesor"
                  />
                  {editingGroup.professorIds.length > 1 && (
                    <button
                      className="btn btn-outline-danger"
                      type="button"
                      onClick={() => removeEditingProfessorField(index)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>
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
  );
};

export default GroupManager;
