import { Pagination, Group, Text, Button, Loader, Center, Badge, ActionIcon, Tooltip, Select } from '@mantine/core';
import { IconArrowLeft, IconRefresh, IconRotateClockwise } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { regenerateTuitionInvoice } from '../services';
import type { TuitionInvoice } from '../types';
import type { Semester } from '../../semesters/types';
import classes from './TuitionInvoiceList.module.css';

interface Props {
  semester: Semester;
  invoices: TuitionInvoice[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  onPage: (p: number) => void;
  onBack: () => void;
  onReload: () => void;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  formatCurrency: (amount: number) => string;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

function calculateStats(invoices: TuitionInvoice[]) {
  const pending = invoices.filter(i => i.status === 'PENDING' || i.status === 'UNPAID').length;
  const paid = invoices.filter(i => i.status === 'PAID').length;
  const cancelled = invoices.filter(i => i.status === 'CANCELLED').length;
  const overdue = invoices.filter(i => i.status === 'OVERDUE').length;
  return { pending, paid, cancelled, overdue, total: invoices.length };
}

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'UNPAID', label: 'Chưa thanh toán' },
  { value: 'OVERDUE', label: 'Quá hạn' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export function TuitionInvoiceList({
  semester,
  invoices,
  loading,
  error,
  page,
  totalPages,
  totalElements,
  onPage,
  onBack,
  onReload,
  statusColors,
  statusLabels,
  formatCurrency,
  selectedStatus,
  onStatusChange,
}: Props) {
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const filteredInvoices = selectedStatus
  ? invoices.filter(i => i.status === selectedStatus)
  : invoices;
  const stats = calculateStats(filteredInvoices);

  const handleRegenerate = async (invoiceId: number) => {
    try {
      setRegeneratingId(invoiceId);
      await regenerateTuitionInvoice(invoiceId);
      notifications.show({
        title: 'Thành công',
        message: 'Đã regenerate hóa đơn',
        color: 'green',
      });
      onReload();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể regenerate hóa đơn',
        color: 'red',
      });
    } finally {
      setRegeneratingId(null);
    }
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <button className={classes.backBtn} onClick={onBack}>
          <IconArrowLeft size={18} />
          <span>Quay lại</span>
        </button>
        <div className={classes.headerRight}>
          <div>
            <h2 className={classes.title}>Hóa đơn học phí</h2>
            <p className={classes.subtitle}>
              {semester.semesterName} • {totalElements} hóa đơn
            </p>
          </div>
          <Group gap={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              data={statusOptions}
              value={selectedStatus}
              onChange={(v) => v !== null && onStatusChange(v)}
              size="sm"
              style={{ width: 180 }}
            />
            <Button
              variant="light"
              color="gray"
              size="sm"
              leftSection={<IconRefresh size={16} />}
              onClick={onReload}
            >
              Làm mới
            </Button>
          </Group>
        </div>
      </div>

      <div className={classes.statsGrid}>
        <div className={classes.statCard}>
          <span className={classes.statValue}>{totalElements}</span>
          <span className={classes.statLabel}>Tổng hóa đơn</span>
        </div>
        <div className={`${classes.statCard} ${classes.pending}`}>
          <span className={classes.statValue}>{stats.pending}</span>
          <span className={classes.statLabel}>Chưa thanh toán</span>
        </div>
        <div className={`${classes.statCard} ${classes.paid}`}>
          <span className={classes.statValue}>{stats.paid}</span>
          <span className={classes.statLabel}>Đã thanh toán</span>
        </div>
        <div className={`${classes.statCard} ${classes.overdue}`}>
          <span className={classes.statValue}>{stats.overdue}</span>
          <span className={classes.statLabel}>Quá hạn</span>
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
                  <th>Mã sinh viên</th>
                  <th>Tên sinh viên</th>
                  <th>Mã hóa đơn</th>
                  <th>Hạn thanh toán</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th className={classes.actionsCol}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={classes.empty}>Không tìm thấy hóa đơn nào</td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.invoiceId} className={classes.row}>
                      <td className={classes.code}>{invoice.studentCode}</td>
                      <td>
                        <Text size="sm" fw={600}>{invoice.studentName}</Text>
                      </td>
                      <td>#{invoice.invoiceId}</td>
                      <td>{invoice.dueDate}</td>
                      <td className={classes.amount}>{formatCurrency(invoice.totalAmount)}</td>
                      <td className={classes.amount}>{formatCurrency(invoice.finalAmount)}</td>
                      <td>
                        <Badge color={statusColors[invoice.status] ?? 'gray'} size="sm">
                          {statusLabels[invoice.status] ?? invoice.status}
                        </Badge>
                      </td>
                      <td>
                        <Group gap={4} wrap="nowrap">
                          <Tooltip label="Regenerate" position="top">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              size="sm"
                              onClick={() => handleRegenerate(invoice.invoiceId)}
                              loading={regeneratingId === invoice.invoiceId}
                            >
                              <IconRotateClockwise size={16} />
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
    </div>
  );
}
