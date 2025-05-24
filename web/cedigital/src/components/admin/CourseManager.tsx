// src/components/admin/CourseManager.tsx
import React, { useState } from 'react'
import { createCurso, updateCurso, getCursos, toggleCursoState } from '@/Functions/coursesApi'
import { ApiCourse } from '@/types/course'
import { AxiosError } from 'axios'

interface CourseEntry {
  code: string;
  name: string;
  credits: number;
  careerCode: string;
  disabled: boolean;
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
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newCourse, setNewCourse] = useState<CourseEntry>({
    code: '',
    name: '',
    credits: 0,
    careerCode: '',
    disabled: false
  })
  const [createdCourses, setCreatedCourses] = useState<CourseEntry[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingCourse, setEditingCourse] = useState<CourseEntry | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar cursos desde el backend
  React.useEffect(() => {
    setLoading(true)
    getCursos()
      .then((data: ApiCourse[]) => {
        setCreatedCourses(
          data.map(c => ({
            code: c.codigo_curso,
            name: c.nombre,
            credits: c.creditos,
            careerCode: c.codigo_carrera,
            disabled: c.estado === 'inactivo'
          }))
        )
      })
      .catch(() => setCreatedCourses([]))
      .finally(() => setLoading(false))
  }, [])

  const updateNewCourse = (field: keyof CourseEntry, value: string | number) => {
    setNewCourse({ ...newCourse, [field]: value })
  }

  const resetForm = () => {
    setNewCourse({ code: '', name: '', credits: 0, careerCode: '', disabled: false })
    setShowForm(false)
  }

  const createCourse = async () => {
    if (!allFieldsFilled(newCourse)) return
    try {
      const careerCode = newCourse.code.substring(0, 2)
      const apiCourse: ApiCourse = {
        codigo_curso: newCourse.code,
        nombre: newCourse.name,
        creditos: newCourse.credits,
        estado: 'inactivo',
        codigo_carrera: careerCode
      }
      await createCurso(apiCourse)
      setCreatedCourses([...createdCourses, { ...newCourse, careerCode, disabled: true }])
      resetForm()
    } catch (error: any) {
      console.error('Error creating course:', error)
      if (error.response?.status === 400 && error.response?.data?.includes('carrera')) {
        alert(`Error: La carrera con código '${newCourse.code.substring(0, 2)}' no existe.`)
      } else {
        alert('Error al crear el curso')
      }
    }
  }

  // Validation for course code
  const isValidCourseCode = (code: string) => /^[A-Z]{2}\d{4}$/.test(code)

  const allFieldsFilled = (c: CourseEntry) =>
    isValidCourseCode(c.code) && 
    c.name.trim() !== '' && 
    c.credits >= 0

  // Group courses by school
  const coursesBySchool = createdCourses.reduce((acc, course) => {
    const schoolCode = course.code
    if (!acc[schoolCode]) {
      acc[schoolCode] = []
    }
    acc[schoolCode].push(course)
    return acc
  }, {} as Record<string, CourseEntry[]>)

  const handleEdit = (idx: number) => {
    setEditingIndex(idx)
    setEditingCourse({ ...createdCourses[idx] })
  }

  const updateEditingCourse = (
    field: keyof CourseEntry,
    value: string | number | null
  ) => {
    if (!editingCourse) return
    setEditingCourse({ ...editingCourse, [field]: value })
  }

  const saveEdit = async () => {
    if (editingIndex === null || !editingCourse) return
    try {
      const apiCourse: ApiCourse = {
        codigo_curso: editingCourse.code,
        nombre: editingCourse.name,
        creditos: editingCourse.credits,
        estado: editingCourse.disabled ? 'inactivo' : 'activo',
        codigo_carrera: editingCourse.careerCode
      }
      await updateCurso(apiCourse)
      const copy = [...createdCourses]
      copy[editingIndex] = editingCourse
      setCreatedCourses(copy)
      setEditingIndex(null)
      setEditingCourse(null)
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        // Close modal first
        setEditingIndex(null)
        setEditingCourse(null)
        
        // Then refresh the course list
        setLoading(true)
        try {
          const data = await getCursos()
          setCreatedCourses(
            data.map(c => ({
              code: c.codigo_curso,
              name: c.nombre,
              credits: c.creditos,
              careerCode: c.codigo_carrera,
              disabled: c.estado === 'inactivo'
            }))
          )
        } finally {
          setLoading(false)
        }
        // Show error last
        alert(`Error: El curso '${editingCourse.code}' no existe en el sistema.`)
      } else {
        console.error('Error updating course:', error)
        alert('Error al actualizar el curso')
      }
    }
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingCourse(null)
  }

  const toggleDisabled = async (idx: number) => {
    try {
      const course = createdCourses[idx]
      await toggleCursoState(course.code)
      const copy = [...createdCourses]
      copy[idx].disabled = !copy[idx].disabled
      setCreatedCourses(copy)
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        alert(`Error: No se encontró el curso '${createdCourses[idx].code}' en el sistema.`)
        setLoading(true)
        try {
          const data = await getCursos()
          setCreatedCourses(
            data.map(c => ({
              code: c.codigo_curso,
              name: c.nombre,
              credits: c.creditos,
              careerCode: c.codigo_carrera,
              disabled: c.estado === 'inactivo'
            }))
          )
        } catch (refreshError) {
          console.error('Error refreshing courses:', refreshError)
        } finally {
          setLoading(false)
        }
      } else {
        console.error('Error toggling course state:', error)
        alert('Error al cambiar el estado del curso')
      }
    }
  }
  const filteredCourses = createdCourses.filter(course => 
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <h2 className="mb-4">Gestión de Cursos</h2>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar cursos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <button
          className={`btn ${showForm ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '- Cancelar' : '+ Crear Curso'}
        </button>
      </div>

      {showForm && (
        <div className="border rounded p-3 mb-3">
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <label className="form-label">Código del Curso (2 letras + 4 números)</label>
              <input
                type="text"
                className="form-control"
                value={newCourse.code}
                onChange={(e) => updateNewCourse('code', e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="Ej: CE3101"
              />
              {newCourse.code && !isValidCourseCode(newCourse.code) && (
                <div className="text-danger small">Formato inválido. Debe ser 2 letras seguidas de 4 números</div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre del Curso</label>
              <input
                type="text"
                className="form-control"
                value={newCourse.name}
                onChange={(e) => updateNewCourse('name', e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Créditos</label>
              <input
                type="number"
                className="form-control"
                value={newCourse.credits}
                onChange={(e) => updateNewCourse('credits', Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                step="1"
              />
            </div>
          </div>
          <button
            className="btn btn-success"
            disabled={!allFieldsFilled(newCourse)}
            onClick={createCourse}
          >
            Crear Curso
          </button>
        </div>
      )}

      {/* Tabla de cursos */}
      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Créditos</th>
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
          ) : createdCourses.length > 0 ? (
            createdCourses.map((course, i) => (
              <tr key={i} className={course.disabled ? 'opacity-50' : ''}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.credits}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => handleEdit(i)}
                  >
                    Editar
                  </button>
                  <button
                    className={`btn btn-sm ${course.disabled ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => toggleDisabled(i)}
                  >
                    {course.disabled ? 'Habilitar' : 'Deshabilitar'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                Sin cursos
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit modal */}
      {editingIndex !== null && editingCourse && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Editar Curso</h5>
              <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                X
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Código del Curso</label>
              <input
                type="text"
                className="form-control"
                value={editingCourse.code}
                onChange={(e) => updateEditingCourse('code', e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre del Curso</label>
              <input
                type="text"
                className="form-control"
                value={editingCourse.name}
                onChange={(e) => updateEditingCourse('name', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Créditos</label>
              <input
                type="number"
                className="form-control"
                value={editingCourse.credits}
                onChange={(e) => updateEditingCourse('credits', Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                step="1"
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

export default CourseManager
