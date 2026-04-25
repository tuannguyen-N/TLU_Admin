import {
  TextInput, Textarea, Button, Stack, Grid, Alert, LoadingOverlay,
} from '@mantine/core';
import {
  IconNews, IconX, IconDeviceFloppy,
  IconPhoto
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import classes from './AddNewsCard.module.css';
import { updateNews } from '../services';
import type { News } from '../types';

interface ValidationErrors {
  title?: string;
  newsUrl?: string;
  source?: string;
  publishDate?: string;
}

interface Props {
  news: News;
  onCancel: () => void;
  onSave: () => void;
}

export function EditNewsCard({ news, onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    title: news.title,
    excerpt: news.excerpt,
    newsUrl: news.newsUrl,
    source: news.source,
    publishDate: news.publishDate,
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(news.imageUrl);


  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const set = (key: keyof typeof form) => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }
    if (!form.newsUrl.trim()) {
      newErrors.newsUrl = 'Link tin tức là bắt buộc';
    }
    if (!form.source.trim()) {
      newErrors.source = 'Nguồn tin là bắt buộc';
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.publishDate)) {
      newErrors.publishDate = 'Ngày phải dạng yyyy-MM-dd';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!news) return;

    setLoading(true);
    setApiError(null);

    try {
      await updateNews(news.id, {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        newsUrl: form.newsUrl.trim(),
        source: form.source.trim(),
        publishDate: form.publishDate.trim(),
        file: file,
      });
      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật tin tức thành công',
        color: 'green',
      });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật tin tức');
      notifications.show({
        title: 'Lỗi',
        message: 'Cập nhật tin tức thất bại',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Chỉnh Sửa Tin Tức</h1>
        <p className={classes.pageSubtitle}>Cập nhật thông tin tin tức trong hệ thống.</p>
      </div>

      <Stack gap={16}>
        <div className={classes.section}>
          <div className={classes.sectionTitle}>
            <div className={classes.sectionIcon}>
              <IconNews size={18} />
            </div>
            <span className={classes.sectionNum}>1.</span>
            <span className={classes.sectionText}>Thông tin tin tức</span>
          </div>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="TIÊU ĐỀ"
                required
                placeholder="Nhập tiêu đề tin tức"
                value={form.title}
                onChange={e => set('title')(e.target.value)}
                error={errors.title}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="MÔ TẢ"
                placeholder="Nhập mô tả ngắn"
                value={form.excerpt}
                onChange={e => set('excerpt')(e.target.value)}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                minRows={3}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="LINK TIN TỨC"
                required
                placeholder="https://example.com/news"
                value={form.newsUrl}
                onChange={e => set('newsUrl')(e.target.value)}
                error={errors.newsUrl}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="NGUỒN TIN"
                required
                placeholder="Khoa CNTT"
                value={form.source}
                onChange={e => set('source')(e.target.value)}
                error={errors.source}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="NGÀY ĐĂNG"
                placeholder="2026-01-01"
                value={form.publishDate}
                onChange={e => set('publishDate')(e.target.value)}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <div
                className={classes.imageWrapper}
                onClick={() => document.getElementById("fileInput")?.click()}
                style={{ cursor: 'pointer' }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={news.title}
                    className={classes.image}
                  />
                ) : (
                  <div className={classes.placeholder}>
                    <IconPhoto size={48} />
                  </div>
                )}
              </div>

              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);

                  e.target.value = '';
                }}
              />
            </Grid.Col>
          </Grid>
        </div>
      </Stack>

      <div className={classes.footer}>
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconX size={16} />}
          onClick={onCancel}
          className={classes.cancelBtn}
          disabled={loading}
        >
          Huỷ
        </Button>
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSave}
          className={classes.saveBtn}
          loading={loading}
        >
          Lưu thay đổi
        </Button>
      </div>

      {apiError && (
        <Alert color="red" title="Lỗi" mt="md">
          {apiError}
        </Alert>
      )}
    </div>
  );
}