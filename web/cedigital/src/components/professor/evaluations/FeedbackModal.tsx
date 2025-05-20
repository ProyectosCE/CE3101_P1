import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaFileUpload, FaTrash } from 'react-icons/fa'
import { getFileType, getFileIcon } from '../../../utils/fileIcons'

interface FeedbackModalProps {
  show: boolean
  onHide: () => void
  onSave: (feedback: { comment: string; file: File | null }) => void
  studentName: string
  initialFeedback?: string
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  show,
  onHide,
  onSave,
  studentName,
  initialFeedback = ''
}) => {
  const [comment, setComment] = useState(initialFeedback)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('')

  useEffect(() => {
    if (show) {
      setComment(initialFeedback)
      setFile(null)
      setFileName('')
    }
  }, [show, initialFeedback])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFileName('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ comment, file })
    onHide()
  }

  return (
    <Modal show={show} onHide={onHide}>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Retroalimentación para {studentName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Comentario</label>
            <textarea
              className="form-control"
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Escriba sus comentarios aquí..."
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Archivo de Retroalimentación</label>
            {!fileName ? (
              <div className="input-group">
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                />
                <span className="input-group-text">
                  <FaFileUpload />
                </span>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 border rounded p-2">
                <span className="flex-grow-1 text-truncate">
                  <i className={`${getFileIcon(getFileType(fileName))} me-2`}></i>
                  {fileName}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleRemoveFile}
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={onHide}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default FeedbackModal
