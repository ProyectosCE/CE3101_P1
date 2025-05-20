import React from 'react'
import { Modal } from 'react-bootstrap'
import { GroupMember } from '@/types/evaluation'

interface GroupMembersModalProps {
  show: boolean
  onHide: () => void
  groupName: string
  members: GroupMember[]
}

const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  show,
  onHide,
  groupName,
  members
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Integrantes del Grupo {groupName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Carnet</th>
                <th>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.carnet}>
                  <td>{member.carnet}</td>
                  <td>{member.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default GroupMembersModal
