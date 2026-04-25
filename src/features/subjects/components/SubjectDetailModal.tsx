import { Modal, Text, Badge, Loader, Center, Divider, Group, Stack, ScrollArea } from '@mantine/core';
import { IconBook, IconClock, IconAlertCircle, IconListCheck } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { fetchSubjectDetail } from '../services';
import type { SubjectDetail } from '../services';
import type { Subject } from '../types';
import classes from './SubjectDetailModal.module.css';

interface Props {
  subject: Subject | null;
  opened: boolean;
  onClose: () => void;
}

export function SubjectDetailModal({ subject, opened, onClose }: Props) {
  const [detail, setDetail] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subject || !opened) return;
    setDetail(null);
    setError(null);
    setLoading(true);
    fetchSubjectDetail(subject.id)
      .then(setDetail)
      .catch(() => setError('Không thể tải chi tiết môn học.'))
      .finally(() => setLoading(false));
  }, [subject, opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="55%"
      title={
        <Group gap={10}>
          <div>
            <div className={classes.pageTitle}>Chi tiết môn học</div>
            {subject && (
              <div className={classes.pageSubtitle}>{subject.subjectCode} — {subject.subjectName}</div>
            )}
          </div>
        </Group>
      }
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {loading ? (
        <Center py={60}><Loader size="md" /></Center>
      ) : error ? (
        <Center py={60}><Text c="red">{error}</Text></Center>
      ) : detail ? (
        <div className={classes.page}>

          {/* ── Section 1: Thông tin cơ bản ── */}
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <div className={classes.sectionIcon}><IconBook size={18} /></div>
              <span className={classes.sectionTitle}>Thông tin cơ bản</span>
            </div>
            <div className={classes.infoGrid}>
              <div className={classes.infoItem}>
                <span className={classes.label}>Mã môn</span>
                <Badge variant="light" color="blue" size="md" style={{ width: 'fit-content' }}>
                  {detail.subjectCode}
                </Badge>
              </div>
              <div className={classes.infoItem}>
                <span className={classes.label}>Tên môn học</span>
                <span className={classes.value}>{detail.subjectName}</span>
              </div>
              <div className={classes.infoItem}>
                <span className={classes.label}>Số tín chỉ</span>
                <span className={classes.value}>{detail.credits} tín chỉ</span>
              </div>
              <div className={classes.infoItem}>
                <span className={classes.label}>Hệ số</span>
                <span className={classes.value}>{detail.coefficient}</span>
              </div>
            </div>
          </div>

          {/* ── Section 2: Phân bổ giờ học ── */}
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <div className={classes.sectionIcon}><IconClock size={18} /></div>
              <span className={classes.sectionTitle}>Phân bổ giờ học</span>
            </div>
            <div className={classes.infoGrid}>
              <div className={classes.infoItem}>
                <span className={classes.label}>Giờ lý thuyết</span>
                <span className={classes.value}>
                  {detail.lectureHours || 0} giờ
                </span>
              </div>
              <div className={classes.infoItem}>
                <span className={classes.label}>Giờ thực hành</span>
                <span className={classes.value}>
                  {detail.practiceHours || 0} giờ
                </span>
              </div>
            </div>
          </div>

          {/* ── Section 3: Môn tiên quyết ── */}
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <div className={classes.sectionIcon}><IconListCheck size={18} /></div>
              <span className={classes.sectionTitle}>Môn tiên quyết</span>
            </div>
            {/* Section 3: Môn tiên quyết */}
            {(detail.prerequisiteGroups ?? []).length === 0 ? (
              <p className={classes.emptyText}>Không có môn tiên quyết</p>
            ) : (
              <Stack gap={10}>
                {(detail.prerequisiteGroups ?? []).map((group) => (
                  <div key={group.id} className={classes.groupCard}>
                    <div className={classes.groupCardHeader}>
                      <span className={classes.groupCardTitle}>{group.description}</span>
                      <Badge variant="outline" color="indigo" size="sm">
                        Hoàn thành tối thiểu {group.minSubjectsRequired} môn
                      </Badge>
                    </div>
                    <div className={classes.badgeList}>
                      {(group.items ?? []).map((item) => ( 
                        <Badge key={item.subjectCode} variant="light" color="violet" size="sm">
                          {item.subjectCode} — {item.subjectName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </Stack>
            )}
          </div>

          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <div className={classes.sectionIcon}><IconAlertCircle size={18} /></div>
              <span className={classes.sectionTitle}>Điều kiện đăng ký</span>
            </div>
            {(detail.enrollmentConditions ?? []).length === 0 ? (
              <p className={classes.emptyText}>Không có điều kiện đăng ký</p>
            ) : (
              <Stack gap={8}>
                {(detail.enrollmentConditions ?? []).map((cond) => (
                  <div key={cond.id} className={classes.conditionRow}>
                    <span className={classes.conditionDesc}>{cond.description}</span>
                    <Badge variant="filled" color="orange" size="sm">
                      {cond.conditionType} {cond.conditionOperator} {cond.conditionValue}
                    </Badge>
                  </div>
                ))}
              </Stack>
            )}
          </div>

        </div>
      ) : null}
    </Modal>
  );
}