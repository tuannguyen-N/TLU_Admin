import { useState } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { NotificationTemplateList } from './components/NotificationTemplateList';
import { AddTemplateCard } from './components/AddTemplateCard';
import { EditTemplateCard } from './components/EditTemplateCard';
import { useNotificationTemplates } from './hooks/useNotificationTemplates';
import type { NotificationTemplate } from './types';
import classes from './NotificationTemplatesPage.module.css';

export function NotificationTemplatesPage() {
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  const {
    templates,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
    handleDelete,
  } = useNotificationTemplates();

  const handleAddTemplate = () => setAddModalOpened(true);
  const handleEditTemplate = (template: NotificationTemplate) => setEditingTemplate(template);

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Mẫu Thông Báo</h1>
        <p className={classes.pageDesc}>
          Quản lý các mẫu thông báo. Tạo, chỉnh sửa và xóa mẫu thông báo để sử dụng khi tạo thông báo.
        </p>
      </div>

      <NotificationTemplateList
        templates={templates}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPage={setPage}
        onReload={reload}
        onAddTemplate={handleAddTemplate}
        onEditTemplate={handleEditTemplate}
        onDeleteConfirm={handleDelete}
      />

      <Modal
        opened={addModalOpened || editingTemplate !== null}
        onClose={() => {
          setAddModalOpened(false);
          setEditingTemplate(null);
        }}
        centered
        size="80%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {addModalOpened && (
          <AddTemplateCard
            onCancel={() => setAddModalOpened(false)}
            onSave={() => {
              setAddModalOpened(false);
              reload();
            }}
          />
        )}
        {editingTemplate && (
          <EditTemplateCard
            template={editingTemplate}
            onCancel={() => setEditingTemplate(null)}
            onSave={() => {
              setEditingTemplate(null);
              reload();
            }}
          />
        )}
      </Modal>
    </div>
  );
}