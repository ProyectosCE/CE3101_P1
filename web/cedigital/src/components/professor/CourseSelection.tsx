import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

export interface Course {
  code: string
  name: string
  group: string
}
export interface SemesterData {
  title: string
  courses: Course[]
}

const CourseSelection: React.FC = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([])
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    // TODO: reemplazar con fetch('/api/professor/semesters') o similar
    // setSemesters(dataDesdeBackend)
  }, [])

  const toggle = (i: number) =>
    setOpenMap(o => ({ ...o, [i]: !o[i] }))

  return (
    <div className="professor-courses">
      <div className="professor-courses-header">
        <img
          src="/images/LogoTransparente.png"
          alt="CEDigital Logo"
          className="professor-logo"
        />
      </div>

      {semesters.map((sem, i) => (
        <div key={i} className="semester-card">
          <div
            className="semester-card-header"
            onClick={() => toggle(i)}
          >
            <span>{sem.title}</span>
            {openMap[i] ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {openMap[i] && sem.courses.length > 0 && (
            <div className="semester-card-body">
              {sem.courses.map(c => (
                <div key={c.code} className="course-item">
                  <Link href="/professor/dashboard">
                    {c.name} {c.group}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default CourseSelection
