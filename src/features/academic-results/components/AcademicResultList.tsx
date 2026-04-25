import { useState, Fragment } from 'react';
import {
  Avatar, Pagination, Group, Text, Button, ActionIcon, Tooltip,
  Loader, Center, Modal
} from '@mantine/core';
import {
  IconArrowLeft, IconFileImport, IconPlus, IconRefresh,
  IconChevronDown, IconChevronRight, IconPencil
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { importAcademicResultsFromExcel } from '../../academic-results/services';
import { EditAcademicResultCard } from './EditAcademicResultCard';
import type { AcademicResult, SubjectResult } from '../types';
import classes from './AcademicResultList.module.css';

interface Props {
  facultyCode: string;
  facultyName: string;
  academicResults: AcademicResult[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  onPage: (p: number) => void;
  onBack: () => void;
  onReload: () => void;
  onAddResult: () => void;
  onImportExcel: () => void;
}

export function AcademicResultList({
  facultyCode,
  facultyName,
  academicResults,
  loading,
  error,
  page,
  totalPages,
  totalElements,
  onPage,
  onBack,
  onReload,
  onAddResult,
}: Props) {
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectResult | null>(null);
  const [editingSemesterName, setEditingSemesterName] = useState<string>('');

  const handleRefresh = () => {
    onReload();
  };

  const handleImportExcel = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await importAcademicResultsFromExcel(file);
        notifications.show({
          title: 'Thành công',
          message: 'Import kết quả học tập từ Excel thành công',
          color: 'green',
        });
        onReload();
      } catch (err) {
        notifications.show({
          title: 'Lỗi',
          message: 'Import kết quả học tập thất bại',
          color: 'red',
        });
      }
    };

    input.click();
  };

  const toggleExpand = (studentId: number) => {
    setExpandedStudent(prev => prev === studentId ? null : studentId);
  };

  const getCumulativeGpa = (result: AcademicResult): number | null => {
    let totalCredits = 0;
    let weightedScore4 = 0;

    for (const program of result.studyPrograms) {
      for (const semester of program.semesterResults) {
        for (const subject of semester.subjectResults) {
          totalCredits += subject.credits;
          weightedScore4 += subject.score4 * subject.credits;
        }
      }
    }

    if (totalCredits === 0) return null;
    return weightedScore4 / totalCredits;
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
            <h2 className={classes.title}>Kết quả học tập</h2>
            <p className={classes.subtitle}>Khoa {facultyName} • {totalElements} sinh viên</p>
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
              variant="outline"
              color="dark"
              size="sm"
              leftSection={<IconFileImport size={16} />}
              onClick={handleImportExcel}
            >
              Import từ Excel
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              size="sm"
              onClick={onAddResult}
              style={{ backgroundColor: '#111827', color: '#fff' }}
            >
              Thêm kết quả
            </Button>
          </Group>
        </div>
      </div>

      {loading ? (
        <Center py={60}>
          <Loader size="md" />
        </Center>
      ) : error ? (
        <Center py={60}>
          <Text c="red">{error}</Text>
        </Center>
      ) : (
        <>
          <div className={classes.tableWrapper}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th style={{ width: 48 }}></th>
                  <th style={{ minWidth: 200 }}>Sinh viên</th>
                  <th style={{ width: 80 }}>Khóa</th>
                  <th style={{ width: 80 }}>CTDT</th>
                  <th style={{ width: 100 }}>Trạng thái</th>
                  <th style={{ width: 120 }}>GPA hiện tại</th>
                </tr>
              </thead>
              <tbody>
                {academicResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={classes.empty}>
                      Không tìm thấy kết quả học tập nào
                    </td>
                  </tr>
                ) : (
                  academicResults.map((result) => {
                    const cumulativeGpa = getCumulativeGpa(result);
                    const isExpanded = expandedStudent === result.studentId;
                    const totalPrograms = result.studyPrograms.length;
                    const isPass = result.studyPrograms.some(sp =>
                      sp.semesterResults.some(sr =>
                        sr.subjectResults.some(sub => sub.isPass)
                      )
                    );

                    return (
                      <Fragment key={result.studentId}>
                        <tr className={classes.row}>
                          <td>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={() => toggleExpand(result.studentId)}
                            >
                              {isExpanded ? (
                                <IconChevronDown size={16} />
                              ) : (
                                <IconChevronRight size={16} />
                              )}
                            </ActionIcon>
                          </td>
                          <td>
                            <Group gap={10} wrap="nowrap">
                              <Avatar size={36} radius="xl" color="blue" name={result.studentName} />
                              <div>
                                <Text size="sm" fw={600}>{result.studentName}</Text>
                                <Text size="xs" c="dimmed">{result.studentCode}</Text>
                              </div>
                            </Group>
                          </td>
                          <td style={{ textAlign: 'center' }}>{result.startYear}</td>
                          <td style={{ textAlign: 'center' }}>{totalPrograms}</td>
                          <td>
                            {isPass ? (
                              <span className={classes.passBadge}>Đạt</span>
                            ) : (
                              <span className={classes.failBadge}>Chưa đạt</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>{cumulativeGpa?.toFixed(2) ?? '—'}</td>
                        </tr>
                        {isExpanded && (
                          <tr className={classes.expandedRow}>
                            <td colSpan={6}>
                              <div className={classes.expandedContent}>
                                {result.studyPrograms.map((program) => (
                                  <div key={program.studyProgramCode} className={classes.programSection}>
                                    <p className={classes.programTitle}>
                                      {program.studyProgramName} ({program.studyProgramCode})
                                    </p>
                                    {program.semesterResults.map((semester) => (
                                      <div key={semester.semester}>
                                        <span className={classes.semesterChip}>{semester.semester}</span>
                                        <table className={classes.subjectTable}>
                                          <thead>
                                            <tr>
                                              <th style={{ width: 200 }}>Môn học</th>
                                              <th style={{ width: 50, textAlign: 'center' }}>TC</th>
                                              <th style={{ width: 65, textAlign: 'center' }}>CC</th>
                                              <th style={{ width: 65, textAlign: 'center' }}>GK</th>
                                              <th style={{ width: 65, textAlign: 'center' }}>CK</th>
                                              <th style={{ textAlign: 'center' }}>Kết quả</th>
                                              <th style={{ width: 60, textAlign: 'center' }}>Hành động</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {semester.subjectResults.map((sub) => (
                                              <tr key={sub.subjectCode}>
                                                <td>
                                                  <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{sub.subjectCode}</div>
                                                  <div style={{ fontSize: 12, color: '#6B7280' }}>{sub.subjectName}</div>
                                                </td>
                                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{sub.credits}</td>
                                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{sub.attendanceScore.toFixed(1)}</td>
                                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{sub.midtermScore.toFixed(1)}</td>
                                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{sub.finalScore.toFixed(1)}</td>
                                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{sub.letterGrade}</div>
                                                  <div style={{ fontSize: 12, color: '#6B7280' }}>{sub.score10.toFixed(1)} / {sub.score4.toFixed(1)}</div>
                                                </td>
                                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                  {sub.id && (
                                                    <Tooltip label="Sua diem">
                                                      <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        size="sm"
                                                        onClick={() => {
                                                          setEditingSubject(sub);
                                                          setEditingSemesterName(semester.semester);
                                                        }}
                                                      >
                                                        <IconPencil size={16} />
                                                      </ActionIcon>
                                                    </Tooltip>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                        {semester.semesterSummary && (
                                          <div className={classes.semesterSummary}>
                                            <div className={classes.summaryItem}>
                                              <span className={classes.summaryLabel}>TC Đăng ký:</span>
                                              <span className={classes.summaryValue}>{semester.semesterSummary.creditsRegistered}</span>
                                            </div>
                                            <div className={classes.summaryItem}>
                                              <span className={classes.summaryLabel}>TC Đạt:</span>
                                              <span className={classes.summaryValue}>{semester.semesterSummary.creditsPassed}</span>
                                            </div>
                                            <div className={classes.summaryItem}>
                                              <span className={classes.summaryLabel}>GPA HK:</span>
                                              <span className={classes.gpaValue}>{semester.semesterSummary.semesterGpa?.toFixed(2) ?? '-'}</span>
                                            </div>
                                            <div className={classes.summaryItem}>
                                              <span className={classes.summaryLabel}>ĐRL:</span>
                                              <span className={classes.summaryValue}>{semester.semesterSummary.conductScore}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={classes.paginationWrapper}>
              <Pagination
                value={page + 1}
                onChange={(p) => onPage(p - 1)}
                total={totalPages}
                size="sm"
              />
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
              onReload();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
