import React, { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import { getGrades } from '@/Functions/Professor/gradesAPI'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

interface Evaluation {
  evaluacion: string
  nota: number
  porcentaje: number
}

interface Category {
  rubro: string
  porcentaje: number
  promedio: number
  nota_ponderada: number
  evaluaciones: Evaluation[]
}

interface StudentGrade {
  carnet: string
  nombre_estudiante: string
  calificaciones: Category[]
  nota_total: number
}

interface ReportNotesProps {
  courseId?: string | null
  groupId?: string | null
}

const ReportNotes: React.FC<ReportNotesProps> = ({ courseId, groupId }) => {
  const [grades, setGrades] = useState<StudentGrade[]>([])
  const [expandedRubrics, setExpandedRubrics] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const gradesData = await getGrades(courseId? courseId : '', groupId ? Number(groupId) : 0)
        setGrades(gradesData)
      } catch (error) {
        console.error('Error fetching grades:', error)
      }
    }
    fetchGrades()
  }, [courseId])

  const handleExportPdf = () => {
    const pdf = new jsPDF('l', 'mm', 'a4')
    const margin = 10
    const rowHeight = 10
    const cellPadding = 3

    // Calculate column widths
    const carnetWidth = 25
    const nombreWidth = 60
    const rubroWidth = 30
    const notaFinalWidth = 25
    let totalWidth = carnetWidth + nombreWidth

    // Title
    pdf.setFontSize(16)
    pdf.text('Reporte de Notas', margin, margin + 10)

    // Start table
    pdf.setFontSize(10)
    pdf.setDrawColor(0)
    pdf.setLineWidth(0.1)

    // Calculate table width and x positions
    const startX = margin
    let currentY = margin + 20
    
    // Draw header cells
    pdf.setFont('helvetica', 'bold')
    
    // Carnet header
    let currentX = startX
    pdf.rect(currentX, currentY, carnetWidth, rowHeight)
    pdf.text('Carnet', currentX + cellPadding, currentY + 7)
    currentX += carnetWidth

    // Nombre header
    pdf.rect(currentX, currentY, nombreWidth, rowHeight)
    pdf.text('Nombre', currentX + cellPadding, currentY + 7)
    currentX += nombreWidth

    // Rubrics headers
    rubrics.forEach((rubro, index) => {
      const category = grades[0]?.calificaciones[index]
      pdf.rect(currentX, currentY, rubroWidth, rowHeight)
      pdf.text(rubro, currentX + cellPadding, currentY + 7)
      currentX += rubroWidth
      totalWidth += rubroWidth
    })

    // Nota Final header
    pdf.rect(currentX, currentY, notaFinalWidth, rowHeight)
    pdf.text('Final', currentX + cellPadding, currentY + 7)
    totalWidth += notaFinalWidth

    currentY += rowHeight

    // Draw content rows
    pdf.setFont('helvetica', 'normal')
    grades.forEach(student => {
      // New page check
      if (currentY > 270) {
        pdf.addPage()
        currentY = margin
      }

      currentX = startX
      const rowStartY = currentY

      // Carnet cell
      pdf.rect(currentX, currentY, carnetWidth, rowHeight)
      pdf.text(student.carnet, currentX + cellPadding, currentY + 7)
      currentX += carnetWidth

      // Nombre cell
      pdf.rect(currentX, currentY, nombreWidth, rowHeight)
      const nombreLines = pdf.splitTextToSize(student.nombre_estudiante, nombreWidth - (cellPadding * 2))
      pdf.text(nombreLines, currentX + cellPadding, currentY + 7)
      currentX += nombreWidth

      // Grades cells
      student.calificaciones.forEach(cat => {
        pdf.rect(currentX, currentY, rubroWidth, rowHeight)
        pdf.text(cat.promedio.toFixed(1), currentX + cellPadding, currentY + 7)
        currentX += rubroWidth
      })

      // Final grade cell
      pdf.rect(currentX, currentY, notaFinalWidth, rowHeight)
      pdf.text(student.nota_total.toFixed(1), currentX + cellPadding, currentY + 7)

      currentY += rowHeight
    })

    // Draw outer border
    pdf.rect(startX, margin + 20, totalWidth, currentY - (margin + 20))

    pdf.save('reporte_notas.pdf')
  }

  const toggleRubric = (rubro: string) => {
    const newExpanded = new Set(expandedRubrics)
    if (newExpanded.has(rubro)) {
      newExpanded.delete(rubro)
    } else {
      newExpanded.add(rubro)
    }
    setExpandedRubrics(newExpanded)
  }

  // Get unique rubrics from all students
  const rubrics = grades.length > 0 
    ? grades[0].calificaciones.map(cat => cat.rubro)
    : []

  return (
    <div>
      <h2 className="mb-4">Reporte de Notas</h2>
      <button className="btn btn-primary mb-3" onClick={handleExportPdf}>
        Exportar PDF
      </button>

      <div style={{ 
        overflowX: 'scroll', 
        position: 'relative',
        whiteSpace: 'nowrap'
      }}>
        <table className="table table-bordered" style={{ width: 'auto' }}>
          <thead>
            <tr>
              <th style={{ 
                position: 'sticky', 
                left: 0, 
                zIndex: 3, 
                backgroundColor: 'white',
                width: '120px'
              }}>Carnet</th>
              <th style={{ 
                position: 'sticky', 
                left: '120px', 
                zIndex: 3, 
                backgroundColor: 'white',
                width: '250px'
              }}>Nombre</th>
              {rubrics.map(rubro => (
                <React.Fragment key={rubro}>
                  <th style={{ 
                    cursor: 'pointer',
                    backgroundColor: expandedRubrics.has(rubro) ? '#e9ecef' : 'white',
                    width: '150px',
                    fontWeight: 'bold'
                  }} 
                  onClick={() => toggleRubric(rubro)}>
                    <div className="d-flex align-items-center">
                      {expandedRubrics.has(rubro) ? <FaChevronDown /> : <FaChevronRight />}
                      <span className="ms-2">{rubro}</span>
                    </div>
                  </th>
                  {expandedRubrics.has(rubro) && grades[0]?.calificaciones
                    .find(cat => cat.rubro === rubro)?.evaluaciones
                    .map(evaluation => (
                      <th 
                        key={evaluation.evaluacion}
                        style={{ 
                          backgroundColor: '#f5f5f5',
                          width: '120px',
                          fontWeight: 'normal',
                          fontSize: '0.9em'
                        }}
                      >
                        {evaluation.evaluacion}
                      </th>
                    ))
                  }
                </React.Fragment>
              ))}
              <th style={{ 
                backgroundColor: '#e9ecef',
                width: '120px'
              }}>Nota Final</th>
            </tr>
          </thead>
          <tbody>
            {grades.map(student => (
              <tr key={student.carnet}>
                <td style={{ 
                  position: 'sticky', 
                  left: 0, 
                  zIndex: 2, 
                  backgroundColor: 'white' 
                }}>
                  {student.carnet}
                </td>
                <td style={{ 
                  position: 'sticky', 
                  left: '120px', 
                  zIndex: 2, 
                  backgroundColor: 'white' 
                }}>
                  {student.nombre_estudiante}
                </td>
                {rubrics.map(rubro => {
                  const category = student.calificaciones.find(cat => cat.rubro === rubro)
                  return (
                    <React.Fragment key={rubro}>
                      <td style={{
                        backgroundColor: expandedRubrics.has(rubro) ? '#f8f9fa' : 'white'
                      }}>
                        {category?.promedio.toFixed(2)}
                      </td>
                      {expandedRubrics.has(rubro) && category?.evaluaciones.map(evaluation => (
                        <td 
                          key={evaluation.evaluacion}
                          style={{ backgroundColor: '#fff' }}
                        >
                          {evaluation.nota.toFixed(2)}
                        </td>
                      ))}
                    </React.Fragment>
                  )
                })}
                <td style={{ backgroundColor: '#e9ecef' }}>
                  <strong>{student.nota_total.toFixed(2)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportNotes
