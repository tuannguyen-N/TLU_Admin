import {
  TextInput, Select, Button, Stack, Grid, Alert, LoadingOverlay
} from '@mantine/core';
import {
  IconCode, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import classes from './AddMajorCard.module.css';
import { updateMajor } from '../services';
import type { Major, MajorFormData } from '../types';
import { fetchFaculties } from '../../students/services';
import type { Faculty } from '../../students/types';

interface ValidationErrors {
  majorCode?: string;
  majorName?: string;
  facultyId?: string;
}

interface Props {
  major: Major;
  onCancel: () => void;
  onSave: () => void;
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

export function EditMajorCard({ major, onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    majorCode: major.majorCode,
    majorName: major.majorName,
    facultyId: null as number | null,
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

  const set = (key: 'majorCode' | 'majorName' | 'facultyId') => (val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) {
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

    const payload: Partial<MajorFormData> = {
      majorCode: form.majorCode.trim(),
      majorName: form.majorName.trim(),
      facultyId: form.facultyId!,
    };

    try {
      await updateMajor(major.id, payload);
      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật ngành thành công',
        color: 'green',
      });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật ngành');
      notifications.show({
        title: 'Lỗi',
        message: 'Cập nhật ngành thất bại',
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
        <h1 className={classes.pageTitle}>Chỉnh Sửa Ngành</h1>
        <p className={classes.pageSubtitle}>Cập nhật thông tin ngành trong hệ thống.</p>
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
          Lưu thay đổi
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