import {
  TextInput, Button, Stack, Grid, Alert, LoadingOverlay
} from '@mantine/core';
import {
  IconCode, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import classes from './AddDepartmentCard.module.css';
import { createFaculty } from '../services';

interface ValidationErrors {
  facultyCode?: string;
  facultyName?: string;
}

interface Props {
  onCancel: () => void;
  onSave: () => void;
}

export function AddDepartmentCard({ onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    facultyCode: '',
    facultyName: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (key: 'facultyCode' | 'facultyName') => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.facultyCode.trim()) {
      newErrors.facultyCode = 'Mã khoa là bắt buộc';
    }
    if (!form.facultyName.trim()) {
      newErrors.facultyName = 'Tên khoa là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      await createFaculty({
        facultyCode: form.facultyCode.trim().toUpperCase(),
        facultyName: form.facultyName.trim(),
      });
      notifications.show({
        title: 'Thành công',
        message: 'Tạo khoa/bộ môn thành công',
        color: 'green',
      });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo khoa/bộ môn');
      notifications.show({
        title: 'Lỗi',
        message: 'Tạo khoa/bộ môn thất bại',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Thêm Khoa / Bộ môn Mới</h1>
        <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để khởi tạo khoa/bộ môn trong hệ thống.</p>
      </div>

      <Stack gap={16}>
        <div className={classes.section}>
          <div className={classes.sectionTitle}>
            <div className={classes.sectionIcon}>
              <IconCode size={18} />
            </div>
            <span className={classes.sectionNum}>1.</span>
            <span className={classes.sectionText}>Thông tin khoa/bộ môn</span>
          </div>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="MÃ KHOA"
                required
                placeholder="CNTT"
                value={form.facultyCode}
                onChange={e => set('facultyCode')(e.target.value)}
                error={errors.facultyCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="TÊN KHOA"
                required
                placeholder="Khoa Công nghệ thông tin"
                value={form.facultyName}
                onChange={e => set('facultyName')(e.target.value)}
                error={errors.facultyName}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
          </Grid>
        </div>
      </Stack>

      <div className={classes.footer}>
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconX size={16} />}
          onClick={onCancel}
          className={classes.cancelBtn}
          disabled={loading}
        >
          Huỷ
        </Button>
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSave}
          className={classes.saveBtn}
          loading={loading}
        >
          Thêm khoa/bộ môn
        </Button>
      </div>

      {apiError && (
        <Alert color="red" title="Lỗi" mt="md">
          {apiError}
        </Alert>
      )}
    </div>
  );
}