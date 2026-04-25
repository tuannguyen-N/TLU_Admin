import {
  TextInput, Button, Stack, Grid, Alert, LoadingOverlay
} from '@mantine/core';
import {
  IconFile, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import classes from './AddApplicationTypeCard.module.css';
import { createApplicationType } from '../services';

interface ValidationErrors {
  code?: string;
  name?: string;
}

interface Props {
  onCancel: () => void;
  onSave: () => void;
}

export function AddApplicationTypeCard({ onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    code: '',
    name: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.code.trim()) {
      newErrors.code = 'Mã loại đơn từ là bắt buộc';
    }
    if (!form.name.trim()) {
      newErrors.name = 'Tên loại đơn từ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      await createApplicationType({
        code: form.code.trim(),
        name: form.name.trim(),
      });
      notifications.show({
        title: 'Thành công',
        message: 'Thêm loại đơn từ thành công',
        color: 'green',
      });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi thêm loại đơn từ');
      notifications.show({
        title: 'Lỗi',
        message: 'Thêm loại đơn từ thất bại',
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
        <h1 className={classes.pageTitle}>Thêm Loại Đơn Từ Mới</h1>
        <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để tạo loại đơn từ mới trong hệ thống.</p>
      </div>

      <Stack gap={16}>
        <div className={classes.section}>
          <div className={classes.sectionTitle}>
            <div className={classes.sectionIcon}>
              <IconFile size={18} />
            </div>
            <span className={classes.sectionNum}>1.</span>
            <span className={classes.sectionText}>Thông tin loại đơn từ</span>
          </div>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="MÃ LOẠI"
                required
                placeholder="Ví dụ: HOC_BONG"
                value={form.code}
                onChange={e => set('code')(e.target.value)}
                error={errors.code}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="TÊN LOẠI"
                required
                placeholder="Ví dụ: Đơn xin học bổng"
                value={form.name}
                onChange={e => set('name')(e.target.value)}
                error={errors.name}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
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
          Thêm loại đơn từ
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