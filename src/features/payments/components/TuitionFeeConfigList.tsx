import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Pagination,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPencil, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import { createTuitionFeeConfig, deleteTuitionFeeConfig, updateTuitionFeeConfig } from '../services';
import type { TuitionFeeConfig, TuitionFeeConfigFormData } from '../types';
import classes from './TuitionFeeConfigList.module.css';

interface Props {
  configs: TuitionFeeConfig[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  onPage: (p: number) => void;
  onReload: () => void;
  formatCurrency: (amount: number) => string;
}

interface FormState {
  basePricePerCredit: number | '';
  academicYear: string;
  cohort: number | '';
}

const initialForm: FormState = {
  basePricePerCredit: '',
  academicYear: '',
  cohort: '',
};

function toForm(config: TuitionFeeConfig): FormState {
  return {
    basePricePerCredit: config.basePricePerCredit,
    academicYear: config.academicYear,
    cohort: config.cohort,
  };
}

function toPayload(form: FormState): TuitionFeeConfigFormData {
  return {
    basePricePerCredit: Number(form.basePricePerCredit),
    academicYear: form.academicYear.trim(),
    cohort: Number(form.cohort),
  };
}

export function TuitionFeeConfigList({
  configs,
  loading,
  error,
  page,
  totalPages,
  totalElements,
  onPage,
  onReload,
  formatCurrency,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TuitionFeeConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<TuitionFeeConfig | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingConfig(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (config: TuitionFeeConfig) => {
    setEditingConfig(config);
    setForm(toForm(config));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.academicYear.trim() || form.basePricePerCredit === '' || form.cohort === '') {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng nhập đầy đủ thông tin học phí',
        color: 'red',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingConfig) {
        await updateTuitionFeeConfig(editingConfig.id, payload);
      } else {
        await createTuitionFeeConfig(payload);
      }
      notifications.show({
        title: 'Thành công',
        message: editingConfig ? 'Đã cập nhật cấu hình học phí' : 'Đã thêm cấu hình học phí',
        color: 'green',
      });
      setModalOpen(false);
      onReload();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: editingConfig ? 'Không thể cập nhật cấu hình học phí' : 'Không thể thêm cấu hình học phí',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingConfig) return;
    setDeleting(true);
    try {
      await deleteTuitionFeeConfig(deletingConfig.id);
      notifications.show({
        title: 'Thành công',
        message: 'Đã xóa cấu hình học phí',
        color: 'green',
      });
      setDeletingConfig(null);
      onReload();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể xóa cấu hình học phí',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <div>
          <Text size="sm" c="dimmed">{totalElements} cấu hình</Text>
        </div>
        <Group gap={8}>
          <Button
            variant="light"
            color="gray"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            onClick={onReload}
          >
            Làm mới
          </Button>
          <Button
            size="sm"
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
            style={{ backgroundColor: '#111827', color: '#fff' }}
          >
            Thêm mức học phí
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
                  <th>Năm học</th>
                  <th>Niên khóa</th>
                  <th>Giá 1 tín chỉ</th>
                  <th>Cập nhật</th>
                  <th className={classes.actionsCol}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {configs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={classes.empty}>Không có cấu hình học phí nào</td>
                  </tr>
                ) : (
                  configs.map((config) => (
                    <tr key={config.id} className={classes.row}>
                      <td><Text size="sm" fw={600}>{config.academicYear}</Text></td>
                      <td>{config.cohort}</td>
                      <td className={classes.amount}>{formatCurrency(config.basePricePerCredit)}</td>
                      <td>{config.updatedAt || '-'}</td>
                      <td>
                        <Group gap={4} wrap="nowrap">
                          <Tooltip label="Sửa" position="top">
                            <ActionIcon
                              variant="subtle"
                              color="yellow"
                              size="sm"
                              onClick={() => openEditModal(config)}
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Xóa" position="top">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => setDeletingConfig(config)}
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
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingConfig ? 'Cập nhật mức học phí' : 'Thêm mức học phí'}
        centered
      >
        <Stack gap={12}>
          <TextInput
            label="Năm học"
            placeholder="VD: 2025-2026"
            value={form.academicYear}
            onChange={(event) => {
              const academicYear = event.currentTarget.value;
              setForm(prev => ({ ...prev, academicYear }));
            }}
            required
          />
          <NumberInput
            label="Niên khóa"
            placeholder="VD: 2022"
            value={form.cohort}
            onChange={(value) => setForm(prev => ({ ...prev, cohort: value === '' ? '' : Number(value) }))}
            min={2000}
            required
          />
          <NumberInput
            label="Giá 1 tín chỉ"
            placeholder="VD: 1200000"
            value={form.basePricePerCredit}
            onChange={(value) => setForm(prev => ({ ...prev, basePricePerCredit: value === '' ? '' : Number(value) }))}
            min={0}
            thousandSeparator=","
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
        opened={deletingConfig !== null}
        onClose={() => setDeletingConfig(null)}
        title="Xác nhận xóa"
        centered
      >
        <Text mb="lg">
          Bạn có chắc chắn muốn xóa mức học phí của năm học <strong>{deletingConfig?.academicYear}</strong>,
          niên khóa <strong>{deletingConfig?.cohort}</strong> không?
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeletingConfig(null)} disabled={deleting}>
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
