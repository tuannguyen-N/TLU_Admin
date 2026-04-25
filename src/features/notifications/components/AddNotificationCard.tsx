import {
  TextInput, Select, Button, Stack, Grid, Alert, LoadingOverlay, Textarea, Switch, Text, MultiSelect, Box, Group, CloseButton
} from '@mantine/core';
import {
  IconX, IconDeviceFloppy, IconBell
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications as mantineNotifications } from '@mantine/notifications';
import classes from './AddNotificationCard.module.css';
import { createNotification } from '../services';
import { fetchNotificationTemplates } from '../../notification-templates/services';
import { fetchStudents, fetchFaculties, fetchStudentClasses, fetchCourseClasses } from '../services/target-services';
import type { NotificationFormData } from '../types';
import type { NotificationTemplate } from '../../notification-templates/types';

type TargetType = 'GLOBAL' | 'FACULTY' | 'STUDENT_CLASS' | 'COURSE_CLASS' | 'STUDENT';

interface ValidationErrors {
  title?: string;
  content?: string;
  targetIds?: string;
}

interface Props {
  onCancel: () => void;
  onSave: (data: NotificationFormData) => void;
}

const SectionTitle = ({ icon: Icon, number, title }: { icon: any; number: number; title: string }) => (
  <div className={classes.sectionTitle}>
    <div className={classes.sectionIcon}><Icon size={18} /></div>
    <span className={classes.sectionNum}>{number}.</span>
    <span className={classes.sectionText}>{title}</span>
  </div>
);

const targetTypeData = [
  { value: 'GLOBAL', label: 'Toàn trường' },
  { value: 'FACULTY', label: 'Khoa' },
  { value: 'STUDENT_CLASS', label: 'Lớp sinh viên' },
  { value: 'COURSE_CLASS', label: 'Lớp học phần' },
  { value: 'STUDENT', label: 'Sinh viên' },
];

interface SelectItem {
  id: number;
  label: string;
}

