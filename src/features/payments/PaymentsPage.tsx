import { useState } from 'react';
import { Button, Group, Tabs } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useSemesters } from '../semesters/hooks/useSemesters';
import { useTuitionInvoices } from './hooks/useTuitionInvoices';
import { useTuitionFeeConfigs } from './hooks/useTuitionFeeConfigs';
import { generateTuitionInvoices } from './services';
import type { Semester } from '../semesters/types';
import { TuitionInvoiceList } from './components/TuitionInvoiceList';
import { TuitionFeeConfigList } from './components/TuitionFeeConfigList';
import classes from './PaymentsPage.module.css';

const statusColors: Record<string, string> = {
  PENDING: 'yellow',
  PAID: 'green',
  CANCELLED: 'gray',
  OVERDUE: 'red',
  UNPAID: 'orange',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chưa đóng',
  PAID: 'Đã đóng',
  CANCELLED: 'Đã hủy',
  OVERDUE: 'Quá hạn',
  UNPAID: 'Chưa đóng',
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
          Tính học phí
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
  const [activeTab, setActiveTab] = useState<string | null>('invoices');

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

  const {
    configs,
    loading: configsLoading,
    error: configsError,
    page: configsPage,
    setPage: setConfigsPage,
    totalPages: configsTotalPages,
    totalElements: configsTotalElements,
    reload: reloadConfigs,
  } = useTuitionFeeConfigs();

  const handleGenerate = async (semesterId: number) => {
    try {
      setGeneratingId(semesterId);
      await generateTuitionInvoices(semesterId);
      notifications.show({
        title: 'Thành công',
        message: 'Đã tạo học phí cho kỳ này',
        color: 'green',
      });
      reloadSemesters();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể tạo học phí cho kỳ này',
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
        <h1 className={classes.pageTitle}>Quản lý học phí</h1>
        <p className={classes.pageDesc}>
          Theo dõi học phí sinh viên đã đóng và cấu hình mức học phí theo tín chỉ
        </p>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab} classNames={{ list: classes.tabsList }}>
        <Tabs.List>
          <Tabs.Tab value="invoices">Học phí sinh viên</Tabs.Tab>
          <Tabs.Tab value="configs">Mức học phí theo tín chỉ</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="invoices" pt="lg">
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
        </Tabs.Panel>

        <Tabs.Panel value="configs" pt="lg">
          <TuitionFeeConfigList
            configs={configs}
            loading={configsLoading}
            error={configsError}
            page={configsPage}
            totalPages={configsTotalPages}
            totalElements={configsTotalElements}
            onPage={setConfigsPage}
            onReload={reloadConfigs}
            formatCurrency={formatCurrency}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
