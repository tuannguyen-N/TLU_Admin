import { Table, Badge, ActionIcon, Tooltip, Group } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import type { Feedback, FeedbackStatus } from '../types';

interface FeedbackTableProps {
  feedback: Feedback[];
  onView: (feedback: Feedback) => void;
}

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string }> = {
  PENDING: { label: 'Chưa xử lý', color: 'orange' },
  IN_PROGRESS: { label: 'Đang xử lý', color: 'blue' },
  RESOLVED: { label: 'Đã giải quyết', color: 'green' },
  REJECTED: { label: 'Từ chối', color: 'red' },
};

export function FeedbackTable({ feedback, onView }: FeedbackTableProps) {
  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Email</Table.Th>
          <Table.Th>Tiêu đề</Table.Th>
          <Table.Th>Danh mục</Table.Th>
          <Table.Th>Trạng thái</Table.Th>
          <Table.Th>Ngày tạo</Table.Th>
          <Table.Th style={{ width: 60 }}>Hành động</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {feedback.map((item) => {
          const statusConfig = STATUS_CONFIG[item.status];
          const createdDate = new Date(item.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });

          return (
            <Table.Tr key={item.id}>
              <Table.Td>{item.email}</Table.Td>
              <Table.Td>{item.title}</Table.Td>
              <Table.Td>{item.categoryName}</Table.Td>
              <Table.Td>
                <Badge color={statusConfig.color} size="sm">
                  {statusConfig.label}
                </Badge>
              </Table.Td>
              <Table.Td>{createdDate}</Table.Td>
              <Table.Td>
                <Group gap={0}>
                  <Tooltip label="Xem chi tiết">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => onView(item)}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
