import React, { useState } from 'react'

interface ExcelUploaderProps {
  /** Se llama con el archivo seleccionado (solo si se pasa) */
  onFileSelect?: (file: File) => void
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onFileSelect }) => {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0]
      setFile(selected)
      if (onFileSelect) onFileSelect(selected)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="form-control"
      />
      {file && <p className="mt-2">Archivo seleccionado: {file.name}</p>}
    </div>
  )
}

export default ExcelUploader
