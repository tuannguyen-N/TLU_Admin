import { useState } from 'react';
import {
    TextInput, Button, Stack, Grid, Alert, Select, NumberInput, LoadingOverlay
} from '@mantine/core';
import {
    IconX, IconDeviceFloppy, IconClock
} from '@tabler/icons-react';
import classes from '../components/AddCourseClassCard.module.css';
import type { Schedule } from '../types';
import type { UpdateSchedulePayload } from '../services';

interface ValidationErrors {
    dayOfWeek?: string;
    startPeriod?: string;
    endPeriod?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
}

interface Props {
    schedule?: Schedule;
    onCancel: () => void;
    onSave: (data: UpdateSchedulePayload) => void;
    loading?: boolean;
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

const dayOfWeekOptions = [
    { value: '1', label: 'Thứ 2' },
    { value: '2', label: 'Thứ 3' },
    { value: '3', label: 'Thứ 4' },
    { value: '4', label: 'Thứ 5' },
    { value: '5', label: 'Thứ 6' },
    { value: '6', label: 'Thứ 7' },
    { value: '7', label: 'Chủ nhật' },
];

export function ScheduleModal({ schedule, onCancel, onSave, loading }: Props) {
    const [form, setForm] = useState({
        dayOfWeek: schedule?.dayOfWeek ?? 2,
        startPeriod: schedule?.startPeriod ?? 1,
        endPeriod: schedule?.endPeriod ?? 3,
        startTime: schedule?.startTime ?? '07:00:00',
        endTime: schedule?.endTime ?? '09:30:00',
        room: schedule?.room ?? '',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});

    const set = (key: keyof typeof form) => (val: any) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!form.dayOfWeek) {
            newErrors.dayOfWeek = 'Thứ là bắt buộc';
        }
        if (!form.startPeriod) {
            newErrors.startPeriod = 'Tiết bắt đầu là bắt buộc';
        }
        if (!form.endPeriod) {
            newErrors.endPeriod = 'Tiết kết thúc là bắt buộc';
        }
        if (form.startPeriod && form.endPeriod && form.startPeriod > form.endPeriod) {
            newErrors.endPeriod = 'Tiết kết thúc phải lớn hơn tiết bắt đầu';
        }
        if (!form.startTime.trim()) {
            newErrors.startTime = 'Giờ bắt đầu là bắt buộc';
        }
        if (!form.endTime.trim()) {
            newErrors.endTime = 'Giờ kết thúc là bắt buộc';
        }
        if (!form.room.trim()) {
            newErrors.room = 'Phòng học là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        const payload: UpdateSchedulePayload = {
            id: schedule?.id ?? 0,
            dayOfWeek: form.dayOfWeek,
            startPeriod: form.startPeriod,
            endPeriod: form.endPeriod,
            startTime: form.startTime,
            endTime: form.endTime,
            room: form.room.trim(),
        };

        onSave(payload);
    };

    return (
        <div className={classes.page} style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading ?? false} />
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>
                    {schedule ? 'Chỉnh Sửa Lịch Học' : 'Thêm Lịch Học'}
                </h1>
                <p className={classes.pageSubtitle}>
                    {schedule ? 'Cập nhật thông tin lịch học.' : 'Nhập thông tin lịch học mới.'}
                </p>
            </div>

            <Stack gap={16}>
                <div className={classes.section}>
                    <SectionTitle icon={IconClock} number={1} title="Thông tin lịch học" />
                    <Grid>
                        <Grid.Col span={6}>
                            <Select
                                label="THỨ"
                                required
                                placeholder="Chọn thứ"
                                data={dayOfWeekOptions}
                                value={String(form.dayOfWeek)}
                                onChange={val => set('dayOfWeek')(val ? parseInt(val, 10) : null)}
                                error={errors.dayOfWeek}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="PHÒNG HỌC"
                                required
                                placeholder="A102"
                                value={form.room}
                                onChange={e => set('room')(e.target.value)}
                                error={errors.room}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="TIẾT BẮT ĐẦU"
                                required
                                placeholder="1"
                                value={form.startPeriod}
                                onChange={val => set('startPeriod')(typeof val === 'number' ? val : null)}
                                error={errors.startPeriod}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                min={1}
                                max={15}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="TIẾT KẾT THÚC"
                                required
                                placeholder="3"
                                value={form.endPeriod}
                                onChange={val => set('endPeriod')(typeof val === 'number' ? val : null)}
                                error={errors.endPeriod}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                min={1}
                                max={15}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <TextInput
                                label="GIỜ BẮT ĐẦU"
                                required
                                placeholder="07:00:00"
                                value={form.startTime}
                                onChange={e => set('startTime')(e.target.value)}
                                error={errors.startTime}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <TextInput
                                label="GIỜ KẾT THÚC"
                                required
                                placeholder="09:30:00"
                                value={form.endTime}
                                onChange={e => set('endTime')(e.target.value)}
                                error={errors.endTime}
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
                    {schedule ? 'Lưu thay đổi' : 'Thêm lịch học'}
                </Button>
            </div>
        </div>
    );
}