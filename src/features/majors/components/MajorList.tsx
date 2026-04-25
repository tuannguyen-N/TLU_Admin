import {
    Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal, Select
} from '@mantine/core';
import {
    IconPlus, IconPencil, IconTrash, IconRefresh
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { Major } from '../types';
import type { Faculty } from '../../students/types';
import classes from './MajorList.module.css';

interface Props {
    majors: Major[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
    onReload: () => void;
    onAddMajor: () => void;
    onEditMajor: (major: Major) => void;
    onDeleteConfirm: (majorId: number) => void;
    selectedFaculty: string;
    onFacultyChange: (f: string) => void;
    faculties: Faculty[];
}

export function MajorList({
    majors, loading, error,
    page, totalPages,
    onPage, onReload, onAddMajor, onEditMajor,
    onDeleteConfirm, selectedFaculty, onFacultyChange, faculties,
}: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingMajor, setDeletingMajor] = useState<Major | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleRefresh = () => {
        onReload();
    };

    const handleDeleteClick = (major: Major) => {
        setDeletingMajor(major);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingMajor) return;
        setDeleting(true);
        try {
            await onDeleteConfirm(deletingMajor.id);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa ngành thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Xóa ngành thất bại',
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
                            onClick={onAddMajor}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Tạo ngành
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
                                    <th>Mã ngành</th>
                                    <th>Tên ngành</th>
                                    <th className={classes.actionsCol}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {majors.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className={classes.empty}>Không tìm thấy ngành nào</td>
                                    </tr>
                                ) : (
                                    majors.map((major) => (
                                        <tr key={major.id} className={classes.row}>
                                            <td className={classes.code}>{major.majorCode}</td>
                                            <td>
                                                <Text size="sm" fw={600}>{major.majorName}</Text>
                                            </td>
                                            <td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Tooltip label="Sửa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            size="sm"
                                                            onClick={() => onEditMajor(major)}
                                                        >
                                                            <IconPencil size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(major)}
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
                    Bạn có chắc chắn muốn xóa ngành <strong>{deletingMajor?.majorName}</strong> không?
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
