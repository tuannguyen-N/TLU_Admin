import { Button, Group, Checkbox, Select, Text, Loader, Center } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import type { SubjectDetail } from '../types';
import { fetchSemesters } from '../../semesters/services';
import classes from './AddSubjectCard.module.css';

interface EditSubjectCardProps {
    subject: SubjectDetail;
    onCancel: () => void;
    onSave: (data: SubjectFormData) => void;
}

export interface SubjectFormData {
    semesterId: number;
    isRequired: boolean;
    electiveGroup: string | null;
}

const electiveGroupOptions = [
    { value: '', label: 'Không thuộc nhóm tự chọn' },
    { value: 'GROUP_1', label: 'Nhóm tự chọn 1' },
    { value: 'GROUP_2', label: 'Nhóm tự chọn 2' },
    { value: 'GROUP_3', label: 'Nhóm tự chọn 3' },
];

export function EditSubjectCard({ subject, onCancel, onSave }: EditSubjectCardProps) {
    const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);
    const [semestersLoading, setSemestersLoading] = useState(false);
    const [semestersError, setSemestersError] = useState<string | null>(null);

    const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
    const [selectedElectiveGroup, setSelectedElectiveGroup] = useState<string>(
        subject.electiveGroup || ''
    );
    const [isRequired, setIsRequired] = useState<boolean>(subject.isRequired);

    useEffect(() => {
        const loadSemesters = async () => {
            setSemestersLoading(true);
            setSemestersError(null);
            try {
                const { semesters } = await fetchSemesters({ page: 0, size: 50 });
                const options = semesters.map((sem: any) => ({
                    value: String(sem.id),
                    label: sem.semesterName,
                }));
                setSemesterOptions(options);

                // pre-fill học kỳ hiện tại của môn nếu match được
                if (subject.semesterId) {
                    setSelectedSemesterId(String(subject.semesterId));
                }
            } catch {
                setSemestersError('Không thể tải danh sách học kỳ');
            } finally {
                setSemestersLoading(false);
            }
        };
        loadSemesters();
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSemesterId) return;
        onSave({
            semesterId: parseInt(selectedSemesterId, 10),
            isRequired,
            electiveGroup: selectedElectiveGroup || null,
        });
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <h3 className={classes.title}>Sửa môn học - {subject.subjectName}</h3>
                <button type="button" className={classes.closeBtn} onClick={onCancel}>
                    <IconX size={18} />
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className={classes.formGrid}>
                    <Text size="sm" fw={500}>Mã môn: {subject.subjectCode}</Text>
                    <div />

                    {semestersError ? (
                        <Text size="sm" c="red">{semestersError}</Text>
                    ) : (
                        <Select
                            label="Học kỳ"
                            data={semesterOptions}
                            value={selectedSemesterId}
                            onChange={(val) => val && setSelectedSemesterId(val)}
                            placeholder={semestersLoading ? 'Đang tải...' : 'Chọn học kỳ'}
                            disabled={semestersLoading}
                            rightSection={semestersLoading ? <Loader size={14} /> : undefined}
                            required
                            searchable
                            size="sm"
                        />
                    )}

                    <Select
                        label="Nhóm tự chọn"
                        data={electiveGroupOptions}
                        value={selectedElectiveGroup}
                        onChange={(val) => setSelectedElectiveGroup(val || '')}
                        placeholder="Chọn nhóm tự chọn"
                        size="sm"
                    />
                    <Checkbox
                        label="Môn bắt buộc"
                        checked={isRequired}
                        onChange={(e) => setIsRequired(e.currentTarget.checked)}
                        size="sm"
                    />
                </div>
                <Group justify="flex-end" mt="xl">
                    <Button variant="subtle" onClick={onCancel}>Hủy</Button>
                    <Button
                        type="submit"
                        style={{ backgroundColor: '#111827', color: '#fff' }}
                        disabled={semestersLoading || !selectedSemesterId}
                    >
                        Lưu thay đổi
                    </Button>
                </Group>
            </form>
        </div>
    );
}