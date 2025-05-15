import React from 'react'

const EvaluationManager: React.FC = () => (
  <div>
    <h2 className="mb-4">Asignar / Evaluar Entregables</h2>
    <button className="btn btn-primary mb-3">Asignar Evaluación</button>
    <button className="btn btn-secondary mb-3 ms-2">Evaluar Entregable</button>
    <table className="table">
      <thead>
        <tr>
          <th>Evaluación</th>
          <th>Rubro</th>
          <th>Fecha Entrega</th>
          <th>Tipo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {/* mapear evaluaciones del backend */}
        <tr>
          <td>Examen Parcial</td>
          <td>Exámenes</td>
          <td>20/05/2025</td>
          <td>Individual</td>
          <td>
            <button className="btn btn-sm btn-info me-1">Ver</button>
            <button className="btn btn-sm btn-primary">Calificar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)

export default EvaluationManager
