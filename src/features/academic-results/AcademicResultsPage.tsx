import { useState } from 'react';
import { Modal } from '@mantine/core';
import {
  IconCode, IconBuildingBank, IconHeartbeat,
  IconTransfer, IconSocial, IconPlane,
  IconDeviceTv, IconMusic, IconUsers
} from '@tabler/icons-react';
import { useAcademicResults } from './hooks/useAcademicResults';
import { AcademicResultList } from './components/AcademicResultList';
import { AddAcademicResultCard } from './components/AddAcademicResultCard';
import { ImportAcademicResultCard } from './components/ImportAcademicResultCard';
import classes from './AcademicResultsPage.module.css';
import type { FacultyOption } from '../subjects/types';

const iconMap: Record<string, React.ComponentType<any>> = {
  laptop: IconCode,
  bank: IconBuildingBank,
  health: IconHeartbeat,
  translate: IconTransfer,
  social: IconSocial,
  travel: IconPlane,
  media: IconDeviceTv,
  music: IconMusic,
  users: IconUsers,
};

const colorMap: Record<string, string> = {
  CNTT: '#3B82F6',
  KTQL: '#10B981',
  KHSK: '#3ac2d8',
  KNN: '#EF4444',
  XHNV: '#6d0102',
  KDL: '#00715f',
  KTT: '#be4510',
  KAN: '#8B5CF6',
  PDT: '#6B7280',
};

export function AcademicResultsPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyOption | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const {
    academicResults,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    faculties,
    reload,
    handleAddResult,
    handleImportExcel,
  } = useAcademicResults(selectedFaculty?.value ?? '');

  const handleFacultySelect = (faculty: FacultyOption) => {
    setSelectedFaculty(faculty);
  };

  const handleBack = () => {
    setSelectedFaculty(null);
    setPage(0);
  };

  const handleAddSuccess = () => {
    setAddModalOpen(false);
    reload();
  };

  const handleImportSuccess = () => {
    setImportModalOpen(false);
    reload();
  };

  if (selectedFaculty) {
    return (
      <>
        <AcademicResultList
          facultyCode={selectedFaculty.value}
          facultyName={selectedFaculty.label}
          academicResults={academicResults}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPage={setPage}
          onBack={handleBack}
          onReload={reload}
          onAddResult={() => setAddModalOpen(true)}
          onImportExcel={() => setImportModalOpen(true)}
        />
        <Modal
          opened={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Thêm kết quả học tập"
          size="lg"
          centered
        >
          <AddAcademicResultCard
            onCancel={() => setAddModalOpen(false)}
            onSave={handleAddSuccess}
            khoa={selectedFaculty.value}
          />
        </Modal>
        <Modal
          opened={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          title="Import kết quả học tập từ Excel"
          size="lg"
          centered
        >
          <ImportAcademicResultCard
            onCancel={() => setImportModalOpen(false)}
            onSave={handleImportSuccess}
            khoa={selectedFaculty.value}
          />
        </Modal>
      </>
    );
  }

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Kết quả học tập</h1>
        <p className={classes.pageDesc}>Chọn khoa để xem danh sách kết quả học tập của sinh viên</p>
      </div>
      <div className={classes.facultyGrid}>
        {faculties.map((faculty) => {
          const Icon = iconMap[faculty.value.toLowerCase()] || IconUsers;
          const color = colorMap[faculty.value] || '#6B7280';
          return (
            <div
              key={faculty.value}
              className={classes.facultyCard}
              onClick={() => handleFacultySelect(faculty)}
            >
              <div
                className={classes.facultyIcon}
                style={{ backgroundColor: `${color}15`, color }}
              >
                <Icon />
              </div>
              <div className={classes.facultyInfo}>
                <p className={classes.facultyName}>{faculty.label}</p>
                <p className={classes.facultyDesc}>{faculty.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
