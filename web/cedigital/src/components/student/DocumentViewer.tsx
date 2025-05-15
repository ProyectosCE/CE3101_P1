import React, { useState, useEffect } from 'react'

interface FileEntry {
  name: string
  url: string
  date: string
  size: number
}

interface FolderEntry {
  name: string
  files: FileEntry[]
}

const DocumentViewer: React.FC = () => {
  const [folders, setFolders] = useState<FolderEntry[]>([])
  const [openFolder, setOpenFolder] = useState<string | null>(null)

  useEffect(() => {
    // TODO: fetch(`/api/student/documents?course=…`).then(r=>r.json()).then(setFolders)
  }, [])

  const toggleFolder = (name: string) =>
    setOpenFolder(prev => (prev === name ? null : name))

  const downloadFile = (file: FileEntry) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <h2 className="mb-4">Documentos del Curso</h2>
      <table className="table table-hover">
        <thead>
          <tr>
            <th style={{ width: '60%' }}>Nombre</th>
            <th style={{ width: '20%' }}>Elementos</th>
            <th style={{ width: '20%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {folders.map(folder => {
            const isOpen = openFolder === folder.name
            return (
              <React.Fragment key={folder.name}>
                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleFolder(folder.name)}
                >
                  <td>
                    {isOpen ? '📂' : '📁'} {folder.name}
                  </td>
                  <td>{folder.files.length} archivos</td>
                  <td>
                    {/* podrías ofrecer descarga de ZIP aquí */}
                  </td>
                </tr>
                {isOpen &&
                  folder.files.map(f => (
                    <tr key={f.name} className="bg-light">
                      <td className="ps-5">📄 {f.name}</td>
                      <td>{f.size} KB</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => downloadFile(f)}
                        >
                          Descargar
                        </button>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DocumentViewer
