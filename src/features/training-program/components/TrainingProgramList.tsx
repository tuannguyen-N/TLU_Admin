import {
    Pagination, Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal, Select
} from '@mantine/core';
import {
    IconPlus, IconPencil, IconTrash, IconRefresh, IconEye
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { TrainingProgram } from '../types';
import type { Faculty } from '../../students/types';
import classes from './TrainingProgramList.module.css';

const academicYears = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
];

interface Props {
    trainingPrograms: TrainingProgram[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
    onReload: () => void;
    onAddProgram: () => void;
    onEditProgram: (program: TrainingProgram) => void;
    onDeleteConfirm: (programId: number) => void;
    onViewProgram: (program: TrainingProgram) => void;
    selectedYear: string;
    onYearChange: (y: string) => void;
    selectedFaculty: string;
    onFacultyChange: (f: string) => void;
    faculties: Faculty[];
}

export function TrainingProgramList({
    trainingPrograms, loading, error,
    page, totalPages,
    onPage, onReload, onAddProgram, onEditProgram,
    onDeleteConfirm, onViewProgram, selectedYear, onYearChange,
    selectedFaculty, onFacultyChange, faculties,
}: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingProgram, setDeletingProgram] = useState<TrainingProgram | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleRefresh = () => {
        onReload();
    };

    const handleDeleteClick = (program: TrainingProgram) => {
        setDeletingProgram(program);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingProgram) return;
        setDeleting(true);
        try {
            await onDeleteConfirm(deletingProgram.id);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa chương trình đào tạo thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Xóa chương trình đào tạo thất bại',
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
                        placeholder="Chọn năm học"
                        data={academicYears}
                        value={selectedYear}
                        onChange={(v) => v && onYearChange(v)}
                        size="sm"
                        style={{ width: 160 }}
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
                            onClick={onAddProgram}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Tạo chương trình đào tạo
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
                                    <th>Tên chương trình</th>
                                    <th>Mã CT</th>
                                    <th>Số tín chỉ</th>
                                    <th className={classes.actionsCol}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainingPrograms.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className={classes.empty}>Không tìm thấy chương trình đào tạo nào</td>
                                    </tr>
                                ) : (
                                    trainingPrograms.map((program) => (
                                        <tr key={program.id} className={classes.row}>
                                            <td>
                                                <Text size="sm" fw={600}>{program.studyProgramName}</Text>
                                            </td>
                                            <td className={classes.code}>{program.studyProgramCode}</td>
                                            <td className={classes.credits}>{program.totalCredits}</td>
                                            <td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Tooltip label="Xem chi tiết" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="blue"
                                                            size="sm"
                                                            onClick={() => onViewProgram(program)}
                                                        >
                                                            <IconEye size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Sửa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            size="sm"
                                                            onClick={() => onEditProgram(program)}
                                                        >
                                                            <IconPencil size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(program)}
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
                    Bạn có chắc chắn muốn xóa chương trình đào tạo <strong>{deletingProgram?.studyProgramName}</strong> không?
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
