import {
  Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal
} from '@mantine/core';
import {
  IconPlus, IconPencil, IconTrash, IconRefresh
} from '@tabler/icons-react';
import { notifications as mantineNotifications } from '@mantine/notifications';
import { useState } from 'react';
import type { NotificationTemplate } from '../types';
import classes from './NotificationTemplateList.module.css';

interface Props {
  templates: NotificationTemplate[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  onPage: (p: number) => void;
  onReload: () => void;
  onAddTemplate: () => void;
  onEditTemplate: (template: NotificationTemplate) => void;
  onDeleteConfirm: (id: number) => void;
}

export function NotificationTemplateList({
  templates, loading, error,
  page, totalPages, totalElements,
  onPage, onReload, onAddTemplate, onEditTemplate, onDeleteConfirm,
}: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<NotificationTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRefresh = () => onReload();

  const handleDeleteClick = (template: NotificationTemplate) => {
    setDeletingTemplate(template);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTemplate) return;
    setDeleting(true);
    try {
      await onDeleteConfirm(deletingTemplate.id);
      mantineNotifications.show({
        title: 'Thành công',
        message: 'Xóa mẫu thông báo thành công',
        color: 'green',
      });
      setDeleteModalOpen(false);
    } catch (err) {
      mantineNotifications.show({
        title: 'Lỗi',
        message: 'Xóa mẫu thông báo thất bại',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <Text size="sm" c="dimmed">{totalElements} mẫu thông báo</Text>
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
              onClick={onAddTemplate}
              style={{ backgroundColor: '#111827', color: '#fff' }}
            >
              Tạo mẫu mới
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
                  <th>Mã</th>
                  <th>Tên mẫu</th>
                  <th className={classes.actionsCol}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={classes.empty}>Không tìm thấy mẫu thông báo nào</td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.id} className={classes.row}>
                      <td><Text size="sm" fw={600}>{template.code}</Text></td>
                      <td><Text size="sm">{template.name}</Text></td>
                      <td>
                        <Group gap={4} wrap="nowrap">
                          <Tooltip label="Sửa" position="top">
                            <ActionIcon
                              variant="subtle"
                              color="yellow"
                              size="sm"
                              onClick={() => onEditTemplate(template)}
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Xóa" position="top">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => handleDeleteClick(template)}
                            >
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
          Bạn có chắc chắn muốn xóa mẫu thông báo <strong>{deletingTemplate?.name}</strong> không?
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