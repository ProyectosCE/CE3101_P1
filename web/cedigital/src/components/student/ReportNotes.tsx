import React, { useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface Note {
  evaluation: string
  grade: number
}

const dummyNotes: Note[] = [
  { evaluation: 'Examen Parcial', grade: 85 },
  { evaluation: 'Proyecto Final', grade: 92 },
]

const ReportNotes: React.FC = () => {
  const tableRef = useRef<HTMLDivElement>(null)

  const exportPdf = async () => {
    if (!tableRef.current) return
    const canvas = await html2canvas(tableRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const w = pdf.internal.pageSize.getWidth()
    const h = (canvas.height * w) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, w, h)
    pdf.save('mis_notas.pdf')
  }

  return (
    <div>
      <h2 className="mb-4">Reporte de Mis Notas</h2>
      <button className="btn btn-primary mb-3" onClick={exportPdf}>
        Exportar PDF
      </button>
      <div ref={tableRef}>
        <table className="table">
          <thead>
            <tr>
              <th>Evaluación</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {dummyNotes.map((n, i) => (
              <tr key={i}>
                <td>{n.evaluation}</td>
                <td>{n.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportNotes
