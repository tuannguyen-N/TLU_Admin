import { useState } from 'react';
import { Button, Group, ActionIcon, Tooltip, Modal, Loader, Center, Text } from '@mantine/core';
import { IconRefresh, IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { useApplicationTypes } from '../hooks/useApplicationTypes';
import { deleteApplicationType } from '../services';
import { notifications } from '@mantine/notifications';
import type { ApplicationType } from '../types';
import { AddApplicationTypeCard } from './AddApplicationTypeCard';
import { EditApplicationTypeCard } from './EditApplicationTypeCard';
import classes from './ApplicationTypeList.module.css';

export function ApplicationTypeList() {
  const { applicationTypes, loading, error, reload } = useApplicationTypes();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ApplicationType | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingType, setDeletingType] = useState<ApplicationType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRefresh = () => {
    reload();
  };

  const handleDeleteClick = (type: ApplicationType) => {
    setDeletingType(type);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingType) return;
    setDeleting(true);
    try {
      await deleteApplicationType(deletingType.id);
      notifications.show({ title: 'Thành công', message: 'Xóa loại đơn từ thành công', color: 'green' });
      setDeleteModalOpen(false);
      setDeletingType(null);
      reload();
    } catch (err) {
      notifications.show({ title: 'Lỗi', message: 'Xóa loại đơn từ thất bại', color: 'red' });
    } finally {
      setDeleting(false);
    }
  };

  const handleAddSuccess = () => {
    setAddModalOpen(false);
    reload();
  };

  const handleEditSuccess = () => {
    setEditingType(null);
    reload();
  };

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <h3 className={classes.title}>Loại đơn từ</h3>
        <Group gap={8}>
          <Button variant="light" color="gray" size="xs" leftSection={<IconRefresh size={14} />} onClick={handleRefresh}>
            Làm mới
          </Button>
          <Button size="xs" leftSection={<IconPlus size={14} />} onClick={() => setAddModalOpen(true)} style={{ backgroundColor: '#111827', color: '#fff' }}>
            Thêm loại
          </Button>
        </Group>
      </div>

      {loading ? (
        <Center py={40}><Loader size="sm" /></Center>
      ) : error ? (
        <Center py={40}><Text c="red" size="sm">{error}</Text></Center>
      ) : (
        <div className={classes.tableWrapper}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên loại đơn từ</th>
                <th className={classes.actionsCol}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {applicationTypes.length === 0 ? (
                <tr>
                  <td colSpan={3} className={classes.empty}>Chưa có loại đơn từ nào</td>
                </tr>
              ) : (
                applicationTypes.map((type) => (
                  <tr key={type.id} className={classes.row}>
                    <td><span className={classes.typeCode}>{type.code}</span></td>
                    <td className={classes.typeName}>{type.name}</td>
                    <td>
                      <Group gap={4}>
                        <Tooltip label="Sửa" position="top">
                          <ActionIcon variant="subtle" color="yellow" size="sm" onClick={() => setEditingType(type)}>
                            <IconPencil size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Xóa" position="top">
                          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteClick(type)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        size="70%"
        withCloseButton={false}
      >
        <AddApplicationTypeCard
          onCancel={() => setAddModalOpen(false)}
          onSave={handleAddSuccess}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editingType !== null}
        onClose={() => setEditingType(null)}
        size="70%"
        withCloseButton={false}
      >
        {editingType && (
          <EditApplicationTypeCard
            applicationType={editingType}
            onCancel={() => setEditingType(null)}
            onSave={handleEditSuccess}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Xác nhận xóa" centered>
        <Text mb="lg">
          Bạn có chắc chắn muốn xóa loại đơn từ <strong>{deletingType?.name}</strong> không?
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>Huỷ</Button>
          <Button color="red" onClick={handleDeleteConfirm} loading={deleting}>Xóa</Button>
        </Group>
      </Modal>
    </div>
  );
}