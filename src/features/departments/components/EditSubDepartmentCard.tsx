import { TextInput, Button, Stack, Grid, Alert, LoadingOverlay, Select } from '@mantine/core';
import { IconCode, IconX, IconDeviceFloppy } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { updateDepartment, getFaculties } from '../services';
import classes from './AddDepartmentCard.module.css';

interface DepartmentItem {
  id: number;
  departmentCode: string;
  departmentName: string;
  facultyCode: string;
  isActive: boolean;
}

interface FacultyOption {
  value: string; // faculty.id as string (for Select)
  label: string; // faculty.name
}

interface ValidationErrors {
  departmentCode?: string;
  departmentName?: string;
  facultyId?: string;
}

interface Props {
  department: DepartmentItem;
  currentFacultyId: number;
  onCancel: () => void;
  onSave: () => void;
}

export function EditSubDepartmentCard({ department, currentFacultyId, onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    departmentCode: department.departmentCode,
    departmentName: department.departmentName,
    facultyId: String(currentFacultyId),
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);

  useEffect(() => {
    const fetchFaculties = async () => {
      setFacultiesLoading(true);
      try {
        const data = await getFaculties();
        setFaculties(
          data
            .filter((f) => f.isActive)
            .map((f) => ({ value: String(f.id), label: f.facultyName }))
        );
      } catch {
        // nếu load thất bại thì Select sẽ trống, không block form
      } finally {
        setFacultiesLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  const set = (key: keyof typeof form) => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!form.departmentCode.trim()) newErrors.departmentCode = 'Mã bộ môn là bắt buộc';
    if (!form.departmentName.trim()) newErrors.departmentName = 'Tên bộ môn là bắt buộc';
    if (!form.facultyId) newErrors.facultyId = 'Vui lòng chọn khoa';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await updateDepartment(department.id, {
        departmentCode: form.departmentCode.trim().toUpperCase(),
        departmentName: form.departmentName.trim(),
        facultyId: Number(form.facultyId),
      });
      notifications.show({ title: 'Thành công', message: 'Cập nhật bộ môn thành công', color: 'green' });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật bộ môn');
      notifications.show({ title: 'Lỗi', message: 'Cập nhật bộ môn thất bại', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Sửa Bộ môn</h1>
        <p className={classes.pageSubtitle}>
          Cập nhật thông tin bộ môn <strong>{department.departmentName}</strong>.
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
            <Grid.Col span={12}>
              <Select
                label="KHOA"
                required
                placeholder={facultiesLoading ? 'Đang tải...' : 'Chọn khoa'}
                data={faculties}
                value={form.facultyId}
                onChange={val => set('facultyId')(val ?? '')}
                error={errors.facultyId}
                disabled={facultiesLoading}
                searchable
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
          Lưu thay đổi
        </Button>
      </div>

      {apiError && (
        <Alert color="red" title="Lỗi" mt="md">{apiError}</Alert>
      )}
    </div>
  );
}