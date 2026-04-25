import { useState } from 'react';
import { NumberInput, Button, Grid, Alert } from '@mantine/core';
import { IconX, IconDeviceFloppy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { calculateLetterGrade, calculateScore4, fetchSemesters } from '../services';
import type { SubjectResult } from '../types';
import classes from './EditAcademicResultCard.module.css';

interface Props {
  subjectResult: SubjectResult;
  semesterName: string;
  onCancel: () => void;
  onSave: () => void;
}

export function EditAcademicResultCard({ subjectResult, semesterName, onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    attendanceScore: subjectResult.attendanceScore,
    midtermScore: subjectResult.midtermScore,
    finalScore: subjectResult.finalScore,
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const score10 = form.attendanceScore * 0.1 + form.midtermScore * 0.3 + form.finalScore * 0.6;
  const score4 = calculateScore4(score10);
  const { letterGrade, isPass } = calculateLetterGrade(score10);

  const getSemesterId = async (): Promise<number | null> => {
    try {
      const semesters = await fetchSemesters();
      const matched = semesters.find(s => s.semesterName === semesterName);
      return matched?.id ?? null;
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const semesterId = await getSemesterId();
      if (!semesterId) {
        setApiError('Không tìm thấy học kỳ');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN || ''}/api/v1/admin/academic-results/update/${subjectResult.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGVzIjpudWxsLCJzaWduIjpudWxsLCJpYXQiOjE3NzU3OTMxNTc1NzksImV4cCI6MTc3NTc5Njc1NzU3OX0.OcuqDvFuHymaB9AB9bHgaAGY04DlYL6pUjKqJWMb328`,
          },
          body: JSON.stringify({
            semesterId: semesterId,
            attendanceScore: form.attendanceScore,
            midtermScore: form.midtermScore,
            finalScore: form.finalScore,
            score10: Math.round(score10 * 100) / 100,
            score4: Math.round(score4 * 100) / 100,
            letterGrade,
            isPass,
          }),
        }
      );

      const json = await response.json();
      if (response.ok && json.code === 0) {
        notifications.show({
          title: 'Thành công',
          message: 'Cập nhật điểm thành công',
          color: 'green',
        });
        onSave();
      } else {
        setApiError(json.message || 'Cập nhật điểm thất bại');
      }
    } catch (err) {
      setApiError('Đã xảy ra lỗi khi cập nhật điểm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.headerInfo}>
        <h3 className={classes.headerTitle}>{subjectResult.subjectName}</h3>
        <p className={classes.headerSubtitle}>
          Mã môn: {subjectResult.subjectCode} | Số tín chỉ: {subjectResult.credits}
        </p>
      </div>

      <div className={classes.section}>
        <Grid>
          <Grid.Col span={4}>
            <NumberInput
              label="ĐIỂM CHUYÊN CẦN (10%)"
              placeholder="0 - 10"
              value={form.attendanceScore}
              onChange={(val) => setForm(prev => ({ ...prev, attendanceScore: typeof val === 'number' ? val : 0 }))}
              min={0}
              max={10}
              decimalScale={2}
              hideControls
              classNames={{ label: classes.fieldLabel, input: classes.input }}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="ĐIỂM GIỮA KỲ (30%)"
              placeholder="0 - 10"
              value={form.midtermScore}
              onChange={(val) => setForm(prev => ({ ...prev, midtermScore: typeof val === 'number' ? val : 0 }))}
              min={0}
              max={10}
              decimalScale={2}
              hideControls
              classNames={{ label: classes.fieldLabel, input: classes.input }}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="ĐIỂM CUỐI KỲ (60%)"
              placeholder="0 - 10"
              value={form.finalScore}
              onChange={(val) => setForm(prev => ({ ...prev, finalScore: typeof val === 'number' ? val : 0 }))}
              min={0}
              max={10}
              decimalScale={2}
              hideControls
              classNames={{ label: classes.fieldLabel, input: classes.input }}
            />
          </Grid.Col>
        </Grid>
      </div>

      <div className={classes.section}>
        <Grid>
          <Grid.Col span={3}>
            <div className={classes.resultCard}>
              <div className={classes.resultLabel}>Thang 10</div>
              <div className={classes.resultValue}>{score10.toFixed(2)}</div>
            </div>
          </Grid.Col>
          <Grid.Col span={3}>
            <div className={classes.resultCard}>
              <div className={classes.resultLabel}>Thang 4</div>
              <div className={classes.resultValue}>{score4.toFixed(2)}</div>
            </div>
          </Grid.Col>
          <Grid.Col span={3}>
            <div className={classes.resultCard}>
              <div className={classes.resultLabel}>Điểm chữ</div>
              <div className={classes.resultValue}>{letterGrade}</div>
            </div>
          </Grid.Col>
          <Grid.Col span={3}>
            <div className={classes.resultCard}>
              <div className={classes.resultLabel}>Trạng thái</div>
              <div className={`${classes.resultValue} ${isPass ? classes.passText : classes.failText}`}>
                {isPass ? 'Đạt' : 'Rớt'}
              </div>
            </div>
          </Grid.Col>
        </Grid>
      </div>

      <div className={classes.footer}>
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconX size={16} />}
          onClick={onCancel}
          className={classes.cancelBtn}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSave}
          className={classes.saveBtn}
          loading={loading}
        >
          Lưu
        </Button>
      </div>

      {apiError && (
        <Alert color="red" title="Lỗi">
          {apiError}
        </Alert>
      )}
    </div>
  );
}