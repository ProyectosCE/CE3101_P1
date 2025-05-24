import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  getFoldersByGroup,
  getFilesByFolder,
  downloadFile
} from '@/Functions/Professor/documentsApi'
import { FaFolder, FaFolderOpen, FaFileAlt, FaEye } from 'react-icons/fa'

interface FileEntry {
  id_documento: number
  nombre_archivo: string
  size: number
  fecha_subida: string
  id_carpeta: number
}

interface FolderEntry {
  id: string
  nombre: string
  files: FileEntry[]
}

const DocumentViewer: React.FC = () => {
  const router = useRouter()
  const { group, id_curso } = router.query
  const groupId = group || id_curso
  const [folders, setFolders] = useState<FolderEntry[]>([])
  const [activeFolder, setActiveFolder] = useState<string>('')
  const [foldersLoading, setFoldersLoading] = useState(true)
  const [filesLoading, setFilesLoading] = useState(false)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [filesError, setFilesError] = useState<string | null>(null)

  useEffect(() => {
    if (!groupId) return
    setFoldersLoading(true)
    getFoldersByGroup(groupId as string)
      .then(async (apiFolders) => {
        if (!Array.isArray(apiFolders)) {
          setFolders([])
          setFoldersLoading(false)
          return
        }
        const mappedFolders: FolderEntry[] = apiFolders.map(folder => ({
          id: folder.id_carpeta.toString(),
          nombre: folder.nombre,
          files: []
        }))
        setFolders(mappedFolders)
        if (mappedFolders.length > 0) {
          setActiveFolder(mappedFolders[0].id)
        }
        setFoldersLoading(false)
      })
      .catch(() => {
        setFolders([])
        setFoldersLoading(false)
      })
  }, [groupId])

  useEffect(() => {
    if (!activeFolder) return
    setFilesLoading(true)
    setFilesError(null)
    getFilesByFolder(parseInt(activeFolder))
      .then(response => {
        if (response.error) {
          setFilesError(response.error)
          setFiles([])
          return
        }
        setFiles(response.data || [])
      })
      .finally(() => setFilesLoading(false))
  }, [activeFolder])

  const handleView = async (file: FileEntry) => {
    try {
      const { url } = await downloadFile(file.id_documento)
      // Solo vista, no descarga directa
      if (
        file.nombre_archivo.toLowerCase().endsWith('.pdf') ||
        file.nombre_archivo.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)
      ) {
        window.open(url, '_blank')?.focus()
      } else {
        // Forzar descarga si no es visualizable
        const link = document.createElement('a')
        link.href = url
        link.download = file.nombre_archivo
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      alert('Error al descargar el archivo')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div>
      <h2 className="mb-4">Documentos del Curso</h2>
      {foldersLoading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <div className="row">
          {/* Sidebar de carpetas */}
          <div className="col-md-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Carpetas</strong>
              {/* Sin botón de crear carpeta */}
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
                </li>
              ))}
            </ul>
          </div>

          {/* Área de documentos */}
          <div className="col-md-9">
            {filesError ? (
              <div className="alert alert-danger">{filesError}</div>
            ) : (
              <>
                <div className="mb-3 d-flex align-items-center">
                  {/* Sin botón de subir documento */}
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
                    {filesLoading ? (
                      <tr>
                        <td colSpan={4} className="text-center">
                          <span className="text-muted">Cargando archivos...</span>
                        </td>
                      </tr>
                    ) : files.length > 0 ? (
                      files.map(file => (
                        <tr key={file.id_documento}>
                          <td>{file.nombre_archivo}</td>
                          <td>{new Date(file.fecha_subida).toLocaleDateString()}</td>
                          <td>{formatFileSize(file.size)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-info me-1"
                              onClick={() => handleView(file)}
                            >
                              <FaEye />
                            </button>
                            {/* Sin editar ni eliminar */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">
                          Sin documentos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentViewer
