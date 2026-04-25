import {
  TextInput, Select, Button, Group, Stack, Grid, Textarea, Alert
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  IconFingerprint, IconBook2, IconId,
  IconAddressBook, IconAlertCircle, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState } from 'react';
import classes from '../components/Addstudetncard.module.css';
import { createStudent, type CreateStudentPayload } from '../services';
import { DatePickerInput } from '@mantine/dates';

interface ValidationErrors {
  studentCode?: string;
  fullName?: string;
  dateOfBirth?: string;
  classCode?: string;
  majorCode?: string;
  cohort?: string;
  startYear?: string;
  endYear?: string;
  cardNumber?: string;
}

interface Props {
  onCancel: () => void;
  onSave: (data: StudentFormData) => void;
}

export interface StudentFormData {
  studentCode: string;
  fullName: string;
  dateOfBirth: Date | null;
  gender: string;
  trainingSystem: string;
  classCode: string;
  majorCode: string;
  cohort: string;
  role: string;
  startYear: string;
  endYear: string;
  cardNumber: string;
  cardType: string;
  issueDate: Date | null;
  issuePlace: string;
  phone: string;
  email: string;
  address: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  emergencyAddress: string;
}

const SectionTitle = ({ icon: Icon, number, title }: { icon: any; number: number; title: string }) => (
  <div className={classes.sectionTitle}>
    <div className={classes.sectionIcon}>
      <Icon size={18} />
    </div>
    <span className={classes.sectionNum}>{number}.</span>
    <span className={classes.sectionText}>{title}</span>
  </div>
);

