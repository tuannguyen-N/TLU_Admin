import { useState } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { useSemesters } from './hooks/useSemesters';
import { SemesterList } from './components/SemesterList';
import { AddSemesterCard } from './components/AddSemesterCard';
import type { SemesterFormData } from './types';
import classes from './SemestersPage.module.css';

export function SemestersPage() {
    const [addModalOpened, setAddModalOpened] = useState(false);

    const {
        semesters,
        loading,
        error,
        page,
        setPage,
        totalPages,
        totalElements,
        reload,
        handleDelete,
    } = useSemesters();

    const handleSaveSemester = (_data: SemesterFormData) => {
        setAddModalOpened(false);
        reload();
    };

    return (
        <div className={classes.page}>
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Học kỳ</h1>
                <p className={classes.pageDesc}>
                    Quản lý các học kỳ trong hệ thống. Mỗi năm học có tối đa 3 học kỳ (Kỳ 1, Kỳ 2, Học kỳ phụ).
                </p>
            </div>

            <SemesterList
                semesters={semesters}
                loading={loading}
                error={error}
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onPage={setPage}
                onReload={reload}
                onAddSemester={() => setAddModalOpened(true)}
                onDeleteConfirm={handleDelete}
            />

            <Modal
                opened={addModalOpened}
                onClose={() => setAddModalOpened(false)}
                size="60%"
                withCloseButton={false}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                <AddSemesterCard
                    onCancel={() => setAddModalOpened(false)}
                    onSave={handleSaveSemester}
                />
            </Modal>
        </div>
    );
}