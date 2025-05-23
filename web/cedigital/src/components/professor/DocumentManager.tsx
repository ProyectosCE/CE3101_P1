// src/components/professor/DocumentManager.tsx
import React, { useState, ChangeEvent, useEffect } from 'react'
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
import { getFolders, getFilesByFolder } from '@/Functions/Professor/documentsApi'

interface ApiFile {
  id: string
  idCarpeta: string
  nombre: string
  fecha: string
  tamano: string
}

interface Folder {
  id: string
  nombre: string
}

const DocumentManager: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeFolder, setActiveFolder] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<ApiFile[]>([])

  // Cargar carpetas al iniciar
  useEffect(() => {
    setLoading(true)
    getFolders()
      .then(response => {
        setFolders(response.carpetas)
        if (response.carpetas.length > 0) {
          setActiveFolder(response.carpetas[0].id)
        }
      })
      .catch(error => {
        console.error('Error loading folders:', error)
        setFolders([])
      })
      .finally(() => setLoading(false))
  }, [])

  // Cargar archivos cuando cambie la carpeta activa
  useEffect(() => {
    if (!activeFolder) return

    setLoading(true)
    getFilesByFolder(activeFolder)
      .then(response => {
        // Filter files by active folder ID
        const filesInFolder = response.archivos.filter(file => file.idCarpeta === activeFolder)
        setFiles(filesInFolder)
      })
      .catch(error => {
        console.error('Error loading files:', error)
        setFiles([])
      })
      .finally(() => setLoading(false))
  }, [activeFolder])

  // Crear nueva carpeta personalizada
  const handleNewFolder = () => {
    const name = window.prompt('Nombre de la nueva carpeta:')
    if (name && !folders.find(f => f.nombre === name)) {
      // setCustomFolders(prev => [...prev, name])
      // setFilesByFolder(prev => ({ ...prev, [name]: [] }))
      setActiveFolder(name)
    }
  }

  // Eliminar carpeta personalizada
  const handleDeleteFolder = (folder: string) => {
    if (!confirm(`Eliminar carpeta "${folder}" y todo su contenido?`)) return
    
    // Si eliminamos la carpeta activa, volvemos a la primera disponible
    if (activeFolder === folder && folders.length > 0) {
      setActiveFolder(folders[0].id)
    }
  }

  // Subir archivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    // TODO: Implement file upload
    e.target.value = ''
  }

  // Ver y editar son placeholders
  const handleView = (file: ApiFile) => alert(`Ver: ${file.nombre}`)
  const handleEdit = (file: ApiFile) => {
    const newName = window.prompt('Nuevo nombre:', file.nombre)
    if (!newName) return
    // TODO: Implement rename
  }

  const handleDeleteFile = (fileId: string) => {
    if (!confirm('¿Eliminar este documento?')) return
    // TODO: Implement delete
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Documentos</h2>
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : (
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
                  key={f.id}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    f.id === activeFolder ? 'active text-white' : ''
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveFolder(f.id)}
                >
                  <span>
                    {f.id === activeFolder ? (
                      <FaFolderOpen className="me-2" />
                    ) : (
                      <FaFolder className="me-2" />
                    )}
                    {f.nombre}
                  </span>
                  <FaTrashAlt
                    style={{ cursor: 'pointer' }}
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteFolder(f.nombre)
                    }}
                  />
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
                Carpeta: <strong>{folders.find(f => f.id === activeFolder)?.nombre}</strong>
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
                {files.map(file => (
                  <tr key={file.id}>
                    <td>{file.nombre}</td>
                    <td>{new Date(file.fecha).toLocaleDateString()}</td>
                    <td>{file.tamano}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() => handleView(file)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-sm btn-secondary me-1"
                        onClick={() => handleEdit(file)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {files.length === 0 && (
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
      )}
    </div>
  )
}

export default DocumentManager
