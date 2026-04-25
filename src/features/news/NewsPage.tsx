import { useState } from 'react';
import { Pagination, Loader, Center, Text, Button, Group, ActionIcon, Tooltip, Modal } from '@mantine/core';
import { TextInput } from '@mantine/core';
import { IconSearch, IconRefresh, IconUserPlus, IconPencil, IconTrash, IconPhoto } from '@tabler/icons-react';
import { useNews } from './hooks/useNews';
import { AddNewsCard } from './components/AddNewsCard';
import { EditNewsCard } from './components/EditNewsCard';
import { deleteNews } from './services';
import type { News } from './types';
import { notifications } from '@mantine/notifications';
import classes from './NewsPage.module.css';

export function NewsPage() {
  const { news, loading, error, page, setPage, totalPages, totalElements, reload } = useNews();
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingNews, setDeletingNews] = useState<News | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filteredNews = search.trim()
    ? news.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.source.toLowerCase().includes(search.toLowerCase())
      )
    : news;

  const handleEdit = (n: News) => {
    setEditingNews(n);
  };

  const handleDeleteClick = (n: News) => {
    setDeletingNews(n);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNews) return;
    setDeleting(true);
    try {
      await deleteNews(deletingNews.id);
      notifications.show({
        title: 'Thành công',
        message: 'Xóa tin tức thành công',
        color: 'green',
      });
      setDeleteModalOpen(false);
      setDeletingNews(null);
      reload();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: 'Xóa tin tức thất bại',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Tin tức</h1>
        <p className={classes.pageDesc}>
          Quản lý tin tức và thông báo từ các khoa, bộ môn trong trường.
        </p>
      </div>

      <div className={classes.header}>
        <TextInput
          placeholder="Tìm kiếm tin tức..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          classNames={{ input: classes.searchInput }}
          style={{ flex: 1, maxWidth: 400 }}
        />
        <Group gap={8}>
          <Button
            variant="light"
            color="gray"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            onClick={reload}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            size="sm"
            leftSection={<IconUserPlus size={16} />}
            onClick={() => setAddModalOpened(true)}
            style={{ backgroundColor: '#111827', color: '#fff' }}
          >
            Thêm tin tức
          </Button>
        </Group>
      </div>

      {loading && news.length === 0 ? (
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
                  <th>Hình ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Nguồn</th>
                  <th>Ngày đăng</th>
                  <th className={classes.actionsCell}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={classes.empty}>Không tìm thấy tin tức nào</td>
                  </tr>
                ) : (
                  filteredNews.map((n) => (
                    <tr key={n.id} className={classes.row}>
                      <td className={classes.imageCell}>
                        {n.imageUrl ? (
                          <img src={n.imageUrl} alt={n.title} className={classes.thumb} />
                        ) : (
                          <div className={classes.placeholder}>
                            <IconPhoto size={20} />
                          </div>
                        )}
                      </td>
                      <td className={classes.titleCell}>
                        <div className={classes.newsTitle}>{n.title}</div>
                      </td>
                      <td className={classes.source}>{n.source}</td>
                      <td>{formatDate(n.publishDate)}</td>
                      <td>
                        <div className={classes.actions}>
                          <Tooltip label="Sửa" position="top">
                            <ActionIcon variant="subtle" color="yellow" size="md" onClick={() => handleEdit(n)}>
                              <IconPencil size={18} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Xóa" position="top">
                            <ActionIcon variant="subtle" color="red" size="md" onClick={() => handleDeleteClick(n)}>
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={classes.paginationWrapper}>
              <Pagination value={page + 1} onChange={(p) => setPage(p - 1)} total={totalPages} size="sm" />
            </div>
          )}
        </>
      )}

      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        size="70%"
        withCloseButton={false}
      >
        <AddNewsCard
          onCancel={() => setAddModalOpened(false)}
          onSave={() => {
            setAddModalOpened(false);
            reload();
          }}
        />
      </Modal>

      <Modal
        opened={editingNews !== null}
        onClose={() => setEditingNews(null)}
        size="70%"
        withCloseButton={false}
      >
        {editingNews && (
          <EditNewsCard
            news={editingNews}
            onCancel={() => setEditingNews(null)}
            onSave={() => {
              setEditingNews(null);
              reload();
            }}
          />
        )}
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác nhận xóa"
        centered
      >
        <Text mb="lg">
          Bạn có chắc chắn muốn xóa tin tức <strong>{deletingNews?.title}</strong> không?
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
            Huỷ
          </Button>
          <Button color="red" onClick={handleDeleteConfirm} loading={deleting}>
            Xóa
          </Button>
        </Group>
      </Modal>
    </div>
  );
}