import {
    Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal, Select, Badge
} from '@mantine/core';
import {
    IconPlus, IconPencil, IconTrash, IconRefresh, IconSchool
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { Lecturer } from '../types';
import type { FacultyOption } from '../../subjects/types';
import classes from './LecturerList.module.css';

interface Props {
    lecturers: Lecturer[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
    onReload: () => void;
    onAddLecturer: () => void;
    onEditLecturer: (lecturer: Lecturer) => void;
    onDeleteConfirm: (id: number) => void;
    onViewAdvisor: (lecturer: Lecturer) => void;
    selectedFaculty: string;
    onFacultyChange: (f: string) => void;
    faculties: FacultyOption[];
}

export function LecturerList({
    lecturers, loading, error,
    page, totalPages,
    onPage, onReload, onAddLecturer, onEditLecturer,
    onDeleteConfirm, onViewAdvisor, selectedFaculty, onFacultyChange, faculties,
}: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingLecturer, setDeletingLecturer] = useState<Lecturer | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleRefresh = () => {
        onReload();
    };

    const handleDeleteClick = (lecturer: Lecturer) => {
        setDeletingLecturer(lecturer);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingLecturer) return;
        setDeleting(true);
        try {
            await onDeleteConfirm(deletingLecturer.id);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa giảng viên thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Xóa giảng viên thất bại',
                color: 'red',
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Select
                        placeholder="Chọn khoa"
                        data={faculties.map(f => ({ value: f.value, label: f.label }))}
                        value={selectedFaculty}
                        onChange={(v) => v && onFacultyChange(v)}
                        required
                        size="sm"
                        style={{ width: 200 }}
                    />
                </div>
                <div className={classes.headerRight}>
                    <Group gap={8}>
                        <Button
                            variant="light"
                            color="gray"
                            size="sm"
                            leftSection={<IconRefresh size={16} />}
                            onClick={handleRefresh}
                        >
                            Làm mới
                        </Button>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            size="sm"
                            onClick={onAddLecturer}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Thêm giảng viên
                        </Button>
                    </Group>
                </div>
            </div>

            {loading ? (
                <Center py={60}>
                    <Loader size="md" />
                </Center>
            ) : error ? (
                <Center py={60}>
                    <Text c="red">{error}</Text>
                </Center>
            ) : (
                <>
                    <div className={classes.tableWrapper}>
                        <table className={classes.table}>
                            <thead>
                                <tr>
                                    <th>Mã giảng viên</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>Số điện thoại</th>
                                    <th>Tên bộ môn</th>
                                    <th>Cố vấn học tập</th>
                                    <th className={classes.actionsCol}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lecturers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={classes.empty}>Không tìm thấy giảng viên nào</td>
                                    </tr>
                                ) : (
                                    lecturers.map((l) => (
                                        <tr key={l.id} className={classes.row}>
                                            <td className={classes.code}>{l.lecturerCode}</td>
                                            <td>
                                                <Text size="sm" fw={600}>{l.fullName}</Text>
                                            </td>
                                            <td>{l.email}</td>
                                            <td>{l.phoneNumber}</td>
                                            <td>{l.departmentName}</td>
                                            <td>
                                                <Badge
                                                    color={l.isAcademicAdvisor ? 'green' : 'gray'}
                                                    variant="light"
                                                    size="sm"
                                                >
                                                    {l.isAcademicAdvisor ? 'Có' : 'Không'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Tooltip label="Quản lý cố vấn học tập" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="blue"
                                                            size="sm"
                                                            onClick={() => onViewAdvisor(l)}
                                                        >
                                                            <IconSchool size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Sửa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            size="sm"
                                                            onClick={() => onEditLecturer(l)}
                                                        >
                                                            <IconPencil size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(l)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className={classes.paginationWrapper}>
                            <Pagination
                                value={page + 1}
                                onChange={(p) => onPage(p - 1)}
                                total={totalPages}
                                size="sm"
                            />
                        </div>
                    )}
                </>
            )}

            <Modal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Xác nhận xóa"
                centered
            >
                <Text mb="lg">
                    Bạn có chắc chắn muốn xóa giảng viên <strong>{deletingLecturer?.fullName}</strong> không?
                </Text>
                <Group justify="flex-end">
                    <Button variant="subtle" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
                        Hủy
                    </Button>
                    <Button color="red" onClick={handleDeleteConfirm} loading={deleting}>
                        Xóa
                    </Button>
                </Group>
            </Modal>
        </div>
    );
}
