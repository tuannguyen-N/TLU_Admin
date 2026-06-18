import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { calcSemesterSummary, fetchSemesters } from './services';
import { useRole } from '../../contexts/RoleContext';
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
};

export function AcademicResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state ?? {}) as { selectedFaculty?: FacultyOption };
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
  } = useAcademicResults(selectedFaculty?.value ?? '');

  const { role, initialized } = useRole();
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [semesters, setSemesters] = useState<Array<{ id: number; semesterName: string }>>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (locationState.selectedFaculty && !selectedFaculty) {
      setSelectedFaculty(locationState.selectedFaculty);
    }
  }, [locationState.selectedFaculty, selectedFaculty]);

  const handleFacultySelect = (faculty: FacultyOption) => {
    setSelectedFaculty(faculty);
  };

  const handleBack = () => {
    setSelectedFaculty(null);
    setPage(0);
    navigate('/academic-results', { replace: true, state: {} });
  };

  const handleAddSuccess = () => {
    setAddModalOpen(false);
    reload();
  };

  const handleImportSuccess = () => {
    setImportModalOpen(false);
    reload();
  };

  const openSummaryModal = async () => {
    setSummaryModalOpen(true);
    try {
      const s = await fetchSemesters();
      setSemesters(s.map(ss => ({ id: ss.id, semesterName: ss.semesterName })));
    } catch (err) {
      console.error('Failed to load semesters', err);
      setSemesters([]);
    }
  };

  const handleCalculateSummary = async () => {
    if (!selectedSemesterId) {
      alert('Vui lòng chọn học kỳ');
      return;
    }
    if (!confirm('Bạn có chắc muốn tính tổng kết cho học kỳ này?')) return;
    setCalculating(true);
    try {
      await calcSemesterSummary(selectedSemesterId);
      alert('Tính tổng kết học kỳ thành công');
      setSummaryModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert('Lỗi khi tính tổng kết: ' + (err?.message || String(err)));
    } finally {
      setCalculating(false);
    }
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
        {initialized && role === 'ADMIN' && (
          <div style={{ marginTop: 12 }}>
            <button
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #1f2937', background: '#111827', color: '#fff' }}
              onClick={openSummaryModal}
            >
              Tính tổng kết học kỳ (Admin)
            </button>
          </div>
        )}
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
      <Modal
        opened={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        title="Tính tổng kết học kỳ"
        size="md"
        centered
      >
        <div>
          <div style={{ marginBottom: 12 }}>
            <label>Học kỳ</label>
            <select
              value={selectedSemesterId ?? ''}
              onChange={(e) => setSelectedSemesterId(e.target.value ? Number(e.target.value) : null)}
              style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }}
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.semesterName}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setSummaryModalOpen(false)} style={{ padding: '8px 12px' }}>Hủy</button>
            <button onClick={handleCalculateSummary} disabled={calculating} style={{ padding: '8px 12px', background: '#111827', color: '#fff', borderRadius: 6 }}>
              {calculating ? 'Đang tính...' : 'Tính tổng kết'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Modal rendered at root of component to pick semester and trigger calculation
// (Mantine Modal can be placed anywhere inside component tree)

