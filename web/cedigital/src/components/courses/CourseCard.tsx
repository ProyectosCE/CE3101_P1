import React from 'react'
import { useRouter } from 'next/router'
import { Course } from '../../types/course'

interface CourseCardProps {
  course: Course
  semesterId: string
}

const CourseCard: React.FC<CourseCardProps> = ({ course, semesterId }) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/courses/${semesterId}/${course.code}/${course.group}/documents`)
  }

  return (
    <div className="card mb-3 cursor-pointer" onClick={handleClick}>
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
