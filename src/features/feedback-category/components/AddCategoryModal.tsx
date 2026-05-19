import { Modal, Button, Group, TextInput, Textarea, Stack, ScrollArea } from '@mantine/core';
import { useState } from 'react';
import { createFeedbackCategory } from '../services';
import { notifications } from '@mantine/notifications';

interface AddCategoryModalProps {
  opened: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
}

export function AddCategoryModal({
  opened,
  onClose,
  onCategoryAdded,
}: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
      await createFeedbackCategory({
        name: name.trim(),
        description: description.trim(),
      });

      notifications.show({
        title: 'Thành công',
        message: 'Tạo danh mục feedback thành công',
        color: 'green',
      });

      setName('');
      setDescription('');
      onCategoryAdded();
      onClose();
    } catch (err) {
      console.error('Create category error:', err);
      notifications.show({
        title: 'Lỗi',
        message: 'Tạo danh mục feedback thất bại',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Thêm danh mục feedback"
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
            Tạo danh mục
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
