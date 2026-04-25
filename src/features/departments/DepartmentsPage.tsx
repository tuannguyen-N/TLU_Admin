import { useState } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { Button, Group } from '@mantine/core';
import { FacultyCard } from '../students/components/FacultyCard';
import { DepartmentList } from './components/DepartmentList';
import { AddDepartmentCard } from './components/AddDepartmentCard';
import { useDepartments } from './hooks/useDepartments';
import type { Faculty } from '../students/types';
import classes from './DepartmentsPage.module.css';

export function DepartmentsPage() {
  const { faculties, loading, error, reload } = useDepartments();
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [addModalOpened, setAddModalOpened] = useState(false);

  return (
    <div className={classes.page}>
      {!selectedFaculty ? (
        <>
          <div className={classes.pageHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 className={classes.pageTitle}>Khoa / Bộ môn</h1>
                <p className={classes.pageDesc}>
                  Quản lý thông tin các khoa và bộ môn trong trường. Chọn một khoa để xem danh sách chi tiết.
                </p>
              </div>
              <Group gap={8}>
                <Button
                  variant="light"
                  color="gray"
                  size="sm"
                  onClick={reload}
                  loading={loading}
                >
                  Làm mới
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAddModalOpened(true)}
                  style={{ backgroundColor: '#111827', color: '#fff' }}
                >
                  Thêm khoa/bộ môn
                </Button>
              </Group>
            </div>
          </div>

          {loading && <p>Đang tải...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className={classes.grid}>
            {faculties.map((faculty) => (
              <FacultyCard
                key={faculty.id}
                faculty={faculty}
                onClick={setSelectedFaculty}
              />
            ))}
          </div>
        </>
      ) : (
        <DepartmentList
          faculty={selectedFaculty}
          onBack={() => setSelectedFaculty(null)}
          onReload={reload}
          onDepartmentUpdated={() => {
            reload();
            setSelectedFaculty(null);
          }}
        />
      )}

      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        size="60%"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <AddDepartmentCard
          onCancel={() => setAddModalOpened(false)}
          onSave={() => {
            setAddModalOpened(false);
            reload();
          }}
        />
      </Modal>
    </div>
  );
}