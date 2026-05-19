import { Modal, Button, Group, Text, Badge, Image, Stack, ScrollArea } from '@mantine/core';
import { useState } from 'react';
import { Select } from '@mantine/core';
import { updateFeedbackStatus } from '../services';
import { notifications } from '@mantine/notifications';
import type { Feedback, FeedbackStatus } from '../types';

interface FeedbackDetailModalProps {
  feedback: Feedback | null;
  opened: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const STATUS_OPTIONS: { value: FeedbackStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Chưa xử lý', color: 'orange' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý', color: 'blue' },
  { value: 'RESOLVED', label: 'Đã giải quyết', color: 'green' },
  { value: 'REJECTED', label: 'Từ chối', color: 'red' },
];

export function FeedbackDetailModal({
  feedback,
  opened,
  onClose,
  onStatusUpdated,
}: FeedbackDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | null>(
    feedback?.status || null
  );
  const [updating, setUpdating] = useState(false);

  if (!feedback) return null;

  const statusOption = STATUS_OPTIONS.find((s) => s.value === feedback.status);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;

    setUpdating(true);
    try {
      await updateFeedbackStatus(feedback.id || 0, selectedStatus);
      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật trạng thái feedback thành công',
        color: 'green',
      });
      onStatusUpdated();
      onClose();
    } catch (err) {
      console.error('Update status error:', err);
      notifications.show({
        title: 'Lỗi',
        message: 'Cập nhật trạng thái feedback thất bại',
        color: 'red',
      });
    } finally {
      setUpdating(false);
    }
  };

  const imageUrl = (imageKey: string) =>
    `https://res.cloudinary.com/dm5ev1isi/raw/feedback/${imageKey}`;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Chi tiết Feedback"
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        <div>
          <Text fw={500} size="sm" c="dimmed">
            Email
          </Text>
          <Text>{feedback.email}</Text>
        </div>

        <div>
          <Text fw={500} size="sm" c="dimmed">
            Tiêu đề
          </Text>
          <Text>{feedback.title}</Text>
        </div>

        <div>
          <Text fw={500} size="sm" c="dimmed">
            Nội dung
          </Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{feedback.content}</Text>
        </div>

        <div>
          <Text fw={500} size="sm" c="dimmed">
            Danh mục
          </Text>
          <Badge>{feedback.categoryName}</Badge>
        </div>

        <div>
          <Text fw={500} size="sm" c="dimmed">
            Phiên bản ứng dụng
          </Text>
          <Text>{feedback.appVersion}</Text>
        </div>

        <div>
          <Text fw={500} size="sm" c="dimmed">
            Thiết bị
          </Text>
          <Text>{feedback.deviceInfo}</Text>
        </div>

        {feedback.feedbackImages && feedback.feedbackImages.length > 0 && (
          <div>
            <Text fw={500} size="sm" c="dimmed" mb="xs">
              Hình ảnh
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {feedback.feedbackImages.map((imageKey, idx) => (
                <div key={idx}>
                  <Image
                    src={imageUrl(imageKey)}
                    alt={`Feedback image ${idx + 1}`}
                    height={150}
                    fit="cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Text fw={500} size="sm" c="dimmed">
            Ngày tạo
          </Text>
          <Text>
            {new Date(feedback.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </div>

        <div>
          <Text fw={500} size="sm" c="dimmed" mb="xs">
            Trạng thái hiện tại
          </Text>
          <Badge color={statusOption?.color}>{statusOption?.label}</Badge>
        </div>

        <Select
          label="Cập nhật trạng thái"
          placeholder="Chọn trạng thái mới"
          data={STATUS_OPTIONS.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value as FeedbackStatus)}
          allowDeselect
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={handleUpdateStatus} loading={updating}>
            Cập nhật trạng thái
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
