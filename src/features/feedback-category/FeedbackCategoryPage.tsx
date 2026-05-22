import { useState } from 'react';
import { Button, Group, Loader, Center, Text } from '@mantine/core';
import { IconRefresh, IconPlus } from '@tabler/icons-react';
import { useFeedbackCategories } from './hooks/useFeedbackCategories';
import { CategoryTable } from './components/CategoryTable';
import { AddCategoryModal } from './components/AddCategoryModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import type { FeedbackCategory } from './types';
import classes from './FeedbackCategoryPage.module.css';

interface Props {
  embedded?: boolean;
}

export function FeedbackCategoryPage({ embedded = false }: Props) {
  const { categories, loading, error, reload } = useFeedbackCategories();
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FeedbackCategory | null>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);

  const handleEdit = (category: FeedbackCategory) => {
    setEditingCategory(category);
    setEditModalOpened(true);
  };

  const handleEditClose = () => {
    setEditModalOpened(false);
    setEditingCategory(null);
  };

  return (
    <div className={classes.page}>
      {!embedded && (
        <div className={classes.pageHeader}>
          <h1 className={classes.pageTitle}>Danh mục Feedback</h1>
          <p className={classes.pageDesc}>
            Quản lý các danh mục feedback để phân loại góp ý từ người dùng.
          </p>
        </div>
      )}

      <div className={classes.header}>
        <Group gap={8} ml="auto">
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
            leftSection={<IconPlus size={16} />}
            onClick={() => setAddModalOpened(true)}
            style={{ backgroundColor: '#111827', color: '#fff' }}
          >
            Thêm danh mục
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
          {categories.length === 0 ? (
            <Center py={40}>
              <Text c="dimmed">Không có danh mục nào</Text>
            </Center>
          ) : (
            <div className={classes.table}>
              <CategoryTable
                categories={categories}
                onEdit={handleEdit}
                onCategoryDeleted={reload}
              />
            </div>
          )}
        </>
      )}

      <AddCategoryModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        onCategoryAdded={reload}
      />

      <EditCategoryModal
        category={editingCategory}
        opened={editModalOpened}
        onClose={handleEditClose}
        onCategoryUpdated={reload}
      />
    </div>
  );
}
