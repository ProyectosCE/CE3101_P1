// src/components/admin/SemesterInitializer.tsx
import React, { useState } from 'react'
import ExcelUploader from './ExcelUploader'
import { getSemestres, uploadSemestresExcel, createSemestre, toggleSemestre, deleteSemestre } from '@/Functions/semestresApi'

interface Semester {
  id: string
  year: number
  period: '1' | '2' | 'V'
  active: boolean
}

interface ApiSemester {
  id_semestre: string;
  anio: string | number;
  periodo: string;
  estado: string;
}

const SemesterInitializer: React.FC = () => {
  const [year, setYear] = useState<number | ''>('')
  const [period, setPeriod] = useState<'1' | '2' | 'V'>('1')
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Load semesters from API
  React.useEffect(() => {
    getSemestres().then((data: ApiSemester[]) => {
      setSemesters(data.map((s: ApiSemester) => ({
        id: s.id_semestre,
        year: Number(s.anio),
        period: s.periodo as '1' | '2' | 'V',
        active: s.estado === 'activo'
      })))
    }).catch(() => setSemesters([]))
  }, [])

  const createSemester = async () => {
    if (!year) {
      alert('Por favor seleccione un año')
      return
    }

    try {
      await createSemestre({
        anio: year,
        periodo: period,
        estado: 'inactivo'
      })
      
      // Refresh list after creation
      const updatedSemesters = await getSemestres()
      setSemesters(updatedSemesters.map((s: ApiSemester) => ({
        id: s.id_semestre,
        year: Number(s.anio),
        period: s.periodo as '1' | '2' | 'V',
        active: s.estado === 'activo'
      })))
      
      setYear('')
    } catch (err) {
      alert('Error al crear semestre')
    }
  }

  const toggleSemester = async (id: string) => {
    try {
      await toggleSemestre(Number(id))
      
      // Refresh list after toggle
      const updatedSemesters = await getSemestres()
      setSemesters(updatedSemesters.map((s: ApiSemester) => ({
        id: s.id_semestre,
        year: Number(s.anio),
        period: s.periodo as '1' | '2' | 'V',
        active: s.estado === 'activo'
      })))
    } catch (err) {
      alert('Error al cambiar estado del semestre')
    }
  }

  const deleteSemester = async (id: string) => {
    try {
      await deleteSemestre(Number(id))
      
      // Refresh list after deletion
      const updatedSemesters = await getSemestres()
      setSemesters(updatedSemesters.map((s: ApiSemester) => ({
        id: s.id_semestre,
        year: Number(s.anio),
        period: s.periodo as '1' | '2' | 'V',
        active: s.estado === 'activo'
      })))
    } catch (err) {
      alert('Error al eliminar semestre')
    }
  }

  const handleFileSelect = (file: File) => setSelectedFile(file)

  const confirmImport = async () => {
    if (!selectedFile) {
      alert('No hay archivo seleccionado.')
      return
    }
    try {
      const res = await uploadSemestresExcel(selectedFile)
      alert(
        `Importación completada.}`
      )
      setSelectedFile(null)
      // Recargar semestres
      getSemestres().then((data: any) => {
        const arr = Array.isArray(data) ? data : data.semestres ?? []
        setSemesters(
          arr.map((s: any) => ({
            id: s.id_semestre,
            year: Number(s.anio),
            period: s.periodo,
            active: s.estado === 'activo'
          }))
        )
      })
    } catch (err) {
      alert('Error al subir el archivo.')
    }
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Semestres</h2>

      {/* Importar Excel */}
      <div className="mb-4">
        <h5>Importar Semestres desde Excel</h5>
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

      {/* Año y periodo */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label htmlFor="year" className="form-label">Año</label>
          <input
            id="year"
            type="number"
            className="form-control"
            placeholder="2025"
            value={year}
            onChange={e => setYear(parseInt(e.target.value) || '')}
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="period" className="form-label">Periodo</label>
          <select
            id="period"
            className="form-select"
            value={period}
            onChange={e => setPeriod(e.target.value as '1' | '2' | 'V')}
          >
            <option value="1">1 – Primer semestre</option>
            <option value="2">2 – Segundo semestre</option>
            <option value="V">V – Verano</option>
          </select>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button 
            className="btn btn-primary" 
            onClick={createSemester}
            disabled={!year}
          >
            Crear Semestre
          </button>
        </div>
      </div>

      {/* Tabla de Semestres */}
      <h5 className="mt-5">Semestres</h5>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Año</th>
            <th>Periodo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {semesters.map((sem) => (
            <tr key={sem.id}>
              <td>{sem.id}</td>
              <td>{sem.year}</td>
              <td>{sem.period}</td>
              <td>
                <span className={`badge ${sem.active ? 'bg-success' : 'bg-secondary'}`}>
                  {sem.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <button
                  className={`btn btn-sm ${sem.active ? 'btn-warning' : 'btn-success'} me-2`}
                  onClick={() => toggleSemester(sem.id)}
                >
                  {sem.active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteSemester(sem.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SemesterInitializer
