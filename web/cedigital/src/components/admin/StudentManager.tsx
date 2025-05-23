// src/components/admin/StudentManager.tsx
import React, { useState } from 'react'
import ExcelUploader from './ExcelUploader'
import * as XLSX from 'xlsx'
import {
  createEstudiante,
  uploadEstudiantesExcel,
  getEstudiantes,
} from '@/Functions/studentsApi'

interface Student {
  id: string
  carnet: string
  cedula: string
  nombre: string
  email: string
  telefono: string
}

const StudentManager: React.FC<{ reloadKey?: number }> = ({ reloadKey }) => {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newStud, setNewStud] = useState<Omit<Student, 'id'>>({
    carnet: '',
    cedula: '',
    nombre: '',
    email: '',
    telefono: '',
  })
  const [loading, setLoading] = useState(true)

  // Expresiones regulares de validación
  const carnetRegex  = /^20\d{8}$/
  const cedulaRegex  = /^\d{9}$/
  const telefonoRegex = /^\d{4}-\d{4}$/

  // Referencia al archivo Excel
  const handleFileSelect = (file: File) => setSelectedFile(file)

  // Confirmar importación desde Excel
  const confirmImport = async () => {
    if (!selectedFile) {
      alert('No hay archivo seleccionado.')
      return
    }
    try {
      await uploadEstudiantesExcel(selectedFile)
      alert('Archivo enviado al servidor para procesamiento.')
      setSelectedFile(null)
      // Opcional: recargar lista de estudiantes desde el backend aquí
    } catch (err) {
      alert('Error al subir el archivo.')
    }
  }

  // Manejo de formulario manual
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewStud(s => ({ ...s, [name]: value }))
  }

  const addManual = async () => {
    const { carnet, cedula, nombre, email, telefono } = newStud
    // Campos obligatorios
    if (!carnet || !cedula || !nombre || !email || !telefono) {
      alert('Todos los campos son obligatorios.')
      return
    }
    // Formatos correctos
    if (!carnetRegex.test(carnet)) {
      alert('Carné inválido: debe empezar con "20" y tener 10 dígitos.')
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
    // No duplicados
    if (
      students.some(s => s.carnet === carnet) ||
      students.some(s => s.cedula === cedula)
    ) {
      alert('Ya existe un estudiante con ese carné o cédula.')
      return
    }

    try {
      await createEstudiante({
        carnet,
        cedula,
        nombre,
        correo: email,
        telefono,
      })
      const entry: Student = {
        id: String(students.length + 1),
        carnet,
        cedula,
        nombre,
        email,
        telefono,
      }
      setStudents(prev => [...prev, entry])
      setNewStud({ carnet: '', cedula: '', nombre: '', email: '', telefono: '' })
      alert('Estudiante agregado correctamente.')
    } catch (err) {
      alert('Error al agregar estudiante.')
    }
  }

  React.useEffect(() => {
    setLoading(true)
    getEstudiantes()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.students ?? []
        if (!Array.isArray(arr) || arr.length === 0) {
          setStudents([])
        } else {
          setStudents(
            arr.map((s: any, idx: number) => ({
              id: s.id?.toString() ?? (idx + 1).toString(),
              carnet: s.carnet,
              cedula: s.cedula,
              nombre: s.nombre,
              email: s.correo,
              telefono: s.telefono,
            }))
          )
        }
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [reloadKey])

  return (
    <div>
      <h2 className="mb-4">Gestión de Estudiantes</h2>

      {/* Agregar Estudiante Manualmente */}
      <div className="mb-4 p-3" style={{ border: '1px solid #ddd', borderRadius: 6 }}>
        <h5>Agregar Estudiante Manualmente</h5>
        <div className="row g-2">
          <div className="col">
            <input
              name="carnet"
              value={newStud.carnet}
              onChange={handleManualChange}
              placeholder="Carné (2020XXXXXX)"
              className="form-control"
            />
          </div>
          <div className="col">
            <input
              name="cedula"
              value={newStud.cedula}
              onChange={handleManualChange}
              placeholder="Cédula (9 dígitos)"
              className="form-control"
            />
          </div>
          <div className="col">
            <input
              name="nombre"
              value={newStud.nombre}
              onChange={handleManualChange}
              placeholder="Nombre"
              className="form-control"
            />
          </div>
          <div className="col">
            <input
              name="email"
              value={newStud.email}
              onChange={handleManualChange}
              placeholder="Correo electrónico"
              className="form-control"
            />
          </div>
          <div className="col">
            <input
              name="telefono"
              value={newStud.telefono}
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

      {/* Tabla de Estudiantes */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Carné</th>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                Cargando...
              </td>
            </tr>
          ) : students.length > 0 ? (
            students.map(s => (
              <tr key={s.id}>
                <td>{s.carnet}</td>
                <td>{s.cedula}</td>
                <td>{s.nombre}</td>
                <td>{s.email}</td>
                <td>{s.telefono}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                Sin estudiantes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default StudentManager
