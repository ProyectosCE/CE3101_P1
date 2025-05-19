import React from 'react'
import { Course } from '../../types/course'

interface CourseCardProps {
  course: Course
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{course.code}: {course.name}</h5>
        <p className="card-text">
          Grupo: {course.group}<br />
          Profesor: {course.professor}
        </p>
      </div>
    </div>
  )
}

export default CourseCard
