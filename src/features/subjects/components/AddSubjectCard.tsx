import {
  TextInput, Select, Button, Stack, Grid, Alert, NumberInput, LoadingOverlay
} from '@mantine/core';
import {
  IconCode, IconBook, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import classes from './AddSubjectCard.module.css';
import { createSubject, fetchFaculties, fetchDepartments } from '../services';
import type { SubjectFormData, FacultyOption, DepartmentOption } from '../types';

interface ValidationErrors {
  facultyId?: string;
  departmentId?: string;
  subjectCode?: string;
  subjectName?: string;
  credits?: string;
  coefficient?: string;
  lectureHours?: string;
  practiceHours?: string;
}

interface Props {
  onCancel: () => void;
  onSave: (data: SubjectFormData) => void;
}

export interface SubjectFormDataInput {
  facultyId: number | null;
  departmentId: number | null;
  subjectCode: string;
  subjectName: string;
  credits: number | null;
  coefficient: number | null;
  lectureHours: number | null;
  practiceHours: number | null;
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

export function AddSubjectCard({ onCancel, onSave }: Props) {
  const [form, setForm] = useState<SubjectFormDataInput>({
    facultyId: null,
    departmentId: null,
    subjectCode: '',
    subjectName: '',
    credits: null,
    coefficient: null,
    lectureHours: null,
    practiceHours: null,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  useEffect(() => {
    setFacultiesLoading(true);
    fetchFaculties()
      .then(setFacultyOptions)
      .catch(console.error)
      .finally(() => setFacultiesLoading(false));
  }, []);

  useEffect(() => {
    setDepartmentsLoading(true);
    fetchDepartments()
      .then((data) => {
        console.log('[DEBUG] departments from API:', data);
        setDepartmentOptions(data);
      })
      .catch(console.error)
      .finally(() => setDepartmentsLoading(false));
  }, []);

  const set = (key: keyof SubjectFormDataInput) => (val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleFacultyChange = (facultyCode: string | null) => {
    if (!facultyCode) {
      setForm(prev => ({ ...prev, facultyId: null, departmentId: null }));
      return;
    }
    const selected = facultyOptions.find(f => f.value === facultyCode);
    if (selected) {
      setForm(prev => ({ ...prev, facultyId: selected.id, departmentId: null }));
    }
  };

  const handleDepartmentChange = (departmentIdStr: string | null) => {
    if (!departmentIdStr) {
      setForm(prev => ({ ...prev, departmentId: null }));
      return;
    }
    const departmentId = parseInt(departmentIdStr, 10);
    setForm(prev => ({ ...prev, departmentId }));
  };

  const selectedFaculty = facultyOptions.find(f => f.id === form.facultyId);
  const selectedFacultyCode = selectedFaculty?.value;
  const filteredDepartments = departmentOptions.filter(
    d => d.facultyCode === selectedFacultyCode
  );

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.facultyId) {
      newErrors.facultyId = 'Khoa là bắt buộc';
    }
    if (!form.subjectCode.trim()) {
      newErrors.subjectCode = 'Mã môn học là bắt buộc';
    }
    if (!form.subjectName.trim()) {
      newErrors.subjectName = 'Tên môn học là bắt buộc';
    }
    if (!form.credits) {
      newErrors.credits = 'Số tín chỉ là bắt buộc';
    }
    if (!form.coefficient && form.coefficient !== 0) {
      newErrors.coefficient = 'Hệ số là bắt buộc';
    }
    if (!form.lectureHours && form.lectureHours !== 0) {
      newErrors.lectureHours = 'Số giờ lý thuyết là bắt buộc';
    }
    if (!form.practiceHours && form.practiceHours !== 0) {
      newErrors.practiceHours = 'Số giờ thực hành là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    const payload: SubjectFormData = {
      facultyId: form.facultyId!,
      departmentId: form.departmentId!,
      subjectCode: form.subjectCode.trim(),
      subjectName: form.subjectName.trim(),
      credits: form.credits ?? 0,
      coefficient: form.coefficient ?? 1,
      lectureHours: form.lectureHours ?? 0,
      practiceHours: form.practiceHours ?? 0,
    };

    try {
      await createSubject(payload);
      onSave(payload);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo môn học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page} style={{ position: 'relative' }}>
      <LoadingOverlay visible={facultiesLoading || departmentsLoading} />
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Thêm Môn Học Mới</h1>
        <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để khởi tạo môn học trong hệ thống.</p>
      </div>

      <Stack gap={16}>
        {/* Section 1 */}
        <div className={classes.section}>
          <SectionTitle icon={IconCode} number={1} title="Thông tin khoa và bộ môn" />
          <Grid>
            <Grid.Col span={6}>
              <Select
                label="KHOA"
                required
                placeholder="Chọn khoa"
                data={facultyOptions.map(f => ({ value: f.value, label: f.label }))}
                onChange={handleFacultyChange}
                error={errors.facultyId}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                searchable
                loading={facultiesLoading}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="BỘ MÔN"
                required
                placeholder={form.facultyId ? "Chọn bộ môn" : "Chọn khoa trước"}
                data={filteredDepartments.map(d => ({ value: String(d.id), label: d.label }))}
                value={form.departmentId ? String(form.departmentId) : undefined}
                onChange={handleDepartmentChange}
                error={errors.departmentId}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                searchable
                disabled={!form.facultyId}
                loading={departmentsLoading}
                nothingFoundMessage="Không tìm thấy bộ môn"
              />
            </Grid.Col>
          </Grid>
        </div>

        {/* Section 2 */}
        <div className={classes.section}>
          <SectionTitle icon={IconBook} number={2} title="Thông tin môn học" />
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="MÃ MÔN HỌC"
                required
                placeholder="INT1001"
                value={form.subjectCode}
                onChange={e => set('subjectCode')(e.target.value)}
                error={errors.subjectCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="TÊN MÔN HỌC"
                required
                placeholder="Nhập môn lập trình"
                value={form.subjectName}
                onChange={e => set('subjectName')(e.target.value)}
                error={errors.subjectName}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="SỐ TÍN CHỈ"
                required
                placeholder="3"
                value={form.credits ?? ''}
                onChange={val => set('credits')(typeof val === 'number' ? val : null)}
                error={errors.credits}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                min={1}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="HỆ SỐ"
                required
                placeholder="1"
                value={form.coefficient ?? ''}
                onChange={val => set('coefficient')(typeof val === 'number' ? val : null)}
                error={errors.coefficient}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                min={1}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="HÌNH THỨC ĐÀO TẠO"
                required
                placeholder="Chính quy"
                value="Chính quy"
                disabled
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="SỐ GIỜ LÝ THUYẾT"
                required
                placeholder="30"
                value={form.lectureHours ?? ''}
                onChange={val => set('lectureHours')(typeof val === 'number' ? val : null)}
                error={errors.lectureHours}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="SỐ GIỜ THỰC HÀNH"
                required
                placeholder="15"
                value={form.practiceHours ?? ''}
                onChange={val => set('practiceHours')(typeof val === 'number' ? val : null)}
                error={errors.practiceHours}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                min={0}
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
          Thêm môn học
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