import { TextInput, NumberInput, Button, Group, Checkbox, Select } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import classes from './AddSubjectCard.module.css';

interface AddSubjectCardProps {
    semesterId: number;
    semesterName: string;
    onCancel: () => void;
    onSave: (data: SubjectFormData) => void;
}

export interface SubjectFormData {
    semesterId: number;
    subjectCode: string;
    subjectName: string;
    credits: number;
    lectureHours: number;
    practiceHours: number;
    isRequired: boolean;
    electiveGroup: string | null;
}

const electiveGroupOptions = [
    { value: '', label: 'Không thuộc nhóm tự chọn' },
    { value: 'GROUP_1', label: 'Nhóm tự chọn 1' },
    { value: 'GROUP_2', label: 'Nhóm tự chọn 2' },
    { value: 'GROUP_3', label: 'Nhóm tự chọn 3' },
];

export function AddSubjectCard({ semesterId, semesterName, onCancel, onSave }: AddSubjectCardProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const electiveGroup = formData.get('electiveGroup') as string;
        onSave({
            semesterId,
            subjectCode: formData.get('subjectCode') as string,
            subjectName: formData.get('subjectName') as string,
            credits: parseInt(formData.get('credits') as string, 10),
            lectureHours: parseInt(formData.get('lectureHours') as string, 10),
            practiceHours: parseInt(formData.get('practiceHours') as string, 10),
            isRequired: formData.get('isRequired') === 'on',
            electiveGroup: electiveGroup || null,
        });
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <h3 className={classes.title}>Thêm môn học - {semesterName}</h3>
                <button type="button" className={classes.closeBtn} onClick={onCancel}>
                    <IconX size={18} />
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className={classes.formGrid}>
                    <TextInput
                        label="Mã môn học"
                        name="subjectCode"
                        placeholder="Ví dụ: IT001"
                        required
                        size="sm"
                    />
                    <TextInput
                        label="Tên môn học"
                        name="subjectName"
                        placeholder="Ví dụ: Lập trình Python"
                        required
                        size="sm"
                    />
                    <NumberInput
                        label="Số tín chỉ"
                        name="credits"
                        placeholder="3"
                        min={1}
                        max={10}
                        required
                        size="sm"
                    />
                    <NumberInput
                        label="Số tiết lý thuyết"
                        name="lectureHours"
                        placeholder="30"
                        min={0}
                        required
                        size="sm"
                    />
                    <NumberInput
                        label="Số tiết thực hành"
                        name="practiceHours"
                        placeholder="15"
                        min={0}
                        required
                        size="sm"
                    />
                    <Select
                        label="Nhóm tự chọn"
                        name="electiveGroup"
                        data={electiveGroupOptions}
                        placeholder="Chọn nhóm tự chọn"
                        size="sm"
                    />
                    <Checkbox
                        label="Môn bắt buộc"
                        name="isRequired"
                        defaultChecked
                        size="sm"
                    />
                </div>
                <Group justify="flex-end" mt="xl">
                    <Button variant="subtle" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="submit" style={{ backgroundColor: '#111827', color: '#fff' }}>
                        Thêm môn học
                    </Button>
                </Group>
            </form>
        </div>
    );
}
