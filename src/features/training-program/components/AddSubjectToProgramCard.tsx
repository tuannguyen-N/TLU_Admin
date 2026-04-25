import { useState, useEffect } from 'react';
import { TextInput, Select, Button, Group, Checkbox, Stack, LoadingOverlay, Alert } from '@mantine/core';
import { IconX, IconDeviceFloppy } from '@tabler/icons-react';
import { fetchSubjectsAPI, fetchFacultiesAPI } from '../../subjects/services';
import { fetchSemesters } from '../../semesters/services';
import classes from './AddSubjectToProgramCard.module.css';

interface SubjectOption {
  value: string;
  label: string;
  id: number;
}

interface SemesterOption {
  value: string;
  label: string;
  id: number;
}

interface FacultyOption {
  value: string;
  label: string;
  id: number;
}

interface AddSubjectToProgramCardProps {
  studyProgramId: number;
  onCancel: () => void;
  onSave: () => void;
}

const electiveGroupOptions = [
  { value: '', label: 'Không thuộc nhóm tự chọn' },
  { value: 'GROUP_1', label: 'Nhóm tự chọn 1' },
  { value: 'GROUP_2', label: 'Nhóm tự chọn 2' },
  { value: 'GROUP_3', label: 'Nhóm tự chọn 3' },
];

export function AddSubjectToProgramCard({ studyProgramId, onCancel, onSave }: AddSubjectToProgramCardProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [electiveGroup, setElectiveGroup] = useState<string | null>(null);
  const [isRequired, setIsRequired] = useState(true);

  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<SemesterOption[]>([]);
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);

  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [facultiesLoading, setFacultiesLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    faculty?: string;
    subject?: string;
    semester?: string;
  }>({});

  useEffect(() => {
    setFacultiesLoading(true);
    fetchFacultiesAPI()
      .then(setFacultyOptions)
      .catch(console.error)
      .finally(() => setFacultiesLoading(false));
  }, []);

  useEffect(() => {
    setSemestersLoading(true);
    fetchSemesters({ size: 100 })
      .then(res => {
        setSemesterOptions(
          res.semesters.map(s => ({
            value: String(s.id),
            label: `${s.semesterName} - ${s.academicYears}`,
            id: s.id,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setSemestersLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedFaculty) {
      setSubjectOptions([]);
      return;
    }
    setSubjectsLoading(true);
    const facultyId = facultyOptions.find(f => f.value === selectedFaculty)?.id;
    if (!facultyId) {
      setSubjectsLoading(false);
      return;
    }
    fetchSubjectsAPI({ facultyId, size: 100 })
      .then(res => {
        setSubjectOptions(
          res.subjects.map(s => ({
            value: String(s.id),
            label: `${s.subjectCode} - ${s.subjectName}`,
            id: s.id,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setSubjectsLoading(false));
  }, [selectedFaculty, facultyOptions]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!selectedFaculty) {
      newErrors.faculty = 'Khoa là bắt buộc';
    }
    if (!selectedSubject) {
      newErrors.subject = 'Môn học là bắt buộc';
    }
    if (!selectedSemester) {
      newErrors.semester = 'Học kỳ là bắt buộc';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    setApiError(null);

    try {
      const { addSubjectToProgram } = await import('../services');
      await addSubjectToProgram(studyProgramId, {
        subjectId: parseInt(selectedSubject!, 10),
        semesterId: parseInt(selectedSemester!, 10),
        electiveGroup: electiveGroup || '',
        isRequired: isRequired,
      });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi thêm môn học');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={classes.wrapper} style={{ position: 'relative' }}>
      <LoadingOverlay visible={facultiesLoading || semestersLoading || subjectsLoading} />
      <div className={classes.header}>
        <h3 className={classes.title}>Thêm môn học vào chương trình đào tạo</h3>
        <button type="button" className={classes.closeBtn} onClick={onCancel}>
          <IconX size={18} />
        </button>
      </div>

      <Stack gap={16}>
        <Select
          label="KHOA"
          required
          placeholder="Chọn khoa"
          data={facultyOptions.map(f => ({ value: f.value, label: f.label }))}
          value={selectedFaculty}
          onChange={val => {
            setSelectedFaculty(val);
            setSelectedSubject(null);
            if (val) setErrors(prev => ({ ...prev, faculty: undefined }));
          }}
          error={errors.faculty}
          searchable
          disabled={saving}
        />

        <Select
          label="MÔN HỌC"
          required
          placeholder={selectedFaculty ? "Chọn môn học" : "Chọn khoa trước"}
          data={subjectOptions}
          value={selectedSubject}
          onChange={val => {
            setSelectedSubject(val);
            if (val) setErrors(prev => ({ ...prev, subject: undefined }));
          }}
          error={errors.subject}
          searchable
          disabled={!selectedFaculty || saving}
          loading={subjectsLoading}
          nothingFoundMessage="Không tìm thấy môn học"
        />

        <Select
          label="HỌC KỲ"
          required
          placeholder="Chọn học kỳ"
          data={semesterOptions}
          value={selectedSemester}
          onChange={val => {
            setSelectedSemester(val);
            if (val) setErrors(prev => ({ ...prev, semester: undefined }));
          }}
          error={errors.semester}
          searchable
          disabled={saving}
          loading={semestersLoading}
          nothingFoundMessage="Không tìm thấy học kỳ"
        />

        <Select
          label="NHÓM TỰ CHỌN"
          placeholder="Chọn nhóm tự chọn (không bắt buộc)"
          data={electiveGroupOptions}
          value={electiveGroup}
          onChange={val => setElectiveGroup(val)}
          disabled={saving}
          clearable
        />

        <Checkbox
          label="Môn bắt buộc"
          checked={isRequired}
          onChange={e => setIsRequired(e.currentTarget.checked)}
          disabled={saving}
        />
      </Stack>

      {apiError && (
        <Alert color="red" title="Lỗi" mt="md">
          {apiError}
        </Alert>
      )}

      <Group justify="flex-end" mt="xl">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconX size={16} />}
          onClick={onCancel}
          disabled={saving}
        >
          Huỷ
        </Button>
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSave}
          loading={saving}
          style={{ backgroundColor: '#111827', color: '#fff' }}
        >
          Thêm môn học
        </Button>
      </Group>
    </div>
  );
}