export function AddStudentCard({ onCancel, onSave }: Props) {
  const [form, setForm] = useState<StudentFormData>({
    studentCode: '',
    fullName: '',
    dateOfBirth: null,
    gender: 'NAM',
    trainingSystem: 'CHINH_QUY',
    classCode: '',
    majorCode: '',
    cohort: '',
    role: 'Sinh viên',
    startYear: '',
    endYear: '',
    cardNumber: '',
    cardType: 'CCCD',
    issueDate: null,
    issuePlace: '',
    phone: '',
    email: '',
    address: '',
    emergencyName: '',
    emergencyRelation: 'Cha',
    emergencyPhone: '',
    emergencyAddress: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (key: keyof StudentFormData) => (val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.studentCode.trim()) {
      newErrors.studentCode = 'Mã sinh viên là bắt buộc';
    }
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }
    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dob = new Date(form.dateOfBirth);
      if (dob >= today) {
        newErrors.dateOfBirth = 'Ngày sinh phải là ngày trong quá khứ';
      }
    }
    if (!form.classCode.trim()) {
      newErrors.classCode = 'Mã lớp là bắt buộc';
    }
    if (!form.majorCode.trim()) {
      newErrors.majorCode = 'Mã ngành là bắt buộc';
    }
    if (!form.cohort.trim()) {
      newErrors.cohort = 'Khóa học là bắt buộc';
    }
    if (!form.startYear.trim()) {
      newErrors.startYear = 'Năm bắt đầu là bắt buộc';
    }
    if (!form.endYear.trim()) {
      newErrors.endYear = 'Năm kết thúc là bắt buộc';
    }
    if (!form.cardNumber.trim()) {
      newErrors.cardNumber = 'Số thẻ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    console.log('[handleSave] form state:', form);

    const payload: CreateStudentPayload = {
      studentCode: form.studentCode.trim() || null,
      fullName: form.fullName.trim() || null,
      dateOfBirth: formatDate(form.dateOfBirth) || null,
      gender: form.gender,
      studentClassCode: form.classCode.trim() || null,
      majorCode: form.majorCode.trim() || null,
      startYear: form.startYear.trim() ? parseInt(form.startYear.trim(), 10) : null,
      endYear: form.endYear.trim() ? parseInt(form.endYear.trim(), 10) : null,
      trainingType: form.trainingSystem,
      identityCard: {
        cardNumber: form.cardNumber.trim() || null,
        cardType: form.cardType,
        issuedDate: formatDate(form.issueDate) || null,
        issuedPlace: form.issuePlace.trim() || null,
      },
      contact: {
        phoneNumber: form.phone.trim() || null,
        address: form.address.trim() || null,
        email: form.email.trim() || null,
      },
      academicInfo: {
        cohort: form.cohort.trim() || null,
        position: form.role,
      },
      emergencyContact: {
        name: form.emergencyName.trim() || null,
        phoneNumber: form.emergencyPhone.trim() || null,
        address: form.emergencyAddress.trim() || null,
        relationship: form.emergencyRelation,
      },
    };

    try {
      await createStudent(payload);
      onSave(form);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo sinh viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Thêm Sinh Viên Mới</h1>
        <p className={classes.pageSubtitle}>Nhập thông tin chi tiết để khởi tạo hồ sơ sinh viên trong hệ thống.</p>
      </div>

      <Stack gap={16}>
        {/* Section 1 */}
        <div className={classes.section}>
          <SectionTitle icon={IconFingerprint} number={1} title="Thông tin định danh & Cơ bản" />
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="MÃ SINH VIÊN"
                required
                placeholder="A46049"
                value={form.studentCode}
                onChange={e => set('studentCode')(e.target.value)}
                error={errors.studentCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="HỌ VÀ TÊN"
                required
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={e => set('fullName')(e.target.value)}
                error={errors.fullName}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <DateInput
                label="NGÀY SINH"
                required
                placeholder="mm/dd/yyyy"
                value={form.dateOfBirth}
                onChange={set('dateOfBirth')}
                error={errors.dateOfBirth}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="GIỚI TÍNH"
                required
                data={[
                  { label: 'NAM', value: 'NAM' },
                  { label: 'NỮ', value: 'NU' }
                ]}
                value={form.gender}
                onChange={val => set('gender')(val ?? 'NAM')}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="HỆ ĐÀO TẠO"
                required
                data={['CHINH_QUY']}
                value={form.trainingSystem}
                onChange={val => set('trainingSystem')(val ?? 'CHINH_QUY')}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
          </Grid>
        </div>

        {/* Section 2 */}
        <div className={classes.section}>
          <SectionTitle icon={IconBook2} number={2} title="Thông tin học tập & Quá trình" />
          <Grid>
            <Grid.Col span={3}>
              <TextInput
                label="MÃ LỚP"
                required
                placeholder="KHMT2021"
                value={form.classCode}
                onChange={e => set('classCode')(e.target.value)}
                error={errors.classCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="MÃ NGÀNH"
                required
                placeholder="KHMT"
                value={form.majorCode}
                onChange={e => set('majorCode')(e.target.value)}
                error={errors.majorCode}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="NIÊN KHÓA"
                required
                placeholder="K35"
                value={form.cohort}
                onChange={e => set('cohort')(e.target.value)}
                error={errors.cohort}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label="CHỨC VỤ"
                data={['Sinh viên', 'Lớp trưởng', 'Lớp phó', 'Cán bộ lớp']}
                value={form.role}
                onChange={val => set('role')(val ?? 'Sinh viên')}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="NĂM BẮT ĐẦU"
                required
                placeholder="2026"
                value={form.startYear}
                onChange={e => set('startYear')(e.target.value)}
                error={errors.startYear}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="NĂM KẾT THÚC (DỰ KIẾN)"
                required
                placeholder="2030"
                value={form.endYear}
                onChange={e => set('endYear')(e.target.value)}
                error={errors.endYear}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
          </Grid>
        </div>

        {/* Section 3 & 4 side by side */}
        <Grid>
          <Grid.Col span={6}>
            <div className={classes.section} style={{ height: '100%' }}>
              <SectionTitle icon={IconId} number={3} title="Chi tiết căn cước" />
              <Stack gap={12}>
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="SỐ THẺ"
                      required
                      placeholder=""
                      value={form.cardNumber}
                      onChange={e => set('cardNumber')(e.target.value)}
                      error={errors.cardNumber}
                      classNames={{ label: classes.fieldLabel, input: classes.input }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="LOẠI THẺ"
                      required
                      data={['CCCD', 'CMND', 'Hộ chiếu']}
                      value={form.cardType}
                      onChange={val => set('cardType')(val ?? 'CCCD')}
                      classNames={{ label: classes.fieldLabel, input: classes.input }}
                    />
                  </Grid.Col>
                </Grid>
                <DateInput
                  label="NGÀY CẤP"
                  placeholder="mm/dd/yyyy"
                  value={form.issueDate}
                  onChange={set('issueDate')}
                  classNames={{ label: classes.fieldLabel, input: classes.input }}
                />
                <Textarea
                  label="NƠI CẤP"
                  placeholder=""
                  value={form.issuePlace}
                  onChange={e => set('issuePlace')(e.target.value)}
                  rows={2}
                  classNames={{ label: classes.fieldLabel, input: classes.input }}
                />
              </Stack>
            </div>
          </Grid.Col>

          <Grid.Col span={6}>
            <div className={classes.section} style={{ height: '100%' }}>
              <SectionTitle icon={IconAddressBook} number={4} title="Thông tin liên lạc" />
              <Stack gap={12}>
                <TextInput
                  label="SỐ ĐIỆN THOẠI"
                  placeholder=""
                  value={form.phone}
                  onChange={e => set('phone')(e.target.value)}
                  classNames={{ label: classes.fieldLabel, input: classes.input }}
                />
                <TextInput
                  label="EMAIL CÁ NHÂN"
                  placeholder=""
                  value={form.email}
                  onChange={e => set('email')(e.target.value)}
                  classNames={{ label: classes.fieldLabel, input: classes.input }}
                />
                <Textarea
                  label="ĐỊA CHỈ THƯỜNG TRÚ"
                  placeholder=""
                  value={form.address}
                  onChange={e => set('address')(e.target.value)}
                  rows={3}
                  classNames={{ label: classes.fieldLabel, input: classes.input }}
                />
              </Stack>
            </div>
          </Grid.Col>
        </Grid>

        {/* Section 5 */}
        <div className={classes.section}>
          <SectionTitle icon={IconAlertCircle} number={5} title="Liên hệ khẩn cấp" />
          <Grid>
            <Grid.Col span={4}>
              <TextInput
                label="HỌ TÊN NGƯỜI LIÊN HỆ"
                placeholder=""
                value={form.emergencyName}
                onChange={e => set('emergencyName')(e.target.value)}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="QUAN HỆ"
                data={['Cha', 'Mẹ', 'Anh', 'Chị', 'Em', 'Vợ/Chồng', 'Khác']}
                value={form.emergencyRelation}
                onChange={val => set('emergencyRelation')(val ?? 'Cha')}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="SỐ ĐIỆN THOẠI KHẨN CẤP"
                placeholder=""
                value={form.emergencyPhone}
                onChange={e => set('emergencyPhone')(e.target.value)}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="ĐỊA CHỈ LIÊN LẠC"
                placeholder=""
                value={form.emergencyAddress}
                onChange={e => set('emergencyAddress')(e.target.value)}
                classNames={{ label: classes.fieldLabel, input: classes.input }}
              />
            </Grid.Col>
          </Grid>
        </div>
      </Stack>

      {/* Footer Actions */}
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
          Thêm sinh viên
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