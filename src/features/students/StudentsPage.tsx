import { useState } from 'react';
import { Modal } from '@mantine/core';
import { useStudents } from './hooks/useStudents';
import { FacultyCard } from './components/FacultyCard';
import { StudentList } from './components/StudentList';
import { AddStudentCard } from './components/AddStudentcard';
import type { StudentFormData } from './components/AddStudentcard';
import classes from './StudentsPage.module.css';
import { ScrollArea } from '@mantine/core';

export function StudentsPage() {
    const {
        faculties,
        selectedFaculty,
        setSelectedFaculty,
        students,
        loading,
        error,
        page,
        setPage,
        totalPages,
        totalElements,
        reload,
    } = useStudents();

    const [addModalOpened, setAddModalOpened] = useState(false);

    return (
        <div className={classes.page}>
            {!selectedFaculty ? (
                <>
                    <div className={classes.pageHeader}>
                        <h1 className={classes.pageTitle}>Quản lý sinh viên</h1>
                        <p className={classes.pageDesc}>
                            Quản lý sinh viên theo đơn vị Khoa. Chọn một khoa để xem danh sách chi tiết và quản lý nhân sự.
                        </p>
                    </div>

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
                <StudentList
                    faculty={selectedFaculty}
                    students={students}
                    loading={loading}
                    error={error}
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onPage={setPage}
                    onBack={() => setSelectedFaculty(null)}
                    onReload={reload}
                    onAddStudent={() => setAddModalOpened(true)}
                />
            )}

            <Modal
                opened={addModalOpened}
                onClose={() => setAddModalOpened(false)}
                size="80%"
                withCloseButton={false}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                <AddStudentCard
                    onCancel={() => setAddModalOpened(false)}
                    onSave={(data: StudentFormData) => {
                        console.log('Add student:', data);
                        setAddModalOpened(false);
                    }}
                />
            </Modal>
        </div>
    );
}
