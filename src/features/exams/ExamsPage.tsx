import { useState, useEffect } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ExamList } from './components/ExamList';
import { AddExamCard } from './components/AddExamCard';
import { EditExamCard } from './components/EditExamCard';
import { useExams } from './hooks/useExams';
import { fetchSemesters } from '../semesters/services';
import { fetchSubjectsAPI } from '../subjects/services';
import type { ExamFormData, SemesterOption, SubjectOption, Exam } from './types';
import classes from './ExamsPage.module.css';

export function ExamsPage() {
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [semestersLoaded, setSemestersLoaded] = useState(false);
    const [addModalOpened, setAddModalOpened] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [semesters, setSemesters] = useState<SemesterOption[]>([]);
    const [subjects, setSubjects] = useState<SubjectOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const {
        exams,
        loading,
        error,
        page,
        setPage,
        totalPages,
        totalElements,
        reload,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useExams({
        semesterId: selectedSemester ? parseInt(selectedSemester) : 0,
    });

    useEffect(() => {
        const loadSemesters = async () => {
            setLoadingOptions(true);
            try {
                const result = await fetchSemesters({ page: 0, size: 100 });
                const activeSemesters = result.semesters.filter(s => s.isActive);
                setSemesters(activeSemesters.map(s => ({
                    value: s.id.toString(),
                    label: `${s.semesterName} (${s.academicYears})`,
                    id: s.id,
                })));
            } catch (err) {
                console.error('Error loading semesters:', err);
            } finally {
                setLoadingOptions(false);
            }
        };
        loadSemesters();
    }, []);

    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const result = await fetchSubjectsAPI({ page: 0, size: 1000 });
                setSubjects(result.subjects.map(s => ({
                    value: s.subjectCode,
                    label: s.subjectName,
                    id: s.id,
                })));
            } catch (err) {
                console.error('Error loading subjects:', err);
            }
        };
        loadSubjects();
    }, []);

    useEffect(() => {
        if (!selectedSemester && semesters.length > 0 && !semestersLoaded) {
            setSelectedSemester(semesters[0].value);
            setSemestersLoaded(true);
        }
    }, [semesters, selectedSemester, semestersLoaded]);

    const handleAddExam = () => {
        setAddModalOpened(true);
    };

    const handleSaveExam = async (_data: ExamFormData) => {
        try {
            await handleCreate(_data);
            setAddModalOpened(false);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: err instanceof Error ? err.message : 'Tạo lịch thi thất bại',
                color: 'red',
            });
        }
    };

    const handleEditExam = (exam: Exam) => {
        setEditingExam(exam);
    };

    const handleSaveEditExam = async () => {
        setEditingExam(null);
        reload();
    };

    const handleDeleteExam = async (id: number) => {
        try {
            await handleDelete(id);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: err instanceof Error ? err.message : 'Xóa lịch thi thất bại',
                color: 'red',
            });
            throw err;
        }
    };

    const handleSemesterChange = (semesterId: string) => {
        setSelectedSemester(semesterId);
        setPage(0);
    };

    return (
        <div className={classes.page}>
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Lịch thi</h1>
                <p className={classes.pageSubtitle}>
                    Quản lý lịch thi của các môn học trong học kỳ. Theo dõi ngày thi, giờ thi, phòng thi và hình thức thi.
                </p>
            </div>

            <ExamList
                exams={exams}
                loading={loading}
                error={error}
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onPage={setPage}
                onReload={reload}
                onAddExam={handleAddExam}
                onEditExam={handleEditExam}
                onDeleteExam={handleDeleteExam}
                semesters={semesters}
                selectedSemester={selectedSemester}
                onSemesterChange={handleSemesterChange}
            />

            <Modal
                opened={addModalOpened}
                onClose={() => setAddModalOpened(false)}
                centered
                size="60%"
                withCloseButton={false}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                <AddExamCard
                    onCancel={() => setAddModalOpened(false)}
                    onSave={handleSaveExam}
                    semesters={semesters}
                    subjects={subjects}
                />
            </Modal>

            <Modal
                opened={editingExam !== null}
                onClose={() => setEditingExam(null)}
                centered
                size="60%"
                withCloseButton={false}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {editingExam && (
                    <EditExamCard
                        exam={editingExam}
                        currentSemesterId={selectedSemester}
                        onCancel={() => setEditingExam(null)}
                        onSave={handleSaveEditExam}
                        semesters={semesters}
                        subjects={subjects}
                    />
                )}
            </Modal>
        </div>
    );
}
