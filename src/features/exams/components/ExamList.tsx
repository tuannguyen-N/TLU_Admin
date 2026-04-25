import { Pagination, Group, Text, Button, Loader, Center, Badge, Select, ActionIcon, Tooltip, Modal } from '@mantine/core';
import { IconPlus, IconRefresh, IconPencil, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import type { Exam, SemesterOption } from '../types';
import classes from './ExamList.module.css';

interface Props {
    exams: Exam[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    totalElements: number;
    onPage: (p: number) => void;
    onReload: () => void;
    onAddExam: () => void;
    onEditExam: (exam: Exam) => void;
    onDeleteExam: (id: number) => Promise<void>;
    semesters: SemesterOption[];
    selectedSemester: string;
    onSemesterChange: (semesterId: string) => void;
}

export function ExamList({
    exams, loading, error,
    page, totalPages, totalElements,
    onPage, onReload, onAddExam,
    onEditExam, onDeleteExam,
    semesters, selectedSemester, onSemesterChange,
}: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleRefresh = () => onReload();

    const handleDeleteClick = (exam: Exam) => {
        setDeletingExam(exam);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingExam) return;
        setDeleting(true);
        try {
            await onDeleteExam(deletingExam.id);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa lịch thi thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: err instanceof Error ? err.message : 'Xóa lịch thi thất bại',
                color: 'red',
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <div className={classes.headerLeft}>
                    <Select
                        placeholder="Chọn học kỳ"
                        data={semesters.map(s => ({ value: s.value, label: s.label }))}
                        value={selectedSemester}
                        onChange={(v) => v && onSemesterChange(v)}
                        size="sm"
                        style={{ width: 280 }}
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
                            onClick={onAddExam}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Thêm lịch thi
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
                                    <th>Tên môn</th>
                                    <th>Ngày thi</th>
                                    <th>Giờ bắt đầu</th>
                                    <th>Giờ kết thúc</th>
                                    <th>Phòng</th>
                                    <th>Địa điểm</th>
                                    <th>Hình thức</th>
                                    <th>Loại thi</th>
                                    <th className={classes.actionsCol}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className={classes.empty}>Không tìm thấy lịch thi nào</td>
                                    </tr>
                                ) : (
                                    exams.map((exam) => (
                                        <tr key={exam.id} className={classes.row}>
                                            <td className={classes.code}>{exam.subjectCode}</td>
                                            <td>
                                                <Text size="sm" fw={600}>{exam.subjectName}</Text>
                                            </td>
                                            <td>{exam.examDate}</td>
                                            <td>{exam.startTime}</td>
                                            <td>{exam.endTime}</td>
                                            <td>{exam.examRoom}</td>
                                            <td>{exam.examLocation}</td>
                                            <td>
                                                <Badge
                                                    color={exam.examFormat === 'Online' ? 'blue' : 'green'}
                                                    variant="light"
                                                    size="sm"
                                                >
                                                    {exam.examFormat}
                                                </Badge>
                                            </td>
                                            <td>{exam.examType}</td>
                                            <td>
                                                <Group gap={4} wrap="nowrap">
                                                    <Tooltip label="Sửa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            size="sm"
                                                            onClick={() => onEditExam(exam)}
                                                        >
                                                            <IconPencil size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa" position="top">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(exam)}
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
                    Bạn có chắc chắn muốn xóa lịch thi <strong>{deletingExam?.subjectName}</strong> không?
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
