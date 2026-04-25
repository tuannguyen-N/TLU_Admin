import {
    Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal, Select
} from '@mantine/core';
import {
    IconPlus, IconPencil, IconTrash, IconRefresh
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { Subject, FacultyOption } from '../types';
import classes from './SubjectList.module.css';

interface Props {
    subjects: Subject[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
    onReload: () => void;
    onAddSubject: () => void;
    onEditSubject: (subject: Subject) => void;
    onDeleteConfirm: (subjectId: number) => void;
    onViewDetail: (subject: Subject) => void;
    selectedFaculty: string;
    onFacultyChange: (f: string) => void;
    faculties: FacultyOption[];
}

export function SubjectList({
    subjects, loading, error,
    page, totalPages,
    onPage, onReload, onAddSubject, onEditSubject, onViewDetail,
    onDeleteConfirm, selectedFaculty, onFacultyChange, faculties,
}: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleRefresh = () => {
        onReload();
    };

    const handleDeleteClick = (subject: Subject) => {
        setDeletingSubject(subject);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingSubject) return;
        setDeleting(true);
        try {
            await onDeleteConfirm(deletingSubject.id);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa môn học thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Xóa môn học thất bại',
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
                            onClick={onAddSubject}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Thêm môn học
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
                                    <th>Mã môn</th>
                                    <th>Tên môn học</th>
                                    <th>Tín chỉ</th>
                                    <th>Hệ số</th>
                                    <th>Giờ LT</th>
                                    <th>Giờ TH</th>
                                    <th className={classes.actionsCol}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={classes.empty}>Không tìm thấy môn học nào</td>
                                    </tr>
                                ) : (
                                    subjects.map((subject) => (
                                        <tr key={subject.id} className={classes.row}>
                                            <td className={classes.code}>{subject.subjectCode}</td>
                                            <td>
                                                <Text
                                                    size="sm"
                                                    fw={600}
                                                    style={{ cursor: 'pointer', color: 'var(--mantine-color-blue-6)' }}
                                                    onClick={() => onViewDetail(subject)}
                                                >
                                                    {subject.subjectName}
                                                </Text>
                                            </td>
                                            <td className={classes.credits}>{subject.credits}</td>
                                            <td>{subject.coefficient}</td>
                                            <td>{subject.lectureHours}</td>
                                            <td>{subject.practiceHours}</td>
                                            <td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Tooltip label="Sửa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            size="sm"
                                                            onClick={() => onEditSubject(subject)}
                                                        >
                                                            <IconPencil size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(subject)}
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
                    Bạn có chắc chắn muốn xóa môn học <strong>{deletingSubject?.subjectName}</strong> không?
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