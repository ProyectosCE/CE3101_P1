import React, { useState, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getStudentsByCourse } from '../../Functions/Professor/studentsApi'

export interface Student {
  carnet: string
  name: string
  email: string
  phone: string
}

interface ReportStudentsProps {
  courseId: string
}

const ReportStudents: React.FC<ReportStudentsProps> = ({ courseId }) => {
  const [students, setStudents] = useState<Student[]>([])
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudentsByCourse(courseId)
        setStudents(data)
      } catch (error) {
        console.error('Error fetching students:', error)
        setStudents([]) // Clear students on error
      }
    }
    fetchStudents()
  }, [courseId])

  const handleExportPdf = async () => {
    if (!tableRef.current) return
    const canvas = await html2canvas(tableRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('reporte_estudiantes.pdf')
  }

  return (
    <div>
      <h2 className="mb-4">Reporte de Estudiantes Matriculados</h2>
      <button className="btn btn-primary mb-3" onClick={handleExportPdf}>
        Exportar PDF
      </button>

      <div ref={tableRef}>
        <table className="table">
          <thead>
            <tr>
              <th>Carnet</th>
              <th>Nombre</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((s, i) => (
                <tr key={i}>
                  <td>{s.carnet}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  Cargando estudiantes...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportStudents
