import React, { useState } from 'react'
import { Semester } from '../../types/course'
import CourseCard from './CourseCard'

interface SemesterSectionProps {
  semester: Semester
}

const SemesterSection: React.FC<SemesterSectionProps> = ({ semester }) => {
  const [isOpen, setIsOpen] = useState(semester.isActive)

  return (
    <div className="semester-section mb-4">
      <div 
        className="d-flex justify-content-between align-items-center p-3 bg-light rounded"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        <h3 className="m-0">{semester.name}</h3>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </div>
      
      {isOpen && (
        <div className="courses-grid mt-3">
          {semester.courses.map(course => (
            <CourseCard 
              key={`${course.code}-${course.group}`} 
              course={course}
              semesterId={semester.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SemesterSection
