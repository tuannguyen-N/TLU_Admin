import {
    TextInput, Select, Button, Stack, Grid, Alert, LoadingOverlay
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import {
    IconCalendar, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState } from 'react';
import { notifications as mantineNotifications } from '@mantine/notifications';
import classes from './EditExamCard.module.css';
import type { ExamFormData, Exam, SemesterOption, SubjectOption } from '../types';
import { updateExamAPI } from '../services';

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
    exam: Exam;
    currentSemesterId: string;
    onCancel: () => void;
    onSave: () => void;
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
    { value: 'Final', label: 'Final' },
    { value: 'Midterm', label: 'Midterm' },
    { value: 'Quiz', label: 'Quiz' },
    { value: 'Practical', label: 'Practical' },
];

const formatDateToApi = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateFromString = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export function EditExamCard({ exam, currentSemesterId, onCancel, onSave, semesters, subjects }: Props) {
    const [form, setForm] = useState({
        subjectId: exam.subjectCode ? subjects.find(s => s.value === exam.subjectCode)?.id || null : null,
        semesterId: currentSemesterId ? parseInt(currentSemesterId) : null,
        examDate: parseDateFromString(exam.examDate),
        startTime: exam.startTime,
        endTime: exam.endTime,
        examRoom: exam.examRoom,
        examLocation: exam.examLocation || '',
        examFormat: exam.examFormat as 'Online' | 'Offline',
        examType: exam.examType || 'Final',
        note: exam.note || '',
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

        const payload: Partial<ExamFormData> = {
            subjectId: form.subjectId!,
            semesterId: form.semesterId!,
            examDate: formatDateToApi(form.examDate),
            startTime: form.startTime,
            endTime: form.endTime,
            examRoom: form.examRoom.trim(),
            examLocation: form.examLocation.trim() || undefined,
            examFormat: form.examFormat,
            examType: form.examType || undefined,
            note: form.note.trim() || undefined,
        };

        try {
            await updateExamAPI(exam.id, payload);
            mantineNotifications.show({
                title: 'Thành công',
                message: 'Cập nhật lịch thi thành công',
                color: 'green',
            });
            onSave();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật lịch thi';
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
                <h1 className={classes.pageTitle}>Sửa Lịch Thi</h1>
                <p className={classes.pageSubtitle}>Cập nhật thông tin lịch thi trong hệ thống.</p>
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
                            <DateInput
                                label="NGÀY THI"
                                required
                                placeholder="Chọn ngày"
                                value={form.examDate}
                                onChange={val => set('examDate')(val)}
                                error={errors.examDate}
                                classNames={{ label: classes.fieldLabel, input: classes.dateInput }}
                                valueFormat="YYYY-MM-DD"
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TimeInput
                                label="GIỜ BẮT ĐẦU"
                                required
                                value={form.startTime}
                                onChange={e => set('startTime')(e.target.value)}
                                error={errors.startTime}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TimeInput
                                label="GIỜ KẾT THÚC"
                                required
                                value={form.endTime}
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
                                onChange={val => set('examType')(val || 'Final')}
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
