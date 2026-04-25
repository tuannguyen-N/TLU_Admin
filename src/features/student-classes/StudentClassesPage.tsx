import { useState, useEffect } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { StudentClassList } from './components/StudentClassList';
import { AddStudentClassCard } from './components/AddStudentClassCard';
import { EditStudentClassCard } from './components/EditStudentClassCard';
import { useStudentClasses } from './hooks/useStudentClasses';
import type { StudentClass } from './types';
import type { StudentClassFormData } from './types';
import classes from './StudentClassesPage.module.css';

export function StudentClassesPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('CNTT');
  const [facultiesLoaded, setFacultiesLoaded] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingStudentClass, setEditingStudentClass] = useState<StudentClass | null>(null);

  const {
    studentClasses,
    loading,
    error,
    page,
    setPage,
    totalPages,
    reload,
    handleDelete,
    faculties,
    majors,
  } = useStudentClasses(selectedFaculty);

  // Auto-select first faculty when loaded
  useEffect(() => {
    if (!selectedFaculty && faculties.length > 0 && !facultiesLoaded) {
      setSelectedFaculty(faculties[0].facultyCode);
      setFacultiesLoaded(true);
    }
  }, [faculties, selectedFaculty, facultiesLoaded]);

  const filteredStudentClasses = selectedMajor
    ? studentClasses.filter(sc => sc.majorName === selectedMajor)
    : studentClasses;

  const handleAddStudentClass = () => {
    setAddModalOpened(true);
  };

  const handleEditStudentClass = (studentClass: StudentClass) => {
    setEditingStudentClass(studentClass);
  };

  const handleFacultyChange = (faculty: string) => {
    setSelectedFaculty(faculty);
    setSelectedMajor(null);
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Lớp Sinh Viên</h1>
        <p className={classes.pageDesc}>
          Quản lý thông tin các lớp sinh viên trong trường. Theo dõi và cập nhật danh sách lớp theo từng khoa.
        </p>
      </div>

      <StudentClassList
        studentClasses={filteredStudentClasses}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPage={setPage}
        onReload={reload}
        onAddStudentClass={handleAddStudentClass}
        onEditStudentClass={handleEditStudentClass}
        onDeleteConfirm={handleDelete}
        selectedFaculty={selectedFaculty}
        onFacultyChange={handleFacultyChange}
        faculties={faculties}
        selectedMajor={selectedMajor}
        onMajorChange={setSelectedMajor}
        majors={majors}
      />

      <Modal
        opened={addModalOpened || editingStudentClass !== null}
        onClose={() => {
          setAddModalOpened(false);
          setEditingStudentClass(null);
        }}
        centered
        size="80%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {addModalOpened && (
          <AddStudentClassCard
            selectedFaculty={selectedFaculty}
            onCancel={() => setAddModalOpened(false)}
            onSave={(data: StudentClassFormData) => {
              console.log('Add student class:', data);
              setAddModalOpened(false);
              reload();
            }}
          />
        )}
        {editingStudentClass && (
          <EditStudentClassCard
            studentClass={editingStudentClass}
            selectedFaculty={selectedFaculty}
            onCancel={() => setEditingStudentClass(null)}
            onSave={() => {
              setEditingStudentClass(null);
              reload();
            }}
          />
        )}
      </Modal>
    </div>
  );
}