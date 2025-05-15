import React, { useState, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface Note {
  student: string
  carnet: string
  evaluation: string
  grade: number
}

const ReportNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // TODO: fetch('/api/notes?course=...') y luego setNotes(data)
  }, [])

  const handleExportPdf = async () => {
    if (!tableRef.current) return
    const canvas = await html2canvas(tableRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('reporte_notas.pdf')
  }

  return (
    <div>
      <h2 className="mb-4">Reporte de Notas</h2>
      <button className="btn btn-primary mb-3" onClick={handleExportPdf}>
        Exportar PDF
      </button>

      <div ref={tableRef}>
        <table className="table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Carnet</th>
              <th>Evaluación</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {notes.length > 0 ? (
              notes.map((n, i) => (
                <tr key={i}>
                  <td>{n.student}</td>
                  <td>{n.carnet}</td>
                  <td>{n.evaluation}</td>
                  <td>{n.grade}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  Cargando notas...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportNotes
