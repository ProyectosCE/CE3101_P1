import React from 'react'
import { Modal } from 'react-bootstrap'
import GroupManager from '../GroupManager'
import type { Minigroup } from '@/Functions/Professor/groupManagerApi'

interface GroupsViewModalProps {
  show: boolean
  onHide: () => void
  groupTypeId: string
  groupTypeName: string
  onSave?: (groups: Minigroup[]) => void
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
          categoryId={groupTypeId}
          categoryName={groupTypeName}
          onSave={onSave}
        />
      </Modal.Body>
    </Modal>
  )
}

export default GroupsViewModal
