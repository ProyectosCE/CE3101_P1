// src/components/admin/SemesterInitializer.tsx
import React, { useState } from 'react'

interface CourseEntry {
  code: string
  group: string
}

const SemesterInitializer: React.FC = () => {
  const [formCourses, setFormCourses] = useState<CourseEntry[]>([])
  const [semesterCourses, setSemesterCourses] = useState<CourseEntry[]>([])
  const [year, setYear] = useState<number | ''>('')
  const [period, setPeriod] = useState<'1' | '2' | 'V'>('1')

  const addCourseForm = () => {
    setFormCourses([...formCourses, { code: '', group: '' }])
  }

  const updateFormCourse = (
    idx: number,
    field: keyof CourseEntry,
    value: string
  ) => {
    const copy = [...formCourses]
    copy[idx][field] = value
    setFormCourses(copy)
  }

  const removeFormCourse = (idx: number) => {
    setFormCourses(formCourses.filter((_, i) => i !== idx))
  }

  const allFieldsFilled = (c: CourseEntry) =>
    c.code.trim() !== '' && c.group.trim() !== ''

  const addToSemester = (idx: number) => {
    const course = formCourses[idx]
    setSemesterCourses([...semesterCourses, course])
    removeFormCourse(idx)
  }

  const removeSemesterCourse = (idx: number) => {
    setSemesterCourses(semesterCourses.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <h2 className="mb-4">Inicializar Semestre</h2>

      {/* Año y periodo */}
      <div className="row mb-4">
        <div className="col-md-6">
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
        <div className="col-md-6">
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
      </div>

      {/* Formularios de cursos pendientes */}
      <div className="mb-4">
        <h5>Cursos a Asignar</h5>
        {formCourses.map((c, i) => (
          <div key={i} className="border rounded p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Curso #{i + 1}</strong>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => removeFormCourse(i)}
              >
                Eliminar
              </button>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Código de Curso</label>
                <input
                  type="text"
                  className="form-control"
                  value={c.code}
                  onChange={e => updateFormCourse(i, 'code', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Número de Grupo</label>
                <input
                  type="text"
                  className="form-control"
                  value={c.group}
                  onChange={e => updateFormCourse(i, 'group', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 text-end">
              <button
                className="btn btn-success"
                disabled={!allFieldsFilled(c)}
                onClick={() => addToSemester(i)}
              >
                Agregar al Semestre
              </button>
            </div>
          </div>
        ))}

        <button className="btn btn-secondary" onClick={addCourseForm}>
          + Nuevo Curso
        </button>
      </div>

      {/* Tabla de Cursos del Semestre */}
      <h5 className="mt-5">Cursos del Semestre</h5>
      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Número de Grupo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {semesterCourses.map((c, i) => (
            <tr key={i}>
              <td>{c.code}</td>
              <td>{c.group}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeSemesterCourse(i)}
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
