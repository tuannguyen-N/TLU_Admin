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

import toanTin from '../../../assets/toan-tin.png';
import kinhTe from '../../../assets/kinh-te.png';
import ngoaiNgu from '../../../assets/ngoai-ngu.png';
import amNhac from '../../../assets/am-nhac.png';
import khoaHocXaHoi from '../../../assets/khoa-hoc-xa-hoi.png';
import sucKhoe from '../../../assets/suc-khoe.png';
import duLich from '../../../assets/du-lich.png';
import truyenThong from '../../../assets/truyen-thong.png';

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

const imageMap: Record<string, string> = {
  'toan-tin': toanTin,
  'kinh-te': kinhTe,
  'ngoai-ngu': ngoaiNgu,
  'am-nhac': amNhac,
  'khoa-hoc-xa-hoi': khoaHocXaHoi,
  'suc-khoe': sucKhoe,
  'du-lich': duLich,
  'truyen-thong': truyenThong,
};

interface Props {
  faculty: Faculty;
  onClick: (faculty: Faculty) => void;
}

export function FacultyCard({ faculty, onClick }: Props) {
  const Icon = iconMap[faculty.icon] ?? IconUsers;
  const image = faculty.image ? imageMap[faculty.image] : undefined;

  return (
    <div className={classes.card} onClick={() => onClick(faculty)}>
      <div className={classes.iconWrapper} style={{ backgroundColor: `${faculty.color}18` }}>
        <Icon size={28} color={faculty.color} stroke={1.5} />
      </div>

      <h3 className={classes.name}>{faculty.name}</h3>
      <p className={classes.desc}>{faculty.description}</p>

      <div className={classes.footer}>
        <div className={classes.imageThumb}>
          {image
            ? <img src={image} alt={faculty.name} className={classes.thumbImg} />
            : <Icon size={48} color={faculty.color} stroke={0.8} opacity={0.3} />
          }
        </div>
      </div>
    </div>
  );
}