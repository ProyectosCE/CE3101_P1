import React, { useState, useEffect } from 'react'
import {
  FaChevronRight,
  FaChevronDown,
  FaUpload,
  FaCheck,
  FaDownload,
  FaUndo,
} from 'react-icons/fa'

interface EvalItem {
  id: string
  name: string
  max: number
  obtained: number | null
  submitted: boolean
  fileName?: string
  fileUrl?: string
  dateSubmitted?: string
}

interface Rubro {
  id: string
  name: string
  weight: number
  evaluations: EvalItem[]
}

const StudentEvaluations: React.FC = () => {
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  useEffect(() => {

  }, [])

  const toggle = (id: string) =>
    setOpenMap(prev => ({ ...prev, [id]: !prev[id] }))

  const handleUpload = (rubroId: string, evalId: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const today = new Date().toISOString().slice(0, 10)
    setRubros(rs =>
      rs.map(r =>
        r.id === rubroId
          ? {
              ...r,
              evaluations: r.evaluations.map(ev =>
                ev.id === evalId
                  ? {
                      ...ev,
                      submitted: true,
                      fileName: file.name,
                      fileUrl: url,
                      dateSubmitted: today,
                    }
                  : ev
              ),
            }
          : r
      )
    )
  }

  const handleUndo = (rubroId: string, evalId: string) => () => {
    setRubros(rs =>
      rs.map(r =>
        r.id === rubroId
          ? {
              ...r,
              evaluations: r.evaluations.map(ev =>
                ev.id === evalId
                  ? {
                      id:   ev.id,
                      name: ev.name,
                      max:  ev.max,
                      obtained: ev.obtained,
                      submitted: false,
                    }
                  : ev
              ),
            }
          : r
      )
    )

  }

  const handleDownload = (fileUrl?: string, fileName?: string) => {
    if (!fileUrl) return
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const computeRaw = (evs: EvalItem[]) => {
    const obtained = evs.reduce((s, e) => s + (e.obtained ?? 0), 0)
    const max = evs.reduce((s, e) => s + e.max, 0)
    return { obtained, max }
  }

  let totalWeighted = 0
  rubros.forEach(r => {
    const { obtained, max } = computeRaw(r.evaluations)
    if (max > 0) totalWeighted += (obtained / max) * r.weight
  })

  return (
    <div>
      <h2 className="mb-4">Evaluaciones</h2>

      {rubros.map(r => {
        const { obtained, max } = computeRaw(r.evaluations)
        const weighted = max > 0 ? (obtained / max) * r.weight : 0
        const isOpen = !!openMap[r.id]

        return (
          <div
            key={r.id}
            className="mb-4 p-3"
            style={{ border: '1px solid #ddd', borderRadius: 6 }}
          >
            {/* Rubro */}
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => toggle(r.id)}
            >
              <div className="d-flex align-items-center">
                {isOpen ? (
                  <FaChevronDown className="me-2" />
                ) : (
                  <FaChevronRight className="me-2" />
                )}
                <strong>{r.name}</strong>
              </div>
              <div className="text-end">
                <small className="me-3">
                  {obtained.toFixed(1)} / {max.toFixed(1)}
                </small>
                <small>{weighted.toFixed(1)} / {r.weight}</small>
              </div>
            </div>

            {isOpen && (
              <div className="mt-3">
                {r.evaluations.length ? (
                  r.evaluations.map((ev, i) => (
                    <div
                      key={ev.id}
                      className="d-flex justify-content-between align-items-center py-2"
                      style={{
                        borderBottom:
                          i < r.evaluations.length - 1 ? '1px solid #eee' : 'none',
                      }}
                    >
                      <div>{ev.name}</div>
                      <div className="d-flex align-items-center">
                        {ev.obtained != null ? (
                          <small className="me-3 text-success">
                            {ev.obtained.toFixed(1)} / {ev.max.toFixed(1)}
                          </small>
                        ) : ev.submitted ? (
                          <FaCheck className="text-success me-3" />
                        ) : (
                          <label className="btn btn-sm btn-outline-primary me-3 mb-0">
                            <FaUpload className="me-1" /> Subir
                            <input
                              type="file"
                              hidden
                              onChange={handleUpload(r.id, ev.id)}
                            />
                          </label>
                        )}

                        {ev.submitted && ev.fileName && (
                          <>
                            <div className="me-3 text-muted text-end">
                              <div>{ev.fileName}</div>
                              <small>{ev.dateSubmitted}</small>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() =>
                                handleDownload(ev.fileUrl, ev.fileName)
                              }
                            >
                              <FaDownload />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={handleUndo(r.id, ev.id)}
                            >
                              <FaUndo />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted">No hay evaluaciones en este rubro.</div>
                )}
              </div>
            )}
          </div>
        )
      })}

      <hr />
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div>
          <small className="text-muted d-block">Nota Total (sin redondear)</small>
          <h5>{totalWeighted.toFixed(1)} / 100</h5>
        </div>
        <div className="text-end">
          <small className="text-muted d-block">Nota Final</small>
          <h3>{Math.round(totalWeighted)} / 100</h3>
        </div>
      </div>
    </div>
  )
}

export default StudentEvaluations
