import { useState, useEffect } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { SubjectList } from './components/SubjectList';
import { AddSubjectCard } from './components/AddSubjectCard';
import { useSubjects } from './hooks/useSubjects';
import type { Subject, SubjectFormData } from './types';
import classes from './SubjectsPage.module.css';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { EditSubjectCard } from './components/EditSubjectCard';

export function SubjectsPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [facultiesLoaded, setFacultiesLoaded] = useState(false);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [viewingSubject, setViewingSubject] = useState<Subject | null>(null);

  const {
    subjects,
    loading,
    error,
    page,
    setPage,
    totalPages,
    reload,
    handleDelete,
    faculties,
  } = useSubjects(selectedFaculty);

  // Auto-select first faculty when loaded
  useEffect(() => {
    if (!selectedFaculty && faculties.length > 0 && !facultiesLoaded) {
      setSelectedFaculty(faculties[0].value);
      setFacultiesLoaded(true);
    }
  }, [faculties, selectedFaculty, facultiesLoaded]);

  const handleAddSubject = () => {
    setAddModalOpened(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
  };

  const handleSaveSubject = (_data: SubjectFormData) => {
    notifications.show({
      title: 'Thành công',
      message: 'Tạo môn học thành công',
      color: 'green',
    });
    setAddModalOpened(false);
    reload();
  };

  const handleSaveEdit = (_data: SubjectFormData) => {
    notifications.show({
      title: 'Thành công',
      message: 'Cập nhật môn học thành công',
      color: 'green',
    });
    setEditingSubject(null);
    reload();
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Môn học</h1>
        <p className={classes.pageDesc}>
          Quản lý thông tin các môn học trong trường. Theo dõi và cập nhật danh sách môn học theo từng khoa.
        </p>
      </div>

      <SubjectList
        onViewDetail={setViewingSubject}
        subjects={subjects}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPage={setPage}
        onReload={reload}
        onAddSubject={handleAddSubject}
        onEditSubject={handleEditSubject}
        onDeleteConfirm={handleDelete}
        selectedFaculty={selectedFaculty}
        onFacultyChange={setSelectedFaculty}
        faculties={faculties}
      />

      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        centered
        size="60%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <AddSubjectCard
          onCancel={() => setAddModalOpened(false)}
          onSave={handleSaveSubject}
        />
      </Modal>

      <Modal
        opened={editingSubject !== null}
        onClose={() => setEditingSubject(null)}
        centered
        size="60%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {editingSubject && (
          <EditSubjectCard
            subjectId={editingSubject.id}
            onCancel={() => setEditingSubject(null)}
            onSave={handleSaveEdit}
          />
        )}
      </Modal>

      <SubjectDetailModal
        subject={viewingSubject}
        opened={viewingSubject !== null}
        onClose={() => setViewingSubject(null)}
      />
    </div>
  );
}