import {
    Avatar, Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal
} from '@mantine/core';
import {
    IconArrowLeft, IconUserPlus,
    IconPencil, IconTrash, IconRefresh, IconFileImport
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { Student, Faculty } from '../types';
import { importStudentsFromExcel, deleteStudent } from '../services';
import { EditStudentCard } from './EditStudentCard';
import classes from './StudentList.module.css';

interface Props {
    faculty: Faculty;
    students: Student[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    totalElements: number;
    onPage: (p: number) => void;
    onBack: () => void;
    onReload: () => void;
    onAddStudent: () => void;
}

export function StudentList({
    faculty, students, loading, error,
    page, totalPages, totalElements,
    onPage, onBack, onReload, onAddStudent,
}: Props) {
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleRefresh = () => {
        onReload();
    };

    const handleImportExcel = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                await importStudentsFromExcel(file);
                notifications.show({
                    title: 'Thành công',
                    message: 'Import sinh viên từ Excel thành công',
                    color: 'green',
                });
                onReload();
            } catch (err) {
                notifications.show({
                    title: 'Lỗi',
                    message: 'Import sinh viên thất bại',
                    color: 'red',
                });
            }
        };

        input.click();
    };

    const handleAddStudent = () => {
        onAddStudent();
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
    };

    const handleDeleteClick = (student: Student) => {
        setDeletingStudent(student);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingStudent) return;
        setDeleting(true);
        try {
            await deleteStudent(deletingStudent.id);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa sinh viên thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
            onReload();
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Xóa sinh viên thất bại',
                color: 'red',
            });
        } finally {
            setDeleting(false);
        }
    };

    const handleEditSave = () => {
        setEditingStudent(null);
        onReload();
    };

    const handleEditCancel = () => {
        setEditingStudent(null);
    };

    if (editingStudent) {
        return (
            <EditStudentCard
                student={editingStudent}
                onCancel={handleEditCancel}
                onSave={handleEditSave}
            />
        );
    }

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <button className={classes.backBtn} onClick={onBack}>
                    <IconArrowLeft size={18} />
                    <span>Quay lại</span>
                </button>
                <div className={classes.headerRight}>
                    <div>
                        <h2 className={classes.title}>Thông tin sinh viên</h2>
                        <p className={classes.subtitle}>Khoa {faculty.name} • {totalElements} sinh viên</p>
                    </div>
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
                            variant="outline"
                            color="dark"
                            size="sm"
                            leftSection={<IconFileImport size={16} />}
                            onClick={handleImportExcel}
                        >
                            Import từ Excel
                        </Button>
                        <Button
                            leftSection={<IconUserPlus size={16} />}
                            size="sm"
                            onClick={handleAddStudent}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Thêm sinh viên
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
                                    <th>Sinh viên</th>
                                    <th>Mã SV</th>
                                    <th>Ngày sinh</th>
                                    <th>Giới tính</th>
                                    <th>Email</th>
                                    <th>SĐT</th>
                                    <th className={classes.actionsCol}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={classes.empty}>Không tìm thấy sinh viên nào</td>
                                    </tr>
                                ) : (
                                    students.map((s) => (
                                        <tr key={s.id} className={classes.row}>
                                            <td>
                                                <Group gap={10} wrap="nowrap">
                                                    <Avatar size={36} radius="xl" color="blue" name={s.fullName} />
                                                    <div>
                                                        <Text size="sm" fw={600}>{s.fullName}</Text>
                                                        <Text size="xs" c="dimmed">{s.classCode}</Text>
                                                    </div>
                                                </Group>
                                            </td>
                                            <td className={classes.code}>{s.studentCode}</td>
                                            <td>{s.dateOfBirth}</td>
                                            <td>{s.gender}</td>
                                            <td className={classes.email}>{s.contact.email}</td>
                                            <td>{s.contact.phoneNumber}</td>
                                            <td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Tooltip label="Sửa" position="top">
                                                        <ActionIcon variant="subtle" color="yellow" size="sm" onClick={() => handleEdit(s)}>
                                                            <IconPencil size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa" position="top">
                                                        <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteClick(s)}>
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
                            <Pagination value={page + 1} onChange={(p) => onPage(p - 1)} total={totalPages} size="sm" />
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
                    Bạn có chắc chắn muốn xóa sinh viên <strong>{deletingStudent?.fullName}</strong> không?
                </Text>
                <Group justify="flex-end">
                    <Button variant="subtle" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
                        Huỷ
                    </Button>
                    <Button color="red" onClick={handleDeleteConfirm} loading={deleting}>
                        Xóa
                    </Button>
                </Group>
            </Modal>
        </div>
    );
}
