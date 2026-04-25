import { useState } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { MajorList } from './components/MajorList';
import { AddMajorCard } from './components/AddMajorCard';
import { EditMajorCard } from './components/EditMajorCard';
import { useMajors } from './hooks/useMajors';
import type { Major } from './types';
import type { MajorFormData } from './types';
import classes from './MajorPage.module.css';

export function MajorsPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('CNTT');
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);

  const {
    majors,
    loading,
    error,
    page,
    setPage,
    totalPages,
    reload,
    handleDelete,
    faculties,
  } = useMajors(selectedFaculty);

  const handleAddMajor = () => {
    setAddModalOpened(true);
  };

  const handleEditMajor = (major: Major) => {
    setEditingMajor(major);
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Ngành</h1>
        <p className={classes.pageDesc}>
          Quản lý thông tin các ngành học trong trường. Theo dõi và cập nhật danh sách ngành theo từng khoa.
        </p>
      </div>

      <MajorList
        majors={majors}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPage={setPage}
        onReload={reload}
        onAddMajor={handleAddMajor}
        onEditMajor={handleEditMajor}
        onDeleteConfirm={handleDelete}
        selectedFaculty={selectedFaculty}
        onFacultyChange={setSelectedFaculty}
        faculties={faculties}
      />

      <Modal
        opened={addModalOpened || editingMajor !== null}
        onClose={() => {
          setAddModalOpened(false);
          setEditingMajor(null);
        }}
        centered
        size="80%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {addModalOpened && (
          <AddMajorCard
            onCancel={() => setAddModalOpened(false)}
            onSave={(data: MajorFormData) => {
              console.log('Add major:', data);
              setAddModalOpened(false);
              reload();
            }}
          />
        )}
        {editingMajor && (
          <EditMajorCard
            major={editingMajor}
            onCancel={() => setEditingMajor(null)}
            onSave={() => {
              setEditingMajor(null);
              reload();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
