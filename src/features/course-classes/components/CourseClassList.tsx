import {
    Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal, Select
} from '@mantine/core';
import {
    IconPlus, IconPencil, IconTrash, IconRefresh, IconEye
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { CourseClass } from '../types';
import type { FacultyOption } from '../../subjects/types';
import classes from './CourseClassList.module.css';

interface Props {
    courseClasses: CourseClass[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
    onReload: () => void;
    onAddCourseClass: () => void;
    onEditCourseClass: (courseClass: CourseClass) => void;
    onViewCourseClass: (courseClass: CourseClass) => void;
    onDeleteConfirm: (id: number) => void;
    selectedFaculty: string;
    onFacultyChange: (f: string) => void;
    faculties: FacultyOption[];
}

export function CourseClassList({
    courseClasses, loading, error,
    page, totalPages,
    onPage, onReload, onAddCourseClass, onEditCourseClass,
    onViewCourseClass,
    onDeleteConfirm, selectedFaculty, onFacultyChange, faculties,
}: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingCourseClass, setDeletingCourseClass] = useState<CourseClass | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleRefresh = () => {
        onReload();
    };

    const handleDeleteClick = (courseClass: CourseClass) => {
        setDeletingCourseClass(courseClass);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCourseClass) return;
        setDeleting(true);
        try {
            await onDeleteConfirm(deletingCourseClass.id);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa lớp học phần thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Xóa lớp học phần thất bại',
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
                            onClick={onAddCourseClass}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Thêm lớp học phần
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
                                    <th>Mã lớp</th>
                                    <th>Tên lớp</th>
                                    <th>Số lượng</th>
                                    <th>Mã giáo viên</th>
                                    <th>Mã môn</th>
                                    <th>Mã học kỳ</th>
                                    <th className={classes.actionsCol}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={classes.empty}>Không tìm thấy lớp học phần nào</td>
                                    </tr>
                                ) : (
                                    courseClasses.map((cc) => (
                                        <tr key={cc.id} className={classes.row}>
                                            <td className={classes.code}>{cc.classCode}</td>
                                            <td>
                                                <Text size="sm" fw={600}>{cc.className}</Text>
                                            </td>
                                            <td>{cc.capacity}</td>
                                            <td>{cc.lecturerCode}</td>
                                            <td>{cc.subjectCode}</td>
                                            <td>{cc.semesterCode}</td>
                                            <td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Tooltip label="Xem chi tiết" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="blue"
                                                            size="sm"
                                                            onClick={() => onViewCourseClass(cc)}
                                                        >
                                                            <IconEye size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Sửa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            size="sm"
                                                            onClick={() => onEditCourseClass(cc)}
                                                        >
                                                            <IconPencil size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(cc)}
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
                    Bạn có chắc chắn muốn xóa lớp học phần <strong>{deletingCourseClass?.className}</strong> không?
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
