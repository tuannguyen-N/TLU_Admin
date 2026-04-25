import {
  TextInput, Select, Button, Stack, Grid, Alert, LoadingOverlay
} from '@mantine/core';
import {
  IconCode, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import classes from './AddMajorCard.module.css';
import { createMajor } from '../services';
import type { MajorFormData } from '../types';
import { fetchFaculties } from '../../students/services';
import type { Faculty } from '../../students/types';

interface ValidationErrors {
  majorCode?: string;
  majorName?: string;
  facultyId?: string;
}

interface Props {
  onCancel: () => void;
  onSave: (data: MajorFormData) => void;
}

export interface MajorFormDataInput {
  majorCode: string;
  majorName: string;
  facultyId: number | null;
}

const SectionTitle = ({ icon: Icon, number, title }: { icon: any; number: number; title: string }) => (
  <div className={classes.sectionTitle}>
    <div className={classes.sectionIcon}>
      <Icon size={18} />
    </div>
    <span className={classes.sectionNum}>{number}.</span>
    <span className={classes.sectionText}>{title}</span>
  </div>
);

export function AddMajorCard({ onCancel, onSave }: Props) {
  const [form, setForm] = useState<MajorFormDataInput>({
    majorCode: '',
    majorName: '',
    facultyId: null,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);

  useEffect(() => {
    fetchFaculties().then(data => {
      setFaculties(data);
      setLoadingFaculties(false);
    }).catch(() => {
      setLoadingFaculties(false);
    });
  }, []);

  const set = (key: keyof MajorFormDataInput) => (val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.majorCode.trim()) {
      newErrors.majorCode = 'Mã ngành là bắt buộc';
    }
    if (!form.majorName.trim()) {
      newErrors.majorName = 'Tên ngành là bắt buộc';
    }
    if (!form.facultyId) {
      newErrors.facultyId = 'Khoa là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    const payload: MajorFormData = {
      majorCode: form.majorCode.trim(),
      majorName: form.majorName.trim(),
      facultyId: form.facultyId!,
    };

    try {
      await createMajor(payload);
      notifications.show({
        title: 'Thành công',
        message: 'Tạo ngành thành công',
        color: 'green',
      });
      onSave(payload);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo ngành');
      notifications.show({
        title: 'Lỗi',
        message: 'Tạo ngành thất bại',
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
        <h1 className={classes.pageTitle}>Thêm Ngành Mới</h1>
        <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để khởi tạo ngành trong hệ thống.</p>
      </div>

      <Stack gap={16}>
        <div className={classes.section}>
          <SectionTitle icon={IconCode} number={1} title="Thông tin ngành" />
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="MÃ NGÀNH"
                required
                placeholder="CNTT"
                value={form.majorCode}
                onChange={e => set('majorCode')(e.target.value)}
                error={errors.majorCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="TÊN NGÀNH"
                required
                placeholder="Công nghệ thông tin"
                value={form.majorName}
                onChange={e => set('majorName')(e.target.value)}
                error={errors.majorName}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="KHOA"
                required
                placeholder="Chọn khoa"
                data={faculties.map(f => ({ value: String(f.id), label: f.name }))}
                value={form.facultyId ? String(form.facultyId) : null}
                onChange={val => set('facultyId')(val ? parseInt(val, 10) : null)}
                error={errors.facultyId}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                disabled={loadingFaculties}
              />
            </Grid.Col>
          </Grid>
        </div>
      </Stack>

      {/* Footer Actions */}
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
          Thêm ngành
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