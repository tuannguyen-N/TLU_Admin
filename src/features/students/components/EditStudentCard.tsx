import {
  TextInput, Select, Button, Stack, Grid, Textarea, Alert
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  IconFingerprint, IconBook2, IconId,
  IconAddressBook, IconAlertCircle, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import { useState } from 'react';
import type { Student } from '../types';
import { updateStudentBasic, updateStudentAcademic } from '../services';
import classes from '../components/Addstudetncard.module.css';

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
  student: Student;
  onCancel: () => void;
  onSave: () => void;
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

function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function EditStudentCard({ student, onCancel, onSave }: Props) {
  const [form, setForm] = useState({
    studentCode: student.studentCode || '',
    fullName: student.fullName || '',
    dateOfBirth: parseDate(student.dateOfBirth),
    gender: student.gender === 'Nam' ? 'NAM' : student.gender === 'Nữ' ? 'NỮ' : 'NAM',
    trainingSystem: student.trainingType || '',
    classCode: student.classCode || '',
    majorCode: student.majorCode || '',
    cohort: student.academicInfo.cohort || '',
    role: student.academicInfo.position || 'Sinh viên',
    startYear: String(student.startYear || ''),
    endYear: String(student.endYear || ''),
    cardNumber: student.identityCard.cardNumber || '',
    cardType: student.identityCard.cardType || '',
    issueDate: parseDate(student.identityCard.issuedDate),
    issuePlace: student.identityCard.issuedPlace || '',
    phone: student.contact.phoneNumber || '',
    email: student.contact.email || '',
    address: student.contact.address || '',
    emergencyName: student.emergencyContact.name || '',
    emergencyRelation: student.emergencyContact.relationship || 'Cha',
    emergencyPhone: student.emergencyContact.phoneNumber || '',
    emergencyAddress: student.emergencyContact.address || '',
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

  const buildBasicPayload = () => {
    const original = student;
    const payload: any = {};

    if (form.studentCode.trim() !== (original.studentCode || '')) {
      payload.studentCode = form.studentCode.trim();
    }
    if (form.fullName.trim() !== (original.fullName || '')) {
      payload.fullName = form.fullName.trim();
    }
    if (formatDate(form.dateOfBirth) !== (original.dateOfBirth || '')) {
      payload.dateOfBirth = formatDate(form.dateOfBirth);
    }
    if (form.gender !== (original.gender === 'Nam' ? 'NAM' : original.gender === 'Nữ' ? 'NỮ' : 'NAM')) {
      payload.gender = form.gender;
    }
    if (form.cardNumber.trim() !== (original.identityCard.cardNumber || '')) {
      payload.cardNumber = form.cardNumber.trim();
    }
    if (form.cardType !== (original.identityCard.cardType || '')) {
      payload.cardType = form.cardType;
    }
    if (formatDate(form.issueDate) !== (original.identityCard.issuedDate || '')) {
      payload.issuedDate = formatDate(form.issueDate) || null;
    }
    if (form.issuePlace.trim() !== (original.identityCard.issuedPlace || '')) {
      payload.issuedPlace = form.issuePlace.trim();
    }
    if (form.phone.trim() !== (original.contact.phoneNumber || '')) {
      payload.phoneNumber = form.phone.trim();
    }
    if (form.address.trim() !== (original.contact.address || '')) {
      payload.address = form.address.trim();
    }
    if (form.email.trim() !== (original.contact.email || '')) {
      payload.email = form.email.trim();
    }
    if (form.emergencyName.trim() !== (original.emergencyContact.name || '')) {
      payload.emergencyContactName = form.emergencyName.trim();
    }
    if (form.emergencyPhone.trim() !== (original.emergencyContact.phoneNumber || '')) {
      payload.emergencyContactPhoneNumber = form.emergencyPhone.trim();
    }
    if (form.emergencyAddress.trim() !== (original.emergencyContact.address || '')) {
      payload.emergencyContactAddress = form.emergencyAddress.trim();
    }
    if (form.emergencyRelation !== (original.emergencyContact.relationship || '')) {
      payload.emergencyContactRelationship = form.emergencyRelation;
    }

    return payload;
  };

  const buildAcademicPayload = () => {
    const original = student;
    const payload: any = {};

    if (form.classCode.trim() !== (original.classCode || '')) {
      payload.studentClassCode = form.classCode.trim();
    }
    if (form.majorCode.trim() !== (original.majorCode || '')) {
      payload.majorCode = form.majorCode.trim();
    }
    if (form.trainingSystem !== (original.trainingType || '')) {
      payload.trainingType = form.trainingSystem;
    }
    if (parseInt(form.startYear.trim()) !== (original.startYear || 0)) {
      payload.startYear = parseInt(form.startYear.trim());
    }
    if (parseInt(form.endYear.trim()) !== (original.endYear || 0)) {
      payload.endYear = parseInt(form.endYear.trim());
    }
    if (form.cohort.trim() !== (original.academicInfo.cohort || '')) {
      payload.cohort = form.cohort.trim();
    }
    if (form.role !== (original.academicInfo.position || '')) {
      payload.position = form.role;
    }

    return payload;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    const basicPayload = buildBasicPayload();
    const academicPayload = buildAcademicPayload();

    try {
      if (Object.keys(basicPayload).length > 0) {
        await updateStudentBasic(student.id, basicPayload);
      }
      if (Object.keys(academicPayload).length > 0) {
        await updateStudentAcademic(student.id, academicPayload);
      }

      notifications.show({
        title: 'Thành công',
        message: 'Cập nhật sinh viên thành công',
        color: 'green',
      });
      onSave();
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: 'Cập nhật sinh viên thất bại',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Sửa Thông Tin Sinh Viên</h1>
        <p className={classes.pageSubtitle}>Cập nhật thông tin sinh viên trong hệ thống.</p>
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
                label="KHÓA HỌC (COHORT)"
                required
                placeholder="2026-2030"
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
          Xác nhận
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
