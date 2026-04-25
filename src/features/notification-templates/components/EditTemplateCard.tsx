import {
  TextInput, Button, Stack, Grid, Alert, LoadingOverlay, Textarea
} from '@mantine/core';
import {
  IconX, IconDeviceFloppy, IconTemplate
} from '@tabler/icons-react';
import { useState } from 'react';
import { notifications as mantineNotifications } from '@mantine/notifications';
import classes from './AddTemplateCard.module.css';
import { updateNotificationTemplate } from '../services';
import type { NotificationTemplate, NotificationTemplateFormData } from '../types';

interface ValidationErrors {
  code?: string;
  name?: string;
  content?: string;
}

interface Props {
  template: NotificationTemplate;
  onCancel: () => void;
  onSave: () => void;
}

const SectionTitle = ({ icon: Icon, number, title }: { icon: any; number: number; title: string }) => (
  <div className={classes.sectionTitle}>
    <div className={classes.sectionIcon}><Icon size={18} /></div>
    <span className={classes.sectionNum}>{number}.</span>
    <span className={classes.sectionText}>{title}</span>
  </div>
);

export function EditTemplateCard({ template, onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    code: template.code,
    name: template.name,
    content: template.content,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!form.code.trim()) newErrors.code = 'Mã template là bắt buộc';
    if (!form.name.trim()) newErrors.name = 'Tên template là bắt buộc';
    if (!form.content.trim()) newErrors.content = 'Nội dung là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const payload: NotificationTemplateFormData = {
        code: form.code.trim(),
        name: form.name.trim(),
        content: form.content.trim(),
      };
      await updateNotificationTemplate(template.id, payload);
      mantineNotifications.show({ title: 'Thành công', message: 'Cập nhật mẫu thông báo thành công', color: 'green' });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      mantineNotifications.show({ title: 'Lỗi', message: 'Cập nhật mẫu thông báo thất bại', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Chỉnh Sửa Mẫu Thông Báo</h1>
        <p className={classes.pageSubtitle}>Cập nhật thông tin mẫu thông báo.</p>
      </div>

      <Stack gap={16}>
        <div className={classes.section}>
          <SectionTitle icon={IconTemplate} number={1} title="Thông tin mẫu thông báo" />
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="MÃ TEMPLATE"
                required
                placeholder="VD: WELCOME"
                value={form.code}
                onChange={e => set('code')(e.target.value)}
                error={errors.code}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="TÊN TEMPLATE"
                required
                placeholder="VD: Thông báo chào mừng"
                value={form.name}
                onChange={e => set('name')(e.target.value)}
                error={errors.name}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="NỘI DUNG"
                required
                placeholder="Nhập nội dung template"
                value={form.content}
                onChange={e => set('content')(e.target.value)}
                error={errors.content}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                minRows={4}
              />
            </Grid.Col>
          </Grid>
        </div>
      </Stack>

      <div className={classes.footer}>
        <Button variant="subtle" color="gray" leftSection={<IconX size={16} />} onClick={onCancel} className={classes.cancelBtn} disabled={loading}>
          Huỷ
        </Button>
        <Button leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} className={classes.saveBtn} loading={loading}>
          Lưu thay đổi
        </Button>
      </div>

      {apiError && <Alert color="red" title="Lỗi" mt="md">{apiError}</Alert>}
    </div>
  );
}