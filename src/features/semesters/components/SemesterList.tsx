import {
    Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal, Badge, ScrollArea
} from '@mantine/core';
import {
    IconArrowLeft, IconUserPlus, IconPencil, IconTrash, IconRefresh
} from '@tabler/icons-react';
import { notifications as mantineNotifications } from '@mantine/notifications';
import { useState } from 'react';
import type { Semester } from '../types';
import classes from './SemesterList.module.css';
import { EditSemesterCard } from './EditSemesterCard';

interface Props {
    semesters: Semester[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    totalElements: number;
    onPage: (p: number) => void;
    onReload: () => void;
    onAddSemester: () => void;
    onDeleteConfirm: (id: number) => void;
}

const getSemesterNumberLabel = (num: 1 | 2 | 3) => {
    switch (num) {
        case 1: return { label: 'Kỳ 1', color: 'blue' };
        case 2: return { label: 'Kỳ 2', color: 'green' };
        case 3: return { label: 'Học kỳ phụ', color: 'orange' };
    }
};

export function SemesterList({
    semesters, loading, error,
    page, totalPages, totalElements,
    onPage, onReload, onAddSemester, onDeleteConfirm,
}: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

    const activeSemesters = semesters.filter(s => s.isActive !== false);

    const handleRefresh = () => onReload();

    const handleDeleteClick = (semester: Semester) => {
        setDeletingSemester(semester);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingSemester) return;
        setDeleting(true);
        try {
            await onDeleteConfirm(deletingSemester.id);
            mantineNotifications.show({
                title: 'Thành công',
                message: 'Xóa học kỳ thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
        } catch (err) {
            mantineNotifications.show({
                title: 'Lỗi',
                message: 'Xóa học kỳ thất bại',
                color: 'red',
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
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
                            leftSection={<IconUserPlus size={16} />}
                            size="sm"
                            onClick={onAddSemester}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Thêm học kỳ
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
                                    <th>Mã học kỳ</th>
                                    <th>Tên học kỳ</th>
                                    <th>Năm học</th>
                                    <th>Học kỳ</th>
                                    <th>Ngày bắt đầu</th>
                                    <th>Ngày kết thúc</th>
                                    <th className={classes.actionsCol}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeSemesters.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={classes.empty}>Không tìm thấy học kỳ nào</td>
                                    </tr>
                                ) : (
                                    activeSemesters.map((s) => {
                                        const semNum = getSemesterNumberLabel(s.semesterNumber);
                                        return (
                                            <tr key={s.id} className={classes.row}>
                                                <td className={classes.code}>{s.semesterCode}</td>
                                                <td>
                                                    <Text size="sm" fw={600}>{s.semesterName}</Text>
                                                </td>
                                                <td>{s.academicYears}</td>
                                                <td><Badge color={semNum.color} size="sm">{semNum.label}</Badge></td>
                                                <td>{s.startDate}</td>
                                                <td>{s.endDate}</td>
                                                <td>
                                                    <Group gap={4} wrap="nowrap">
                                                        <Tooltip label="Sửa" position="top">
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="yellow"
                                                                size="sm"
                                                                onClick={() => setEditingSemester(s)}
                                                            >
                                                                <IconPencil size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Xóa" position="top">
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="red"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(s)}
                                                            >
                                                                <IconTrash size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Group>
                                                </td>
                                            </tr>
                                        );
                                    })
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
                    Bạn có chắc chắn muốn xóa học kỳ <strong>{deletingSemester?.semesterName}</strong> không?
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

            <Modal
                opened={editingSemester !== null}
                onClose={() => setEditingSemester(null)}
                size="60%"
                withCloseButton={false}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {editingSemester && (
                    <EditSemesterCard
                        semester={editingSemester}
                        onCancel={() => setEditingSemester(null)}
                        onSave={() => {
                            setEditingSemester(null);
                            onReload();
                        }}
                    />
                )}
            </Modal>
        </div>
    );
}