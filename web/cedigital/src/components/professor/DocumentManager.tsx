// src/components/professor/DocumentManager.tsx
import React, { useState, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  FaFolder, FaFolderOpen, FaPlus, FaFileAlt,
  FaEye, FaEdit, FaTrash, FaTrashAlt,
} from 'react-icons/fa'
import { 
  getFoldersByGroup, 
  getFilesByFolder, 
  downloadFile, 
  uploadFileToFolder, 
  deleteFile, 
  renameFile, 
  createFolder,
  deleteFolder 
} from '@/Functions/Professor/documentsApi'
import { Folder as ApiFolder } from '@/Functions/Professor/documentsApi'
import JsFileDownloader from 'js-file-downloader'
import { useAuthStore } from '@/stores/authStore'

interface ApiFile {
  id_documento: number
  nombre_archivo: string
  size: number
  fecha_subida: string
  id_carpeta: number
}

interface Folder {
  id: string
  nombre: string
  cedula: string | null // Changed from string | undefined to string | null
}

interface DocumentManagerProps {
  courseId?: string
  groupId?: string
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ courseId, groupId }) => {
  const router = useRouter()
  const { id_curso, group } = router.query
  const currentGroupId = groupId || group
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeFolder, setActiveFolder] = useState<string>('')
  const [foldersLoading, setFoldersLoading] = useState(true)
  const [filesLoading, setFilesLoading] = useState(false)
  const [files, setFiles] = useState<ApiFile[]>([])
  const [filesError, setFilesError] = useState<string | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    const currentCourseId = courseId || id_curso
    console.log('DocumentManager mounted, courseId:', courseId)
    console.log('id_curso from router:', id_curso)
    console.log('currentCourseId:', currentCourseId)

    if (!currentCourseId) {
      console.warn('No courseId available')
      return
    }

    const loadFolders = async () => {
      try {
        setFoldersLoading(true)
        console.log('Calling API with courseId:', currentCourseId)
        const response = await getFoldersByGroup(currentCourseId)
        console.log('API Response:', response)
        
        if (Array.isArray(response)) {
          const mappedFolders = response.map(folder => ({
            id: folder.id_carpeta.toString(),
            nombre: folder.nombre,
            cedula: folder.cedula_profesor || null // Changed from string | undefined to string | null
          }))
          console.log('Mapped folders:', mappedFolders)
          setFolders(mappedFolders)
          if (mappedFolders.length > 0) {
            setActiveFolder(mappedFolders[0].id)
          }
        } else {
          console.error('Unexpected API response format:', response)
          setFolders([])
        }
      } catch (error) {
        console.error('Error loading folders:', error)
        setFolders([])
      } finally {
        setFoldersLoading(false)
      }
    }

    loadFolders()
  }, [courseId, id_curso])

  // Cargar archivos cuando cambie la carpeta activa
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

  // Crear nueva carpeta personalizada
  const handleNewFolder = async () => {
    const name = window.prompt('Nombre de la nueva carpeta:')
    if (!name || folders.find(f => f.nombre === name)) return

    const currentCourseId = courseId || id_curso
    if (!currentCourseId || !currentGroupId) {
      alert('No hay un curso o grupo seleccionado')
      return
    }

    if (!user?.username) {
      alert('No se encontró la identificación del profesor')
      return
    }

    try {
      setFoldersLoading(true)
      const newFolder = await createFolder(
        name, 
        parseInt(currentGroupId as string),
        user.username
      )
      setFolders(prev => [...prev, {
        id: newFolder.id_carpeta.toString(),
        nombre: newFolder.nombre,
        cedula: newFolder.cedula_profesor || null
      }])
      setActiveFolder(newFolder.id_carpeta.toString())
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Error al crear la carpeta')
    } finally {
      setFoldersLoading(false)
    }
  }

  // Eliminar carpeta personalizada
  const handleDeleteFolder = async (id: string) => {
    const folder = folders.find(f => f.id === id)
    if (!folder || !folder.cedula) return
    
    if (!confirm(`Eliminar carpeta "${folder.nombre}" y todo su contenido?`)) return

    try {
      setFoldersLoading(true)
      await deleteFolder(parseInt(id))
      
      // Recargar la lista de carpetas
      const currentCourseId = courseId || id_curso
      if (currentCourseId) {
        const response = await getFoldersByGroup(currentCourseId)
        const mappedFolders = response.map(folder => ({
          id: folder.id_carpeta.toString(),
          nombre: folder.nombre,
          cedula: folder.cedula_profesor
        }))
        setFolders(mappedFolders)
        
        // Si eliminamos la carpeta activa, volvemos a la primera disponible
        if (id === activeFolder && mappedFolders.length > 0) {
          setActiveFolder(mappedFolders[0].id)
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert('Error al eliminar la carpeta')
    } finally {
      setFoldersLoading(false)
    }
  }

  // Subir archivo
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !activeFolder) return
    
    const file = e.target.files[0]
    try {
      setFilesLoading(true)
      const uploadedFile = await uploadFileToFolder(parseInt(activeFolder), file)
      setFiles(prev => [...prev, uploadedFile])
      console.log('File uploaded successfully:', uploadedFile)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir el archivo')
    } finally {
      setFilesLoading(false)
      e.target.value = '' // Reset input
    }
  }

  // Ver y editar son placeholders
  const handleView = async (file: ApiFile) => {
    try {
      const { url } = await downloadFile(file.id_documento);
      
      // Use the original filename from the file object
      const filename = file.nombre_archivo;
      
      if (filename.toLowerCase().endsWith('.pdf') || 
          filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
        window.open(url, '_blank')?.focus();
      } else {
        new JsFileDownloader({ 
          url,
          filename,
          forceDesktopMode: true,
          timeout: 30000,
          autoStart: true,
          headers: {
            'Accept': '*/*'
          }
        })
        .then(() => {
          console.log('Download complete');
        })
        .catch((error) => {
          console.error('Download error:', error);
          alert('Error al descargar el archivo');
        });
      }
    } catch (error) {
      console.error('Error handling file:', error);
      alert('Error al procesar el archivo');
    }
  }
  const handleEdit = async (file: ApiFile) => {
    // Extract base name and extension
    const lastDotIndex = file.nombre_archivo.lastIndexOf('.');
    const extension = lastDotIndex >= 0 ? file.nombre_archivo.slice(lastDotIndex) : '';
    const currentName = lastDotIndex >= 0 ? file.nombre_archivo.slice(0, lastDotIndex) : file.nombre_archivo;

    const newName = window.prompt('Nuevo nombre:', currentName)
    if (!newName) return

    try {
      setFilesLoading(true)
      // Append the original extension to the new name
      const fullNewName = newName + extension
      const updatedFile = await renameFile(file.id_documento, fullNewName)
      setFiles(prev => prev.map(f => 
        f.id_documento === file.id_documento ? updatedFile : f
      ))
    } catch (error) {
      console.error('Error renaming file:', error)
      alert('Error al renombrar el archivo')
    } finally {
      setFilesLoading(false)
    }
  }

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('¿Eliminar este documento?')) return

    try {
      setFilesLoading(true)
      await deleteFile(fileId)
      setFiles(prev => prev.filter(f => f.id_documento !== fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error al eliminar el archivo')
    } finally {
      setFilesLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Documentos</h2>
      {foldersLoading ? (
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
                  {f.cedula && (
                    <FaTrashAlt
                      style={{ cursor: 'pointer' }}
                      onClick={e => {
                        e.stopPropagation()
                        handleDeleteFolder(f.id)
                      }}
                    />
                  )}
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
                            <button
                              className="btn btn-sm btn-secondary me-1"
                              onClick={() => handleEdit(file)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteFile(file.id_documento)}
                            >
                              <FaTrash />
                            </button>
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

export default DocumentManager
