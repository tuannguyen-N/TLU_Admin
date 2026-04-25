import { useState } from 'react';
import { Button, Group, ActionIcon, Tooltip, Modal, Text, Loader, Center } from '@mantine/core';
import { IconRefresh, IconEye, IconFile, IconTrash } from '@tabler/icons-react';
import { useApplications } from '../hooks/useApplications';
import { fetchApplicationDetail, updateApplicationStatus, deleteApplication } from '../services';
import { notifications } from '@mantine/notifications';
import type { Application, ApplicationDetail, ApplicationStatus } from '../types';
import classes from './ApplicationProcessingList.module.css';

const statusLabels: Record<ApplicationStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cls = status === 'APPROVED' ? classes.statusApproved
    : status === 'REJECTED' ? classes.statusRejected
    : classes.statusPending;
  return <span className={`${classes.statusBadge} ${cls}`}>{statusLabels[status]}</span>;
}

export function ApplicationProcessingList() {
  const { applications, loading, error, page, setPage, totalPages, totalElements, reload } = useApplications();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ApplicationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRefresh = () => {
    reload();
  };

  const handleViewDetail = async (app: Application) => {
    setLoadingDetail(true);
    setDetailModalOpen(true);
    try {
      const detail = await fetchApplicationDetail(app.id);
      setSelectedDetail(detail);
    } catch (err) {
      notifications.show({ title: 'Lỗi', message: 'Không thể tải chi tiết đơn từ', color: 'red' });
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteClick = (app: Application) => {
    setDeletingApp(app);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingApp) return;
    setDeleting(true);
    try {
      await deleteApplication(deletingApp.id);
      notifications.show({ title: 'Thành công', message: 'Xóa đơn từ thành công', color: 'green' });
      setDeleteModalOpen(false);
      setDeletingApp(null);
      if (detailModalOpen) {
        setDetailModalOpen(false);
        setSelectedDetail(null);
      }
      reload();
    } catch (err) {
      notifications.show({ title: 'Lỗi', message: 'Xóa đơn từ thất bại', color: 'red' });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatus = async (appId: number, newStatus: ApplicationStatus) => {
    setUpdatingStatus(true);
    try {
      await updateApplicationStatus(appId, newStatus);
      notifications.show({ title: 'Thành công', message: 'Cập nhật trạng thái thành công', color: 'green' });
      if (selectedDetail && selectedDetail.id === appId) {
        setSelectedDetail(prev => prev ? { ...prev, status: newStatus } : null);
      }
      reload();
    } catch (err) {
      notifications.show({ title: 'Lỗi', message: 'Cập nhật trạng thái thất bại', color: 'red' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <h3 className={classes.title}>Xử lý đơn từ</h3>
        <Button variant="light" color="gray" size="xs" leftSection={<IconRefresh size={14} />} onClick={handleRefresh}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <Center py={40}><Loader size="sm" /></Center>
      ) : error ? (
        <Center py={40}><Text c="red" size="sm">{error}</Text></Center>
      ) : (
        <>
          <div className={classes.tableWrapper}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Sinh viên</th>
                  <th>Mã SV</th>
                  <th>Loại đơn từ</th>
                  <th>Trạng thái</th>
                  <th className={classes.actionsCol}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={classes.empty}>Chưa có đơn từ nào</td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className={classes.row}>
                      <td className={classes.studentName}>{app.studentName}</td>
                      <td className={classes.studentCode}>{app.studentCode}</td>
                      <td className={classes.typeName}>{app.applicationTypeName}</td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>
                        <Group gap={4}>
                          <Tooltip label="Xem chi tiết" position="top">
                            <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => handleViewDetail(app)}>
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Xóa" position="top">
                            <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteClick(app)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={classes.paginationWrapper}>
              <Button.Group>
                <Button size="xs" variant="subtle" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</Button>
                <Button size="xs" variant="subtle" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Sau</Button>
              </Button.Group>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Xác nhận xóa" centered>
        <Text mb="lg">
          Bạn có chắc chắn muốn xóa đơn từ của <strong>{deletingApp?.studentName}</strong> không?
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>Huỷ</Button>
          <Button color="red" onClick={handleDeleteConfirm} loading={deleting}>Xóa</Button>
        </Group>
      </Modal>

      {/* Detail Modal */}
      <Modal
        opened={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedDetail(null); }}
        size="60%"
        withCloseButton={false}
        centered
      >
        {loadingDetail ? (
          <Center py={40}><Loader size="md" /></Center>
        ) : selectedDetail ? (
          <div className={classes.detailModal}>
            <div className={classes.detailHeader}>
              <h2 className={classes.detailTitle}>{selectedDetail.applicationTypeName}</h2>
              <div className={classes.detailMeta}>
                <span>Mã SV: {selectedDetail.studentCode}</span>
                <span>•</span>
                <span>SV: {selectedDetail.studentName}</span>
              </div>
            </div>

            <div className={classes.detailSection}>
              <div className={classes.detailLabel}>Nội dung</div>
              <div className={classes.detailValue}>{selectedDetail.content || 'Không có nội dung'}</div>
            </div>

            {selectedDetail.attachments && selectedDetail.attachments.length > 0 && (
              <div className={classes.detailSection}>
                <div className={classes.detailLabel}>File đính kèm</div>
                {selectedDetail.attachments.map((att) => (
                  <div key={att.id} className={classes.attachmentItem}>
                    <IconFile size={16} />
                    <span>{att.originalFilename}</span>
                    <span className={classes.fileSize}>({(att.fileSize / 1024).toFixed(1)} KB)</span>
                  </div>
                ))}
              </div>
            )}

            <div className={classes.statusUpdateSection}>
              <div className={classes.detailLabel}>Trạng thái hiện tại</div>
              <div style={{ marginBottom: 12 }}>
                <StatusBadge status={selectedDetail.status} />
              </div>
              <div className={classes.detailLabel}>Cập nhật trạng thái</div>
              <div className={classes.statusButtons}>
                <button
                  className={`${classes.statusBtn} ${selectedDetail.status === 'PENDING' ? classes.statusBtnActive : ''}`}
                  onClick={() => handleUpdateStatus(selectedDetail.id, 'PENDING')}
                  disabled={updatingStatus || selectedDetail.status === 'PENDING'}
                >
                  Chờ duyệt
                </button>
                <button
                  className={`${classes.statusBtn} ${selectedDetail.status === 'APPROVED' ? classes.statusBtnActive : ''}`}
                  onClick={() => handleUpdateStatus(selectedDetail.id, 'APPROVED')}
                  disabled={updatingStatus || selectedDetail.status === 'APPROVED'}
                >
                  Đã duyệt
                </button>
                <button
                  className={`${classes.statusBtn} ${selectedDetail.status === 'REJECTED' ? classes.statusBtnActive : ''}`}
                  onClick={() => handleUpdateStatus(selectedDetail.id, 'REJECTED')}
                  disabled={updatingStatus || selectedDetail.status === 'REJECTED'}
                >
                  Từ chối
                </button>
              </div>
              {updatingStatus && <Loader size="sm" mt={8} />}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}