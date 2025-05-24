import React, { useRef, useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getStudentGrades } from '@/Functions/Professor/gradesAPI'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/stores/authStore'

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

const ReportNotesStudent: React.FC = () => {
  const tableRef = useRef<HTMLDivElement>(null)
  const [grade, setGrade] = useState<StudentGrade | null>(null)
  const [expandedRubrics, setExpandedRubrics] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { code, group } = router.query
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user?.username || !code || !group) return
      try {
        const data = await getStudentGrades(
          code as string,
          Number(group),
          user.username
        )
        setGrade(data)
      } catch (error) {
        setGrade(null)
      }
    }
    fetchGrades()
  }, [user, code, group])

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

  const toggleRubric = (rubro: string) => {
    const newExpanded = new Set(expandedRubrics)
    if (newExpanded.has(rubro)) {
      newExpanded.delete(rubro)
    } else {
      newExpanded.add(rubro)
    }
    setExpandedRubrics(newExpanded)
  }

  const rubrics = grade?.calificaciones.map(cat => cat.rubro) || []

  return (
    <div>
      <h2 className="mb-4">Reporte de Mis Notas</h2>
      <button className="btn btn-primary mb-3" onClick={exportPdf}>
        Exportar PDF
      </button>
      <div ref={tableRef}>
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
                  {expandedRubrics.has(rubro) && grade?.calificaciones
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
            {grade ? (
              <tr>
                <td style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  backgroundColor: 'white'
                }}>
                  {grade.carnet}
                </td>
                <td style={{
                  position: 'sticky',
                  left: '120px',
                  zIndex: 2,
                  backgroundColor: 'white'
                }}>
                  {grade.nombre_estudiante}
                </td>
                {rubrics.map(rubro => {
                  const category = grade.calificaciones.find(cat => cat.rubro === rubro)
                  return (
                    <React.Fragment key={rubro}>
                      <td style={{
                        backgroundColor: expandedRubrics.has(rubro) ? '#f8f9fa' : 'white'
                      }}>
                        {category?.promedio?.toFixed(2)}
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
                  <strong>{grade.nota_total?.toFixed(2)}</strong>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={2 + rubrics.length + 1} className="text-center text-muted">
                  Cargando o sin notas disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportNotesStudent
