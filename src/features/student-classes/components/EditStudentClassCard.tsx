import {
  TextInput, Select, Button, Stack, Grid, Alert, LoadingOverlay, NumberInput
} from '@mantine/core';
import {
  IconCode, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import classes from '../components/AddStudentClassCard.module.css';
import { updateStudentClass } from '../services';
import type { StudentClass, StudentClassFormData } from '../types';
import type { Major } from '../../majors/types';
import { fetchMajors } from '../../majors/services';

interface ValidationErrors {
  classCode?: string;
  startYear?: string;
  majorId?: string;
}

interface Props {
  studentClass: StudentClass;
  selectedFaculty: string;
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

export function EditStudentClassCard({ studentClass, selectedFaculty, onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    classCode: studentClass.classCode,
    startYear: studentClass.startYear,
    majorId: null as string | null,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(true);

  useEffect(() => {
    fetchMajors({ khoa: selectedFaculty, page: 0, size: 100 })
      .then(data => {
        setMajors(data.majors);
        // Find the major that matches the studentClass.majorName
        const matched = data.majors.find(m => m.majorName === studentClass.majorName);
        if (matched) {
          setForm(prev => ({ ...prev, majorId: String(matched.id) }));
        }
        setLoadingMajors(false);
      })
      .catch(() => {
        setLoadingMajors(false);
      });
  }, [selectedFaculty, studentClass.majorName]);

  const set = (key: 'classCode' | 'startYear' | 'majorId') => (val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.classCode.trim()) {
      newErrors.classCode = 'Mã lớp là bắt buộc';
    }
    if (!form.startYear) {
      newErrors.startYear = 'Niên khóa là bắt buộc';
    }
    if (!form.majorId) {
      newErrors.majorId = 'Ngành là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    const payload: Partial<StudentClassFormData> = {
      classCode: form.classCode.trim(),
      majorId: form.majorId!,
      startYear: form.startYear,
    };

    try {
      await updateStudentClass(studentClass.id, payload);
      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật lớp sinh viên thành công',
        color: 'green',
      });
      onSave();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật lớp sinh viên';
      setApiError(errorMessage);
      notifications.show({
        title: 'Lỗi',
        message: errorMessage,
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
        <h1 className={classes.pageTitle}>Chỉnh Sửa Lớp Sinh Viên</h1>
        <p className={classes.pageSubtitle}>Cập nhật thông tin lớp sinh viên trong hệ thống.</p>
      </div>

      <Stack gap={16}>
        <div className={classes.section}>
          <SectionTitle icon={IconCode} number={1} title="Thông tin lớp sinh viên" />
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="MÃ LỚP"
                required
                placeholder="IT35CL01"
                value={form.classCode}
                onChange={e => set('classCode')(e.target.value)}
                error={errors.classCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="NIÊN KHÓA"
                required
                placeholder="2022"
                value={form.startYear}
                onChange={val => set('startYear')(typeof val === 'number' ? val : null)}
                error={errors.startYear}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                min={2000}
                max={2100}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="NGÀNH"
                required
                placeholder="Chọn ngành"
                data={majors.map(m => ({ value: String(m.id), label: m.majorName }))}
                value={form.majorId}
                onChange={val => set('majorId')(val)}
                error={errors.majorId}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                disabled={loadingMajors}
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