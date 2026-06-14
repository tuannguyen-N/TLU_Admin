import {
    TextInput, Select, Button, Stack, Grid, Alert, LoadingOverlay
} from '@mantine/core';
import {
    IconCalendar, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState } from 'react';
import { notifications as mantineNotifications } from '@mantine/notifications';
import classes from './AddExamCard.module.css';
import type { ExamFormData, ExamType, SemesterOption, SubjectOption } from '../types';
import { createExamAPI } from '../services';

interface ValidationErrors {
    subjectId?: string;
    semesterId?: string;
    examDate?: string;
    startTime?: string;
    endTime?: string;
    examRoom?: string;
    timeRange?: string;
}

interface Props {
    onCancel: () => void;
    onSave: (data: ExamFormData) => Promise<void>;
    semesters: SemesterOption[];
    subjects: SubjectOption[];
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

const examFormatData = [
    { value: 'Offline', label: 'Offline' },
    { value: 'Online', label: 'Online' },
];

const examTypeData = [
    { value: 'FINAL', label: 'Thi cuối kỳ' },
    { value: 'MIDTERM', label: 'Thi giữa kỳ' },
];

const normalizeExamType = (value: string | null | undefined): ExamType => {
    if (value === 'MIDTERM') return 'MIDTERM';
    return 'FINAL';
};

const formatDateToApi = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateInput = (value: string): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeTime = (value: string): string => {
    if (!value) return value;
    return value.length === 5 ? `${value}:00` : value;
};

const toTimeInputValue = (value: string): string => {
    if (!value) return '';
    return value.length >= 5 ? value.slice(0, 5) : value;
};

export function AddExamCard({ onCancel, onSave, semesters, subjects }: Props) {
    const [form, setForm] = useState({
        subjectId: null as number | null,
        semesterId: null as number | null,
        examDate: null as Date | null,
        startTime: '08:00',
        endTime: '10:00',
        examRoom: '',
        examLocation: '',
        examFormat: 'Offline' as 'Online' | 'Offline',
        examType: '',
        note: '',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const set = (key: keyof typeof form) => (val: any) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (key === 'startTime' || key === 'endTime') {
            setErrors(prev => ({ ...prev, timeRange: undefined, [key]: undefined }));
        } else if (errors[key as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!form.subjectId) {
            newErrors.subjectId = 'Môn học là bắt buộc';
        }

        if (!form.semesterId) {
            newErrors.semesterId = 'Học kỳ là bắt buộc';
        }

        if (!form.examDate) {
            newErrors.examDate = 'Ngày thi là bắt buộc';
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const examDay = new Date(form.examDate);
            examDay.setHours(0, 0, 0, 0);
            if (examDay < today) {
                newErrors.examDate = 'Ngày thi không được là ngày trong quá khứ';
            }
        }

        if (!form.startTime.trim()) {
            newErrors.startTime = 'Giờ bắt đầu là bắt buộc';
        }

        if (!form.endTime.trim()) {
            newErrors.endTime = 'Giờ kết thúc là bắt buộc';
        }

        if (form.startTime && form.endTime && form.startTime >= form.endTime) {
            newErrors.timeRange = 'Giờ kết thúc phải sau giờ bắt đầu';
        }

        if (!form.examRoom.trim()) {
            newErrors.examRoom = 'Phòng thi là bắt buộc';
        } else if (!/^[A-Z0-9-]+$/i.test(form.examRoom.trim())) {
            newErrors.examRoom = 'Phòng thi chỉ chứa chữ, số và dấu -';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        setApiError(null);

        const payload: ExamFormData = {
            subjectId: form.subjectId!,
            semesterId: form.semesterId!,
            examDate: formatDateToApi(form.examDate),
            startTime: normalizeTime(form.startTime),
            endTime: normalizeTime(form.endTime),
            examRoom: form.examRoom.trim(),
            examLocation: form.examLocation.trim() || undefined,
            examFormat: form.examFormat,
            examType: normalizeExamType(form.examType),
            note: form.note.trim() || undefined,
        };

        try {
            await onSave(payload);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo lịch thi';
            setApiError(errorMsg);
            mantineNotifications.show({
                title: 'Lỗi',
                message: errorMsg,
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={classes.page} style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} />
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Thêm Lịch Thi Mới</h1>
                <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để khởi tạo lịch thi trong hệ thống.</p>
            </div>

            <Stack gap={16}>
                <div className={classes.section}>
                    <SectionTitle icon={IconCalendar} number={1} title="Thông tin lịch thi" />
                    <Grid>
                        <Grid.Col span={6}>
                            <Select
                                label="MÔN HỌC"
                                required
                                placeholder="Gõ để tìm kiếm môn học"
                                data={subjects.map(s => ({ value: s.id.toString(), label: `${s.label} (${s.value})` }))}
                                value={form.subjectId?.toString() || null}
                                onChange={val => set('subjectId')(val ? parseInt(val) : null)}
                                error={errors.subjectId}
                                searchable
                                clearable
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="HỌC KỲ"
                                required
                                placeholder="Chọn học kỳ"
                                data={semesters.map(s => ({ value: s.id.toString(), label: s.label }))}
                                value={form.semesterId?.toString() || null}
                                onChange={val => set('semesterId')(val ? parseInt(val) : null)}
                                error={errors.semesterId}
                                searchable
                                clearable
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="NGÀY THI"
                                type="date"
                                required
                                value={form.examDate ? formatDateToApi(form.examDate) : ''}
                                onChange={e => set('examDate')(parseDateInput(e.target.value))}
                                error={errors.examDate}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="GIỜ BẮT ĐẦU"
                                type="time"
                                required
                                value={toTimeInputValue(form.startTime)}
                                onChange={e => set('startTime')(e.target.value)}
                                error={errors.startTime}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="GIỜ KẾT THÚC"
                                type="time"
                                required
                                value={toTimeInputValue(form.endTime)}
                                onChange={e => set('endTime')(e.target.value)}
                                error={errors.endTime || errors.timeRange}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="PHÒNG THI"
                                required
                                placeholder="A101"
                                value={form.examRoom}
                                onChange={e => set('examRoom')(e.target.value.toUpperCase())}
                                error={errors.examRoom}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="ĐỊA ĐIỂM"
                                placeholder="Cơ sở 1"
                                value={form.examLocation}
                                onChange={e => set('examLocation')(e.target.value)}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="HÌNH THỨC THI"
                                data={examFormatData}
                                value={form.examFormat}
                                onChange={val => set('examFormat')(val as 'Online' | 'Offline')}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="LOẠI THI"
                                data={examTypeData}
                                value={form.examType}
                                onChange={val => set('examType')(val || '')}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <TextInput
                                label="GHI CHÚ"
                                placeholder="Thi tập trung"
                                value={form.note}
                                onChange={e => set('note')(e.target.value)}
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
                    Thêm lịch thi
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
