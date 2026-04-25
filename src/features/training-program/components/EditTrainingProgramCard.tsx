import {
  TextInput, Select, Button, Stack, Grid, Alert, NumberInput
} from '@mantine/core';
import {
  IconCode, IconBook, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import classes from './AddTrainingProgramCard.module.css';
import { fetchMajors, updateTrainingProgram, type MajorOption } from '../services';
import type { TrainingProgram, TrainingProgramFormData } from '../types';

interface ValidationErrors {
  studyProgramCode?: string;
  studyProgramName?: string;
  majorCode?: string;
  startYear?: string;
  totalCredits?: string;
  trainingType?: string;
}

interface Props {
  khoa: string;
  program: TrainingProgram;
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

export function EditTrainingProgramCard({ khoa, program, onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    studyProgramCode: program.studyProgramCode || '',
    studyProgramName: program.studyProgramName || '',
    majorCode: program.majorCode || '',
    startYear: program.startYear || null as number | null,
    totalCredits: program.totalCredits || null as number | null,
    trainingType: program.trainingType || 'CHINH_QUY',
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

  const set = (key: keyof typeof form) => (val: any) => {
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

    const payload: Partial<TrainingProgramFormData> = {};

    if (form.studyProgramCode.trim() !== (program.studyProgramCode || '')) {
      payload.studyProgramCode = form.studyProgramCode.trim();
    }
    if (form.studyProgramName.trim() !== (program.studyProgramName || '')) {
      payload.studyProgramName = form.studyProgramName.trim();
    }
    if (form.majorCode !== program.majorCode) {
      payload.majorId = majorId;
    }
    if (form.startYear !== null && form.startYear !== program.startYear) {
      payload.startYear = form.startYear;
    }
    if (form.totalCredits !== null && form.totalCredits !== program.totalCredits) {
      payload.totalCredits = form.totalCredits;
    }
    if (form.trainingType !== (program.trainingType || '')) {
      payload.trainingType = form.trainingType as TrainingProgramFormData['trainingType'];
    }

    try {
      await updateTrainingProgram(program.id, payload);
      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật chương trình đào tạo thành công',
        color: 'green',
      });
      onSave();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: 'Cập nhật chương trình đào tạo thất bại',
        color: 'red',
      });
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật chương trình đào tạo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Sửa Chương Trình Đào Tạo</h1>
        <p className={classes.pageSubtitle}>Cập nhật thông tin chương trình đào tạo trong hệ thống.</p>
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
                label="MÃ NGÀNH"
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
          Xác nhận
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
