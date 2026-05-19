import { Table, ActionIcon, Tooltip, Group, Modal, Button, Text, Stack } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { deleteFeedbackCategory } from '../services';
import { notifications } from '@mantine/notifications';
import type { FeedbackCategory } from '../types';

interface CategoryTableProps {
  categories: FeedbackCategory[];
  onEdit: (category: FeedbackCategory) => void;
  onCategoryDeleted: () => void;
}

export function CategoryTable({
  categories,
  onEdit,
  onCategoryDeleted,
}: CategoryTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<FeedbackCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (category: FeedbackCategory) => {
    setDeletingCategory(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    setDeleting(true);
    try {
      await deleteFeedbackCategory(deletingCategory.id);
      notifications.show({
        title: 'Thành công',
        message: 'Xóa danh mục feedback thành công',
        color: 'green',
      });
      setDeleteModalOpen(false);
      setDeletingCategory(null);
      onCategoryDeleted();
    } catch (err) {
      console.error('Delete category error:', err);
      notifications.show({
        title: 'Lỗi',
        message: 'Xóa danh mục feedback thất bại',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tên danh mục</Table.Th>
            <Table.Th>Mô tả</Table.Th>
            <Table.Th style={{ width: 100 }}>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {categories.map((category) => (
            <Table.Tr key={category.id}>
              <Table.Td>{category.name}</Table.Td>
              <Table.Td>{category.description}</Table.Td>
              <Table.Td>
                <Group gap={0}>
                  <Tooltip label="Chỉnh sửa">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => onEdit(category)}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Xóa">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingCategory(null);
        }}
        title="Xác nhận xóa"
        centered
      >
        <Stack gap="md">
          <Text>
            Bạn có chắc muốn xóa danh mục <strong>{deletingCategory?.name}</strong> không?
          </Text>
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeletingCategory(null);
              }}
            >
              Hủy
            </Button>
            <Button color="red" onClick={handleDeleteConfirm} loading={deleting}>
              Xóa
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
