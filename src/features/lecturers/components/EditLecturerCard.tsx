import { useState } from 'react';
import {
    TextInput, Button, Stack, Grid, Alert, Select, LoadingOverlay
} from '@mantine/core';
import {
    IconUser, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import classes from './AddLecturerCard.module.css';
import type { Lecturer, LecturerFormData, DepartmentOption } from '../types';
import type { FacultyOption } from '../../subjects/types';
import { updateLecturerAPI } from '../services';

interface ValidationErrors {
    lecturerCode?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    departmentId?: string;
}

interface Props {
    lecturer: Lecturer;
    onCancel: () => void;
    onSave: () => void;
    departments: DepartmentOption[];
    faculties: FacultyOption[];
    selectedFaculty: string;
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

export function EditLecturerCard({ lecturer, onCancel, onSave, departments, faculties, selectedFaculty }: Props) {
    const [form, setForm] = useState({
        lecturerCode: lecturer.lecturerCode,
        fullName: lecturer.fullName,
        email: lecturer.email,
        phoneNumber: lecturer.phoneNumber,
        departmentId: departments.find(d => d.label === lecturer.departmentName)?.id,
    });
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^0[0-9]{9}$/;

        if (!form.lecturerCode.trim()) {
            newErrors.lecturerCode = 'Mã giảng viên là bắt buộc';
        }
        if (!form.fullName.trim()) {
            newErrors.fullName = 'Họ tên là bắt buộc';
        }
        if (!form.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!emailRegex.test(form.email.trim())) {
            newErrors.email = 'Email không đúng định dạng';
        }
        if (!form.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
        } else if (!phoneRegex.test(form.phoneNumber.trim())) {
            newErrors.phoneNumber = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0';
        }
        if (!form.departmentId) {
            newErrors.departmentId = 'Bộ môn là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        setApiError(null);

        const payload: LecturerFormData = {
            lecturerCode: form.lecturerCode.trim(),
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phoneNumber: form.phoneNumber.trim(),
            departmentId: form.departmentId,
        };

        try {
            await updateLecturerAPI(lecturer.id, payload);
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật giảng viên thành công',
                color: 'green',
            });
            onSave();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật giảng viên';
            setApiError(errorMessage);
            notifications.show({
                title: 'Lỗi',
                message: errorMessage,
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const departmentSelectData = departments.map(d => ({
        value: String(d.id),
        label: `${d.label} (${d.facultyCode})`,
    }));

    return (
        <div className={classes.page} style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} />
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Chỉnh Sửa Giảng Viên</h1>
                <p className={classes.pageSubtitle}>Cập nhật thông tin giảng viên trong hệ thống.</p>
            </div>

            <Stack gap={16}>
                <div className={classes.section}>
                    <SectionTitle icon={IconUser} number={1} title="Thông tin giảng viên" />
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="MÃ GIẢNG VIÊN"
                                required
                                placeholder="GV001"
                                value={form.lecturerCode}
                                onChange={e => set('lecturerCode')(e.target.value)}
                                error={errors.lecturerCode}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="HỌ TÊN"
                                required
                                placeholder="Nguyễn Văn A"
                                value={form.fullName}
                                onChange={e => set('fullName')(e.target.value)}
                                error={errors.fullName}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="EMAIL"
                                required
                                placeholder="gv@university.edu.vn"
                                value={form.email}
                                onChange={e => set('email')(e.target.value)}
                                error={errors.email}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="SỐ ĐIỆN THOẠI"
                                required
                                placeholder="0901234567"
                                value={form.phoneNumber}
                                onChange={e => set('phoneNumber')(e.target.value)}
                                error={errors.phoneNumber}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="BỘ MÔN"
                                required
                                placeholder="Chọn bộ môn"
                                data={departmentSelectData}
                                value={String(form.departmentId)}
                                onChange={val => set('departmentId')(val ? parseInt(val, 10) : null)}
                                error={errors.departmentId}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                searchable
                                nothingFoundMessage="Không tìm thấy bộ môn"
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