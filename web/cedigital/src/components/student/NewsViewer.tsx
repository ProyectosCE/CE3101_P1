import React, { useState, useEffect } from 'react'
import { getNews } from '@/Functions/Professor/newsAPI'
import { useRouter } from 'next/router'
import { FaEye, FaTimes } from 'react-icons/fa'

interface NewsItem {
  id: string
  title: string
  message: string
  date: string
  author: string
}

const NewsViewer: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [viewing, setViewing] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { group } = router.query

  useEffect(() => {
    if (!group) return
    setLoading(true)
    getNews(Number(group))
      .then((newsData: any[]) => {
        const formattedNews = newsData.map(n => ({
          id: n.id,
          title: n.titulo,
          message: n.cuerpo,
          date: n.fecha,
          author: n.autor,
        }))
        // Ordenar descendente por fecha
        formattedNews.sort((a, b) => (a.date < b.date ? 1 : -1))
        setNewsList(formattedNews)
      })
      .catch(() => setNewsList([]))
      .finally(() => setLoading(false))
  }, [group])

  return (
    <div>
      <h2 className="mb-4">Noticias</h2>
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
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Cargando noticias…
              </td>
            </tr>
          ) : newsList.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                No hay noticias
              </td>
            </tr>
          ) : (
            newsList.map(n => (
              <tr key={n.id}>
                <td>{n.title}</td>
                <td>{n.date}</td>
                <td>{n.author}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => setViewing(n)}
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {viewing && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            width: '90%',
            maxWidth: 600,
            padding: '1.5rem',
            position: 'relative',
          }}>
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

export default NewsViewer
