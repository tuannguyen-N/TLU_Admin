import { Loader, Center, Table, Badge, Group, ActionIcon, Tooltip, Button } from '@mantine/core';
import {
    IconBook, IconUser, IconCalendar, IconHash, IconUsers, IconClock, IconPencil, IconTrash, IconPlus
} from '@tabler/icons-react';
import type { CourseClassDetail, Schedule } from '../types';
import classes from './CourseClassDetailCard.module.css';

interface Props {
    detail: CourseClassDetail;
    schedules: Schedule[];
    schedulesLoading: boolean;
    onEditSchedule: (schedule: Schedule) => void;
    onDeleteSchedule: (scheduleId: number) => void;
    onAddSchedule: () => void;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number | boolean | undefined }) => (
    <div className={classes.infoRow}>
        <div className={classes.infoIcon}>
            <Icon size={18} />
        </div>
        <div className={classes.infoContent}>
            <span className={classes.infoLabel}>{label}</span>
            <span className={classes.infoValue}>{value ?? '-'}</span>
        </div>
    </div>
);

const dayOfWeekMap: Record<number, string> = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
    7: 'Chủ nhật',
};

export function CourseClassDetailCard({ detail, schedules, schedulesLoading, onEditSchedule, onDeleteSchedule, onAddSchedule }: Props) {
    return (
        <div className={classes.page}>
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Chi tiết lớp học phần</h1>
                <p className={classes.pageSubtitle}>
                    Thông tin chi tiết của lớp học phần {detail.classCode}
                </p>
            </div>

            <div className={classes.section}>
                <div className={classes.sectionTitle}>
                    <div className={classes.sectionIcon}>
                        <IconBook size={18} />
                    </div>
                    <span className={classes.sectionNum}>1.</span>
                    <span className={classes.sectionText}>Thông tin lớp học phần</span>
                </div>
                <div className={classes.infoGrid}>
                    <InfoRow icon={IconHash} label="Mã lớp" value={detail.classCode} />
                    <InfoRow icon={IconBook} label="Tên lớp" value={detail.className} />
                    <InfoRow icon={IconUsers} label="Sĩ số" value={detail.capacity} />
                    <InfoRow icon={IconHash} label="Mã môn" value={detail.subjectCode} />
                    <InfoRow icon={IconBook} label="Tên môn" value={detail.subjectName} />
                </div>
            </div>

            <div className={classes.section}>
                <div className={classes.sectionTitle}>
                    <div className={classes.sectionIcon}>
                        <IconUser size={18} />
                    </div>
                    <span className={classes.sectionNum}>2.</span>
                    <span className={classes.sectionText}>Thông tin giảng viên</span>
                </div>
                <div className={classes.infoGrid}>
                    <InfoRow icon={IconHash} label="Mã giảng viên" value={detail.lecturerCode} />
                    <InfoRow icon={IconUser} label="Tên giảng viên" value={detail.lecturerName} />
                </div>
            </div>

            <div className={classes.section}>
                <div className={classes.sectionTitle}>
                    <div className={classes.sectionIcon}>
                        <IconCalendar size={18} />
                    </div>
                    <span className={classes.sectionNum}>3.</span>
                    <span className={classes.sectionText}>Thông tin học kỳ</span>
                </div>
                <div className={classes.infoGrid}>
                    <InfoRow icon={IconCalendar} label="Học kỳ" value={detail.semester.semesterName} />
                    <InfoRow icon={IconHash} label="Mã học kỳ" value={detail.semester.semesterCode} />
                    <InfoRow icon={IconCalendar} label="Năm học" value={detail.semester.academicYears} />
                    <InfoRow icon={IconCalendar} label="Ngày bắt đầu" value={detail.semester.startDate} />
                    <InfoRow icon={IconCalendar} label="Ngày kết thúc" value={detail.semester.endDate} />
                </div>
            </div>

            <div className={classes.section}>
                <div className={classes.scheduleHeader}>
                    <div className={classes.sectionTitle}>
                        <div className={classes.sectionIcon}>
                            <IconClock size={18} />
                        </div>
                        <span className={classes.sectionNum}>4.</span>
                        <span className={classes.sectionText}>Lịch học</span>
                    </div>
                    <Button
                        size="xs"
                        leftSection={<IconPlus size={14} />}
                        onClick={onAddSchedule}
                        style={{ backgroundColor: '#111827', color: '#fff' }}
                    >
                        Thêm lịch học
                    </Button>
                </div>

                {schedulesLoading ? (
                    <Center py={20}>
                        <Loader size="sm" />
                    </Center>
                ) : schedules.length === 0 ? (
                    <div className={classes.emptySchedule}>Chưa có lịch học</div>
                ) : (
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Thứ</Table.Th>
                                <Table.Th>Tiết</Table.Th>
                                <Table.Th>Giờ</Table.Th>
                                <Table.Th>Phòng</Table.Th>
                                <Table.Th style={{ width: 80 }}>Hành động</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {schedules.map((schedule) => (
                                <Table.Tr key={schedule.id}>
                                    <Table.Td>
                                        <Badge color="blue" variant="light">
                                            {dayOfWeekMap[schedule.dayOfWeek] || `Thứ ${schedule.dayOfWeek}`}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>Tiết {schedule.startPeriod} - {schedule.endPeriod}</Table.Td>
                                    <Table.Td>{schedule.startTime} - {schedule.endTime}</Table.Td>
                                    <Table.Td>{schedule.room}</Table.Td>
                                    <Table.Td>
                                        <Group gap={4} wrap="nowrap">
                                            <Tooltip label="Sửa" position="top">
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="yellow"
                                                    size="sm"
                                                    onClick={() => onEditSchedule(schedule)}
                                                >
                                                    <IconPencil size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                            <Tooltip label="Xóa" position="top">
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    size="sm"
                                                    onClick={() => onDeleteSchedule(schedule.id)}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </div>
        </div>
    );
}