import { useState, useEffect } from 'react';
import { Modal, ScrollArea, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CourseClassList } from './components/CourseClassList';
import { AddCourseClassCard } from './components/AddCourseClassCard';
import { EditCourseClassCard } from './components/EditCourseClassCard';
import type { UpdateCourseClassPayload } from './components/EditCourseClassCard';

import { CourseClassDetailCard } from './components/CourseClassDetailCard';
import { ScheduleModal } from './components/ScheduleModal';
import { useCourseClasses } from './hooks/useCourseClasses';
import { fetchCourseClassDetailAPI, updateCourseClassAPI, fetchSchedulesAPI, updateScheduleAPI, deleteScheduleAPI, createSchedulesAPI } from './services';
import type { CourseClass, CourseClassFormData, CourseClassDetail, Schedule } from './types';
import type { UpdateSchedulePayload } from './services';
import classes from './CourseClassesPage.module.css';

export function CourseClassesPage() {
    const [selectedFaculty, setSelectedFaculty] = useState<string>('');
    const [facultiesLoaded, setFacultiesLoaded] = useState(false);
    const [addModalOpened, setAddModalOpened] = useState(false);
    const [editingCourseClass, setEditingCourseClass] = useState<CourseClassDetail | null>(null);
    const [editingLoading, setEditingLoading] = useState(false);
    const [editingError, setEditingError] = useState<string | null>(null);
    const [viewingCourseClass, setViewingCourseClass] = useState<CourseClass | null>(null);
    const [detail, setDetail] = useState<CourseClassDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [schedulesLoading, setSchedulesLoading] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [addingSchedule, setAddingSchedule] = useState(false);
    const [scheduleModalLoading, setScheduleModalLoading] = useState(false);

    const {
        courseClasses,
        loading,
        error,
        page,
        setPage,
        totalPages,
        reload,
        handleDelete,
        handleCreate,
        faculties,
        departments,
        lecturers,
        subjects,
    } = useCourseClasses(selectedFaculty);

    // Auto-select first faculty when loaded
    useEffect(() => {
        if (!selectedFaculty && faculties.length > 0 && !facultiesLoaded) {
            setSelectedFaculty(faculties[0].value);
            setFacultiesLoaded(true);
        }
    }, [faculties, selectedFaculty, facultiesLoaded]);

    const handleAddCourseClass = () => {
        setAddModalOpened(true);
    };

    const handleEditCourseClass = async (courseClass: CourseClass) => {
        setEditingLoading(true);
        setEditingError(null);
        setEditingCourseClass(null);

        try {
            const response = await fetchCourseClassDetailAPI(courseClass.id);
            setEditingCourseClass(response);
        } catch (err) {
            setEditingError(err instanceof Error ? err.message : 'Không thể tải chi tiết lớp học phần');
        } finally {
            setEditingLoading(false);
        }
    };

    const handleCloseEdit = () => {
        setEditingCourseClass(null);
        setEditingError(null);
    };

    const handleViewCourseClass = async (courseClass: CourseClass) => {
        setViewingCourseClass(courseClass);
        setDetailLoading(true);
        setDetailError(null);
        setDetail(null);
        setSchedules([]);
        setSchedulesLoading(true);

        try {
            const [detailResponse, schedulesResponse] = await Promise.all([
                fetchCourseClassDetailAPI(courseClass.id),
                fetchSchedulesAPI(courseClass.id),
            ]);
            setDetail(detailResponse);
            setSchedules(schedulesResponse);
        } catch (err) {
            setDetailError(err instanceof Error ? err.message : 'Không thể tải chi tiết lớp học phần');
        } finally {
            setDetailLoading(false);
            setSchedulesLoading(false);
        }
    };

    const handleCloseDetail = () => {
        setViewingCourseClass(null);
        setDetail(null);
        setDetailError(null);
        setSchedules([]);
        setEditingSchedule(null);
    };

    const handleEditSchedule = (schedule: Schedule) => {
        setEditingSchedule(schedule);
    };

    const handleCloseScheduleModal = () => {
        setEditingSchedule(null);
    };

    const handleUpdateSchedule = async (payload: UpdateSchedulePayload) => {
        if (!editingSchedule || !viewingCourseClass) return;
        setScheduleModalLoading(true);
        try {
            await updateScheduleAPI(editingSchedule.id, payload);
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật lịch học thành công',
                color: 'green',
            });
            // Reload schedules
            const newSchedules = await fetchSchedulesAPI(viewingCourseClass.id);
            setSchedules(newSchedules);
            setEditingSchedule(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Cập nhật lịch học thất bại';
            notifications.show({
                title: 'Lỗi',
                message: errorMessage,
                color: 'red',
            });
            throw err;
        } finally {
            setScheduleModalLoading(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId: number) => {
        if (!viewingCourseClass) return;
        try {
            await deleteScheduleAPI(scheduleId);
            notifications.show({
                title: 'Thành công',
                message: 'Xóa lịch học thành công',
                color: 'green',
            });
            // Reload schedules
            const newSchedules = await fetchSchedulesAPI(viewingCourseClass.id);
            setSchedules(newSchedules);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Xóa lịch học thất bại';
            notifications.show({
                title: 'Lỗi',
                message: errorMessage,
                color: 'red',
            });
            throw err;
        }
    };

    const handleAddSchedule = async (payload: UpdateSchedulePayload) => {
        if (!viewingCourseClass) return;
        setScheduleModalLoading(true);
        try {
            await createSchedulesAPI(viewingCourseClass.id, [payload]);
            notifications.show({
                title: 'Thành công',
                message: 'Thêm lịch học thành công',
                color: 'green',
            });
            // Reload schedules
            const newSchedules = await fetchSchedulesAPI(viewingCourseClass.id);
            setSchedules(newSchedules);
            setAddingSchedule(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Thêm lịch học thất bại';
            notifications.show({
                title: 'Lỗi',
                message: errorMessage,
                color: 'red',
            });
            throw err;
        } finally {
            setScheduleModalLoading(false);
        }
    };

    const handleOpenAddSchedule = () => {
        setAddingSchedule(true);
    };

    const handleCloseAddSchedule = () => {
        setAddingSchedule(false);
    };

    const handleSaveCourseClass = async (_data: CourseClassFormData) => {
        try {
            await handleCreate(_data);
            notifications.show({
                title: 'Thành công',
                message: 'Tạo lớp học phần thành công',
                color: 'green',
            });
            setAddModalOpened(false);
            reload();
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Tạo lớp học phần thất bại',
                color: 'red',
            });
        }
    };

    const handleUpdateCourseClass = async (payload: UpdateCourseClassPayload) => {
        if (!editingCourseClass) return;
        try {
            const sendPayload = {
                ...(payload as unknown as CourseClassFormData),
                lecturerCode:
                    (payload as any).lecturerCode ??
                    (editingCourseClass as any).lecturerCode ??
                    (editingCourseClass as any).lecturer?.code ??
                    '',
                subjectCode:
                    (payload as any).subjectCode ??
                    (editingCourseClass as any).subjectCode ??
                    (editingCourseClass as any).subject?.code ??
                    '',
                semesterCode:
                    (payload as any).semesterCode ??
                    (editingCourseClass as any).semesterCode ??
                    '',
            } as CourseClassFormData;

            await updateCourseClassAPI(editingCourseClass.id, sendPayload);
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật lớp học phần thành công',
                color: 'green',
            });
            handleCloseEdit();
            reload();
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: 'Cập nhật lớp học phần thất bại',
                color: 'red',
            });
            throw err;
        }
    };

    return (
        <div className={classes.page}>
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Lớp học phần</h1>
                <p className={classes.pageSubtitle}>
                    Quản lý thông tin các lớp học phần trong trường. Theo dõi và cập nhật danh sách lớp học phần theo từng khoa.
                </p>
            </div>

            <CourseClassList
                courseClasses={courseClasses}
                loading={loading}
                error={error}
                page={page}
                totalPages={totalPages}
                onPage={setPage}
                onReload={reload}
                onAddCourseClass={handleAddCourseClass}
                onEditCourseClass={handleEditCourseClass}
                onViewCourseClass={handleViewCourseClass}
                onDeleteConfirm={handleDelete}
                selectedFaculty={selectedFaculty}
                onFacultyChange={setSelectedFaculty}
                faculties={faculties}
            />

            <Modal
                opened={addModalOpened}
                onClose={() => setAddModalOpened(false)}
                centered
                size="60%"
                withCloseButton={false}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                <AddCourseClassCard
                    onCancel={() => setAddModalOpened(false)}
                    onSave={handleSaveCourseClass}
                    lecturers={lecturers}
                    departments={departments}
                    faculties={faculties}
                    selectedFaculty={selectedFaculty}
                    subjects={subjects}
                />
            </Modal>

            <Modal
                opened={editingCourseClass !== null || editingLoading || editingError !== null}
                onClose={handleCloseEdit}
                centered
                size="60%"
                withCloseButton={false}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {editingLoading ? (
                    <Center py={60}>
                        <Loader size="md" />
                    </Center>
                ) : editingError ? (
                    <Center py={60}>
                        <p style={{ color: 'red' }}>{editingError}</p>
                    </Center>
                ) : editingCourseClass ? (
                    <EditCourseClassCard
                        courseClass={editingCourseClass}
                        onCancel={handleCloseEdit}
                        onSave={handleUpdateCourseClass}
                        lecturers={lecturers}
                        departments={departments}
                        faculties={faculties}
                        selectedFaculty={selectedFaculty}
                        subjects={subjects}
                    />
                ) : null}
            </Modal>

            <Modal
                opened={viewingCourseClass !== null}
                onClose={handleCloseDetail}
                centered
                size="60%"
                scrollAreaComponent={ScrollArea.Autosize}
                withCloseButton={false}
            >
                {detailLoading ? (
                    <Center py={60}>
                        <Loader size="md" />
                    </Center>
                ) : detailError ? (
                    <Center py={60}>
                        <p style={{ color: 'red' }}>{detailError}</p>
                    </Center>
                ) : detail ? (
                    <CourseClassDetailCard
                        detail={detail}
                        schedules={schedules}
                        schedulesLoading={schedulesLoading}
                        onEditSchedule={handleEditSchedule}
                        onDeleteSchedule={handleDeleteSchedule}
                        onAddSchedule={handleOpenAddSchedule}
                    />
                ) : null}
            </Modal>

            <Modal
                opened={editingSchedule !== null}
                onClose={handleCloseScheduleModal}
                centered
                size="50%"
                withCloseButton={false}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {editingSchedule && (
                    <ScheduleModal
                        schedule={editingSchedule}
                        onCancel={handleCloseScheduleModal}
                        onSave={handleUpdateSchedule}
                        loading={scheduleModalLoading}
                    />
                )}
            </Modal>

            <Modal
                opened={addingSchedule}
                onClose={handleCloseAddSchedule}
                centered
                size="50%"
                withCloseButton={false}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                <ScheduleModal
                    onCancel={handleCloseAddSchedule}
                    onSave={handleAddSchedule}
                    loading={scheduleModalLoading}
                />
            </Modal>
        </div>
    );
}