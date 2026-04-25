import {
    IconDeviceLaptop,
    IconBuildingBank,
    IconLanguage,
    IconMusic,
    IconUsers,
    IconHeartbeat,
    IconBeach,
    IconDeviceTv,
} from '@tabler/icons-react';
import type { Faculty } from '../types';
import classes from './FacultyCard.module.css';

interface Props {
    faculty: Faculty;
    onClick: (faculty: Faculty) => void;
}

const iconMap: Record<string, React.ElementType> = {
    laptop: IconDeviceLaptop,
    bank: IconBuildingBank,
    translate: IconLanguage,
    music: IconMusic,
    social: IconUsers,
    health: IconHeartbeat,
    travel: IconBeach,
    media: IconDeviceTv,
};

export function FacultyCard({ faculty, onClick }: Props) {
    const Icon = iconMap[faculty.icon] ?? IconUsers;

    return (
        <div className={classes.card} onClick={() => onClick(faculty)}>
            <div className={classes.iconWrapper} style={{ backgroundColor: `${faculty.color}18` }}>
                <Icon size={28} color={faculty.color} stroke={1.5} />
            </div>

            <h3 className={classes.name}>{faculty.name}</h3>
            <p className={classes.desc}>{faculty.description}</p>

            <div className={classes.footer}>
                <div>
                    <span className={classes.label}>Mã khoa</span>
                    <span className={classes.count}>{faculty.facultyCode}</span>
                </div>
            </div>
        </div>
    );
}
