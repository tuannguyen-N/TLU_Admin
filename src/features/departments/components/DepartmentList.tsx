import { Group, Text, Button, Loader, Center, Modal, ActionIcon, Tooltip, Table } from '@mantine/core';
import { IconArrowLeft, IconPencil, IconTrash, IconUsers, IconPlus } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import type { Faculty } from '../../students/types';
import { deleteFaculty, getDepartmentsByFacultyCode, createDepartment, updateDepartment, deleteDepartment } from '../services';
import { EditDepartmentCard } from './EditDepartmentCard';
import classes from './DepartmentList.module.css';
import { AddSubDepartmentCard } from './AddSubDepartmentCard';
import { EditSubDepartmentCard } from './EditSubDepartmentCard';

interface DepartmentItem {
    id: number;
    departmentCode: string;
    departmentName: string;
    facultyCode: string;
    isActive: boolean;
}

interface Props {
    faculty: Faculty;
    loading?: boolean;
    error?: string | null;
    onReload?: () => void;
    onBack: () => void;
    onDepartmentUpdated: () => void;
}

export function DepartmentList({ faculty, loading, error, onBack, onDepartmentUpdated }: Props) {
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [departments, setDepartments] = useState<DepartmentItem[]>([]);
    const [deptLoading, setDeptLoading] = useState(false);
    const [deptError, setDeptError] = useState<string | null>(null);

    // Department CRUD states
    const [addDeptModalOpen, setAddDeptModalOpen] = useState(false);
    const [deletingDept, setDeletingDept] = useState<DepartmentItem | null>(null);
    const [deleteDeptModalOpen, setDeleteDeptModalOpen] = useState(false);
    const [deletingDeptLoading, setDeletingDeptLoading] = useState(false);

    // Form states
    const [deptForm, setDeptForm] = useState({ departmentCode: '', departmentName: '' });
    const [deptFormLoading, setDeptFormLoading] = useState(false);

    const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);

    const openEditDept = (dept: DepartmentItem) => setEditingDept(dept);


    const fetchDepartments = async () => {
        setDeptLoading(true);
        setDeptError(null);
        try {
            const data = await getDepartmentsByFacultyCode(faculty.facultyCode);
            setDepartments(data.filter((d) => d.isActive));
        } catch {
            setDeptError('Không thể tải danh sách bộ môn.');
        } finally {
            setDeptLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [faculty.facultyCode]);

    // Faculty handlers
    const handleEdit = (f: Faculty) => setEditingFaculty(f);
    const handleDeleteClick = (f: Faculty) => {
        setDeletingFaculty(f);
        setDeleteModalOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!deletingFaculty) return;
        setDeleting(true);
        try {
            await deleteFaculty(deletingFaculty.id);
            notifications.show({ title: 'Thành công', message: 'Xóa khoa thành công', color: 'green' });
            setDeleteModalOpen(false);
            onDepartmentUpdated();
        } catch {
            notifications.show({ title: 'Lỗi', message: 'Xóa khoa thất bại', color: 'red' });
        } finally {
            setDeleting(false);
        }
    };

    // Department handlers
    const openAddDept = () => {
        setDeptForm({ departmentCode: '', departmentName: '' });
        setAddDeptModalOpen(true);
    };

    const openDeleteDept = (dept: DepartmentItem) => {
        setDeletingDept(dept);
        setDeleteDeptModalOpen(true);
    };

    // Sửa handler
    const handleAddDeptSave = async () => {
        if (!deptForm.departmentCode.trim() || !deptForm.departmentName.trim()) {
            notifications.show({ title: 'Lỗi', message: 'Vui lòng nhập đầy đủ thông tin', color: 'red' });
            return;
        }
        setDeptFormLoading(true);
        try {
            await createDepartment({
                departmentCode: deptForm.departmentCode.trim(),
                departmentName: deptForm.departmentName.trim(),
                facultyId: faculty.id,  // tự truyền từ prop faculty
            });
            notifications.show({ title: 'Thành công', message: 'Thêm bộ môn thành công', color: 'green' });
            setAddDeptModalOpen(false);
            fetchDepartments();
        } catch {
            notifications.show({ title: 'Lỗi', message: 'Thêm bộ môn thất bại', color: 'red' });
        } finally {
            setDeptFormLoading(false);
        }
    };

    const handleEditDeptSave = async () => {
        if (!editingDept) return;
        if (!deptForm.departmentCode.trim() || !deptForm.departmentName.trim()) {
            notifications.show({ title: 'Lỗi', message: 'Vui lòng nhập đầy đủ thông tin', color: 'red' });
            return;
        }
        setDeptFormLoading(true);
        try {
            await updateDepartment(editingDept.id, {
                departmentCode: deptForm.departmentCode.trim(),
                departmentName: deptForm.departmentName.trim(),
            });
            notifications.show({ title: 'Thành công', message: 'Cập nhật bộ môn thành công', color: 'green' });
            setEditingDept(null);
            fetchDepartments();
        } catch {
            notifications.show({ title: 'Lỗi', message: 'Cập nhật bộ môn thất bại', color: 'red' });
        } finally {
            setDeptFormLoading(false);
        }
    };

    const handleDeleteDeptConfirm = async () => {
        if (!deletingDept) return;
        setDeletingDeptLoading(true);
        try {
            await deleteDepartment(deletingDept.id);
            notifications.show({ title: 'Thành công', message: 'Xóa bộ môn thành công', color: 'green' });
            setDeleteDeptModalOpen(false);
            fetchDepartments();
        } catch {
            notifications.show({ title: 'Lỗi', message: 'Xóa bộ môn thất bại', color: 'red' });
        } finally {
            setDeletingDeptLoading(false);
        }
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <button className={classes.backBtn} onClick={onBack}>
                    <IconArrowLeft size={18} />
                    <span>Quay lại</span>
                </button>
                <div className={classes.headerRight}>
                    <h2 className={classes.title}>Thông tin Bộ môn</h2>
                </div>
            </div>

            {loading ? (
                <Center py={60}><Loader size="md" /></Center>
            ) : error ? (
                <Center py={60}><Text c="red">{error}</Text></Center>
            ) : (
                <>
                    {/* Faculty card */}
                    <div className={classes.detailCard}>
                        <div className={classes.detailHeader}>
                            <div className={classes.iconWrapper} style={{ backgroundColor: `${faculty.color}18` }}>
                                <IconUsers size={32} color={faculty.color} stroke={1.5} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className={classes.detailName}>{faculty.name}</h3>
                                <p className={classes.detailCode}>Mã khoa: {faculty.facultyCode}</p>
                            </div>
                            <Group gap={4}>
                                <Tooltip label="Sửa khoa" position="top">
                                    <ActionIcon variant="subtle" color="yellow" size="md" onClick={() => handleEdit(faculty)}>
                                        <IconPencil size={18} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Xóa khoa" position="top">
                                    <ActionIcon variant="subtle" color="red" size="md" onClick={() => handleDeleteClick(faculty)}>
                                        <IconTrash size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </div>
                    </div>

                    {/* Department table */}
                    <div className={classes.tableSection}>
                        <div className={classes.tableTitleRow}>
                            <h4 className={classes.tableTitle}>Danh sách bộ môn</h4>
                            <Button
                                styles={{
                                    root: { backgroundColor: '#050C56' }
                                }}
                                leftSection={<IconPlus size={16} />} size="sm" onClick={openAddDept}>
                                Thêm bộ môn
                            </Button>
                        </div>

                        {deptLoading ? (
                            <Center py={40}><Loader size="sm" /></Center>
                        ) : deptError ? (
                            <Center py={40}><Text c="red">{deptError}</Text></Center>
                        ) : departments.length === 0 ? (
                            <Center py={40}><Text c="dimmed">Chưa có bộ môn nào trong khoa này.</Text></Center>
                        ) : (
                            <Table striped highlightOnHover withTableBorder withColumnBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th style={{ width: 50 }}>#</Table.Th>
                                        <Table.Th>Mã bộ môn</Table.Th>
                                        <Table.Th>Tên bộ môn</Table.Th>
                                        <Table.Th style={{ width: 90, textAlign: 'center' }}>Thao tác</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {departments.map((dept, index) => (
                                        <Table.Tr key={dept.id}>
                                            <Table.Td>{index + 1}</Table.Td>
                                            <Table.Td><Text fw={500} size="sm">{dept.departmentCode}</Text></Table.Td>
                                            <Table.Td>{dept.departmentName}</Table.Td>
                                            <Table.Td>
                                                <Group gap={4} justify="center">
                                                    <Tooltip label="Sửa" position="top">
                                                        <ActionIcon variant="subtle" color="yellow" size="sm" onClick={() => openEditDept(dept)}>
                                                            <IconPencil size={15} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa" position="top">
                                                        <ActionIcon variant="subtle" color="red" size="sm" onClick={() => openDeleteDept(dept)}>
                                                            <IconTrash size={15} />
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
                </>
            )}

            <Modal opened={editingFaculty !== null} onClose={() => setEditingFaculty(null)} size="60%" withCloseButton={false}>
                {editingFaculty && (
                    <EditDepartmentCard
                        faculty={editingFaculty}
                        onCancel={() => setEditingFaculty(null)}
                        onSave={() => { setEditingFaculty(null); onDepartmentUpdated(); }}
                    />
                )}
            </Modal>

            <Modal
                opened={addDeptModalOpen}
                onClose={() => setAddDeptModalOpen(false)}
                size="60%"
                withCloseButton={false}
            >
                <AddSubDepartmentCard
                    faculty={faculty}
                    onCancel={() => setAddDeptModalOpen(false)}
                    onSave={() => {
                        setAddDeptModalOpen(false);
                        fetchDepartments();
                    }}
                />
            </Modal>

            <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Xác nhận xóa khoa" centered>
                <Text mb="lg">
                    Bạn có chắc chắn muốn xóa khoa <strong>{deletingFaculty?.name}</strong> không?
                </Text>
                <Group justify="flex-end">
                    <Button variant="subtle" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>Huỷ</Button>
                    <Button color="red" onClick={handleDeleteConfirm} loading={deleting}>Xóa</Button>
                </Group>
            </Modal>

            <Modal
                opened={editingDept !== null}
                onClose={() => setEditingDept(null)}
                size="60%"
                withCloseButton={false}
            >
                {editingDept && (
                    <EditSubDepartmentCard
                        department={editingDept}
                        currentFacultyId={faculty.id}
                        onCancel={() => setEditingDept(null)}
                        onSave={() => {
                            setEditingDept(null);
                            fetchDepartments();
                        }}
                    />
                )}
            </Modal>

            <Modal opened={deleteDeptModalOpen} onClose={() => setDeleteDeptModalOpen(false)} title="Xác nhận xóa bộ môn" centered>
                <Text mb="lg">
                    Bạn có chắc chắn muốn xóa bộ môn <strong>{deletingDept?.departmentName}</strong> không?
                </Text>
                <Group justify="flex-end">
                    <Button variant="subtle" onClick={() => setDeleteDeptModalOpen(false)} disabled={deletingDeptLoading}>Huỷ</Button>
                    <Button color="red" onClick={handleDeleteDeptConfirm} loading={deletingDeptLoading}>Xóa</Button>
                </Group>
            </Modal>
        </div>
    );
}