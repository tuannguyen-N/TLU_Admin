import {
    TextInput, Select, Button, Stack, Grid, Alert, NumberInput, LoadingOverlay,
    MultiSelect, ActionIcon, Paper, Text, Badge, Group, Divider, Textarea
} from '@mantine/core';
import {
    IconCode, IconBook, IconX, IconDeviceFloppy, IconListCheck,
    IconPlus, IconTrash, IconGitBranch, IconAlertCircle
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import classes from './AddSubjectCard.module.css';
import {
    fetchFaculties, fetchDepartments, fetchSubjects, updateSubject, fetchSubjectDetail
} from '../services';
import type { SubjectFormData, FacultyOption, DepartmentOption } from '../types';
import type { SubjectDetail } from '../services';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ValidationErrors {
    facultyId?: string;
    subjectCode?: string;
    subjectName?: string;
    credits?: string;
    coefficient?: string;
    lectureHours?: string;
    practiceHours?: string;
}

interface PrerequisiteGroupForm {
    id?: number;                       // existing group id (undefined = new)
    minSubjectsRequired: number | null;
    description: string;
    prerequisiteSubjectIds: string[];  // stored as string[] for MultiSelect
}

interface EnrollmentConditionForm {
    id?: number;
    conditionType: string;
    conditionValue: number | null;
    conditionOperator: string;
    description: string;
}

interface Props {
    subjectId: number;
    onCancel: () => void;
    onSave: (data: SubjectFormData) => void;
}

interface SubjectFormDataInput {
    facultyId: number | null;
    departmentId: number | null;
    subjectCode: string;
    subjectName: string;
    credits: number | null;
    coefficient: number | null;
    lectureHours: number | null;
    practiceHours: number | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle = ({
    icon: Icon, number, title,
}: {
    icon: any; number: number; title: string;
}) => (
    <div className={classes.sectionTitle}>
        <div className={classes.sectionIcon}>
            <Icon size={18} />
        </div>
        <span className={classes.sectionNum}>{number}.</span>
        <span className={classes.sectionText}>{title}</span>
    </div>
);

// ─── Condition type / operator options ───────────────────────────────────────

const CONDITION_TYPE_OPTIONS = [
    { value: 'GPA', label: 'GPA tối thiểu' },
    { value: 'TOTAL_CREDITS', label: 'Tổng số tín chỉ' },
];

const CONDITION_OPERATOR_OPTIONS = [
    { value: '>=', label: '>= (Lớn hơn hoặc bằng)' },
    { value: '>', label: '> (Lớn hơn)' },
    { value: '=', label: '= (Bằng)' },
    { value: '<=', label: '<= (Nhỏ hơn hoặc bằng)' },
];

// Helper: accept incoming operator codes (GTE, LTE, EQ, GT, LT) or symbols and
// normalize to symbol characters for UI and for sending to server.
const normalizeOperatorToSymbol = (op?: string | null) => {
    if (!op) return '>='; // default
    switch (op) {
        case 'GTE':
            return '>=';
        case 'LTE':
            return '<=';
        case 'EQ':
            return '=';
        case 'GT':
            return '>';
        case 'LT':
            // map legacy LT to '<=' so UI will present the supported <= option
            return '<=';
        default:
            return op; // already a symbol or unknown - pass through
    }
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function EditSubjectCard({ subjectId, onCancel, onSave }: Props) {
    // Basic form
    const [form, setForm] = useState<SubjectFormDataInput>({
        facultyId: null,
        departmentId: null,
        subjectCode: '',
        subjectName: '',
        credits: null,
        coefficient: null,
        lectureHours: null,
        practiceHours: null,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);

    // Dropdown data
    const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
    const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
    const [allSubjectOptions, setAllSubjectOptions] = useState<{ value: string; label: string }[]>([]);
    const [facultiesLoading, setFacultiesLoading] = useState(false);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);
    const [subjectsLoading, setSubjectsLoading] = useState(false);

    // Prerequisite groups
    const [prerequisiteGroups, setPrerequisiteGroups] = useState<PrerequisiteGroupForm[]>([]);
    // Track deleted existing groups so we can inform the server explicitly
    const [deletedPrerequisiteGroupIds, setDeletedPrerequisiteGroupIds] = useState<number[]>([]);

    // Enrollment conditions
    const [enrollmentConditions, setEnrollmentConditions] = useState<EnrollmentConditionForm[]>([]);
    // Track deleted existing conditions to send to server
    const [deletedEnrollmentConditionIds, setDeletedEnrollmentConditionIds] = useState<number[]>([]);

    // ── Load dropdowns + subject detail ────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            setInitLoading(true);
            try {
                setFacultiesLoading(true);
                setDepartmentsLoading(true);
                setSubjectsLoading(true);

                const [faculties, departments, subjectsResponse, detail] = await Promise.all([
                    fetchFaculties(),
                    fetchDepartments(),
                    fetchSubjects({ page: 0, size: 500 }),
                    fetchSubjectDetail(subjectId),
                ]);

                setFacultyOptions(faculties);
                setDepartmentOptions(departments);

                // Build subject options excluding the current subject
                const opts = subjectsResponse.subjects
                    .filter(s => s.id !== subjectId)
                    .map(s => ({
                        value: String(s.id),
                        label: `${s.subjectCode} – ${s.subjectName}`,
                    }));
                setAllSubjectOptions(opts);
                console.debug('[EditSubjectCard] built allSubjectOptions count=', opts.length);

                // Populate basic form
                setForm({
                    facultyId: detail.facultyId,
                    departmentId: detail.departmentId,
                    subjectCode: detail.subjectCode,
                    subjectName: detail.subjectName,
                    credits: detail.credits,
                    coefficient: detail.coefficient,
                    lectureHours: detail.lectureHours,
                    practiceHours: detail.practiceHours,
                });

                // Debug: inspect detail shape from API
                console.debug('[EditSubjectCard] subject detail:', detail);

                // Populate prerequisite groups
                setPrerequisiteGroups(
                    (detail.prerequisiteGroups ?? []).map(g => {
                        // Determine subject id strings for MultiSelect.
                        let subjectIdStrs: string[] = [];
                        if (Array.isArray((g as any).prerequisiteSubjectIds)) {
                            subjectIdStrs = (g as any).prerequisiteSubjectIds.map((id: any) => String(id));
                        } else if (Array.isArray((g as any).items)) {
                            // Items may contain subjectCode/subjectName; try to match to allSubjectOptions to find ids.
                            subjectIdStrs = (g as any).items
                                .map((it: any) => {
                                    const code = it?.subjectCode;
                                    if (!code) return null;
                                    const match = opts.find(o => o.label.startsWith(code + ' ' ) || o.label.startsWith(code + '–') || o.label.startsWith(code + '–') || o.label.startsWith(code + ' -') || o.label.startsWith(code + ' –'));
                                    if (match) return match.value;
                                    // fallback: try exact code match in label
                                    const match2 = opts.find(o => o.label.includes(code));
                                    return match2 ? match2.value : null;
                                })
                                .filter(Boolean) as string[];
                        }

                        return {
                            id: g.id,
                            minSubjectsRequired: g.minSubjectsRequired,
                            description: g.description ?? '',
                            prerequisiteSubjectIds: subjectIdStrs,
                        };
                    })
                );

                // Populate enrollment conditions (normalize operators to symbol form)
                setEnrollmentConditions(
                    (detail.enrollmentConditions ?? []).map(c => ({
                        id: c.id,
                        conditionType: c.conditionType,
                        conditionValue: c.conditionValue,
                        conditionOperator: normalizeOperatorToSymbol(c.conditionOperator),
                        description: c.description ?? '',
                    }))
                );
            } catch (err) {
                setApiError('Không thể tải thông tin môn học');
            } finally {
                setFacultiesLoading(false);
                setDepartmentsLoading(false);
                setSubjectsLoading(false);
                setInitLoading(false);
            }
        };
        init();
    }, [subjectId]);

    // ── Helpers ─────────────────────────────────────────────────────────────────
    const set = (key: keyof SubjectFormDataInput) => (val: any) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const handleFacultyChange = (facultyCode: string | null) => {
        if (!facultyCode) {
            setForm(prev => ({ ...prev, facultyId: null, departmentId: null }));
            return;
        }
        const selected = facultyOptions.find(f => f.value === facultyCode);
        if (selected) setForm(prev => ({ ...prev, facultyId: selected.id, departmentId: null }));
    };

    const handleDepartmentChange = (departmentIdStr: string | null) => {
        setForm(prev => ({
            ...prev,
            departmentId: departmentIdStr ? parseInt(departmentIdStr, 10) : null,
        }));
    };

    const selectedFaculty = facultyOptions.find(f => f.id === form.facultyId);
    const selectedFacultyCode = selectedFaculty?.value;
    const filteredDepartments = departmentOptions.filter(d => d.facultyCode === selectedFacultyCode);

    // ── Prerequisite groups handlers ────────────────────────────────────────────
    const addPrerequisiteGroup = () => {
        setPrerequisiteGroups(prev => [
            ...prev,
            { minSubjectsRequired: 1, description: '', prerequisiteSubjectIds: [] },
        ]);
    };

    const removePrerequisiteGroup = (index: number) => {
        setPrerequisiteGroups(prev => {
            const group = prev[index];
            if (group && group.id !== undefined) {
                setDeletedPrerequisiteGroupIds(ids => [...ids, group.id!]);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const updatePrerequisiteGroup = (
        index: number,
        field: keyof PrerequisiteGroupForm,
        value: any,
    ) => {
        setPrerequisiteGroups(prev =>
            prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
        );
    };

    // ── Enrollment conditions handlers ──────────────────────────────────────────
    const addEnrollmentCondition = () => {
        setEnrollmentConditions(prev => [
            ...prev,
            { conditionType: 'GPA', conditionValue: null, conditionOperator: '>=', description: '' },
        ]);
    };

    const removeEnrollmentCondition = (index: number) => {
        setEnrollmentConditions(prev => {
            const cond = prev[index];
            if (cond && cond.id !== undefined) {
                setDeletedEnrollmentConditionIds(ids => [...ids, cond.id!]);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const updateEnrollmentCondition = (
        index: number,
        field: keyof EnrollmentConditionForm,
        value: any,
    ) => {
        setEnrollmentConditions(prev =>
            prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
        );
    };

    // Helper to set field with coercion when conditionType changes
    const setEnrollmentConditionField = (index: number, field: keyof EnrollmentConditionForm, value: any) => {
        setEnrollmentConditions(prev =>
            prev.map((c, i) => {
                if (i !== index) return c;
                // If changing conditionType, coerce existing conditionValue accordingly
                if (field === 'conditionType') {
                    const newType = value as string;
                    let newValue = c.conditionValue;
                    if (newType === 'GPA') {
                        // clamp to 0-4 and allow float
                        if (newValue == null) newValue = null;
                        else newValue = Math.max(0, Math.min(4, Number(newValue))).valueOf();
                    } else if (newType === 'TOTAL_CREDITS') {
                        // integers only
                        if (newValue == null) newValue = null;
                        else newValue = Math.floor(Number(newValue));
                    }
                    return { ...c, conditionType: newType, conditionValue: newValue };
                }
                return { ...c, [field]: value };
            })
        );
    };

    // ── Validation ───────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const newErrors: ValidationErrors = {};
        if (!form.facultyId) newErrors.facultyId = 'Khoa là bắt buộc';
        if (!form.subjectCode.trim()) newErrors.subjectCode = 'Mã môn học là bắt buộc';
        if (!form.subjectName.trim()) newErrors.subjectName = 'Tên môn học là bắt buộc';
        if (!form.credits) newErrors.credits = 'Số tín chỉ là bắt buộc';
        if (!form.coefficient && form.coefficient !== 0) newErrors.coefficient = 'Hệ số là bắt buộc';
        if (!form.lectureHours && form.lectureHours !== 0) newErrors.lectureHours = 'Số giờ lý thuyết là bắt buộc';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Save ─────────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);
        setApiError(null);

        const payload: SubjectFormData & {
            prerequisiteGroups?: any[];
            enrollmentConditions?: any[];
        } = {
            facultyId: form.facultyId!,
            departmentId: form.departmentId!,
            subjectCode: form.subjectCode.trim(),
            subjectName: form.subjectName.trim(),
            credits: form.credits ?? 0,
            coefficient: form.coefficient ?? 1,
            lectureHours: form.lectureHours ?? 0,
            practiceHours: form.practiceHours ?? 0,
            prerequisiteGroups: prerequisiteGroups.map(g => ({
                ...(g.id !== undefined ? { id: g.id } : {}),
                minSubjectsRequired: g.minSubjectsRequired ?? 1,
                description: g.description,
                prerequisiteSubjectIds: g.prerequisiteSubjectIds.map(Number),
            })),
            enrollmentConditions: enrollmentConditions.map(c => {
                const type = c.conditionType === 'TOTAL_CREDITS' ? 'TOTAL_CREDITS' : 'GPA';
                let value: number = 0;
                if (type === 'GPA') {
                    const raw = c.conditionValue ?? 0;
                    const num = Number(raw);
                    value = Number(Math.max(0, Math.min(4, isNaN(num) ? 0 : num)).toFixed(2));
                } else {
                    const raw = c.conditionValue ?? 0;
                    const num = Number(raw);
                    value = isNaN(num) ? 0 : Math.floor(num);
                }

                return {
                    ...(c.id !== undefined ? { id: c.id } : {}),
                    conditionType: type,
                    conditionValue: value,
                    conditionOperator: c.conditionOperator,
                    description: c.description,
                };
            }),
            // explicitly include deleted ids so server can remove persisted records
            ...(deletedPrerequisiteGroupIds.length > 0 ? { deletedPrerequisiteGroupIds } : {}),
            ...(deletedEnrollmentConditionIds.length > 0 ? { deletedEnrollmentConditionIds } : {}),
        };

        try {
            await updateSubject(subjectId, payload);
            onSave(payload);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật môn học');
        } finally {
            setLoading(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <div className={classes.page} style={{ position: 'relative' }}>
            <LoadingOverlay visible={initLoading} />

            {/* Header */}
            <div className={classes.pageHeader}>
                <h1 className={classes.pageTitle}>Chỉnh Sửa Môn Học</h1>
                <p className={classes.pageSubtitle}>
                    Cập nhật thông tin chi tiết, điều kiện tiên quyết và điều kiện đăng ký học phần.
                </p>
            </div>

            <Stack gap={16}>

                {/* ── Section 1: Khoa / Bộ môn ───────────────────────────────────── */}
                <div className={classes.section}>
                    <SectionTitle icon={IconCode} number={1} title="Thông tin khoa và bộ môn" />
                    <Grid>
                        <Grid.Col span={6}>
                            <Select
                                label="KHOA"
                                required
                                placeholder="Chọn khoa"
                                data={facultyOptions.map(f => ({ value: f.value, label: f.label }))}
                                value={selectedFacultyCode ?? null}
                                onChange={handleFacultyChange}
                                error={errors.facultyId}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                searchable
                                loading={facultiesLoading}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="BỘ MÔN"
                                placeholder={form.facultyId ? 'Chọn bộ môn' : 'Chọn khoa trước'}
                                data={filteredDepartments.map(d => ({ value: String(d.id), label: d.label }))}
                                value={form.departmentId ? String(form.departmentId) : null}
                                onChange={handleDepartmentChange}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                searchable
                                disabled={!form.facultyId}
                                loading={departmentsLoading}
                                nothingFoundMessage="Không tìm thấy bộ môn"
                            />
                        </Grid.Col>
                    </Grid>
                </div>

                {/* ── Section 2: Thông tin môn học ───────────────────────────────── */}
                <div className={classes.section}>
                    <SectionTitle icon={IconBook} number={2} title="Thông tin môn học" />
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="MÃ MÔN HỌC"
                                required
                                placeholder="INT1001"
                                value={form.subjectCode}
                                onChange={e => set('subjectCode')(e.target.value)}
                                error={errors.subjectCode}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="TÊN MÔN HỌC"
                                required
                                placeholder="Nhập môn lập trình"
                                value={form.subjectName}
                                onChange={e => set('subjectName')(e.target.value)}
                                error={errors.subjectName}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="SỐ TÍN CHỈ"
                                required
                                placeholder="3"
                                value={form.credits ?? ''}
                                onChange={val => set('credits')(typeof val === 'number' ? val : null)}
                                error={errors.credits}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                min={1}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="HỆ SỐ"
                                required
                                placeholder="1"
                                value={form.coefficient ?? ''}
                                onChange={val => set('coefficient')(typeof val === 'number' ? val : null)}
                                error={errors.coefficient}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                min={1}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="HÌNH THỨC ĐÀO TẠO"
                                required
                                placeholder="Chính quy"
                                value="Chính quy"
                                disabled
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="SỐ GIỜ LÝ THUYẾT"
                                required
                                placeholder="30"
                                value={form.lectureHours ?? ''}
                                onChange={val => set('lectureHours')(typeof val === 'number' ? val : null)}
                                error={errors.lectureHours}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                min={0}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="SỐ GIỜ THỰC HÀNH"
                                required
                                placeholder="15"
                                value={form.practiceHours ?? ''}
                                onChange={val => set('practiceHours')(typeof val === 'number' ? val : null)}
                                error={errors.practiceHours}
                                classNames={{ label: classes.fieldLabel, input: classes.input }}
                                min={0}
                            />
                        </Grid.Col>
                    </Grid>
                </div>

                {/* ── Section 3: Nhóm môn học tiên quyết ────────────────────────── */}
                <div className={classes.section}>
                    <SectionTitle icon={IconGitBranch} number={3} title="Nhóm môn học tiên quyết" />

                    {prerequisiteGroups.length === 0 && (
                        <Paper
                            p="md"
                            radius="md"
                            style={{
                                background: '#f9fafb',
                                border: '1.5px dashed #d1d5db',
                                textAlign: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <Text size="sm" c="dimmed">
                                Chưa có nhóm tiên quyết nào. Nhấn "+ Thêm nhóm" để bắt đầu.
                            </Text>
                        </Paper>
                    )}

                    <Stack gap={12}>
                        {prerequisiteGroups.map((group, index) => (
                            <Paper
                                key={index}
                                p="lg"
                                radius="md"
                                style={{ border: '1px solid #e5e7eb', background: '#fafbff' }}
                            >
                                {/* Group header */}
                                <Group justify="space-between" mb={14}>
                                    <Group gap={8}>
                                        <Badge
                                            size="md"
                                            radius="sm"
                                            style={{ background: '#eef2ff', color: '#1a2b5e', fontWeight: 700 }}
                                        >
                                            Nhóm {index + 1}
                                        </Badge>
                                    </Group>
                                    <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        size="sm"
                                        onClick={() => removePrerequisiteGroup(index)}
                                        title="Xoá nhóm này"
                                    >
                                        <IconTrash size={15} />
                                    </ActionIcon>
                                </Group>

                                <Grid>
                                    {/* Môn học trong nhóm */}
                                    <Grid.Col span={12}>
                                        <MultiSelect
                                            label="MÔN HỌC TIÊN QUYẾT"
                                            required
                                            placeholder={
                                                subjectsLoading ? 'Đang tải danh sách môn học...' : 'Tìm kiếm và chọn môn học...'
                                            }
                                            data={allSubjectOptions}
                                            value={group.prerequisiteSubjectIds}
                                            onChange={val => updatePrerequisiteGroup(index, 'prerequisiteSubjectIds', val)}
                                            searchable
                                            clearable
                                            disabled={subjectsLoading}
                                            nothingFoundMessage="Không tìm thấy môn học"
                                            maxDropdownHeight={240}
                                            classNames={{ label: classes.fieldLabel, input: classes.input }}
                                            description="Có thể chọn nhiều môn học cùng lúc"
                                        />
                                    </Grid.Col>

                                    {/* Số môn tối thiểu */}
                                    <Grid.Col span={6}>
                                        <NumberInput
                                            label="SỐ MÔN TỐI THIỂU CẦN HOÀN THÀNH"
                                            required
                                            placeholder="1"
                                            value={group.minSubjectsRequired ?? ''}
                                            onChange={val =>
                                                updatePrerequisiteGroup(
                                                    index,
                                                    'minSubjectsRequired',
                                                    typeof val === 'number' ? val : null,
                                                )
                                            }
                                            min={1}
                                            max={group.prerequisiteSubjectIds.length || 1}
                                            classNames={{ label: classes.fieldLabel, input: classes.input }}
                                            description={
                                                group.prerequisiteSubjectIds.length > 0
                                                    ? `Tối đa ${group.prerequisiteSubjectIds.length} môn đã chọn`
                                                    : undefined
                                            }
                                        />
                                    </Grid.Col>

                                    {/* Mô tả */}
                                    <Grid.Col span={6}>
                                        <TextInput
                                            label="MÔ TẢ NHÓM"
                                            placeholder="Ví dụ: Hoàn thành ít nhất 1 trong các môn đại cương"
                                            value={group.description}
                                            onChange={e => updatePrerequisiteGroup(index, 'description', e.target.value)}
                                            classNames={{ label: classes.fieldLabel, input: classes.input }}
                                        />
                                    </Grid.Col>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>

                    <Button
                        mt={prerequisiteGroups.length > 0 ? 12 : 0}
                        variant="light"
                        color="blue"
                        size="sm"
                        leftSection={<IconPlus size={15} />}
                        onClick={addPrerequisiteGroup}
                        style={{ borderRadius: 8, color: '#1a2b5e', background: '#eef2ff' }}
                    >
                        Thêm nhóm tiên quyết
                    </Button>
                </div>

                {/* ── Section 4: Điều kiện đăng ký ───────────────────────────────── */}
                <div className={classes.section}>
                    <SectionTitle icon={IconListCheck} number={4} title="Điều kiện đăng ký học phần" />

                    {enrollmentConditions.length === 0 && (
                        <Paper
                            p="md"
                            radius="md"
                            style={{
                                background: '#f9fafb',
                                border: '1.5px dashed #d1d5db',
                                textAlign: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <Text size="sm" c="dimmed">
                                Chưa có điều kiện nào. Nhấn "Thêm điều kiện" để bắt đầu.
                            </Text>
                        </Paper>
                    )}

                    <Stack gap={12}>
                        {enrollmentConditions.map((cond, index) => (
                            <Paper
                                key={index}
                                p="lg"
                                radius="md"
                                style={{ border: '1px solid #e5e7eb', background: '#fafbff' }}
                            >
                                <Group justify="space-between" mb={14}>
                                    <Badge
                                        size="md"
                                        radius="sm"
                                        style={{ background: '#f0fdf4', color: '#166534', fontWeight: 700 }}
                                    >
                                        Điều kiện {index + 1}
                                    </Badge>
                                    <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        size="sm"
                                        onClick={() => removeEnrollmentCondition(index)}
                                        title="Xoá điều kiện này"
                                    >
                                        <IconTrash size={15} />
                                    </ActionIcon>
                                </Group>

                                <Grid>
                                    <Grid.Col span={4}>
                                        <Select
                                            label="LOẠI ĐIỀU KIỆN"
                                            required
                                            placeholder="Chọn loại"
                                            data={CONDITION_TYPE_OPTIONS}
                                            value={cond.conditionType || null}
                                            onChange={val => setEnrollmentConditionField(index, 'conditionType', val ?? 'GPA')}
                                            classNames={{ label: classes.fieldLabel, input: classes.input }}
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={4}>
                                        <Select
                                            label="TOÁN TỬ"
                                            required
                                            placeholder="Chọn toán tử"
                                            data={CONDITION_OPERATOR_OPTIONS}
                                            value={cond.conditionOperator || null}
                                            onChange={val => updateEnrollmentCondition(index, 'conditionOperator', val ?? '>=')}
                                            classNames={{ label: classes.fieldLabel, input: classes.input }}
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={4}>
                                        <NumberInput
                                            label="GIÁ TRỊ"
                                            required
                                            placeholder={cond.conditionType === 'TOTAL_CREDITS' ? '0' : '0.0'}
                                            value={cond.conditionValue ?? ''}
                                            onChange={val => {
                                                if (cond.conditionType === 'TOTAL_CREDITS') {
                                                    // ensure integer
                                                    const intVal = typeof val === 'number' ? Math.floor(val) : null;
                                                    setEnrollmentConditionField(index, 'conditionValue', intVal);
                                                } else {
                                                    // GPA: allow float and clamp 0-4
                                                    if (typeof val === 'number') {
                                                        const v = Math.max(0, Math.min(4, val));
                                                        setEnrollmentConditionField(index, 'conditionValue', Number(v.toFixed(2)));
                                                    } else {
                                                        setEnrollmentConditionField(index, 'conditionValue', null);
                                                    }
                                                }
                                            }}
                                            min={0}
                                            step={cond.conditionType === 'TOTAL_CREDITS' ? 1 : 0.01}
                                            decimalScale={cond.conditionType === 'TOTAL_CREDITS' ? 0 : 2}
                                            fixedDecimalScale={cond.conditionType !== 'TOTAL_CREDITS'}
                                            classNames={{ label: classes.fieldLabel, input: classes.input }}
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={12}>
                                        <TextInput
                                            label="MÔ TẢ ĐIỀU KIỆN"
                                            placeholder="Ví dụ: Sinh viên phải tích lũy tối thiểu 30 tín chỉ"
                                            value={cond.description}
                                            onChange={e => updateEnrollmentCondition(index, 'description', e.target.value)}
                                            classNames={{ label: classes.fieldLabel, input: classes.input }}
                                        />
                                    </Grid.Col>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>

                    <Button
                        mt={enrollmentConditions.length > 0 ? 12 : 0}
                        variant="light"
                        color="green"
                        size="sm"
                        leftSection={<IconPlus size={15} />}
                        onClick={addEnrollmentCondition}
                        style={{ borderRadius: 8, color: '#166534', background: '#f0fdf4' }}
                    >
                        Thêm điều kiện đăng ký
                    </Button>
                </div>

            </Stack>

            {/* Footer */}
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
                <Alert
                    color="red"
                    title="Lỗi"
                    mt="md"
                    icon={<IconAlertCircle size={16} />}
                >
                    {apiError}
                </Alert>
            )}
        </div>
    );
}