export function AddNotificationCard({ onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    targetType: 'GLOBAL' as TargetType,
    targetIds: [] as number[],
    deadLine: '',
    isImportant: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const [availableTargets, setAvailableTargets] = useState<SelectItem[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [selectedTargetObjects, setSelectedTargetObjects] = useState<SelectItem[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (form.targetType !== 'GLOBAL') {
      loadTargetsByType(form.targetType);
    } else {
      setAvailableTargets([]);
      setSelectedTargetObjects([]);
    }
  }, [form.targetType]);

  const loadTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const result = await fetchNotificationTemplates({ page: 0, size: 100 });
      setTemplates(result.templates);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const loadTargetsByType = async (type: TargetType) => {
    setTargetsLoading(true);
    try {
      let items: SelectItem[] = [];
      switch (type) {
        case 'STUDENT':
          const students = await fetchStudents();
          items = students.map(s => ({ id: s.id, label: `${s.studentCode} - ${s.fullName}` }));
          break;
        case 'FACULTY':
          const faculties = await fetchFaculties();
          items = faculties.map(f => ({ id: f.id, label: `${f.facultyCode} - ${f.facultyName}` }));
          break;
        case 'STUDENT_CLASS':
          const classes = await fetchStudentClasses();
          items = classes.map(c => ({ id: c.id, label: `${c.classCode} - ${c.majorName}` }));
          break;
        case 'COURSE_CLASS':
          const courseClasses = await fetchCourseClasses();
          items = courseClasses.map(c => ({ id: c.id, label: `${c.classCode} - ${c.className}` }));
          break;
      }
      setAvailableTargets(items);
    } catch (err) {
      console.error('Failed to load targets:', err);
    } finally {
      setTargetsLoading(false);
    }
  };

  const handleTemplateChange = (templateId: number | null) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setForm(prev => ({
          ...prev,
          title: template.name,
          content: template.content,
        }));
      }
    }
  };

  const handleTargetSelectChange = (selectedIds: string[]) => {
    const ids = selectedIds.map(id => parseInt(id));
    setForm(prev => ({ ...prev, targetIds: ids }));
    const selected = availableTargets.filter(t => ids.includes(t.id));
    setSelectedTargetObjects(selected);
  };

  const handleRemoveTarget = (id: number) => {
    const newIds = form.targetIds.filter(tid => tid !== id);
    setForm(prev => ({ ...prev, targetIds: newIds }));
    setSelectedTargetObjects(prev => prev.filter(t => t.id !== id));
  };

  const isGlobal = form.targetType === 'GLOBAL';

  const set = (key: keyof typeof form) => (val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (key === 'targetType') {
      setForm(prev => ({ ...prev, targetIds: [], [key]: val }));
      setSelectedTargetObjects([]);
    }
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!form.title.trim()) newErrors.title = 'Tiêu đề là bắt buộc';
    if (!form.content.trim()) newErrors.content = 'Nội dung là bắt buộc';
    if (!isGlobal && form.targetIds.length === 0) {
      newErrors.targetIds = 'Cần chọn ít nhất một đối tượng';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const payload: NotificationFormData = {
        ...(selectedTemplateId && { templateId: selectedTemplateId }),
        title: form.title.trim(),
        content: form.content.trim(),
        targetType: form.targetType,
        targetIds: isGlobal ? [] : form.targetIds,
        deadLine: form.deadLine || null,
        isImportant: form.isImportant,
      };
      await createNotification(payload);
      mantineNotifications.show({ title: 'Thành công', message: 'Tạo thông báo thành công', color: 'green' });
      onSave(payload);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      mantineNotifications.show({ title: 'Lỗi', message: 'Tạo thông báo thất bại', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Tạo Thông Báo Mới</h1>
        <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để tạo thông báo mới.</p>
      </div>

      <Stack gap={16}>
        <div className={classes.section}>
          <SectionTitle icon={IconBell} number={1} title="Thông tin thông báo" />
          <Grid>
            <Grid.Col span={12}>
              <Select
                label="CHỌN MẪU THÔNG BÁO"
                placeholder="-- Chọn mẫu thông báo --"
                data={templates.map(t => ({ value: t.id.toString(), label: t.name }))}
                value={selectedTemplateId?.toString() || null}
                onChange={(val) => handleTemplateChange(val ? parseInt(val) : null)}
                clearable
                searchable
                disabled={templatesLoading}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="TIÊU ĐỀ"
                required
                placeholder="Nhập tiêu đề thông báo"
                value={form.title}
                onChange={e => set('title')(e.target.value)}
                error={errors.title}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="NỘI DUNG"
                required
                placeholder="Nhập nội dung thông báo"
                value={form.content}
                onChange={e => set('content')(e.target.value)}
                error={errors.content}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
                minRows={3}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="LOẠI THÔNG BÁO"
                required
                data={targetTypeData}
                value={form.targetType}
                onChange={val => set('targetType')(val as TargetType)}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="HẠN CHÓT"
                placeholder="YYYY-MM-DD"
                value={form.deadLine}
                onChange={e => set('deadLine')(e.target.value)}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            {!isGlobal && (
              <>
                <Grid.Col span={12}>
                  <MultiSelect
                    label="CHỌN ĐỐI TƯỢNG"
                    placeholder={`Chọn ${targetTypeData.find(t => t.value === form.targetType)?.label || 'đối tượng'}`}
                    data={availableTargets.map(t => ({ value: t.id.toString(), label: t.label }))}
                    value={form.targetIds.map(id => id.toString())}
                    onChange={handleTargetSelectChange}
                    searchable
                    disabled={targetsLoading}
                    error={errors.targetIds}
                    classNames={{ label: classes.fieldLabel, input: classes.input }}
                  />
                </Grid.Col>
                {selectedTargetObjects.length > 0 && (
                  <Grid.Col span={12}>
                    <Text className={classes.fieldLabel}>ĐÃ CHỌN:</Text>
                    <Group gap={8} mt={8}>
                      {selectedTargetObjects.map(obj => (
                        <Box
                          key={obj.id}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#eef2ff',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Text size="sm">{obj.label}</Text>
                          <CloseButton
                            size="xs"
                            onClick={() => handleRemoveTarget(obj.id)}
                          />
                        </Box>
                      ))}
                    </Group>
                  </Grid.Col>
                )}
              </>
            )}
            <Grid.Col span={6}>
              <Stack gap={8}>
                <Text className={classes.fieldLabel}>QUAN TRỌNG</Text>
                <Switch
                  checked={form.isImportant}
                  onChange={(e) => set('isImportant')(e.currentTarget.checked)}
                  label={form.isImportant ? 'Quan trọng' : 'Không quan trọng'}
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </div>
      </Stack>

      <div className={classes.footer}>
        <Button variant="subtle" color="gray" leftSection={<IconX size={16} />} onClick={onCancel} className={classes.cancelBtn} disabled={loading}>
          Huỷ
        </Button>
        <Button leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} className={classes.saveBtn} loading={loading}>
          Tạo thông báo
        </Button>
      </div>

      {apiError && <Alert color="red" title="Lỗi" mt="md">{apiError}</Alert>}
    </div>
  );
}