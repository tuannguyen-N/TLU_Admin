import { useState } from 'react';
import { Button, Group, TextInput, Loader, Center, Text, Tabs } from '@mantine/core';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import { useFeedback } from './hooks/useFeedback';
import { FeedbackTable } from './components/FeedbackTable';
import { FeedbackDetailModal } from './components/FeedbackDetailModal';
import type { Feedback } from './types';
import { FeedbackCategoryPage } from '../feedback-category/FeedbackCategoryPage';
import classes from './FeedbackPage.module.css';

export function FeedbackPage() {
  const { feedback, loading, error, reload } = useFeedback();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('feedback');

  const filteredFeedback = search.trim()
    ? feedback.filter(
        (f) =>
          f.email.toLowerCase().includes(search.toLowerCase()) ||
          f.title.toLowerCase().includes(search.toLowerCase()) ||
          f.categoryName.toLowerCase().includes(search.toLowerCase())
      )
    : feedback;

  const handleViewFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
    setModalOpened(true);
  };

  const handleModalClose = () => {
    setModalOpened(false);
    setSelectedFeedback(null);
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Feedback / Góp ý</h1>
        <p className={classes.pageDesc}>
          Quản lý feedback và góp ý từ người dùng. Xem chi tiết và cập nhật trạng thái xử lý.
        </p>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="feedback">Feedback</Tabs.Tab>
          <Tabs.Tab value="categories">Danh mục feedback</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="feedback">
          <div className={classes.header}>
            <TextInput
              placeholder="Tìm kiếm feedback..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              classNames={{ input: classes.searchInput }}
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
            </Group>
          </div>

          {loading && (
            <Center py={40}>
              <Loader />
            </Center>
          )}

          {error && (
            <Center py={40}>
              <Text c="red">{error}</Text>
            </Center>
          )}

          {!loading && !error && (
            <>
              {filteredFeedback.length === 0 ? (
                <Center py={40}>
                  <Text c="dimmed">Không có feedback nào</Text>
                </Center>
              ) : (
                <div className={classes.table}>
                  <FeedbackTable
                    feedback={filteredFeedback}
                    onView={handleViewFeedback}
                  />
                </div>
              )}
            </>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="categories">
          <FeedbackCategoryPage embedded />
        </Tabs.Panel>
      </Tabs>

      <FeedbackDetailModal
        feedback={selectedFeedback}
        opened={modalOpened}
        onClose={handleModalClose}
        onStatusUpdated={reload}
      />
    </div>
  );
}
