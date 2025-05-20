import React from 'react'
import { Modal } from 'react-bootstrap'
import { FaPlus } from 'react-icons/fa'
import GroupManager from '../GroupManager'
import type { Group } from '@/types/groups'

interface GroupsViewModalProps {
  show: boolean
  onHide: () => void
  groupTypeId: string
  groupTypeName: string
  onSave?: (groups: Group[]) => void
}

const GroupsViewModal: React.FC<GroupsViewModalProps> = ({
  show,
  onHide,
  groupTypeId,
  groupTypeName,
  onSave
}) => {
  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Grupos - {groupTypeName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <GroupManager
          standalone={false}
          singleCategory={true}
          activityId={groupTypeId}
          activityName={groupTypeName}
          onSave={onSave}
        />
      </Modal.Body>
    </Modal>
  )
}

export default GroupsViewModal
