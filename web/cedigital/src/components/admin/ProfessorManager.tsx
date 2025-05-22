import React, { useState } from 'react'
import ExcelUploader from './ExcelUploader'
import * as XLSX from 'xlsx'
import {
  createProfesor,
  uploadProfesoresExcel,
  getProfesores,
} from '@/Functions/professorsApi'

interface Professor {
  id: string
  cedula: string
  nombre: string
  email: string
  telefono: string
}

const ProfessorManager: React.FC<{ reloadKey?: number }> = ({ reloadKey }) => {
  const [profs, setProfs] = useState<Professor[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newProf, setNewProf] = useState<Omit<Professor, 'id'>>({
    cedula: '',
    nombre: '',
    email: '',
    telefono: '',
  })

  const cedulaRegex = /^\d{9}$/
  const telefonoRegex = /^\d{4}-\d{4}$/

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
      // Opcional: recargar lista de profesores desde el backend aquí
    } catch (err) {
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
    const { cedula, nombre, email, telefono } = newProf
    if (!cedula || !nombre || !email || !telefono) {
      alert('Todos los campos son obligatorios.')
      return
    }
    if (!cedulaRegex.test(cedula)) {
      alert('Cédula inválida: debe tener 9 dígitos.')
      return
    }
    if (!telefonoRegex.test(telefono)) {
      alert('Teléfono inválido: formato debe ser 8888-0000.')
      return
    }
    if (profs.some(p => p.cedula === cedula)) {
      alert('Ya existe un profesor con esa cédula.')
      return
    }
    try {
      await createProfesor({
        cedula,
        nombre,
        correo: email,
        telefono,
      })
      const entry: Professor = {
        id: String(profs.length + 1),
        cedula,
        nombre,
        email,
        telefono,
      }
      setProfs(prev => [...prev, entry])
      setNewProf({ cedula: '', nombre: '', email: '', telefono: '' })
      alert('Profesor agregado correctamente.')
    } catch (err) {
      alert('Error al agregar profesor.')
    }
  }

  React.useEffect(() => {
    // Cargar profesores cada vez que reloadKey cambie
    getProfesores()
      .then((data) => {
        setProfs(
          (data as any[]).map((p, idx) => ({
            id: p.id?.toString() ?? (idx + 1).toString(),
            cedula: p.cedula,
            nombre: p.nombre,
            email: p.correo,
            telefono: p.telefono,
          }))
        )
      })
      .catch(() => setProfs([]))
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
              name="email"
              value={newProf.email}
              onChange={handleManualChange}
              placeholder="Correo electrónico"
              className="form-control"
            />
          </div>
          <div className="col">
            <input
              name="telefono"
              value={newProf.telefono}
              onChange={handleManualChange}
              placeholder="Teléfono (8888-0000)"
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

      {/* Importar Excel */}
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

      {/* Tabla Profesores */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {profs.length > 0 ? (
            profs.map(p => (
              <tr key={p.id}>
                <td>{p.cedula}</td>
                <td>{p.nombre}</td>
                <td>{p.email}</td>
                <td>{p.telefono}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Sin profesores
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ProfessorManager
