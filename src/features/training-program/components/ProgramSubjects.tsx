import {
    Group, Text, Button, ActionIcon, Tooltip, Loader, Center, Modal, Tabs
} from '@mantine/core';
import {
    IconArrowLeft, IconPlus, IconPencil, IconTrash, IconRefresh
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import type { SubjectDetail } from '../types';
import { deleteSubject } from '../services';
import classes from './ProgramSubjects.module.css';

interface SemesterData {
    semesterId: number;
    semester: string;
    subjects: SubjectDetail[];
}

interface Props {
    programId: number;
    programName: string;
    programCode: string;
    semesters: SemesterData[];
    loading: boolean;
    error: string | null;
    onBack: () => void;
    onReload: () => void;
    onAddSubject: (studyProgramId: number) => void;
    onEditSubject: (subject: SubjectDetail) => void;
}

export function ProgramSubjects({
    programId,
    programName,
    programCode,
    semesters,
    loading,
    error,
    onBack,
    onReload,
    onAddSubject,
    onEditSubject,
}: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingSubject, setDeletingSubject] = useState<SubjectDetail | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<number | null>(null);

    // Set initial tab to first semester
    useEffect(() => {
        if (semesters.length > 0 && activeTab === null) {
            setActiveTab(semesters[0].semesterId);
        }
    }, [semesters, activeTab]);

    const totalSubjects = semesters.reduce((sum, sem) => sum + sem.subjects.length, 0);
    const totalCredits = semesters.reduce((sum, sem) =>
        sum + sem.subjects.reduce((s, subj) => s + subj.credits, 0), 0);

    const handleRefresh = () => {
        onReload();
    };

    const handleDeleteClick = (subject: SubjectDetail) => {
        setDeletingSubject(subject);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingSubject) return;
        setDeleting(true);
        try {
            await deleteSubject(deletingSubject.id);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa môn học thành công',
                color: 'green',
            });
            setDeleteModalOpen(false);
            onReload();
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

    const handleAddSubject = () => {
    onAddSubject(programId);
  };

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <button className={classes.backBtn} onClick={onBack}>
                    <IconArrowLeft size={18} />
                    <span>Quay lại</span>
                </button>
                <div className={classes.headerRight}>
                    <div>
                        <h2 className={classes.title}>{programName}</h2>
                        <p className={classes.subtitle}>
                            Mã CT: {programCode} • {totalSubjects} môn học • {totalCredits} tín chỉ
                        </p>
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
                            leftSection={<IconPlus size={16} />}
                            size="sm"
                            onClick={handleAddSubject}
                            style={{ backgroundColor: '#111827', color: '#fff' }}
                        >
                            Thêm môn học
                        </Button>
                    </Group>
                </div>
            </div>

            <Tabs value={activeTab?.toString() ?? null} onChange={(val) => setActiveTab(val ? Number(val) : null)}>
                <Tabs.List className={classes.tabsList}>
                    {semesters.map((sem) => (
                        <Tabs.Tab
                            key={sem.semesterId}
                            value={sem.semesterId.toString()}
                            className={classes.tab}
                        >
                            {sem.semester} ({sem.subjects.length} môn)
                        </Tabs.Tab>
                    ))}
                </Tabs.List>

                {semesters.map((sem) => (
                    <Tabs.Panel key={sem.semesterId} value={sem.semesterId.toString()}>
                        {loading ? (
                            <Center py={60}>
                                <Loader size="md" />
                            </Center>
                        ) : error ? (
                            <Center py={60}>
                                <Text c="red">{error}</Text>
                            </Center>
                        ) : (
                            <div className={classes.tableWrapper}>
                                <table className={classes.table}>
                                    <thead>
                                        <tr>
                                            <th>Mã môn</th>
                                            <th>Tên môn học</th>
                                            <th>Số tín chỉ</th>
                                            <th>LT</th>
                                            <th>TH</th>
                                            <th>Bắt buộc</th>
                                            <th className={classes.actionsCol}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sem.subjects.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className={classes.empty}>
                                                    Chưa có môn học nào trong kỳ này
                                                </td>
                                            </tr>
                                        ) : (
                                            sem.subjects.map((subject) => (
                                                <tr key={subject.id} className={classes.row}>
                                                    <td className={classes.code}>{subject.subjectCode}</td>
                                                    <td>
                                                        <Text size="sm" fw={500}>{subject.subjectName}</Text>
                                                    </td>
                                                    <td className={classes.credits}>{subject.credits}</td>
                                                    <td>{subject.lectureHours}</td>
                                                    <td>{subject.practiceHours}</td>
                                                    <td>{subject.isRequired ? 'Có' : 'Tự chọn'}</td>
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
                        )}
                    </Tabs.Panel>
                ))}
            </Tabs>

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
