import { useState } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { NotificationList } from './components/NotificationList';
import { AddNotificationCard } from './components/AddNotificationCard';
import { EditNotificationCard } from './components/EditNotificationCard';
import { useNotifications } from './hooks/useNotifications';
import type { Notification } from './types';
import type { NotificationFormData } from './types';
import classes from './NotificationsPage.module.css';

export function NotificationsPage() {
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

  const {
    notifications,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
    handleDelete,
  } = useNotifications();

  const handleAddNotification = () => setAddModalOpened(true);
  const handleEditNotification = (notification: Notification) => setEditingNotification(notification);

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Thông báo</h1>
        <p className={classes.pageDesc}>
          Quản lý các thông báo trong hệ thống. Tạo, chỉnh sửa và xóa thông báo cho sinh viên và giảng viên.
        </p>
      </div>

      <NotificationList
        notifications={notifications}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPage={setPage}
        onReload={reload}
        onAddNotification={handleAddNotification}
        onEditNotification={handleEditNotification}
        onDeleteConfirm={handleDelete}
      />

      <Modal
        opened={addModalOpened || editingNotification !== null}
        onClose={() => {
          setAddModalOpened(false);
          setEditingNotification(null);
        }}
        centered
        size="80%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {addModalOpened && (
          <AddNotificationCard
            onCancel={() => setAddModalOpened(false)}
            onSave={() => {
              setAddModalOpened(false);
              reload();
            }}
          />
        )}
        {editingNotification && (
          <EditNotificationCard
            notification={editingNotification}
            onCancel={() => setEditingNotification(null)}
            onSave={() => {
              setEditingNotification(null);
              reload();
            }}
          />
        )}
      </Modal>
    </div>
  );
}