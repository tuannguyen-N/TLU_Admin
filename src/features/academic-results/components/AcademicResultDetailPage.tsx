import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Select,
  Text,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck, IconPencil, IconRefresh, IconTrash, IconX } from '@tabler/icons-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { EditAcademicResultCard } from './EditAcademicResultCard';
import { deleteAcademicResultAPI, fetchAcademicResults } from '../services';
import type { AcademicResult, SemesterResult, StudyProgram, SubjectResult } from '../types';
import classes from './AcademicResultDetailPage.module.css';

interface DetailLocationState {
  facultyCode?: string;
  facultyName?: string;
  academicResult?: AcademicResult;
}

function getSemesterOrderKey(label: string): number {
  const lower = label.toLowerCase();
  const semesterMatch = lower.match(/hk\s*(\d+)/i);
  const yearMatch = lower.match(/(\d{4})\s*-\s*(\d{4})/);

  const semesterNo = semesterMatch ? Number(semesterMatch[1]) : 0;
  const startYear = yearMatch ? Number(yearMatch[1]) : 0;

  return startYear * 10 + semesterNo;
}

export function AcademicResultDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { facultyCode = '', studentId = '' } = useParams();

  const locationState = (location.state ?? {}) as DetailLocationState;

  const [studentResult, setStudentResult] = useState<AcademicResult | null>(locationState.academicResult ?? null);
  const [loadingStudent, setLoadingStudent] = useState(!locationState.academicResult);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedProgramCode, setSelectedProgramCode] = useState<string>(
    locationState.academicResult?.studyPrograms[0]?.studyProgramCode ?? ''
  );
  const [editingSubject, setEditingSubject] = useState<SubjectResult | null>(null);
  const [editingSemesterName, setEditingSemesterName] = useState<string>('');
  const [deletingSubjectId, setDeletingSubjectId] = useState<number | null>(null);

  const studentIdNumber = useMemo(() => Number(studentId), [studentId]);

  const loadStudentResult = useCallback(async () => {
    if (!facultyCode || !Number.isFinite(studentIdNumber) || studentIdNumber <= 0) {
      setLoadError('Thiếu thông tin sinh viên để hiển thị chi tiết.');
      setLoadingStudent(false);
      return;
    }

    setLoadingStudent(true);
    setLoadError(null);

    try {
      let page = 0;
      let totalPages = 1;
      let found: AcademicResult | null = null;

      while (page < totalPages && !found) {
        const response = await fetchAcademicResults({
          khoa: facultyCode,
          page,
          size: 100,
        });

        found = response.academicResults.find((item) => item.studentId === studentIdNumber) ?? null;
        totalPages = response.totalPages;
        page += 1;
      }

      if (!found) {
        setLoadError('Không tìm thấy dữ liệu chi tiết của sinh viên.');
        setStudentResult(null);
        return;
      }

      setStudentResult(found);
      setSelectedProgramCode((current) => current || found.studyPrograms[0]?.studyProgramCode || '');
    } catch (error) {
      console.error('[AcademicResultDetailPage] load error:', error);
      setLoadError('Không thể tải dữ liệu chi tiết kết quả học tập.');
      setStudentResult(null);
    } finally {
      setLoadingStudent(false);
    }
  }, [facultyCode, studentIdNumber]);

  useEffect(() => {
    if (!locationState.academicResult) {
      loadStudentResult();
      return;
    }

    setStudentResult(locationState.academicResult);
    setSelectedProgramCode(locationState.academicResult.studyPrograms[0]?.studyProgramCode ?? '');
    setLoadingStudent(false);
  }, [locationState.academicResult, loadStudentResult]);

  const selectedProgram: StudyProgram | null = useMemo(() => {
    if (!studentResult) return null;
    return (
      studentResult.studyPrograms.find((program) => program.studyProgramCode === selectedProgramCode)
      ?? studentResult.studyPrograms[0]
      ?? null
    );
  }, [studentResult, selectedProgramCode]);

  const sortedSemesterResults = useMemo<SemesterResult[]>(() => {
    if (!selectedProgram) return [];
    return [...selectedProgram.semesterResults].sort(
      (a, b) => getSemesterOrderKey(a.semester) - getSemesterOrderKey(b.semester)
    );
  }, [selectedProgram]);

  const programSummary = useMemo(() => {
    if (!selectedProgram) {
      return { totalCreditsAccumulated: 0, gpa: null as number | null };
    }

    let totalCreditsAccumulated = 0;
    let weightedScore4 = 0;

    for (const semester of selectedProgram.semesterResults) {
      for (const subject of semester.subjectResults) {
        if (!subject.isPass) continue;
        totalCreditsAccumulated += subject.credits;
        weightedScore4 += subject.score4 * subject.credits;
      }
    }

    return {
      totalCreditsAccumulated,
      gpa: totalCreditsAccumulated > 0 ? weightedScore4 / totalCreditsAccumulated : null,
    };
  }, [selectedProgram]);

  const handleDeleteSubject = async (subject: SubjectResult) => {
    if (!subject.id) return;

    const confirmed = window.confirm(`Xóa kết quả môn ${subject.subjectCode} - ${subject.subjectName}?`);
    if (!confirmed) return;

    setDeletingSubjectId(subject.id);
    try {
      await deleteAcademicResultAPI(subject.id);
      notifications.show({
        title: 'Thành công',
        message: 'Xóa kết quả học tập thành công',
        color: 'green',
      });
      await loadStudentResult();
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Xóa kết quả học tập thất bại',
        color: 'red',
      });
    } finally {
      setDeletingSubjectId(null);
    }
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <button
          className={classes.backBtn}
          onClick={() =>
            navigate('/academic-results', {
              state: {
                selectedFaculty: {
                  value: facultyCode,
                  label: locationState.facultyName || facultyCode,
                },
              },
            })
          }
        >
          <IconArrowLeft size={18} />
          <span>Quay lại</span>
        </button>
        <Group gap={8}>
          <Button
            variant="light"
            color="indigo"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            onClick={loadStudentResult}
          >
            Tải lại
          </Button>
        </Group>
      </div>

      {loadingStudent ? (
        <Center py={80}>
          <Loader size="md" />
        </Center>
      ) : loadError ? (
        <Center py={80}>
          <Text c="red">{loadError}</Text>
        </Center>
      ) : !studentResult ? (
        <Center py={80}>
          <Text c="dimmed">Không có dữ liệu chi tiết.</Text>
        </Center>
      ) : (
        <>
          <div className={classes.studentCard}>
            <h2 className={classes.title}>{studentResult.studentName}</h2>
            <p className={classes.subtitle}>
              MSV: {studentResult.studentCode} • Năm bắt đầu: {studentResult.startYear} • Khoa: {locationState.facultyName || facultyCode}
            </p>
          </div>

          <div className={classes.programFilter}>
            <Select
              label="Chọn chương trình đào tạo"
              placeholder="Chọn CTĐT"
              value={selectedProgram?.studyProgramCode ?? null}
              onChange={(value) => setSelectedProgramCode(value ?? '')}
              data={studentResult.studyPrograms.map((program) => ({
                value: program.studyProgramCode,
                label: `${program.studyProgramName} (${program.studyProgramCode})`,
              }))}
              searchable
              nothingFoundMessage="Không tìm thấy CTĐT"
            />
          </div>

          {!selectedProgram ? (
            <Center py={40}>
              <Text c="dimmed">Sinh viên chưa có dữ liệu CTĐT.</Text>
            </Center>
          ) : (
            <div className={classes.programSection}>
              <p className={classes.programTitle}>
                {selectedProgram.studyProgramName} ({selectedProgram.studyProgramCode})
              </p>

              {sortedSemesterResults.length === 0 ? (
                <Center py={24}>
                  <Text c="dimmed">Chưa có học kỳ nào trong CTĐT này.</Text>
                </Center>
              ) : (
                sortedSemesterResults.map((semester) => (
                  <div key={`${selectedProgram.studyProgramCode}-${semester.semester}`} className={classes.semesterBlock}>
                    <span className={classes.semesterChip}>{semester.semester}</span>
                    <table className={classes.subjectTable}>
                      <thead>
                        <tr>
                          <th style={{ width: 220 }}>Môn học</th>
                          <th style={{ width: 90, textAlign: 'center' }}>Số TC</th>
                          <th style={{ width: 90, textAlign: 'center' }}>Chuyên cần</th>
                          <th style={{ width: 90, textAlign: 'center' }}>Giữa kỳ</th>
                          <th style={{ width: 90, textAlign: 'center' }}>Cuối kỳ</th>
                          <th style={{ width: 100, textAlign: 'center' }}>Điểm hệ số 10</th>
                          <th style={{ width: 100, textAlign: 'center' }}>Điểm hệ số 4</th>
                          <th style={{ width: 100, textAlign: 'center' }}>Điểm chữ</th>
                          <th style={{ width: 90, textAlign: 'center' }}>Kết quả</th>
                          <th style={{ width: 100, textAlign: 'center' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semester.subjectResults.map((subject) => (
                          <tr key={`${semester.semester}-${subject.subjectCode}`}>
                            <td>
                              <div className={classes.subjectCode}>{subject.subjectCode}</div>
                              <div className={classes.subjectName}>{subject.subjectName}</div>
                            </td>
                            <td style={{ textAlign: 'center' }}>{subject.credits}</td>
                            <td style={{ textAlign: 'center' }}>{subject.attendanceScore.toFixed(1)}</td>
                            <td style={{ textAlign: 'center' }}>{subject.midtermScore.toFixed(1)}</td>
                            <td style={{ textAlign: 'center' }}>{subject.finalScore.toFixed(1)}</td>
                            <td style={{ textAlign: 'center' }}>{subject.score10.toFixed(1)}</td>
                            <td style={{ textAlign: 'center' }}>{subject.score4.toFixed(1)}</td>
                            <td style={{ textAlign: 'center' }}>{subject.letterGrade}</td>
                            <td style={{ textAlign: 'center' }}>
                              {subject.isPass ? (
                                <IconCheck size={18} className={classes.passIcon} />
                              ) : (
                                <IconX size={18} className={classes.failIcon} />
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <Group gap={6} justify="center">
                                {subject.id && (
                                  <Tooltip label="Sửa điểm">
                                    <ActionIcon
                                      variant="subtle"
                                      color="blue"
                                      size="sm"
                                      onClick={() => {
                                        setEditingSubject(subject);
                                        setEditingSemesterName(semester.semester);
                                      }}
                                    >
                                      <IconPencil size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                                {subject.id && (
                                  <Tooltip label="Xóa kết quả">
                                    <ActionIcon
                                      variant="subtle"
                                      color="red"
                                      size="sm"
                                      disabled={deletingSubjectId === subject.id}
                                      onClick={() => handleDeleteSubject(subject)}
                                    >
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </Group>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {semester.semesterSummary && (
                      <div className={classes.semesterSummary}>
                        <div className={classes.summaryItem}>
                          <span className={classes.summaryLabel}>Số TC đăng ký:</span>
                          <span className={classes.summaryValue}>{semester.semesterSummary.creditsRegistered}</span>
                        </div>
                        <div className={classes.summaryItem}>
                          <span className={classes.summaryLabel}>Số TC đạt:</span>
                          <span className={classes.summaryValue}>{semester.semesterSummary.creditsPassed}</span>
                        </div>
                        <div className={classes.summaryItem}>
                          <span className={classes.summaryLabel}>Điểm trung bình học kỳ:</span>
                          <span className={classes.gpaValue}>{semester.semesterSummary.semesterGpa?.toFixed(2) ?? '-'}</span>
                        </div>
                        <div className={classes.summaryItem}>
                          <span className={classes.summaryLabel}>Điểm rèn luyện:</span>
                          <span className={classes.summaryValue}>{semester.semesterSummary.conductScore ?? '-'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              <div className={classes.programFinalSummary}>
                <div className={classes.finalSummaryItem}>
                  <span className={classes.finalSummaryLabel}>GPA tổng kết</span>
                  <span className={classes.finalSummaryValue}>{programSummary.gpa?.toFixed(2) ?? '-'}</span>
                </div>
                <div className={classes.finalSummaryItem}>
                  <span className={classes.finalSummaryLabel}>Tổng số tín chỉ tích lũy</span>
                  <span className={classes.finalSummaryValue}>{programSummary.totalCreditsAccumulated}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        opened={editingSubject !== null}
        onClose={() => setEditingSubject(null)}
        title="Sửa điểm"
        size="lg"
        centered
      >
        {editingSubject && (
          <EditAcademicResultCard
            subjectResult={editingSubject}
            semesterName={editingSemesterName}
            onCancel={() => setEditingSubject(null)}
            onSave={() => {
              setEditingSubject(null);
              loadStudentResult();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
