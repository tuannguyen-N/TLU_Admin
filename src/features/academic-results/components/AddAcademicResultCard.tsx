import { useEffect, useState } from 'react';
import { NumberInput, Button, Grid, Alert, Select, Loader, Center } from '@mantine/core';
import { IconAward, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  addAcademicResult,
  fetchSubjectsByFaculty,
  fetchSemesters,
  fetchStudentsByKhoa,
} from '../services';
import { fetchFaculties } from '../../subjects/services';
import type { Subject } from '../../subjects/types';
import type { Semester } from '../../semesters/types';
import type { StudentOption } from '../services';
import classes from './AddAcademicResultCard.module.css';

interface Props {
  onCancel: () => void;
  onSave: () => void;
  khoa: string;
}

interface ValidationErrors {
  studentId?: string;
  subjectId?: string;
  semesterId?: string;
  attendanceScore?: string;
  midtermScore?: string;
  finalScore?: string;
  credits?: string;
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

function computeScore10(attendance: number, midterm: number, final: number): number {
  return attendance * 0.1 + midterm * 0.3 + final * 0.6;
}

function computeScore4(score10: number): number {
  if (score10 >= 8.5) return 4.0;
  if (score10 >= 7.0) return 3.0;
  if (score10 >= 5.5) return 2.0;
  if (score10 >= 4.0) return 1.0;
  return 0.0;
}

function computeLetterGrade(score10: number): string {
  if (score10 >= 8.5) return 'A';
  if (score10 >= 7.0) return 'B';
  if (score10 >= 5.5) return 'C';
  if (score10 >= 4.0) return 'D';
  return 'F';
}

function computeIsPass(score10: number): boolean {
  return score10 >= 4.0;
}

export function AddAcademicResultCard({ onCancel, onSave, khoa }: Props) {
  const [form, setForm] = useState({
    studentId: null as number | null,
    subjectId: null as number | null,
    semesterId: null as number | null,
    credits: 0,
    attendanceScore: 0,
    midtermScore: 0,
    finalScore: 0,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const score10 = computeScore10(form.attendanceScore, form.midtermScore, form.finalScore);
  const score4 = computeScore4(score10);
  const letterGrade = computeLetterGrade(score10);
  const isPass = computeIsPass(score10);

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      setLoadingData(true);
      try {
        const [faculties, sems, studentsByKhoa] = await Promise.all([
          fetchFaculties(),
          fetchSemesters(),
          fetchStudentsByKhoa(khoa),
        ]);

        if (cancelled) return;

        setSemesters(sems);
        setStudents(studentsByKhoa);

        const facultyId = faculties.find((faculty) => faculty.value === khoa)?.id ?? null;
        if (facultyId != null) {
          const subs = await fetchSubjectsByFaculty(facultyId);
          if (!cancelled) setSubjects(subs);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error('[AddAcademicResultCard] load error:', err);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [khoa]);

  const set = (key: keyof typeof form) => (val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubjectChange = (subjectId: string | null) => {
    const id = subjectId ? parseInt(subjectId, 10) : null;
    set('subjectId')(id);

    if (id) {
      const subject = subjects.find((s) => s.id === id);
      if (subject) {
        setForm((prev) => ({ ...prev, subjectId: id, credits: subject.credits }));
      }
    } else {
      setForm((prev) => ({ ...prev, subjectId: null, credits: 0 }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.studentId) {
      newErrors.studentId = 'Sinh viên là bắt buộc';
    }
    if (!form.subjectId) {
      newErrors.subjectId = 'Môn học là bắt buộc';
    }
    if (!form.semesterId) {
      newErrors.semesterId = 'Học kỳ là bắt buộc';
    }
    if (form.credits <= 0) {
      newErrors.credits = 'Số tín chỉ phải lớn hơn 0';
    }
    if (form.attendanceScore < 0 || form.attendanceScore > 10) {
      newErrors.attendanceScore = 'Điểm phải từ 0 đến 10';
    }
    if (form.midtermScore < 0 || form.midtermScore > 10) {
      newErrors.midtermScore = 'Điểm phải từ 0 đến 10';
    }
    if (form.finalScore < 0 || form.finalScore > 10) {
      newErrors.finalScore = 'Điểm phải từ 0 đến 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    const payload = {
      studentId: form.studentId!,
      subjectId: form.subjectId!,
      semesterId: form.semesterId!,
      credits: form.credits,
      attendanceScore: form.attendanceScore,
      midtermScore: form.midtermScore,
      finalScore: form.finalScore,
      score10,
      score4,
      letterGrade,
      isPass,
    };

    try {
      await addAcademicResult(payload);
      notifications.show({
        title: 'Thành công',
        message: 'Thêm kết quả học tập thành công',
        color: 'green',
      });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi thêm kết quả học tập');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Center py={40}>
        <Loader size="md" />
      </Center>
    );
  }

  const semesterOptions = semesters.map((s) => ({
    value: String(s.id),
    label: s.semesterName,
  }));

  const subjectOptions = subjects.map((s) => ({
    value: String(s.id),
    label: `${s.subjectCode} - ${s.subjectName}`,
  }));

  const studentOptions = students.map((student) => ({
    value: String(student.id),
    label: `${student.studentCode} - ${student.fullName}`,
  }));

  return (
    <div className={classes.page}>
      <div className={classes.section}>
        <SectionTitle icon={IconAward} number={1} title="Thông tin sinh viên" />
        <Grid>
          <Grid.Col span={12}>
            <Select
              label="SINH VIÊN"
              required
              placeholder="Chọn sinh viên"
              searchable
              nothingFoundMessage="Không tìm thấy sinh viên"
              data={studentOptions}
              value={form.studentId ? String(form.studentId) : null}
              onChange={(value) => set('studentId')(value ? parseInt(value, 10) : null)}
              error={errors.studentId}
              classNames={{ label: classes.fieldLabel }}
              className={classes.selectInput}
            />
          </Grid.Col>
        </Grid>
      </div>

      <div className={classes.section}>
        <SectionTitle icon={IconAward} number={2} title="Thông tin môn học & Học kỳ" />
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="MÔN HỌC"
              required
              placeholder="Tìm kiếm môn học..."
              searchable
              nothingFoundMessage="Không tìm thấy môn học"
              data={subjectOptions}
              value={form.subjectId ? String(form.subjectId) : null}
              onChange={handleSubjectChange}
              error={errors.subjectId}
              classNames={{ label: classes.fieldLabel }}
              className={classes.selectInput}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="HỌC KỲ"
              required
              placeholder="Chọn học kỳ"
              searchable
              nothingFoundMessage="Không tìm thấy học kỳ"
              data={semesterOptions}
              value={form.semesterId ? String(form.semesterId) : null}
              onChange={(val) => set('semesterId')(val ? parseInt(val, 10) : null)}
              error={errors.semesterId}
              classNames={{ label: classes.fieldLabel }}
              className={classes.selectInput}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="SỐ TÍN CHỈ"
              required
              placeholder="3"
              value={form.credits}
              onChange={(val) => set('credits')(typeof val === 'number' ? val : 0)}
              min={1}
              max={20}
              error={errors.credits}
              classNames={{ label: classes.fieldLabel, input: classes.input }}
            />
          </Grid.Col>
        </Grid>
      </div>

      <div className={classes.section}>
        <SectionTitle icon={IconAward} number={3} title="Điểm số" />
        <Grid>
          <Grid.Col span={4}>
            <NumberInput
              label="ĐIỂM CHUYÊN CẦN (10%)"
              required
              placeholder="0 - 10"
              value={form.attendanceScore}
              onChange={(val) => set('attendanceScore')(typeof val === 'number' ? val : 0)}
              min={0}
              max={10}
              decimalScale={2}
              hideControls
              error={errors.attendanceScore}
              classNames={{ label: classes.fieldLabel, input: classes.input }}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="ĐIỂM GIỮA KỲ (30%)"
              required
              placeholder="0 - 10"
              value={form.midtermScore}
              onChange={(val) => set('midtermScore')(typeof val === 'number' ? val : 0)}
              min={0}
              max={10}
              decimalScale={2}
              hideControls
              error={errors.midtermScore}
              classNames={{ label: classes.fieldLabel, input: classes.input }}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="ĐIỂM CUỐI KỲ (60%)"
              required
              placeholder="0 - 10"
              value={form.finalScore}
              onChange={(val) => set('finalScore')(typeof val === 'number' ? val : 0)}
              min={0}
              max={10}
              decimalScale={2}
              hideControls
              error={errors.finalScore}
              classNames={{ label: classes.fieldLabel, input: classes.input }}
            />
          </Grid.Col>
        </Grid>
      </div>

      <div className={classes.section}>
        <SectionTitle icon={IconAward} number={4} title="Kết quả tính toán" />
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
          Thêm kết quả
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
