import {
  TextInput, Select, Button, Stack, Grid, Alert, NumberInput, LoadingOverlay
} from '@mantine/core';
import {
  IconCode, IconBook, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import classes from './AddTrainingProgramCard.module.css';
import { createTrainingProgram, fetchMajors, type MajorOption } from '../services';
import type { TrainingProgramFormData } from '../types';

interface ValidationErrors {
  studyProgramCode?: string;
  studyProgramName?: string;
  majorCode?: string;
  startYear?: string;
  totalCredits?: string;
  trainingType?: string;
}

interface Props {
  khoa?: string;
  onCancel: () => void;
  onSave: (data: TrainingProgramFormData) => void;
}

export interface TrainingProgramFormDataInput {
  studyProgramCode: string;
  studyProgramName: string;
  majorCode: string;
  startYear: number | null;
  totalCredits: number | null;
  trainingType: string;
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

export function AddTrainingProgramCard({ khoa = 'CNTT', onCancel, onSave }: Props) {
  const [form, setForm] = useState<TrainingProgramFormDataInput>({
    studyProgramCode: '',
    studyProgramName: '',
    majorCode: '',
    startYear: null,
    totalCredits: null,
    trainingType: 'CHINH_QUY',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [majorOptions, setMajorOptions] = useState<MajorOption[]>([]);
  const [majorsLoading, setMajorsLoading] = useState(false);

  useEffect(() => {
    setMajorsLoading(true);
    fetchMajors(khoa)
      .then(setMajorOptions)
      .catch(console.error)
      .finally(() => setMajorsLoading(false));
  }, [khoa]);

  const set = (key: keyof TrainingProgramFormDataInput) => (val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.studyProgramCode.trim()) {
      newErrors.studyProgramCode = 'Mã chương trình đào tạo là bắt buộc';
    }
    if (!form.studyProgramName.trim()) {
      newErrors.studyProgramName = 'Tên chương trình đào tạo là bắt buộc';
    }
    if (!form.majorCode) {
      newErrors.majorCode = 'Mã ngành là bắt buộc';
    }
    if (!form.startYear) {
      newErrors.startYear = 'Năm bắt đầu là bắt buộc';
    }
    if (!form.totalCredits) {
      newErrors.totalCredits = 'Tổng số tín chỉ là bắt buộc';
    }
    if (!form.trainingType) {
      newErrors.trainingType = 'Hình thức đào tạo là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    const selectedMajor = majorOptions.find(m => m.value === form.majorCode);
    const majorId = selectedMajor?.id ?? 0;

    const payload: TrainingProgramFormData = {
      studyProgramCode: form.studyProgramCode.trim(),
      studyProgramName: form.studyProgramName.trim(),
      majorId,
      startYear: form.startYear ?? 0,
      totalCredits: form.totalCredits ?? 0,
      trainingType: form.trainingType as TrainingProgramFormData['trainingType'],
    };

    try {
      await createTrainingProgram(payload);
      onSave(payload);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo chương trình đào tạo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page} style={{ position: 'relative' }}>
      <LoadingOverlay visible={majorsLoading} />
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Thêm Chương Trình Đào Tạo Mới</h1>
        <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để khởi tạo chương trình đào tạo trong hệ thống.</p>
      </div>

      <Stack gap={16}>
        {/* Section 1 */}
        <div className={classes.section}>
          <SectionTitle icon={IconCode} number={1} title="Thông tin mã chương trình" />
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="MÃ CHƯƠNG TRÌNH ĐÀO TẠO"
                required
                placeholder="CNTT-2025"
                value={form.studyProgramCode}
                onChange={e => set('studyProgramCode')(e.target.value)}
                error={errors.studyProgramCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="NGÀNH"
                required
                placeholder="Chọn ngành"
                data={majorOptions}
                value={form.majorCode}
                onChange={val => set('majorCode')(val ?? '')}
                error={errors.majorCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                searchable
                loading={majorsLoading}
              />
            </Grid.Col>
          </Grid>
        </div>

        {/* Section 2 */}
        <div className={classes.section}>
          <SectionTitle icon={IconBook} number={2} title="Thông tin chương trình đào tạo" />
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="TÊN CHƯƠNG TRÌNH ĐÀO TẠO"
                required
                placeholder="Công nghệ thông tin"
                value={form.studyProgramName}
                onChange={e => set('studyProgramName')(e.target.value)}
                error={errors.studyProgramName}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="NĂM BẮT ĐẦU"
                required
                placeholder="2025"
                value={form.startYear ?? ''}
                onChange={e => set('startYear')(e.target.value ? parseInt(e.target.value, 10) : null)}
                error={errors.startYear}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="TỔNG SỐ TÍN CHỈ"
                required
                placeholder="120"
                value={form.totalCredits ?? ''}
                onChange={val => set('totalCredits')(typeof val === 'number' ? val : null)}
                error={errors.totalCredits}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                min={1}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="HÌNH THỨC ĐÀO TẠO"
                required
                data={[
                  { value: 'CHINH_QUY', label: 'Chính quy' },
                ]}
                value={form.trainingType}
                onChange={val => set('trainingType')(val ?? 'CHINH_QUY')}
                error={errors.trainingType}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
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
          Thêm chương trình đào tạo
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