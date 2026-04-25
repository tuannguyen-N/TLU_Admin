import { useState } from 'react';
import {
    TextInput, Button, Stack, Grid, Alert, NumberInput, Select
} from '@mantine/core';
import {
    IconCode, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import classes from './AddCourseClassCard.module.css';
import type { CourseClassFormData } from '../types';
import type { DepartmentOption } from '../../subjects/types';
import type { FacultyOption, Subject } from '../../subjects/types';
import type { Lecturer } from '../../lecturers/types';

interface ValidationErrors {
    classCode?: string;
    className?: string;
    capacity?: string;
    lecturerCode?: string;
    subjectCode?: string;
    semesterCode?: string;
}

interface Props {
    onCancel: () => void;
    onSave: (data: CourseClassFormData) => void;
    lecturers: Lecturer[];
    departments: DepartmentOption[];
    faculties: FacultyOption[];
    selectedFaculty: string;
    subjects: Subject[];
}

export interface CourseClassFormDataInput {
    classCode: string;
    className: string;
    capacity: number | null;
    lecturerCode: string;
    subjectCode: string;
    semesterCode: string;
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

export function AddCourseClassCard({ onCancel, onSave, lecturers, departments, faculties, selectedFaculty, subjects }: Props) {
    const [form, setForm] = useState<CourseClassFormDataInput>({
        classCode: '',
        className: '',
        capacity: null,
        lecturerCode: '',
        subjectCode: '',
        semesterCode: '',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const set = (key: keyof CourseClassFormDataInput) => (val: any) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!form.classCode.trim()) {
            newErrors.classCode = 'Mã lớp là bắt buộc';
        }
        if (!form.className.trim()) {
            newErrors.className = 'Tên lớp là bắt buộc';
        }
        if (!form.capacity) {
            newErrors.capacity = 'Số lượng là bắt buộc';
        }
        if (!form.lecturerCode.trim()) {
            newErrors.lecturerCode = 'Mã giáo viên là bắt buộc';
        }
        if (!form.subjectCode.trim()) {
            newErrors.subjectCode = 'Mã môn là bắt buộc';
        }
        if (!form.semesterCode.trim()) {
            newErrors.semesterCode = 'Mã học kỳ là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        setApiError(null);

        const payload: CourseClassFormData = {
            classCode: form.classCode.trim(),
            className: form.className.trim(),
            capacity: form.capacity ?? 0,
            lecturerCode: form.lecturerCode.trim(),
            subjectCode: form.subjectCode.trim(),
            semesterCode: form.semesterCode.trim(),
        };

        try {
            onSave(payload);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo lớp học phần');
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
        value: l.lecturerCode,
        label: `${l.lecturerCode} - ${l.fullName}`,
    }));

    const selectedFacultyId = selectedFacultyObj?.id;
    const filteredSubjects = selectedFacultyId
        ? subjects.filter(s => s.facultyId === selectedFacultyId)
        : subjects;

    const subjectSelectData = filteredSubjects.map(s => ({
        value: s.subjectCode,
        label: `${s.subjectCode} - ${s.subjectName}`,
    }));

    return (
        <div className={classes.page}>
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Thêm Lớp Học Phần Mới</h1>
                <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để khởi tạo lớp học phần trong hệ thống.</p>
            </div>

            <Stack gap={16}>
                {/* Section 1 */}
                <div className={classes.section}>
                    <SectionTitle icon={IconCode} number={1} title="Thông tin lớp học phần" />
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="MÃ LỚP"
                                required
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
                                required
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
                                required
                                placeholder="50"
                                value={form.capacity ?? ''}
                                onChange={val => set('capacity')(typeof val === 'number' ? val : null)}
                                error={errors.capacity}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                min={1}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="GIẢNG VIÊN"
                                required
                                placeholder="Chọn giảng viên"
                                data={lecturerSelectData}
                                value={form.lecturerCode}
                                onChange={val => set('lecturerCode')(val ?? '')}
                                error={errors.lecturerCode}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                searchable
                                clearable
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="MÃ HỌC KỲ"
                                required
                                placeholder="HK1-2025"
                                value={form.semesterCode}
                                onChange={e => set('semesterCode')(e.target.value)}
                                error={errors.semesterCode}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="MÔN HỌC"
                                required
                                placeholder="Chọn môn học"
                                data={subjectSelectData}
                                value={form.subjectCode}
                                onChange={val => set('subjectCode')(val ?? '')}
                                error={errors.subjectCode}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                searchable
                                clearable
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
                    Thêm lớp học phần
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
