import { useState } from 'react';
import { Badge, Button, Group } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useSemesters } from '../semesters/hooks/useSemesters';
import { useTuitionInvoices } from './hooks/useTuitionInvoices';
import { generateTuitionInvoices } from './services';
import type { Semester } from '../semesters/types';
import { TuitionInvoiceList } from './components/TuitionInvoiceList';
import classes from './PaymentsPage.module.css';

const statusColors: Record<string, string> = {
  PENDING: 'yellow',
  PAID: 'green',
  CANCELLED: 'gray',
  OVERDUE: 'red',
  UNPAID: 'orange',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  CANCELLED: 'Đã hủy',
  OVERDUE: 'Quá hạn',
  UNPAID: 'Chưa thanh toán',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

interface SemesterCardProps {
  semester: Semester;
  onSelect: () => void;
  onGenerate: () => void;
  generating: boolean;
}

function SemesterCard({ semester, onSelect, onGenerate, generating }: SemesterCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onSelect();
  };

  return (
    <div className={classes.semesterCard} onClick={handleCardClick}>
      <div className={classes.semesterCode}>{semester.semesterCode}</div>
      <div className={classes.semesterName}>{semester.semesterName}</div>
      <div className={classes.semesterYear}>{semester.academicYears}</div>
      <Group gap={8} className={classes.cardActions} onClick={(e) => e.stopPropagation()}>
        <Button
          size="xs"
          variant="light"
          color="blue"
          leftSection={<IconSparkles size={14} />}
          onClick={onGenerate}
          loading={generating}
        >
          Tính Học phí
        </Button>
      </Group>
    </div>
  );
}

export function PaymentsPage() {
  const {
    semesters,
    loading: semestersLoading,
    error: semestersError,
    reload: reloadSemesters,
  } = useSemesters();

  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
    page: invoicePage,
    setPage: setInvoicePage,
    totalPages: invoiceTotalPages,
    totalElements: invoiceTotalElements,
    reload: reloadInvoices,
  } = useTuitionInvoices(selectedSemester?.id ?? null, selectedStatus || undefined);

  const handleGenerate = async (semesterId: number) => {
    try {
      setGeneratingId(semesterId);
      await generateTuitionInvoices(semesterId);
      notifications.show({
        title: 'Thành công',
        message: 'Đã tạo hóa đơn học phí cho kỳ này',
        color: 'green',
      });
      reloadSemesters();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể tạo hóa đơn học phí',
        color: 'red',
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setInvoicePage(0);
  };

  if (selectedSemester) {
    return (
      <TuitionInvoiceList
        semester={selectedSemester}
        invoices={invoices}
        loading={invoicesLoading}
        error={invoicesError}
        page={invoicePage}
        totalPages={invoiceTotalPages}
        totalElements={invoiceTotalElements}
        onPage={setInvoicePage}
        onBack={() => {
          setSelectedSemester(null);
          setSelectedStatus('');
        }}
        onReload={reloadInvoices}
        statusColors={statusColors}
        statusLabels={statusLabels}
        formatCurrency={formatCurrency}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Thanh toán học phí</h1>
        <p className={classes.pageDesc}>
          Quản lý các hóa đơn học phí theo từng học kỳ
        </p>
      </div>

      <div className={classes.semesterGrid}>
        {semestersLoading ? (
          <div className={classes.loading}>Đang tải danh sách học kỳ...</div>
        ) : semestersError ? (
          <div className={classes.error}>{semestersError}</div>
        ) : semesters.length === 0 ? (
          <div className={classes.empty}>Không tìm thấy học kỳ nào</div>
        ) : (
          semesters.map((semester) => (
            <SemesterCard
              key={semester.id}
              semester={semester}
              onSelect={() => setSelectedSemester(semester)}
              onGenerate={() => handleGenerate(semester.id)}
              generating={generatingId === semester.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
