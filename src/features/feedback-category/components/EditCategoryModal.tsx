import { Modal, Button, Group, TextInput, Textarea, Stack, ScrollArea } from '@mantine/core';
import { useState, useEffect } from 'react';
import { updateFeedbackCategory } from '../services';
import { notifications } from '@mantine/notifications';
import type { FeedbackCategory } from '../types';

interface EditCategoryModalProps {
  category: FeedbackCategory | null;
  opened: boolean;
  onClose: () => void;
  onCategoryUpdated: () => void;
}

export function EditCategoryModal({
  category,
  opened,
  onClose,
  onCategoryUpdated,
}: EditCategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
    }
  }, [category, opened]);

  const handleSubmit = async () => {
    if (!category) return;

    if (!name.trim()) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng nhập tên danh mục',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      await updateFeedbackCategory(category.id, {
        name: name.trim(),
        description: description.trim(),
      });

      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật danh mục feedback thành công',
        color: 'green',
      });

      onCategoryUpdated();
      onClose();
    } catch (err) {
      console.error('Update category error:', err);
      notifications.show({
        title: 'Lỗi',
        message: 'Cập nhật danh mục feedback thất bại',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!category) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Cập nhật danh mục feedback"
      size="md"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        <TextInput
          label="Tên danh mục"
          placeholder="Nhập tên danh mục"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả danh mục"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Cập nhật danh mục
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
