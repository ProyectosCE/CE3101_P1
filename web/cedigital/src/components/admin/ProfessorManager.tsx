import React, { useState } from 'react'
import ExcelUploader from './ExcelUploader'
import * as XLSX from 'xlsx'

interface Professor {
  id: string
  cedula: string
  nombre: string
  email: string
  telefono: string
}

const ProfessorManager: React.FC = () => {
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
  const confirmImport = () => {
    if (!selectedFile) {
      alert('No hay archivo seleccionado.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array((e.target!.result as ArrayBuffer))
      const wb = XLSX.read(data, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet)

      const existingCedulas = new Set(profs.map(p => p.cedula))
      const newSet = new Set<string>()
      const imported: Professor[] = []
      let skipped = 0

      rows.forEach((row, i) => {
        const ced = String(row['Cédula'] ?? '').trim()
        const nom = String(row['Nombre'] ?? '').trim()
        const em = String(row['Correo electrónico'] ?? '').trim()
        const tel = String(row['Teléfono'] ?? '').trim()

        // Validaciones básicas
        if (!ced || !nom || !em || !tel) { skipped++; return }
        if (!cedulaRegex.test(ced)) { skipped++; return }
        if (!telefonoRegex.test(tel)) { skipped++; return }
        if (existingCedulas.has(ced) || newSet.has(ced)) { skipped++; return }

        imported.push({
          id: String(profs.length + imported.length + 1),
          cedula: ced,
          nombre: nom,
          email: em,
          telefono: tel,
        })
        newSet.add(ced)
      })

      if (imported.length) {
        setProfs(prev => [...prev, ...imported])
        alert(`Se importaron ${imported.length} profesor(es).`)
      }
      if (skipped) {
        alert(`Se omitieron ${skipped} fila(s) por datos inválidos o duplicados.`)
      }
      setSelectedFile(null)
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  // Cambio en formulario manual
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProf(p => ({ ...p, [name]: value }))
  }

  // Agregar manual con validación
  const addManual = () => {
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
  }

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
