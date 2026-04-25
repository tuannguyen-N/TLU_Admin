import {
    TextInput, Select, Button, Stack, Grid, Alert, LoadingOverlay
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
    IconCalendar, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { notifications as mantineNotifications } from '@mantine/notifications';
import classes from './AddSemesterCard.module.css';
import type { SemesterFormData } from '../types';
import { createSemester } from '../services';

interface ValidationErrors {
    semesterCode?: string;
    semesterName?: string;
    academicYears?: string;
    startDate?: string;
}

interface Props {
    onCancel: () => void;
    onSave: (data: SemesterFormData) => void;
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

const semesterNumberData = [
    { value: '1', label: 'Kỳ 1' },
    { value: '2', label: 'Kỳ 2' },
    { value: '3', label: 'Học kỳ phụ' },
];

const generateAcademicYears = (): { value: string; label: string }[] => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 5; i++) {
        years.push({
            value: `${i}-${i + 1}`,
            label: `${i}-${i + 1}`,
        });
    }
    return years;
};

const academicYearData = generateAcademicYears();

const formatDateToApi = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const addWeeks = (date: Date, weeks: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
};

export function AddSemesterCard({ onCancel, onSave }: Props) {
    const [form, setForm] = useState({
        semesterCode: '',
        semesterName: '',
        academicYears: '',
        semesterNumber: '1' as '1' | '2' | '3',
        startDate: null as Date | null,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const endDate = useMemo(() => {
        if (!form.startDate) return null;
        return addWeeks(form.startDate, 15);
    }, [form.startDate]);

    const set = (key: keyof typeof form) => (val: any) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!form.semesterCode.trim()) {
            newErrors.semesterCode = 'Mã học kỳ là bắt buộc';
        } else if (!/^[A-Z0-9_]+$/.test(form.semesterCode.trim())) {
            newErrors.semesterCode = 'Mã học kỳ chỉ chứa chữ hoa, số và dấu _';
        }

        if (!form.semesterName.trim()) {
            newErrors.semesterName = 'Tên học kỳ là bắt buộc';
        }

        if (!form.academicYears.trim()) {
            newErrors.academicYears = 'Năm học là bắt buộc';
        }

        if (!form.startDate) {
            newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        setApiError(null);

        const payload: SemesterFormData = {
            semesterCode: form.semesterCode.trim(),
            semesterName: form.semesterName.trim(),
            academicYears: form.academicYears.trim(),
            semesterNumber: parseInt(form.semesterNumber) as 1 | 2 | 3,
            startDate: formatDateToApi(form.startDate) || '',
            endDate: formatDateToApi(endDate) || '',
            isActive: true,
        };

        try {
            await createSemester(payload);
            mantineNotifications.show({
                title: 'Thành công',
                message: 'Tạo học kỳ thành công',
                color: 'green',
            });
            onSave(payload);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo học kỳ');
            mantineNotifications.show({
                title: 'Lỗi',
                message: 'Tạo học kỳ thất bại',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDisplayDate = (date: Date | null): string => {
        if (!date) return '-';
        return formatDateToApi(date);
    };

    return (
        <div className={classes.page} style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} />
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Thêm Học Kỳ Mới</h1>
                <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để khởi tạo học kỳ trong hệ thống.</p>
            </div>

            <Stack gap={16}>
                <div className={classes.section}>
                    <SectionTitle icon={IconCalendar} number={1} title="Thông tin học kỳ" />
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="MÃ HỌC KỲ"
                                required
                                placeholder="HK1_2025"
                                value={form.semesterCode}
                                onChange={e => set('semesterCode')(e.target.value.toUpperCase())}
                                error={errors.semesterCode}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="TÊN HỌC KỲ"
                                required
                                placeholder="HK1 2025-2026"
                                value={form.semesterName}
                                onChange={e => set('semesterName')(e.target.value)}
                                error={errors.semesterName}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="NĂM HỌC"
                                required
                                placeholder="Chọn năm học"
                                data={academicYearData}
                                value={form.academicYears}
                                onChange={val => set('academicYears')(val || '')}
                                error={errors.academicYears}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="HỌC KỲ"
                                required
                                data={semesterNumberData}
                                value={form.semesterNumber}
                                onChange={val => set('semesterNumber')(val as '1' | '2' | '3')}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateInput
                                label="NGÀY BẮT ĐẦU"
                                required
                                placeholder="Chọn ngày"
                                value={form.startDate}
                                onChange={val => set('startDate')(val)}
                                error={errors.startDate}
                                classNames={{ label: classes.fieldLabel, input: classes.dateInput }}
                                valueFormat="YYYY-MM-DD"
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="NGÀY KẾT THÚC"
                                value={formatDisplayDate(endDate)}
                                disabled
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
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
                    Thêm học kỳ
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