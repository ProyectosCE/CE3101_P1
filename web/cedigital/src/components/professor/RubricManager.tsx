// src/components/professor/RubricManager.tsx
import React, { useState } from 'react'
import { FaPlus, FaMinusCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'

interface Evaluation {
  id: string
  name: string
  weight: number
}

interface Rubro {
  id: string
  name: string
  weight: number
  evaluations: Evaluation[]
}

const initialRubros: Rubro[] = [
  { id: uuidv4(), name: 'Quices',   weight: 30, evaluations: [] },
  { id: uuidv4(), name: 'Exámenes', weight: 30, evaluations: [] },
  { id: uuidv4(), name: 'Proyectos',weight: 40, evaluations: [] },
]

const RubricManager: React.FC = () => {
  const [rubros, setRubros] = useState<Rubro[]>(initialRubros)
  const [open, setOpen] = useState<Record<string, boolean>>({})

  // Toggle panel de evaluaciones
  const toggle = (id: string) => setOpen(o => ({ ...o, [id]: !o[id] }))

  // Añadir un nuevo rubro
  const addRubro = () => {
    setRubros(rs => [
      ...rs,
      { id: uuidv4(), name: '', weight: 0, evaluations: [] },
    ])
  }

  // Eliminar un rubro
  const deleteRubro = (rubroId: string) => {
    if (!confirm('¿Eliminar este rubro?')) return
    setRubros(rs => rs.filter(r => r.id !== rubroId))
  }

  // Actualizar nombre o peso de un rubro
  const updateRubro = (
    rubroId: string,
    field: 'name' | 'weight',
    value: string | number
  ) => {
    setRubros(rs => {
      // Sumamos pesos de los demás rubros para validar <= 100
      const sumOthers = rs
        .filter(r => r.id !== rubroId)
        .reduce((s, r) => s + r.weight, 0)

      return rs.map(r => {
        if (r.id !== rubroId) return r

        if (field === 'name') {
          return { ...r, name: value as string }
        } 

        // field === 'weight'
        let newW = Number(value)
        if (sumOthers + newW > 100) {
          const maxAllowed = 100 - sumOthers
          alert(`Peso máximo para "${r.name || 'este rubro'}" es ${maxAllowed}%. Ajustado.`)
          newW = maxAllowed
        }
        return { ...r, weight: newW }
      })
    })
  }

  // Añadir evaluación dentro de un rubro
  const addEval = (rubroId: string) => {
    setRubros(rs =>
      rs.map(r =>
        r.id === rubroId
          ? { ...r, evaluations: [...r.evaluations, { id: uuidv4(), name: '', weight: 0 }] }
          : r
      )
    )
    setOpen(o => ({ ...o, [rubroId]: true }))
  }

  // Eliminar evaluación
  const deleteEval = (rubroId: string, evalId: string) => {
    if (!confirm('¿Eliminar esta evaluación?')) return
    setRubros(rs =>
      rs.map(r =>
        r.id === rubroId
          ? { ...r, evaluations: r.evaluations.filter(e => e.id !== evalId) }
          : r
      )
    )
  }

  // Actualizar nombre o peso de una evaluación,
  // validando que la suma no exceda el peso del rubro
  const updateEval = (
    rubroId: string,
    evalId: string,
    field: 'name' | 'weight',
    value: string | number
  ) => {
    setRubros(rs =>
      rs.map(r => {
        if (r.id !== rubroId) return r

        if (field === 'name') {
          return {
            ...r,
            evaluations: r.evaluations.map(e =>
              e.id === evalId ? { ...e, name: value as string } : e
            ),
          }
        }

        // field === 'weight'
        const newW = Number(value)
        // sumamos pesos de las otras evaluaciones
        const sumOtherEvals = r.evaluations
          .filter(e => e.id !== evalId)
          .reduce((s, e) => s + e.weight, 0)
        // el máximo permitido es el peso del rubro menos sumOtherEvals
        const maxAllowed = r.weight - sumOtherEvals
        let adjusted = newW
        if (newW > maxAllowed) {
          alert(`Peso máximo para esta evaluación es ${maxAllowed}%. Ajustado.`)
          adjusted = maxAllowed
        }
        return {
          ...r,
          evaluations: r.evaluations.map(e =>
            e.id === evalId ? { ...e, weight: adjusted } : e
          ),
        }
      })
    )
  }

  // Suma total de pesos de rubros
  const totalRubros = rubros.reduce((s, r) => s + r.weight, 0)

  return (
    <div>
      <h2 className="mb-4">Gestión de Rubros</h2>

      <button className="btn btn-outline-primary mb-4" onClick={addRubro}>
        <FaPlus /> Agregar Rubro
      </button>

      {rubros.map(r => (
        <div key={r.id} className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            {/* Campos del rubro */}
            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control me-3"
                placeholder="Nombre del rubro"
                value={r.name}
                onChange={e => updateRubro(r.id, 'name', e.target.value)}
                style={{ width: 200 }}
              />
              <input
                type="number"
                className="form-control"
                placeholder="%"
                value={r.weight}
                onChange={e => updateRubro(r.id, 'weight', +e.target.value)}
                style={{ width: 80 }}
              />
              <span className="ms-1">%</span>
            </div>
            <div>
              <FaPlus
                className="text-success me-3"
                style={{ cursor: 'pointer' }}
                onClick={() => addEval(r.id)}
                title="Agregar evaluación"
              />
              <FaMinusCircle
                className="text-danger"
                style={{ cursor: 'pointer' }}
                onClick={() => deleteRubro(r.id)}
                title="Eliminar rubro"
              />
            </div>
          </div>

          {/* Evaluaciones anidadas */}
          {open[r.id] && (
            <div className="card-body">
              {r.evaluations.map(ev => (
                <div key={ev.id} className="d-flex align-items-center mb-2">
                  <input
                    type="text"
                    className="form-control me-3"
                    placeholder="Nombre evaluación"
                    value={ev.name}
                    onChange={e => updateEval(r.id, ev.id, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="%"
                    value={ev.weight}
                    onChange={e => updateEval(r.id, ev.id, 'weight', +e.target.value)}
                    style={{ width: 80 }}
                  />
                  <span className="ms-1">%</span>
                  <FaMinusCircle
                    className="text-danger ms-3"
                    style={{ cursor: 'pointer' }}
                    onClick={() => deleteEval(r.id, ev.id)}
                    title="Eliminar evaluación"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="card-footer text-end text-muted" style={{ background: '#fafafa' }}>
            Total del rubro: <strong>{r.weight}%</strong>
          </div>
        </div>
      ))}

      <div className="mt-4">
        <h5 className={totalRubros > 100 ? 'text-danger' : 'text-muted'}>
          Total de rubros: {totalRubros}% / 100%
        </h5>
      </div>
    </div>
  )
}

export default RubricManager
