import {
    Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal, Select
} from '@mantine/core';
import {
    IconPlus, IconPencil, IconTrash, IconRefresh
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { StudentClass } from '../types';
import type { Faculty } from '../../students/types';
import classes from './StudentClassList.module.css';

interface Props {
    studentClasses: StudentClass[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
    onReload: () => void;
    onAddStudentClass: () => void;
    onEditStudentClass: (studentClass: StudentClass) => void;
    onDeleteConfirm: (classId: number) => void;
    selectedFaculty: string;
    onFacultyChange: (f: string) => void;
    faculties: Faculty[];
    selectedMajor: string | null;
    onMajorChange: (m: string | null) => void;
    majors: { majorCode: string; majorName: string }[];
}

export function StudentClassList({
    studentClasses, loading, error,
    page, totalPages,
    onPage, onReload, onAddStudentClass, onEditStudentClass,
    onDeleteConfirm, selectedFaculty, onFacultyChange, faculties,
    selectedMajor, onMajorChange, majors,
}: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingStudentClass, setDeletingStudentClass] = useState<StudentClass | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleRefresh = () => {
        onReload();
    };

    const handleDeleteClick = (studentClass: StudentClass) => {
        setDeletingStudentClass(studentClass);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingStudentClass) return;
        setDeleting(true);
        try {
            await onDeleteConfirm(deletingStudentClass.id);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa lớp sinh viên thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Xóa lớp sinh viên thất bại',
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
                        data={faculties.map(f => ({ value: f.facultyCode, label: f.name }))}
                        value={selectedFaculty}
                        onChange={(v) => v && onFacultyChange(v)}
                        size="sm"
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="Chọn ngành"
                        data={[
                            { value: '', label: 'Tất cả ngành' },
                            ...majors.map(m => ({ value: m.majorName, label: m.majorName }))
                        ]}
                        value={selectedMajor || ''}
                        onChange={(v) => onMajorChange(v || null)}
                        size="sm"
                        style={{ width: 200 }}
                        disabled={majors.length === 0}
                        clearable
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
                            onClick={onAddStudentClass}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Tạo lớp sinh viên
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
                                    <th>Tên ngành</th>
                                    <th>Niên khóa</th>
                                    <th>Số sinh viên</th>
                                    <th className={classes.actionsCol}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={classes.empty}>Không tìm thấy lớp sinh viên nào</td>
                                    </tr>
                                ) : (
                                    studentClasses.map((studentClass) => (
                                        <tr key={studentClass.id} className={classes.row}>
                                            <td className={classes.code}>{studentClass.classCode}</td>
                                            <td>
                                                <Text size="sm" fw={600}>{studentClass.majorName}</Text>
                                            </td>
                                            <td>{studentClass.startYear}</td>
                                            <td>{studentClass.studentCount}</td>
                                            <td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Tooltip label="Sửa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            size="sm"
                                                            onClick={() => onEditStudentClass(studentClass)}
                                                        >
                                                            <IconPencil size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(studentClass)}
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
                    Bạn có chắc chắn muốn xóa lớp <strong>{deletingStudentClass?.classCode}</strong> không?
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