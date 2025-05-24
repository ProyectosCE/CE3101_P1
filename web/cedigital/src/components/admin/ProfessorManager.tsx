import React, { useState } from 'react'
import {
  createProfesor,
  uploadProfesoresExcel,
  getProfesores,
  updateProfesor,
  toggleProfesorState,
} from '@/Functions/professorsApi'

interface Professor {
  id: string
  cedula: string
  nombre: string
  apellidos: string
  correo: string
  password?: string
  isAdmin: boolean
  estado: string
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1050,
}

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  minWidth: '300px',
  maxWidth: '500px',
  width: '100%',
}

const ProfessorManager: React.FC<{ reloadKey?: number }> = ({ reloadKey }) => {
  const [profs, setProfs] = useState<Professor[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newProf, setNewProf] = useState<Omit<Professor, 'id' | 'password' | 'isAdmin' | 'estado'>>({
    cedula: '',
    nombre: '',
    apellidos: '',
    correo: '',
  })
  const [loading, setLoading] = useState(true)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingProf, setEditingProf] = useState<Professor | null>(null)

  const cedulaRegex = /^\d{9}$/

  // Referencia al archivo Excel
  const handleFileSelect = (file: File) => setSelectedFile(file)

  // Importar desde Excel con validación
  const confirmImport = async () => {
    if (!selectedFile) {
      alert('No hay archivo seleccionado.')
      return
    }
    try {
      await uploadProfesoresExcel(selectedFile)
      alert('Archivo enviado al servidor para procesamiento.')
      setSelectedFile(null)
      const updatedProfs = await getProfesores()
      setProfs(updatedProfs)
    } catch {
      alert('Error al subir el archivo.')
    }
  }

  // Cambio en formulario manual
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProf(p => ({ ...p, [name]: value }))
  }

  // Agregar manual con validación y API
  const addManual = async () => {
    const { cedula, nombre, apellidos, correo } = newProf
    if (!cedula || !nombre || !apellidos || !correo) {
      alert('Todos los campos son obligatorios.')
      return
    }
    if (!cedulaRegex.test(cedula)) {
      alert('Cédula inválida: debe tener 9 dígitos.')
      return
    }
    if (profs.some(p => p.cedula === cedula)) {
      alert('Ya existe un profesor con esa cédula.')
      return
    }

    try {
      const password = Math.random().toString(36).slice(-8) // Autogenerate password
      const newProfessor = {
        cedula,
        nombre,
        apellidos,
        correo,
        password,
        isAdmin: false,
        estado: 'activo',
      }
      await createProfesor(newProfessor)
      const entry: Professor = {
        id: String(profs.length + 1),
        cedula,
        nombre,
        apellidos,
        correo,
        password,
        isAdmin: false,
        estado: 'activo',
      }
      setProfs(prev => [...prev, entry])
      setNewProf({ cedula: '', nombre: '', apellidos: '', correo: '' })
      alert(`Profesor agregado correctamente.\nContraseña: ${password}`)
    } catch {
      alert('Error al agregar profesor.')
    }
  }

  // Editar profesor
  const handleEdit = (idx: number) => {
    setEditingIndex(idx)
    setEditingProf({ ...profs[idx] })
  }

  const saveEdit = async () => {
    if (editingIndex === null || !editingProf) return
    try {
      await updateProfesor(editingProf.id, {
        id: editingProf.id,
        cedula: editingProf.cedula,
        nombre: editingProf.nombre,
        apellidos: editingProf.apellidos,
        correo: editingProf.correo,
        estado: editingProf.estado,
        password: '',
        isAdmin: editingProf.isAdmin,
      })
      const updatedProfs = await getProfesores()
      setProfs(updatedProfs)
      setEditingIndex(null)
      setEditingProf(null)
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert('Error: Profesor no encontrado.')
        setEditingIndex(null)
        setEditingProf(null)
        const updatedProfs = await getProfesores()
        setProfs(updatedProfs)
      } 
      else if (error.response?.status === 400) {
        alert('Error: Profesor no encontrado.')
        setEditingIndex(null)
        setEditingProf(null)
        const updatedProfs = await getProfesores()
        setProfs(updatedProfs)
      }
      else {
        alert('Error al editar profesor.')
      }
    }
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingProf(null)
  }

  // Habilitar / Deshabilitar profesor
  const toggleDisabled = async (idx: number) => {
    const prof = profs[idx]
    if (!prof.id) return
    try {
      await toggleProfesorState(prof.id)
      const updatedProfs = await getProfesores()
      setProfs(updatedProfs)
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert('Error: Profesor no encontrado.')
        const updatedProfs = await getProfesores()
        setProfs(updatedProfs)
      } else {
        alert('Error al cambiar estado del profesor.')
      }
    }
  }

  React.useEffect(() => {
    setLoading(true)
    // Cargar profesores cada vez que reloadKey cambie
    getProfesores()
      .then((data: Professor[]) => {
        setProfs(data)
      })
      .catch(() => setProfs([]))
      .finally(() => setLoading(false))
  }, [reloadKey])

  return (
    <div>
      <h2 className="mb-4">Gestión de Profesores</h2>

      {/* Agregar manual */}
      <div className="mb-4 p-3" style={{ border: '1px solid #ddd', borderRadius: 6 }}>
        <h5>Agregar Profesor Manualmente</h5>
        <div className="row g-2">
          <div className="col">
            <input
              name="cedula"
              value={newProf.cedula}
              onChange={handleManualChange}
              placeholder="Cédula (9 dígitos)"
              className="form-control"
            />
          </div>
          <div className="col">
            <input
              name="nombre"
              value={newProf.nombre}
              onChange={handleManualChange}
              placeholder="Nombre"
              className="form-control"
            />
          </div>
          <div className="col">
            <input
              name="apellidos"
              value={newProf.apellidos}
              onChange={handleManualChange}
              placeholder="Apellidos"
              className="form-control"
            />
          </div>
          <div className="col">
            <input
              name="correo"
              value={newProf.correo}
              onChange={handleManualChange}
              placeholder="Correo electrónico"
              className="form-control"
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={addManual}>
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Profesores */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                Cargando...
              </td>
            </tr>
          ) : profs.length > 0 ? (
            profs.map((p, i) => (
              <tr key={p.id} className={p.estado === 'inactivo' ? 'opacity-50' : ''}>
                <td>{p.cedula}</td>
                <td>{p.nombre}</td>
                <td>{p.apellidos}</td>
                <td>{p.correo}</td>
                <td>
                  <button className="btn btn-sm btn-primary me-1" onClick={() => handleEdit(i)}>
                    Editar
                  </button>
                  <button
                    className={`btn btn-sm ${p.estado === 'inactivo' ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => toggleDisabled(i)}
                  >
                    {p.estado === 'inactivo' ? 'Habilitar' : 'Deshabilitar'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                Sin profesores
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de edición */}
      {editingIndex !== null && editingProf && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Editar Profesor</h5>
              <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                X
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Cédula</label>
              <input
                type="text"
                className="form-control"
                value={editingProf.cedula}
                onChange={e => setEditingProf({ ...editingProf, cedula: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={editingProf.nombre}
                onChange={e => setEditingProf({ ...editingProf, nombre: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Apellidos</label>
              <input
                type="text"
                className="form-control"
                value={editingProf.apellidos}
                onChange={e => setEditingProf({ ...editingProf, apellidos: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input
                type="email"
                className="form-control"
                value={editingProf.correo}
                onChange={e => setEditingProf({ ...editingProf, correo: e.target.value })}
              />
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
  )
}

export default ProfessorManager
