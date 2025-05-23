import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaTimes, FaEye } from 'react-icons/fa'
import { getNews, createNews, updateNews, deleteNews } from '@/Functions/Professor/newsAPI'

interface NewsItem {
  id: string
  title: string
  message: string
  date: string
  author: string
  authorId: string
}

const NewsEditor: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [viewing, setViewing] = useState<NewsItem | null>(null)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [date, setDate] = useState('')
  const [author, setAuthor] = useState('')

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await getNews();
        const formattedNews = newsData.map(n => ({
          id: n.id,
          title: n.titulo,
          message: n.cuerpo,
          date: n.fecha,
          author: n.autor.nombre,
          authorId: n.autor.id,
        }));
        setNewsList(formattedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, [])

  const openNew = () => {
    setEditing(null)
    setTitle('')
    setMessage('')
    setDate(new Date().toISOString().slice(0,10))
    setAuthor('') // o tu propio nombre
    setModalOpen(true)
  }

  const openEdit = (item: NewsItem) => {
    setEditing(item)
    setTitle(item.title)
    setMessage(item.message)
    setDate(item.date)
    setAuthor(item.author)
    setModalOpen(true)
  }

  const openView = (item: NewsItem) => {
    setViewing(item)
  }

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Título y mensaje son obligatorios.')
      return
    }

    try {
      if (editing) {
        await updateNews(editing.id, {
          titulo: title,
          cuerpo: message,
          fecha: date,
          autorId: author,
          cursoId: '1' // TODO: Get actual course ID
        });
      } else {
        await createNews({
          titulo: title,
          cuerpo: message,
          fecha: date,
          autorId: author,
          cursoId: '1' // TODO: Get actual course ID
        });
      }
      // Refresh news list
      const newsData = await getNews();
      const formattedNews = newsData.map(n => ({
        id: n.id,
        title: n.titulo,
        message: n.cuerpo,
        date: n.fecha,
        author: n.autor.nombre,
        authorId: n.autor.id,
      }));
      setNewsList(formattedNews);
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Error al guardar la noticia')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    try {
      await deleteNews(id);
      setNewsList(nl => nl.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Error al eliminar la noticia')
    }
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {newsList.map(n => (
            <tr key={n.id}>
              <td>{n.title}</td>
              <td>{n.date}</td>
              <td>{n.author}</td>
              <td>
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() => openView(n)}
                >
                  <FaEye />
                </button>
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
              <td colSpan={4} className="text-center text-muted">
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

      {viewing && (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
              onClick={() => setViewing(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'transparent',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              <FaTimes />
            </button>

            <h4 className="mb-3">{viewing.title}</h4>
            <p className="text-muted mb-3">
              {viewing.date} - {viewing.author}
            </p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{viewing.message}</p>
            
            <div className="text-end">
              <button
                className="btn btn-secondary"
                onClick={() => setViewing(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsEditor
