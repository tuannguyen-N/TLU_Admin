import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  NumberInput,
  Pagination,
  Select,
  Stack,
  Tabs,
  Text,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPencil, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useSemesters } from '../semesters/hooks/useSemesters';
import {
  cancelStudentEnrollment,
  confirmStudentEnrollments,
  createEnrollmentPeriod,
  deleteEnrollmentPeriod,
  updateEnrollmentPeriod,
} from './services';
import { useEnrollmentPeriods } from './hooks/useEnrollmentPeriods';
import { useStudentEnrollments } from './hooks/useStudentEnrollments';
import type { EnrollmentPeriod, EnrollmentPeriodFormData, StudentEnrollmentFilter } from './types';
import classes from './EnrollmentPeriodsPage.module.css';

interface FormState {
  semesterId: string;
  startTime: string;
  endTime: string;
  maxCredits: number | '';
}

const initialForm: FormState = {
  semesterId: '',
  startTime: '',
  endTime: '',
  maxCredits: '',
};

function normalizeDateTime(value: string): string {
  if (!value) return '';
  return value.length === 16 ? `${value}:00` : value;
}

function toDateTimeInputValue(value: string): string {
  return value ? value.slice(0, 16) : '';
}

function formatDateTime(value: string): string {
  if (!value) return '-';
  return value.replace('T', ' ');
}

function getEnrollmentStatus(status: string) {
  switch (status) {
    case 'PENDING':
      return { label: 'Chờ xác nhận', color: 'yellow' };
    case 'CONFIRMED':
      return { label: 'Đã xác nhận', color: 'green' };
    case 'CANCELLED':
      return { label: 'Đã hủy', color: 'red' };
    default:
      return { label: status, color: 'gray' };
  }
}

function toForm(period: EnrollmentPeriod): FormState {
  return {
    semesterId: String(period.semesterId),
    startTime: toDateTimeInputValue(period.startTime),
    endTime: toDateTimeInputValue(period.endTime),
    maxCredits: period.maxCredits,
  };
}

function toPayload(form: FormState): EnrollmentPeriodFormData {
  return {
    semesterId: Number(form.semesterId),
    startTime: normalizeDateTime(form.startTime),
    endTime: normalizeDateTime(form.endTime),
    maxCredits: Number(form.maxCredits),
  };
}

export function EnrollmentPeriodsPage() {
  const [activeTab, setActiveTab] = useState<string | null>('periods');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [enrollmentSemesterId, setEnrollmentSemesterId] = useState<string>('');
  const [majorId, setMajorId] = useState<number | ''>('');
  const [studentId, setStudentId] = useState<number | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<EnrollmentPeriod | null>(null);
  const [deletingPeriod, setDeletingPeriod] = useState<EnrollmentPeriod | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    semesters,
    loading: semestersLoading,
  } = useSemesters();

  const {
    periods,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
  } = useEnrollmentPeriods(semesterFilter || undefined);

  const enrollmentFilter = useMemo<StudentEnrollmentFilter>(() => ({
    ...(majorId !== '' && { majorId: Number(majorId) }),
    ...(enrollmentSemesterId && { semesterId: Number(enrollmentSemesterId) }),
    ...(studentId !== '' && { studentId: Number(studentId) }),
  }), [majorId, enrollmentSemesterId, studentId]);

  const {
    enrollments,
    loading: enrollmentsLoading,
    error: enrollmentsError,
    reload: reloadEnrollments,
  } = useStudentEnrollments(enrollmentFilter);

  const semesterOptions = useMemo(() => semesters.map(semester => ({
    value: String(semester.id),
    label: `${semester.semesterCode} - ${semester.semesterName}`,
  })), [semesters]);

  const semesterFilterOptions = useMemo(() => semesters.map(semester => ({
    value: semester.semesterCode,
    label: `${semester.semesterCode} - ${semester.semesterName}`,
  })), [semesters]);

  const semesterNameById = useMemo(() => {
    const map = new Map<number, string>();
    semesters.forEach(semester => {
      map.set(semester.id, `${semester.semesterCode} - ${semester.semesterName}`);
    });
    return map;
  }, [semesters]);

  const openCreateModal = () => {
    setEditingPeriod(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (period: EnrollmentPeriod) => {
    setEditingPeriod(period);
    setForm(toForm(period));
    setModalOpen(true);
  };

  const handleSemesterFilterChange = (value: string | null) => {
    setSemesterFilter(value || '');
    setPage(0);
  };

  const validate = () => {
    if (!form.semesterId || !form.startTime || !form.endTime || form.maxCredits === '') {
      return 'Vui lòng nhập đầy đủ thông tin đợt đăng ký';
    }
    if (new Date(form.startTime).getTime() >= new Date(form.endTime).getTime()) {
      return 'Thời gian bắt đầu phải trước thời gian kết thúc';
    }
    if (Number(form.maxCredits) <= 0) {
      return 'Số tín chỉ tối đa phải lớn hơn 0';
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      notifications.show({ title: 'Lỗi', message: validationError, color: 'red' });
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingPeriod) {
        await updateEnrollmentPeriod(editingPeriod.id, payload);
      } else {
        await createEnrollmentPeriod(payload);
      }
      notifications.show({
        title: 'Thành công',
        message: editingPeriod ? 'Đã cập nhật đợt đăng ký học' : 'Đã tạo đợt đăng ký học',
        color: 'green',
      });
      setModalOpen(false);
      reload();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không thể lưu đợt đăng ký học',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPeriod) return;

    setDeleting(true);
    try {
      await deleteEnrollmentPeriod(deletingPeriod.id);
      notifications.show({
        title: 'Thành công',
        message: 'Đã xóa đợt đăng ký học',
        color: 'green',
      });
      setDeletingPeriod(null);
      reload();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không thể xóa đợt đăng ký học',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmEnrollments = async () => {
    if (!enrollmentSemesterId) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng chọn học kỳ cần xác nhận',
        color: 'red',
      });
      return;
    }

    try {
      await confirmStudentEnrollments(Number(enrollmentSemesterId));
      notifications.show({
        title: 'Thành công',
        message: 'Đã xác nhận toàn bộ đăng ký học của học kỳ',
        color: 'green',
      });
      reloadEnrollments();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không thể xác nhận đăng ký học',
        color: 'red',
      });
    }
  };

  const handleCancelEnrollment = async (id: number) => {
    try {
      await cancelStudentEnrollment(id);
      notifications.show({
        title: 'Thành công',
        message: 'Đã hủy đăng ký học của sinh viên',
        color: 'green',
      });
      reloadEnrollments();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không thể hủy đăng ký học',
        color: 'red',
      });
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Đăng ký học</h1>
        <p className={classes.pageDesc}>
          Quản lý các đợt mở đăng ký học cho sinh viên theo từng học kỳ
        </p>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="periods">Đợt đăng ký</Tabs.Tab>
          <Tabs.Tab value="student-enrollments">Đăng ký sinh viên</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="periods">
      <div className={classes.toolbar}>
        <div className={classes.filters}>
          <Select
            label="Lọc theo học kỳ"
            placeholder="Tất cả học kỳ"
            data={semesterFilterOptions}
            value={semesterFilter || null}
            onChange={handleSemesterFilterChange}
            clearable
            searchable
            disabled={semestersLoading}
            w={280}
          />
        </div>
        <Group gap={8}>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={reload}
          >
            Làm mới
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
            style={{ backgroundColor: '#111827', color: '#fff' }}
          >
            Tạo đợt đăng ký
          </Button>
        </Group>
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
                  <th>Học kỳ</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Tín chỉ tối đa</th>
                  <th>Ngày tạo</th>
                  <th className={classes.actionsCol}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {periods.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={classes.empty}>Không có đợt đăng ký học nào</td>
                  </tr>
                ) : (
                  periods.map(period => (
                    <tr key={period.id} className={classes.row}>
                      <td><Text size="sm" fw={600}>{semesterNameById.get(period.semesterId) || period.semesterId}</Text></td>
                      <td>{formatDateTime(period.startTime)}</td>
                      <td>{formatDateTime(period.endTime)}</td>
                      <td>{period.maxCredits}</td>
                      <td>{formatDateTime(period.createdAt)}</td>
                      <td>
                        <Group gap={4} wrap="nowrap">
                          <Tooltip label="Sửa" position="top">
                            <ActionIcon
                              variant="subtle"
                              color="yellow"
                              size="sm"
                              onClick={() => openEditModal(period)}
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Xóa" position="top">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => setDeletingPeriod(period)}
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
                onChange={(p) => setPage(p - 1)}
                total={totalPages}
                size="sm"
              />
            </div>
          )}
        </>
      )}

      <Text size="sm" c="dimmed" mt="md">{totalElements} đợt đăng ký</Text>
        </Tabs.Panel>

        <Tabs.Panel value="student-enrollments">
          <div className={classes.toolbar}>
            <div className={classes.filters}>
              <Select
                label="Học kỳ"
                placeholder="Tất cả học kỳ"
                data={semesterOptions}
                value={enrollmentSemesterId || null}
                onChange={(value) => setEnrollmentSemesterId(value || '')}
                clearable
                searchable
                disabled={semestersLoading}
                w={280}
              />
              <NumberInput
                label="ID ngành"
                placeholder="majorId"
                value={majorId}
                onChange={(value) => setMajorId(value === '' ? '' : Number(value))}
                min={1}
                w={160}
              />
              <NumberInput
                label="ID sinh viên"
                placeholder="studentId"
                value={studentId}
                onChange={(value) => setStudentId(value === '' ? '' : Number(value))}
                min={1}
                w={160}
              />
            </div>
            <Group gap={8}>
              <Button
                variant="light"
                color="gray"
                leftSection={<IconRefresh size={16} />}
                onClick={reloadEnrollments}
              >
                Làm mới
              </Button>
              <Button
                color="green"
                onClick={handleConfirmEnrollments}
                disabled={!enrollmentSemesterId}
              >
                Xác nhận học kỳ
              </Button>
            </Group>
          </div>

          {enrollmentsLoading ? (
            <Center py={60}>
              <Loader size="md" />
            </Center>
          ) : enrollmentsError ? (
            <Center py={60}>
              <Text c="red">{enrollmentsError}</Text>
            </Center>
          ) : (
            <div className={classes.tableWrapper}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>Sinh viên</th>
                    <th>Lớp học phần</th>
                    <th>Môn học</th>
                    <th>Học kỳ</th>
                    <th>Trạng thái</th>
                    <th>Học lại</th>
                    <th>Ngày đăng ký</th>
                    <th className={classes.actionsCol}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={classes.empty}>Không có đăng ký học nào</td>
                    </tr>
                  ) : (
                    enrollments.map(enrollment => {
                      const status = getEnrollmentStatus(enrollment.status);
                      return (
                        <tr key={enrollment.id} className={classes.row}>
                          <td>
                            <Text size="sm" fw={600}>{enrollment.studentCode}</Text>
                            <Text size="xs" c="dimmed">{enrollment.studentName}</Text>
                          </td>
                          <td>
                            <Text size="sm" fw={600}>{enrollment.classCode}</Text>
                            <Text size="xs" c="dimmed">{enrollment.className}</Text>
                          </td>
                          <td>
                            <Text size="sm" fw={600}>{enrollment.subjectCode}</Text>
                            <Text size="xs" c="dimmed">{enrollment.subjectName}</Text>
                          </td>
                          <td>
                            <Text size="sm">{enrollment.semesterCode}</Text>
                            <Text size="xs" c="dimmed">{enrollment.semesterName}</Text>
                          </td>
                          <td><Badge color={status.color} size="sm">{status.label}</Badge></td>
                          <td>{enrollment.isRetake ? 'Có' : 'Không'}</td>
                          <td>{formatDateTime(enrollment.createdAt)}</td>
                          <td>
                            <Tooltip label="Hủy đăng ký" position="top">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={() => handleCancelEnrollment(enrollment.id)}
                                disabled={enrollment.status === 'CANCELLED'}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Text size="sm" c="dimmed" mt="md">{enrollments.length} đăng ký học</Text>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPeriod ? 'Cập nhật đợt đăng ký học' : 'Tạo đợt đăng ký học'}
        centered
      >
        <Stack gap={12}>
          <Select
            label="Học kỳ"
            placeholder="Chọn học kỳ"
            data={semesterOptions}
            value={form.semesterId || null}
            onChange={(value) => setForm(prev => ({ ...prev, semesterId: value || '' }))}
            searchable
            disabled={semestersLoading}
            required
          />
          <div>
            <Text size="sm" fw={500} mb={6}>Thời gian bắt đầu</Text>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setForm(prev => ({ ...prev, startTime: value }));
              }}
              style={{ width: '100%', height: 36, padding: '0 12px' }}
            />
          </div>
          <div>
            <Text size="sm" fw={500} mb={6}>Thời gian kết thúc</Text>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setForm(prev => ({ ...prev, endTime: value }));
              }}
              style={{ width: '100%', height: 36, padding: '0 12px' }}
            />
          </div>
          <NumberInput
            label="Số tín chỉ tối đa"
            value={form.maxCredits}
            onChange={(value) => setForm(prev => ({ ...prev, maxCredits: value === '' ? '' : Number(value) }))}
            min={1}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setModalOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Lưu
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deletingPeriod !== null}
        onClose={() => setDeletingPeriod(null)}
        title="Xác nhận xóa"
        centered
      >
        <Text mb="lg">
          Bạn có chắc chắn muốn xóa đợt đăng ký học này không?
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeletingPeriod(null)} disabled={deleting}>
            Hủy
          </Button>
          <Button color="red" onClick={handleDelete} loading={deleting}>
            Xóa
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
