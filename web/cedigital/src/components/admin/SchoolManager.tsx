// src/components/admin/SchoolManager.tsx
import React, { useState } from 'react'
import ExcelUploader from './ExcelUploader'
import { uploadEscuelasExcel, createEscuela, updateEscuela, toggleEscuela, getEscuelas } from '@/Functions/schoolsApi'

interface SchoolEntry {
  id?: string
  code: string
  name: string
  disabled?: boolean
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: '1.5rem',
  width: '90%',
  maxWidth: 500,
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
}

const SchoolManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [newSchool, setNewSchool] = useState<SchoolEntry>({ code: '', name: '' })
  const [createdSchools, setCreatedSchools] = useState<SchoolEntry[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingSchool, setEditingSchool] = useState<SchoolEntry | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const updateNewSchool = (field: keyof SchoolEntry, value: string) => {
    setNewSchool({ ...newSchool, [field]: value })
  }

  const resetForm = () => {
    setNewSchool({ code: '', name: '' })
    setShowForm(false)
  }

  // Cargar escuelas desde el backend
  React.useEffect(() => {
    getEscuelas().then((data: any) => {
      setCreatedSchools(
        data.map((s: any) => ({
          id: s.codigo_carrera, // Use `codigo_carrera` as `id`
          code: s.codigo_carrera, // Map `codigo_carrera` to `code`
          name: s.nombre, // Map `nombre` to `name`
          disabled: s.estado === 'inactivo', // Map `estado` to `disabled`
        }))
      );
    }).catch(() => setCreatedSchools([]));
  }, [])

  // Crear escuela usando API
  const createSchool = async () => {
    if (!allFieldsFilled(newSchool)) return;
    try {
      const res = await createEscuela({
        codigo_carrera: newSchool.code,
        nombre: newSchool.name,
      });
      setCreatedSchools(prev => [
        ...prev,
        {
          id: res.codigo_carrera, // Use `codigo` directly from ApiSchool
          code: res.codigo_carrera,
          name: res.nombre,
          //por defecto al crear una escuela el estado es inactivo
          disabled: true
        }
      ]);
      resetForm();
    } catch {
      alert('Error al crear escuela');
    }
  }

  const isValidSchoolCode = (code: string) => /^[A-Z]{2}$/.test(code)

  const allFieldsFilled = (s: SchoolEntry) =>
    isValidSchoolCode(s.code) && s.name.trim() !== ''

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditingSchool({ ...createdSchools[idx] });
  }

  const updateEditingSchool = (field: keyof SchoolEntry, value: string) => {
    if (!editingSchool) return
    setEditingSchool({ ...editingSchool, [field]: value })
  }

  // Guardar edición usando API
  const saveEdit = async () => {
    if (editingIndex === null || !editingSchool || !allFieldsFilled(editingSchool)) return;
    try {
      await updateEscuela(
        createdSchools[editingIndex].id!,
        {
          codigo_carrera: editingSchool.code, // Use `codigo_carrera` for the API body
          nombre: editingSchool.name,
          estado: editingSchool.disabled ? 'inactivo' : 'activo', // Map `disabled` to `estado`
        }
      );
      // Refresh the list of schools
      const updatedSchools = await getEscuelas();
      setCreatedSchools(
        updatedSchools.map((s: any) => ({
          id: s.codigo_carrera,
          code: s.codigo_carrera,
          name: s.nombre,
          disabled: s.estado === 'inactivo',
        }))
      );
      setEditingIndex(null);
      setEditingSchool(null);
    } catch {
      alert('Error al editar Carrera');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingSchool(null)
  }

  // Habilitar/deshabilitar usando API
  const toggleDisabled = async (idx: number) => {
    const school = createdSchools[idx];
    if (!school.id) return;
    try {
      await toggleEscuela(school.id);
      // Refresh the list of schools
      const updatedSchools = await getEscuelas();
      setCreatedSchools(
        updatedSchools.map((s: any) => ({
          id: s.codigo_carrera,
          code: s.codigo_carrera,
          name: s.nombre,
          disabled: s.estado === 'inactivo',
        }))
      );
    } catch {
      alert('Error al cambiar estado de la carrera');
    }
  }

  // Subida de Excel
  const handleFileSelect = (file: File) => setSelectedFile(file)

  const confirmImport = async () => {
    if (!selectedFile) {
      alert('No hay archivo seleccionado.')
      return
    }
    try {
      const res = await uploadEscuelasExcel(selectedFile)
      alert(
        `Importación completada.\nImportados: ${res.importedCount}\nErrores: ${res.errors?.length || 0}`
      )
      setSelectedFile(null)
      // Opcional: recargar escuelas desde backend aquí
    } catch (err) {
      alert('Error al subir el archivo.')
    }
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Carreras</h2>
      
      {/* Crear escuela form */}
      <div className="mb-4">
        <button 
          className={`btn ${showForm ? 'btn-danger' : 'btn-secondary'}`} 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '- Cancelar' : '+ Crear Carrera'}
        </button>
      </div>

      {showForm && (
        <div className="border rounded p-3 mb-3">
          <div className="row mb-3">
            <div className="col-md-4 mb-2">
              <label className="form-label">Código de Carerra (2 letras)</label>
              <input
                type="text"
                className="form-control"
                value={newSchool.code}
                onChange={(e) => updateNewSchool('code', e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <div className="col-md-8 mb-2">
              <label className="form-label">Nombre de la Carrera</label>
              <input
                type="text"
                className="form-control"
                value={newSchool.name}
                onChange={(e) => updateNewSchool('name', e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn btn-success"
            disabled={!allFieldsFilled(newSchool)}
            onClick={createSchool}
          >
            Crear Carrera
          </button>
        </div>
      )}

      {/* Temporarily disabled Excel import
      <div className="mb-4">
        <h5>Importar desde Excel</h5>
        <ExcelUploader onFileSelect={handleFileSelect} />
        {selectedFile && (
          <div className="mt-2">
            <span>Archivo listo: {selectedFile.name}</span>{' '}
            <button className="btn btn-success btn-sm ms-2" onClick={confirmImport}>
              Confirmar importación
            </button>
          </div>
        )}
      </div>
      */}
      <h3 className="mt-5 mb-3">Carreras Registradas</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {createdSchools.map((s, i) => (
            <tr key={i} className={s.disabled ? 'opacity-50' : ''}>
              <td>{s.code}</td>
              <td>
                {s.name}
                {s.disabled && (
                  <span className="text-danger border border-danger rounded px-1 ms-2 small" style={{ fontSize: '0.7em' }}>
                    Deshabilitada
                  </span>
                )}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-1"
                  onClick={() => handleEdit(i)}
                >
                  Editar
                </button>
                <button 
                  className={`btn btn-sm ${s.disabled ? 'btn-success' : 'btn-danger'}`}
                  onClick={() => toggleDisabled(i)}
                >
                  {s.disabled ? 'Habilitar' : 'Deshabilitar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingIndex !== null && editingSchool && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Editar Carrera</h5>
              <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                X
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Código de Carrera (2 letras)</label>
              <input
                type="text"
                className="form-control"
                value={editingSchool.code}
                onChange={(e) => updateEditingSchool('code', e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre de la Carrera</label>
              <input
                type="text"
                className="form-control"
                value={editingSchool.name}
                onChange={(e) => updateEditingSchool('name', e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-secondary me-2" onClick={cancelEdit}>
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveEdit}
                disabled={!allFieldsFilled(editingSchool)}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchoolManager
