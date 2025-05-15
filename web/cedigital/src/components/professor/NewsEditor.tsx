import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'

interface NewsItem {
  id: string
  title: string
  message: string
  date: string // YYYY-MM-DD
  author: string
  course: string
}

const NewsEditor: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [courses, setCourses] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [date, setDate] = useState('')
  const [author, setAuthor] = useState('')
  const [course, setCourse] = useState('')

  useEffect(() => {
    // TODO: fetch newsList desde backend y setNewsList(...)
    // TODO: fetch lista de cursos y setCourses(...)
  }, [])

  const openNew = () => {
    setEditing(null)
    setTitle('')
    setMessage('')
    setDate(new Date().toISOString().slice(0,10))
    setAuthor('') // o tu propio nombre
    setCourse(courses[0] || '')
    setModalOpen(true)
  }

  const openEdit = (item: NewsItem) => {
    setEditing(item)
    setTitle(item.title)
    setMessage(item.message)
    setDate(item.date)
    setAuthor(item.author)
    setCourse(item.course)
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!title.trim() || !message.trim()) {
      alert('Título y mensaje son obligatorios.')
      return
    }
    if (editing) {
      // TODO: PUT /api/news/{editing.id}
      setNewsList(nl =>
        nl.map(n =>
          n.id === editing.id
            ? { ...n, title, message, date, author, course }
            : n
        )
      )
    } else {
      // TODO: POST /api/news
      const newItem: NewsItem = {
        id: uuidv4(),
        title,
        message,
        date,
        author,
        course,
      }
      setNewsList(nl => [newItem, ...nl])
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    // TODO: DELETE /api/news/{id}
    setNewsList(nl => nl.filter(n => n.id !== id))
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Noticias</h2>
      <button className="btn btn-primary mb-3" onClick={openNew}>
        <FaPlus className="me-1" /> Crear Noticia
      </button>

      <table className="table table-hover">
        <thead>
          <tr>
            <th>Título</th>
            <th>Fecha</th>
            <th>Autor</th>
            <th>Curso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {newsList.map(n => (
            <tr key={n.id}>
              <td>{n.title}</td>
              <td>{n.date}</td>
              <td>{n.author}</td>
              <td>{n.course}</td>
              <td>
                <button
                  className="btn btn-sm btn-secondary me-2"
                  onClick={() => openEdit(n)}
                >
                  <FaEdit />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(n.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          {newsList.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No hay noticias
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {modalOpen && (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{
              background: '#fff',
              borderRadius: 8,
              width: '90%',
              maxWidth: 600,
              padding: '1.5rem',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: 12, right: 12,
                background: 'transparent',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              <FaTimes />
            </button>

            <h4 className="mb-3">{editing ? 'Editar Noticia' : 'Nueva Noticia'}</h4>

            <div className="mb-3">
              <label className="form-label">Título</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mensaje</label>
              <textarea
                className="form-control"
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Autor</label>
                <input
                  type="text"
                  className="form-control"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Curso</label>
                <select
                  className="form-select"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-end">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsEditor
