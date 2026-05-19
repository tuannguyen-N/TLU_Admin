import {
    Loader,
    Center,
    Table,
    Badge,
    Group,
    ActionIcon,
    Tooltip,
    Button,
    Modal,
    RingProgress,
    SimpleGrid,
    Text,
} from '@mantine/core';
import {
    IconBook,
    IconUser,
    IconCalendar,
    IconHash,
    IconUsers,
    IconClock,
    IconPencil,
    IconTrash,
    IconPlus,
    IconQrcode,
    IconChartBar,
} from '@tabler/icons-react';
import { QRCode } from 'react-qr-code';
import type { AttendanceStatistics, CourseClassDetail, Schedule } from '../types';
import classes from './CourseClassDetailCard.module.css';

interface Props {
    detail: CourseClassDetail;
    schedules: Schedule[];
    schedulesLoading: boolean;
    attendanceStats: AttendanceStatistics | null;
    attendanceLoading: boolean;
    attendanceError: string | null;
    qrToken: string | null;
    qrLoading: boolean;
    qrError: string | null;
    qrOpened: boolean;
    onEditSchedule: (schedule: Schedule) => void;
    onDeleteSchedule: (scheduleId: number) => void;
    onAddSchedule: () => void;
    onCreateAttendanceQr: () => void;
    onCloseQr: () => void;
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

const formatRate = (value: number) => Number.isFinite(value) ? `${value.toFixed(2)}%` : '0%';

const clampRate = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value));
};

export function CourseClassDetailCard({
    detail,
    schedules,
    schedulesLoading,
    attendanceStats,
    attendanceLoading,
    attendanceError,
    qrToken,
    qrLoading,
    qrError,
    qrOpened,
    onEditSchedule,
    onDeleteSchedule,
    onAddSchedule,
    onCreateAttendanceQr,
    onCloseQr,
}: Props) {
    const totalStudents = attendanceStats?.students.length ?? 0;
    const totalSessions = attendanceStats?.totalSessions ?? 0;
    const totalPresent = attendanceStats?.students.reduce((sum, s) => sum + s.presentCount, 0) ?? 0;
    const totalAbsent = attendanceStats?.students.reduce((sum, s) => sum + s.absentCount, 0) ?? 0;
    const averageAttendanceRate = totalStudents
        ? (attendanceStats?.students.reduce((sum, s) => sum + s.attendanceRate, 0) ?? 0) / totalStudents
        : 0;

    return (
        <div className={classes.page}>
            <div className={classes.pageHeader}>
                <div>
                    <h1 className={classes.pageTitle}>Chi tiết lớp học phần</h1>
                    <p className={classes.pageSubtitle}>
                        Thông tin chi tiết của lớp học phần {detail.classCode}
                    </p>
                </div>
                <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconQrcode size={14} />}
                    onClick={onCreateAttendanceQr}
                    loading={qrLoading}
                >
                    Tạo QR điểm danh
                </Button>
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

            <div className={classes.section}>
                <div className={classes.sectionTitle}>
                    <div className={classes.sectionIcon}>
                        <IconChartBar size={18} />
                    </div>
                    <span className={classes.sectionNum}>5.</span>
                    <span className={classes.sectionText}>Thống kê chuyên cần</span>
                </div>

                {attendanceLoading ? (
                    <Center py={20}>
                        <Loader size="sm" />
                    </Center>
                ) : attendanceError ? (
                    <Text c="red" size="sm">{attendanceError}</Text>
                ) : !attendanceStats || attendanceStats.students.length === 0 ? (
                    <div className={classes.emptySchedule}>Chưa có dữ liệu chuyên cần</div>
                ) : (
                    <>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="md">
                            <div className={classes.statCard}>
                                <span className={classes.statLabel}>Tổng sinh viên</span>
                                <span className={classes.statValue}>{totalStudents}</span>
                            </div>
                            <div className={classes.statCard}>
                                <span className={classes.statLabel}>Tổng buổi học</span>
                                <span className={classes.statValue}>{totalSessions}</span>
                            </div>
                            <div className={classes.statCard}>
                                <span className={classes.statLabel}>Lượt có mặt</span>
                                <span className={classes.statValue}>{totalPresent}</span>
                            </div>
                            <div className={classes.statCard}>
                                <span className={classes.statLabel}>Lượt vắng mặt</span>
                                <span className={classes.statValue}>{totalAbsent}</span>
                            </div>
                        </SimpleGrid>

                        <div className={classes.attendanceOverview}>
                            <RingProgress
                                size={140}
                                thickness={12}
                                roundCaps
                                sections={[{ value: clampRate(averageAttendanceRate), color: 'blue' }]}
                                label={
                                    <Text size="xs" ta="center" fw={700}>
                                        {formatRate(averageAttendanceRate)}
                                    </Text>
                                }
                            />
                            <div className={classes.attendanceRateInfo}>
                                <Text fw={700}>Tỷ lệ chuyên cần trung bình</Text>
                                <Text size="sm" c="dimmed">
                                    Tính trên toàn bộ sinh viên trong lớp học phần.
                                </Text>
                            </div>
                        </div>

                        <Table striped highlightOnHover withTableBorder>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Mã SV</Table.Th>
                                    <Table.Th>Họ tên</Table.Th>
                                    <Table.Th>Có mặt</Table.Th>
                                    <Table.Th>Vắng mặt</Table.Th>
                                    <Table.Th>Tỷ lệ</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {attendanceStats.students.map((student) => (
                                    <Table.Tr key={student.studentCode}>
                                        <Table.Td>{student.studentCode}</Table.Td>
                                        <Table.Td>{student.studentName}</Table.Td>
                                        <Table.Td>{student.presentCount}</Table.Td>
                                        <Table.Td>{student.absentCount}</Table.Td>
                                        <Table.Td>
                                            <Group gap={8} wrap="nowrap">
                                                <div className={classes.tableProgressWrap}>
                                                    <div
                                                        className={classes.tableProgressBar}
                                                        style={{ width: `${clampRate(student.attendanceRate)}%` }}
                                                    />
                                                </div>
                                                <span>{formatRate(student.attendanceRate)}</span>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </>
                )}
            </div>

            <Modal opened={qrOpened} onClose={onCloseQr} centered title="QR điểm danh" size="sm">
                {qrLoading ? (
                    <Center py={20}>
                        <Loader size="sm" />
                    </Center>
                ) : qrError ? (
                    <Text c="red" size="sm">{qrError}</Text>
                ) : qrToken ? (
                    <div className={classes.qrWrap}>
                        <div className={classes.qrBox}>
                            <QRCode value={qrToken} size={220} />
                        </div>
                        <Text size="xs" c="dimmed" ta="center">
                            QR được tạo từ phiên điểm danh hiện tại của lớp học phần.
                        </Text>
                    </div>
                ) : (
                    <Text size="sm" c="dimmed">Chưa có dữ liệu QR.</Text>
                )}
            </Modal>
        </div>
    );
}
