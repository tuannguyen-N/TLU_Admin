import { useMemo } from 'react';
import {
  Avatar, Pagination, Group, Text, Button, Loader, Center,
} from '@mantine/core';
import {
  IconArrowLeft, IconFileImport, IconPlus, IconRefresh,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { AcademicResult } from '../types';
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
  onImportExcel,
}: Props) {
  const navigate = useNavigate();

  const gpaByStudentId = useMemo(() => {
    const map = new Map<number, number | null>();

    for (const result of academicResults) {
      const primaryProgram = result.studyPrograms[0];
      let totalCredits = 0;
      let weightedScore4 = 0;

      if (!primaryProgram) {
        map.set(result.studentId, null);
        continue;
      }

      for (const semester of primaryProgram.semesterResults) {
        for (const subject of semester.subjectResults) {
          if (!subject.isPass) continue;
          totalCredits += subject.credits;
          weightedScore4 += subject.score4 * subject.credits;
        }
      }

      map.set(result.studentId, totalCredits === 0 ? null : weightedScore4 / totalCredits);
    }

    return map;
  }, [academicResults]);

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
              onClick={onReload}
            >
              Làm mới
            </Button>
            <Button
              variant="outline"
              color="dark"
              size="sm"
              leftSection={<IconFileImport size={16} />}
              onClick={onImportExcel}
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
                  <th style={{ width: '34%' }}>Tên sinh viên</th>
                  <th className={classes.center} style={{ width: '22%' }}>Mã sinh viên</th>
                  <th className={classes.center} style={{ width: '16%' }}>Năm bắt đầu</th>
                  <th className={classes.center} style={{ width: '14%' }}>GPA</th>
                  <th className={classes.center} style={{ width: '14%' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {academicResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={classes.empty}>
                      Không tìm thấy kết quả học tập nào
                    </td>
                  </tr>
                ) : (
                  academicResults.map((result) => {
                    const cumulativeGpa = gpaByStudentId.get(result.studentId) ?? null;

                    return (
                      <tr key={result.studentId} className={classes.row}>
                        <td>
                          <Group gap={10} wrap="nowrap">
                            <Avatar size={36} radius="xl" color="blue" name={result.studentName} />
                            <Text size="sm" fw={600}>{result.studentName}</Text>
                          </Group>
                        </td>
                        <td className={`${classes.code} ${classes.center}`}>{result.studentCode}</td>
                        <td className={classes.center}>{result.startYear}</td>
                        <td className={classes.center}>{cumulativeGpa?.toFixed(2) ?? '—'}</td>
                        <td className={classes.center}>
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => {
                              navigate(`/academic-results/${facultyCode}/${result.studentId}`, {
                                state: {
                                  facultyCode,
                                  facultyName,
                                  academicResult: result,
                                },
                              });
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>
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
    </div>
  );
}
