import {
  Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal, Badge
} from '@mantine/core';
import {
  IconPlus, IconPencil, IconTrash, IconRefresh
} from '@tabler/icons-react';
import { notifications as mantineNotifications } from '@mantine/notifications';
import { useState } from 'react';
import type { Notification } from '../types';
import classes from './NotificationList.module.css';

interface Props {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  onPage: (p: number) => void;
  onReload: () => void;
  onAddNotification: () => void;
  onEditNotification: (notification: Notification) => void;
  onDeleteConfirm: (id: number) => void;
}

export function NotificationList({
  notifications, loading, error,
  page, totalPages, totalElements,
  onPage, onReload, onAddNotification, onEditNotification, onDeleteConfirm,
}: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState<Notification | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRefresh = () => onReload();

  const handleDeleteClick = (notification: Notification) => {
    setDeletingNotification(notification);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNotification) return;
    setDeleting(true);
    try {
      await onDeleteConfirm(deletingNotification.id);
      console.log('DELETE SUCCESS, showing notification');
      mantineNotifications.show({
        title: 'Thành công',
        message: 'Xóa thông báo thành công',
        color: 'green',
      });
      setDeleteModalOpen(false);
    } catch (err) {
      console.log('DELETE ERROR:', err);
      mantineNotifications.show({
        title: 'Lỗi',
        message: 'Xóa thông báo thất bại',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'GLOBAL': return { label: 'Toàn trường', color: 'blue' };
      case 'FACULTY': return { label: 'Khoa', color: 'cyan' };
      case 'STUDENT_CLASS': return { label: 'Lớp', color: 'teal' };
      case 'COURSE_CLASS': return { label: 'Lớp học phần', color: 'green' };
      case 'STUDENT': return { label: 'Sinh viên', color: 'orange' };
      case 'LECTURER': return { label: 'Giảng viên', color: 'violet' };
      default: return { label: type, color: 'gray' };
    }
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <Text size="sm" c="dimmed">{totalElements} thông báo</Text>
        <div className={classes.headerRight}>
          <Group gap={8}>
            <Button
              variant="light"
              color="gray"
              size="sm"
              leftSection={<IconRefresh size={16} />}
              onClick={handleRefresh}
            >
              Làm mới
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              size="sm"
              onClick={onAddNotification}
              style={{ backgroundColor: '#111827', color: '#fff' }}
            >
              Tạo thông báo
            </Button>
          </Group>
        </div>
      </div>

      {loading ? (
        <Center py={60}>
          <Loader size="md" />
        </Center>
      ) : error ? (
        <Center py={60}>
          <Text c="red">{error}</Text>
        </Center>
      ) : (
        <>
          <div className={classes.tableWrapper}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Nội dung</th>
                  <th>Loại</th>
                  <th>Hạn chót</th>
                  <th>Quan trọng</th>
                  <th className={classes.actionsCol}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={classes.empty}>Không tìm thấy thông báo nào</td>
                  </tr>
                ) : (
                  notifications.map((notification) => {
                    const targetInfo = getTargetTypeLabel(notification.targetType);
                    return (
                      <tr key={notification.id} className={classes.row}>
                        <td><Text size="sm" fw={600}>{notification.title}</Text></td>
                        <td><Text size="sm" c="dimmed" lineClamp={1}>{notification.content}</Text></td>
                        <td><Badge color={targetInfo.color} size="sm">{targetInfo.label}</Badge></td>
                        <td><Text size="sm">{notification.deadLine || '-'}</Text></td>
                        <td>
                          {notification.isImportant ? (
                            <Text size="md" c="red" fw={700}>✓</Text>
                          ) : (
                            <Text size="sm" c="dimmed"></Text>
                          )}
                        </td>
                        <td>
                          <Group gap={4} wrap="nowrap">
                            <Tooltip label="Sửa" position="top">
                              <ActionIcon
                                variant="subtle"
                                color="yellow"
                                size="sm"
                                onClick={() => onEditNotification(notification)}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Xóa" position="top">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={() => handleDeleteClick(notification)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={classes.paginationWrapper}>
              <Pagination
                value={page + 1}
                onChange={(p) => onPage(p - 1)}
                total={totalPages}
                size="sm"
              />
            </div>
          )}
        </>
      )}

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác nhận xóa"
        centered
      >
        <Text mb="lg">
          Bạn có chắc chắn muốn xóa thông báo <strong>{deletingNotification?.title}</strong> không?
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
            Hủy
          </Button>
          <Button color="red" onClick={handleDeleteConfirm} loading={deleting}>
            Xóa
          </Button>
        </Group>
      </Modal>
    </div>
  );
}