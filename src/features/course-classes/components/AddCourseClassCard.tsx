import { useState, useEffect } from 'react';
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
    lecturerId?: string;
    subjectId?: string;
    semesterId?: string;
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
    lecturerId: string;
    subjectId: string;
    semesterId: string;
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
        lecturerId: '',
        subjectId: '',
        semesterId: '',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [semesters, setSemesters] = useState<{ id: number; semesterName: string; semesterCode: string }[]>([]);

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
        if (!form.lecturerId.trim()) {
            newErrors.lecturerId = 'Giảng viên là bắt buộc';
        }
        if (!form.subjectId.trim()) {
            newErrors.subjectId = 'Môn học là bắt buộc';
        }
        if (!form.semesterId.trim()) {
            newErrors.semesterId = 'Học kỳ là bắt buộc';
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
            lecturerId: parseInt(form.lecturerId) || 0,
            subjectId: parseInt(form.subjectId) || 0,
            semesterId: parseInt(form.semesterId) || 0,
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
        value: String(l.id),
        label: `${l.lecturerCode} - ${l.fullName}`,
    }));

    const selectedFacultyId = selectedFacultyObj?.id;
    const filteredSubjects = selectedFacultyId
        ? subjects.filter(s => s.facultyId === selectedFacultyId)
        : subjects;

    const subjectSelectData = filteredSubjects.map(s => ({
        value: String(s.id),
        label: `${s.subjectCode} - ${s.subjectName}`,
    }));

    useEffect(() => {
        // load semesters for selection
        const load = async () => {
            try {
                const mod = await import('../../semesters/services');
                const res = await mod.fetchSemesters({ page: 0, size: 100 });
                setSemesters(res.semesters || []);
            } catch (e) {
                // ignore
            }
        };
        load();
    }, []);

    const semesterSelectData = semesters.map(s => ({ value: String(s.id), label: `${s.semesterCode} - ${s.semesterName}` }));

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
                                label="HỌC KỲ"
                                required
                                placeholder="Chọn học kỳ"
                                data={semesterSelectData}
                                value={form.semesterId}
                                onChange={val => set('semesterId')(val ?? '')}
                                error={errors.semesterId}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                searchable
                                clearable
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="MÔN HỌC"
                                required
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
