import React from 'react'

interface GroupMember {
  id: string
  name: string
  avatarUrl?: string
}

interface EvaluationDetailProps {
  open: boolean
  onClose: () => void
  evalItem: {
    id: string
    name: string
    description?: string
    value: number
    rubricEnabled: boolean
    rubricUrl?: string
    dueDate: string
    allowLate: boolean
    groupSize: number
    groupMembers?: GroupMember[]
    submitted: boolean
    fileName?: string
    fileUrl?: string
    dateSubmitted?: string
    grade?: number
    feedback?: string
    feedbackFiles?: { name: string, url: string }[]
    comments?: string
  }
}

const EvaluationDetailModal: React.FC<EvaluationDetailProps> = ({
  open,
  onClose,
  evalItem,
}) => {
  if (!open) return null

  return (
    <>
      <div 
        className="modal-backdrop show" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050 
        }} 
      />
      <div 
        className="modal d-block" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1055,
          overflowY: 'auto'
        }}
      >
        <div className="modal-dialog modal-lg" style={{ margin: '1.75rem auto' }}>
          <div className="modal-content" style={{ backgroundColor: '#fff' }}>
            <div className="modal-header">
              <h5 className="modal-title">{evalItem.name}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p><strong>Descripción:</strong> {evalItem.description || <em>Sin descripción</em>}</p>
              <p><strong>Valor:</strong> {evalItem.value}</p>
              <p><strong>Fecha de entrega:</strong> {evalItem.dueDate}</p>
              <p><strong>Entrega tardía permitida:</strong> {evalItem.allowLate ? 'Sí' : 'No'}</p>
              <p><strong>Tipo de grupo:</strong> {evalItem.groupSize > 1 ? `Grupal (${evalItem.groupSize} personas)` : 'Individual'}</p>
              {evalItem.groupMembers && evalItem.groupMembers.length > 0 && (
                <div>
                  <strong>Miembros del grupo:</strong>
                  <ul>
                    {evalItem.groupMembers.map(m => (
                      <li key={m.id}>
                        {m.avatarUrl && <img src={m.avatarUrl} alt={m.name} style={{ width: 24, borderRadius: '50%', marginRight: 8 }} />}
                        {m.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <hr />
              <div>
                <strong>Entrega:</strong>
                {evalItem.submitted ? (
                  <div>
                    <a href={evalItem.fileUrl} download className="btn btn-success btn-sm me-2">{evalItem.fileName}</a>
                    <span>Entregado el {evalItem.dateSubmitted}</span>
                  </div>
                ) : (
                  <div>
                    <input type="file" className="form-control" />
                  </div>
                )}
              </div>
              <p><strong>Nota obtenida:</strong> {evalItem.grade ?? <em>Pendiente</em>}</p>
              {evalItem.rubricEnabled && evalItem.rubricUrl && (
                <div>
                  <a href={evalItem.rubricUrl} target="_blank" rel="noopener" className="btn btn-outline-primary btn-sm mt-2">Ver rúbrica</a>
                </div>
              )}
              <hr />
              <div>
                <strong>Comentarios del profesor:</strong>
                <div>{evalItem.comments || <em>Sin comentarios</em>}</div>
                {evalItem.feedbackFiles && evalItem.feedbackFiles.length > 0 && (
                  <div className="mt-2">
                    <strong>Archivos de retroalimentación:</strong>
                    <ul>
                      {evalItem.feedbackFiles.map(f => (
                        <li key={f.url}><a href={f.url} download>{f.name}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EvaluationDetailModal