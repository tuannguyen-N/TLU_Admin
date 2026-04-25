import { useState, useEffect } from 'react';
import {
    TextInput, Button, Stack, Grid, Alert, NumberInput, Select, LoadingOverlay
} from '@mantine/core';
import {
    IconCode, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import type { Lecturer } from '../../lecturers/types';
import classes from './AddCourseClassCard.module.css';
import type { CourseClassDetail } from '../types';
import type { DepartmentOption, FacultyOption, Subject } from '../../subjects/types';

interface ValidationErrors {
    classCode?: string;
    className?: string;
    capacity?: string;
    lecturerId?: string;
    subjectId?: string;
    semesterId?: string;
}

interface Props {
    courseClass: CourseClassDetail;
    onCancel: () => void;
    onSave: (data: UpdateCourseClassPayload) => void;
    lecturers: Lecturer[];
    departments: DepartmentOption[];
    faculties: FacultyOption[];
    selectedFaculty: string;
    subjects: Subject[];
}

export interface UpdateCourseClassPayload {
    classCode?: string;
    className?: string;
    capacity?: number;
    lecturerId?: number;
    subjectId?: number;
    semesterId?: number;
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

export function EditCourseClassCard({
    courseClass,
    onCancel,
    onSave,
    lecturers,
    departments,
    faculties,
    selectedFaculty,
    subjects,
}: Props) {
    const [form, setForm] = useState({
        classCode: courseClass.classCode,
        className: courseClass.className,
        capacity: courseClass.capacity,
        lecturerId: '',
        subjectId: '',
        semesterId: String(courseClass.semester?.id ?? ''),
    });

    useEffect(() => {
        const matchedLecturer = lecturers.find(l => l.lecturerCode === courseClass.lecturerCode);
        const matchedSubject = subjects.find(s => s.subjectCode === courseClass.subjectCode);
        setForm(prev => ({
            ...prev,
            lecturerId: matchedLecturer ? String(matchedLecturer.id) : '',
            subjectId: matchedSubject ? String(matchedSubject.id) : '',
        }));
    }, [lecturers, subjects, courseClass.lecturerCode, courseClass.subjectCode]);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const set = (key: keyof typeof form) => (val: any) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!form.classCode.trim()) {
            newErrors.classCode = 'Mã lớp không được để trống';
        }
        if (form.className.trim() && form.className.trim().length < 5) {
            newErrors.className = 'Tên lớp phải có ít nhất 5 ký tự';
        }
        if (form.capacity && (form.capacity < 1 || form.capacity > 300)) {
            newErrors.capacity = 'Số lượng phải từ 1 đến 300';
        }
        if (form.lecturerId && Number(form.lecturerId) < 0) {
            newErrors.lecturerId = 'Mã giảng viên không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        setApiError(null);

        const payload: UpdateCourseClassPayload = {};
        if (form.classCode.trim()) payload.classCode = form.classCode.trim();
        if (form.className.trim()) payload.className = form.className.trim();
        if (form.capacity) payload.capacity = form.capacity;
        if (form.lecturerId) payload.lecturerId = parseInt(form.lecturerId) || undefined;
        if (form.subjectId) payload.subjectId = parseInt(form.subjectId) || undefined;
        if (form.semesterId) payload.semesterId = parseInt(form.semesterId) || undefined;

        try {
            onSave(payload);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật lớp học phần');
        } finally {
            setLoading(false);
        }
    };

    const selectedFacultyObj = faculties.find(f => f.value === selectedFaculty);
    const filteredDepartmentCodes = selectedFacultyObj
        ? departments.filter(d => d.facultyCode === selectedFaculty).map(d => d.label)
        : departments.map(d => d.label);
    const filteredLecturers = selectedFacultyObj
        ? lecturers.filter(l => filteredDepartmentCodes.includes(l.departmentName))
        : lecturers;

    const lecturerSelectData = filteredLecturers.map(l => ({
        value: String(l.id),
        label: `${l.lecturerCode} - ${l.fullName}`,
    }));

    const subjectSelectData = subjects.map(s => ({
        value: String(s.id),
        label: `${s.subjectCode} - ${s.subjectName}`,
    }));

    return (
        <div className={classes.page} style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} />
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Sửa Lớp Học Phần</h1>
                <p className={classes.pageSubtitle}>Cập nhật thông tin lớp học phần trong hệ thống.</p>
            </div>

            <Stack gap={16}>
                <div className={classes.section}>
                    <SectionTitle icon={IconCode} number={1} title="Thông tin lớp học phần" />
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="MÃ LỚP"
                                placeholder="INT1001-01"
                                value={form.classCode}
                                onChange={e => set('classCode')(e.target.value)}
                                error={errors.classCode}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="TÊN LỚP"
                                placeholder="Nhập môn lập trình - Lớp 1"
                                value={form.className}
                                onChange={e => set('className')(e.target.value)}
                                error={errors.className}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="SỐ LƯỢNG"
                                placeholder="50"
                                value={form.capacity ?? ''}
                                onChange={val => set('capacity')(typeof val === 'number' ? val : null)}
                                error={errors.capacity}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                min={1}
                                max={300}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="GIẢNG VIÊN"
                                placeholder="Chọn giảng viên"
                                data={lecturerSelectData}
                                value={form.lecturerId}
                                onChange={val => set('lecturerId')(val ?? '')}
                                error={errors.lecturerId}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                searchable
                                clearable
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="MÔN HỌC"
                                placeholder="Chọn môn học"
                                data={subjectSelectData}
                                value={form.subjectId}
                                onChange={val => set('subjectId')(val ?? '')}
                                error={errors.subjectId}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                searchable
                                clearable
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
                <Alert color="red" title="Lỗi" mt="md">
                    {apiError}
                </Alert>
            )}
        </div>
    );
}