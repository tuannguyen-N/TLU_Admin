import { TextInput, Button, Stack, Grid, Alert, LoadingOverlay } from '@mantine/core';
import { IconCode, IconX, IconDeviceFloppy } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { createDepartment } from '../services';
import type { Faculty } from '../../students/types';
import classes from './AddDepartmentCard.module.css';

interface ValidationErrors {
  departmentCode?: string;
  departmentName?: string;
}

interface Props {
  faculty: Faculty;
  onCancel: () => void;
  onSave: () => void;
}

export function AddSubDepartmentCard({ faculty, onCancel, onSave }: Props) {
  const [form, setForm] = useState({ departmentCode: '', departmentName: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (key: 'departmentCode' | 'departmentName') => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!form.departmentCode.trim()) newErrors.departmentCode = 'Mã bộ môn là bắt buộc';
    if (!form.departmentName.trim()) newErrors.departmentName = 'Tên bộ môn là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await createDepartment({
        departmentCode: form.departmentCode.trim().toUpperCase(),
        departmentName: form.departmentName.trim(),
        facultyId: faculty.id,
      });
      notifications.show({ title: 'Thành công', message: 'Thêm bộ môn thành công', color: 'green' });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi thêm bộ môn');
      notifications.show({ title: 'Lỗi', message: 'Thêm bộ môn thất bại', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Thêm Bộ môn Mới</h1>
        <p className={classes.pageSubtitle}>
          Thêm bộ môn mới cho khoa <strong>{faculty.name}</strong>.
        </p>
      </div>

      <Stack gap={16}>
        <div className={classes.section}>
          <div className={classes.sectionTitle}>
            <div className={classes.sectionIcon}><IconCode size={18} /></div>
            <span className={classes.sectionNum}>1.</span>
            <span className={classes.sectionText}>Thông tin bộ môn</span>
          </div>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="MÃ BỘ MÔN"
                required
                placeholder="CNTT01"
                value={form.departmentCode}
                onChange={e => set('departmentCode')(e.target.value)}
                error={errors.departmentCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="TÊN BỘ MÔN"
                required
                placeholder="Công nghệ phần mềm"
                value={form.departmentName}
                onChange={e => set('departmentName')(e.target.value)}
                error={errors.departmentName}
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
          Thêm bộ môn
        </Button>
      </div>

      {apiError && (
        <Alert color="red" title="Lỗi" mt="md">{apiError}</Alert>
      )}
    </div>
  );
}