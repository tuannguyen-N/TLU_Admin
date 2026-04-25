import { useState, useEffect } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { TrainingProgramList } from './components/TrainingProgramList';
import { ProgramSubjects } from './components/ProgramSubjects';
import { AddTrainingProgramCard } from './components/AddTrainingProgramCard';
import { EditTrainingProgramCard } from './components/EditTrainingProgramCard';
import { AddSubjectToProgramCard } from './components/AddSubjectToProgramCard';
import { EditSubjectCard } from './components/EditSubjectCard';
import { useTrainingPrograms } from './hooks/useTrainingPrograms';
import { fetchStudyProgramDetail, updateSubject } from './services';
import type { TrainingProgram, StudyProgramDetail, SubjectDetail } from './types';
import type { TrainingProgramFormData } from './types';
import classes from './TrainingProgramPage.module.css';

interface SubjectFormData {
  semesterId: number;
  isRequired: boolean;
  electiveGroup: string | null;
}

export function TrainingProgramPage() {
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [facultiesLoaded, setFacultiesLoaded] = useState(false);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [viewingProgram, setViewingProgram] = useState<StudyProgramDetail | null>(null);
  const [viewingProgramId, setViewingProgramId] = useState<number | null>(null);
  const [programDetailLoading, setProgramDetailLoading] = useState(false);
  const [programDetailError, setProgramDetailError] = useState<string | null>(null);
  const [addSubjectSemesterId, setAddSubjectSemesterId] = useState<number | null>(null);
  const [addSubjectProgramId, setAddSubjectProgramId] = useState<number | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectDetail | null>(null);

  const year = parseInt(selectedYear, 10);
  const {
    trainingPrograms,
    loading,
    error,
    page,
    setPage,
    totalPages,
    reload,
    handleDelete,
    faculties,
  } = useTrainingPrograms(year, selectedFaculty || undefined);

  // Auto-select first faculty when loaded
  useEffect(() => {
    if (!selectedFaculty && faculties.length > 0 && !facultiesLoaded) {
      setSelectedFaculty(faculties[0].facultyCode);
      setFacultiesLoaded(true);
    }
  }, [faculties, selectedFaculty, facultiesLoaded]);

  const handleViewProgram = async (program: TrainingProgram) => {
    setProgramDetailLoading(true);
    setProgramDetailError(null);
    try {
      const detail = await fetchStudyProgramDetail(program.id);
      setViewingProgram(detail);
      setViewingProgramId(program.id);
    } catch (err) {
      setProgramDetailError('Không thể tải chi tiết chương trình đào tạo');
    } finally {
      setProgramDetailLoading(false);
    }
  };

  const handleBackFromDetail = () => {
    setViewingProgram(null);
    setViewingProgramId(null);
    setProgramDetailError(null);
  };

  const handleReloadDetail = async () => {
    if (!viewingProgram) return;
    setProgramDetailLoading(true);
    setProgramDetailError(null);
    try {
      const program = trainingPrograms.find(p => p.studyProgramCode === viewingProgram.studyProgramCode);
      if (program) {
        const detail = await fetchStudyProgramDetail(program.id);
        setViewingProgram(detail);
      }
    } catch (err) {
      setProgramDetailError('Không thể tải chi tiết chương trình đào tạo');
    } finally {
      setProgramDetailLoading(false);
    }
  };

  const handleAddSubject = (programId: number) => {
    setAddSubjectProgramId(programId);
  };

  const handleEditSubject = (subject: SubjectDetail) => {
    setEditingSubject(subject);
  };

  const handleAddProgram = () => {
    setAddModalOpened(true);
  };

  const handleEditProgram = (program: TrainingProgram) => {
    setEditingProgram(program);
  };

  const handleDeleteConfirm = async (programId: number) => {
    await handleDelete(programId);
  };

  return (
    <div className={classes.page}>
      {viewingProgram ? (
        <>
          <div className={classes.pageHeader}>
            <h1 className={classes.pageTitle}>Chi tiết chương trình đào tạo</h1>
            <p className={classes.pageDesc}>
              Xem và quản lý các môn học trong chương trình đào tạo
            </p>
          </div>
          <ProgramSubjects
            programId={viewingProgramId!}
            programName={viewingProgram.studyProgramName}
            programCode={viewingProgram.studyProgramCode}
            semesters={viewingProgram.semesters.map(sem => ({
              semesterId: sem.semesterId,
              semester: sem.semesterName,
              subjects: sem.subjects,
            }))}
            loading={programDetailLoading}
            error={programDetailError}
            onBack={handleBackFromDetail}
            onReload={handleReloadDetail}
            onAddSubject={handleAddSubject}
            onEditSubject={handleEditSubject}
          />
        </>
      ) : (
        <>
          <div className={classes.pageHeader}>
            <h1 className={classes.pageTitle}>Chương trình đào tạo</h1>
            <p className={classes.pageDesc}>
              Quản lý chương trình đào tạo của trường. Theo dõi và cập nhật thông tin các chương trình đào tạo.
            </p>
          </div>

          <TrainingProgramList
            trainingPrograms={trainingPrograms}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            onPage={setPage}
            onReload={reload}
            onAddProgram={handleAddProgram}
            onEditProgram={handleEditProgram}
            onDeleteConfirm={handleDeleteConfirm}
            onViewProgram={handleViewProgram}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedFaculty={selectedFaculty}
            onFacultyChange={setSelectedFaculty}
            faculties={faculties}
          />
        </>
      )}

      <Modal
        opened={addModalOpened || editingProgram !== null}
        onClose={() => {
          setAddModalOpened(false);
          setEditingProgram(null);
        }}
        centered
        size="80%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {addModalOpened && (
          <AddTrainingProgramCard
            khoa={selectedFaculty || 'CNTT'}
            onCancel={() => setAddModalOpened(false)}
            onSave={(data: TrainingProgramFormData) => {
              console.log('Add training program:', data);
              setAddModalOpened(false);
              reload();
            }}
          />
        )}
        {editingProgram && (
          <EditTrainingProgramCard
            khoa={selectedFaculty || 'CNTT'}
            program={editingProgram}
            onCancel={() => setEditingProgram(null)}
            onSave={() => {
              setEditingProgram(null);
              reload();
            }}
          />
        )}
      </Modal>

      <Modal
        opened={addSubjectProgramId !== null}
        onClose={() => {
          setAddSubjectProgramId(null);
          setAddSubjectSemesterId(null);
        }}
        centered
        size="60%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {addSubjectProgramId !== null && (
          <AddSubjectToProgramCard
            studyProgramId={addSubjectProgramId}
            onCancel={() => {
              setAddSubjectProgramId(null);
              setAddSubjectSemesterId(null);
            }}
            onSave={() => {
              setAddSubjectProgramId(null);
              setAddSubjectSemesterId(null);
              handleReloadDetail();
              notifications.show({
                title: 'Thành công',
                message: 'Thêm môn học thành công',
                color: 'green',
              });
            }}
          />
        )}
      </Modal>

      <Modal
        opened={editingSubject !== null}
        onClose={() => {
          setEditingSubject(null);
        }}
        centered
        size="60%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {editingSubject && (
          <EditSubjectCard
            subject={editingSubject}
            // semesters={viewingProgram?.semesters || []}
            onCancel={() => setEditingSubject(null)}
            onSave={async (data: SubjectFormData) => {
              try {
                await updateSubject(editingSubject.id, {
                  semesterId: data.semesterId,
                  isRequired: data.isRequired,
                  electiveGroup: data.electiveGroup,
                });
                notifications.show({
                  title: 'Thành công',
                  message: 'Cập nhật môn học thành công',
                  color: 'green',
                });
                setEditingSubject(null);
                handleReloadDetail();
              } catch (err) {
                notifications.show({
                  title: 'Lỗi',
                  message: 'Cập nhật môn học thất bại',
                  color: 'red',
                });
              }
            }}
          />
        )}
      </Modal>
    </div>
  );
}
