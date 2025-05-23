import React, { useState, useEffect } from 'react'

export interface NewsItem {
  id: string
  motivo: string
  mensaje: string
  fecha: string
}

const NewsViewer: React.FC = () => {
  const [noticias, setNoticias] = useState<NewsItem[]>([])
  const [abiertaId, setAbiertaId] = useState<string | null>(null)

  useEffect(() => {
    // TODO: fetch(`/api/student/news?course=…`)
    //   .then(r=>r.json())
    //   .then(data=> {
    //     const sorted = data.sort((a,b)=> a.fecha<b.fecha?1:-1)
    //     setNoticias(sorted)
    //   })
  }, [])

  const toggle = (id: string) =>
    setAbiertaId(prev => (prev === id ? null : id))

  return (
    <div>
      <h2 className="mb-4">Noticias</h2>
      {noticias.map(n => {
        const abierta = abiertaId === n.id
        return (
          <div
            key={n.id}
            className="card mb-3"
            style={{ borderRadius: 6, cursor: 'pointer' }}
          >
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => toggle(n.id)}
            >
              <strong>{n.motivo}</strong>
              <small className="text-muted">{n.fecha}</small>
            </div>
            {abierta && (
              <div className="card-body">
                <p className="mb-0">{n.mensaje}</p>
              </div>
            )}
          </div>
        )
      })}
      {noticias.length === 0 && (
        <div className="text-center text-muted">Cargando noticias…</div>
      )}
    </div>
  )
}

export default NewsViewer
