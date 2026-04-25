import { useState, useEffect } from 'react';
import { TextInput, NumberInput, Button, Grid, Alert, Select, Loader, Center } from '@mantine/core';
import { IconAward, IconAlertCircle, IconDeviceFloppy, IconX, IconSearch } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { addAcademicResult, fetchSubjectsByFaculty, fetchSemesters, fetchStudentByCode } from '../services';
import { fetchFaculties } from '../../subjects/services';
import type { Subject } from '../../subjects/types';
import type { Semester } from '../../semesters/types';
import classes from './AddAcademicResultCard.module.css';

interface Props {
  onCancel: () => void;
  onSave: () => void;
  khoa: string;
}

interface ValidationErrors {
  studentCode?: string;
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
    studentCode: '',
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
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [foundStudent, setFoundStudent] = useState<{ id: number; studentCode: string; fullName: string } | null>(null);
  const [searchingStudent, setSearchingStudent] = useState(false);

  // Compute derived values
  const score10 = computeScore10(form.attendanceScore, form.midtermScore, form.finalScore);
  const score4 = computeScore4(score10);
  const letterGrade = computeLetterGrade(score10);
  const isPass = computeIsPass(score10);

  // Load facultyId from khoa, then subjects and semesters
  useEffect(() => {
    setLoadingData(true);
    fetchFaculties()
      .then((faculties) => {
        const fac = faculties.find(f => f.value === khoa);
        return fac ? fac.id : null;
      })
      .then((fId) => {
        setFacultyId(fId);
        return fetchSemesters();
      })
      .then((sems) => {
        setSemesters(sems);
        return facultyId != null ? fetchSubjectsByFaculty(facultyId) : [];
      })
      .then((subs) => {
        if (facultyId != null) setSubjects(subs);
      })
      .catch((err) => console.error('[AddAcademicResultCard] load error:', err))
      .finally(() => setLoadingData(false));
  }, [khoa]);

  // Refetch subjects when facultyId is available
  useEffect(() => {
    if (facultyId == null) return;
    fetchSubjectsByFaculty(facultyId)
      .then(setSubjects)
      .catch((err) => console.error('[AddAcademicResultCard] fetch subjects error:', err));
  }, [facultyId]);

  const set = (key: keyof typeof form) => (val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubjectChange = (subjectId: string | null) => {
    const id = subjectId ? parseInt(subjectId) : null;
    set('subjectId')(id);
    if (id) {
      const subject = subjects.find(s => s.id === id);
      if (subject) {
        setForm(prev => ({ ...prev, subjectId: id, credits: subject.credits }));
      }
    } else {
      setForm(prev => ({ ...prev, subjectId: null, credits: 0 }));
    }
  };

  const handleSearchStudent = async () => {
    if (!form.studentCode.trim()) {
      setErrors(prev => ({ ...prev, studentCode: 'Mã sinh viên là bắt buộc' }));
      return;
    }
    setSearchingStudent(true);
    setFoundStudent(null);
    try {
      const student = await fetchStudentByCode(form.studentCode.trim());
      if (student) {
        setFoundStudent(student);
      } else {
        setErrors(prev => ({ ...prev, studentCode: 'Không tìm thấy sinh viên với mã này' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, studentCode: 'Lỗi khi tìm kiếm sinh viên' }));
    } finally {
      setSearchingStudent(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!foundStudent) {
      newErrors.studentCode = 'Vui lòng tìm sinh viên trước';
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
    if (!validate() || !foundStudent) return;

    setLoading(true);
    setApiError(null);

    const payload = {
      studentId: foundStudent.id,
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

  const semesterOptions = semesters.map(s => ({
    value: String(s.id),
    label: s.semesterName,
  }));

  const subjectOptions = subjects.map(s => ({
    value: String(s.id),
    label: `${s.subjectCode} - ${s.subjectName}`,
  }));

  return (
    <div className={classes.page}>
      <div className={classes.section}>
        <SectionTitle icon={IconAward} number={1} title="Thông tin sinh viên" />
        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="MÃ SINH VIÊN"
              required
              placeholder="A45033"
              value={form.studentCode}
              onChange={e => {
                set('studentCode')(e.target.value);
                setFoundStudent(null);
              }}
              error={errors.studentCode}
              classNames={{ label: classes.fieldLabel, input: classes.input }}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Button
              leftSection={searchingStudent ? <Loader size={14} /> : <IconSearch size={16} />}
              onClick={handleSearchStudent}
              mt={28}
              style={{ backgroundColor: '#1a2b5e', color: '#fff', height: 36 }}
            >
              Tìm kiếm
            </Button>
          </Grid.Col>
        </Grid>
        {foundStudent && (
          <div className={classes.studentInfo}>
            <strong>Tìm thấy:</strong> {foundStudent.fullName} ({foundStudent.studentCode})
          </div>
        )}
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
              onChange={val => set('semesterId')(val ? parseInt(val) : null)}
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
              onChange={val => set('credits')(typeof val === 'number' ? val : 0)}
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
              onChange={val => set('attendanceScore')(typeof val === 'number' ? val : 0)}
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
              onChange={val => set('midtermScore')(typeof val === 'number' ? val : 0)}
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
              onChange={val => set('finalScore')(typeof val === 'number' ? val : 0)}
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
          Huỷ
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
