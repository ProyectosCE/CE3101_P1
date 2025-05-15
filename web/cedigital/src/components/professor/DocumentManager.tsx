// src/components/professor/DocumentManager.tsx
import React, { useState, ChangeEvent } from 'react'
import {
  FaFolder,
  FaFolderOpen,
  FaPlus,
  FaFileAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaTrashAlt,
} from 'react-icons/fa'

interface FileEntry {
  name: string
  size: number
  date: Date
}

// Carpeta inicial: no se podrán borrar
const initialFolders = ['Presentaciones', 'Quices', 'Exámenes', 'Proyectos']

const DocumentManager: React.FC = () => {
  // Sólo las creadas aquí pueden borrarse
  const [customFolders, setCustomFolders] = useState<string[]>([])
  const folders = [...initialFolders, ...customFolders]

  // Archivos por carpeta
  const [filesByFolder, setFilesByFolder] = useState<Record<string, FileEntry[]>>(
    folders.reduce((acc, f) => ({ ...acc, [f]: [] }), {})
  )

  const [activeFolder, setActiveFolder] = useState<string>(folders[0])

  // Crear nueva carpeta personalizada
  const handleNewFolder = () => {
    const name = window.prompt('Nombre de la nueva carpeta:')
    if (name && !folders.includes(name)) {
      setCustomFolders(prev => [...prev, name])
      setFilesByFolder(prev => ({ ...prev, [name]: [] }))
      setActiveFolder(name)
    }
  }

  // Eliminar carpeta personalizada
  const handleDeleteFolder = (folder: string) => {
    if (!customFolders.includes(folder)) return
    if (!confirm(`Eliminar carpeta "${folder}" y todo su contenido?`)) return
    setCustomFolders(prev => prev.filter(f => f !== folder))
    setFilesByFolder(prev => {
      const copy = { ...prev }
      delete copy[folder]
      return copy
    })
    // Si eliminamos la carpeta activa, volvemos a la primera inicial
    if (activeFolder === folder) {
      setActiveFolder(initialFolders[0])
    }
  }

  // Subir archivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    const entry: FileEntry = { name: file.name, size: file.size, date: new Date() }
    setFilesByFolder(prev => ({
      ...prev,
      [activeFolder]: [...(prev[activeFolder] || []), entry]
    }))
    e.target.value = ''
  }

  // Eliminar archivo
  const handleDeleteFile = (idx: number) => {
    if (!confirm('¿Eliminar este documento?')) return
    setFilesByFolder(prev => {
      const list = [...(prev[activeFolder] || [])]
      list.splice(idx, 1)
      return { ...prev, [activeFolder]: list }
    })
  }

  // Ver y editar son placeholders
  const handleView = (file: FileEntry) => alert(`Ver: ${file.name}`)
  const handleEdit   = (idx: number) => {
    const old = filesByFolder[activeFolder][idx].name
    const name = window.prompt('Nuevo nombre:', old)
    if (!name) return
    setFilesByFolder(prev => {
      const list = [...(prev[activeFolder] || [])]
      list[idx].name = name
      return { ...prev, [activeFolder]: list }
    })
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Documentos</h2>
      <div className="row">
        {/* Sidebar de carpetas */}
        <div className="col-md-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Carpetas</strong>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={handleNewFolder}
            >
              <FaPlus /> Crear
            </button>
          </div>
          <ul className="list-group">
            {folders.map(f => (
              <li
                key={f}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  f === activeFolder ? 'active text-white' : ''
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveFolder(f)}
              >
                <span>
                  {f === activeFolder ? (
                    <FaFolderOpen className="me-2" />
                  ) : (
                    <FaFolder className="me-2" />
                  )}
                  {f}
                </span>
                {customFolders.includes(f) && (
                  <FaTrashAlt
                    style={{ cursor: 'pointer' }}
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteFolder(f)
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Área de documentos */}
        <div className="col-md-9">
          <div className="mb-3 d-flex align-items-center">
            <label className="btn btn-primary mb-0 me-2">
              <FaFileAlt className="me-1" /> Subir Documento
              <input type="file" hidden onChange={handleFileChange} />
            </label>
            <span className="text-muted">
              Carpeta: <strong>{activeFolder}</strong>
            </span>
          </div>

          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Tamaño</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(filesByFolder[activeFolder] || []).map((file, idx) => (
                <tr key={idx}>
                  <td>{file.name}</td>
                  <td>{file.date.toLocaleDateString()}</td>
                  <td>{(file.size / 1024).toFixed(1)} KB</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-1"
                      onClick={() => handleView(file)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-sm btn-secondary me-1"
                      onClick={() => handleEdit(idx)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteFile(idx)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {!(filesByFolder[activeFolder] || []).length && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    Sin documentos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DocumentManager
