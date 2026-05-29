import { NavLink } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

import {
  IconLayoutDashboard,
  IconUsers,
  IconBook2,
  IconAtom,
  IconCalendarEvent,
  IconChalkboard,
  IconBuildingBank,
  IconBellRinging,
  IconClipboardList,
  IconNews,
  IconCreditCard,
  IconLogout,
  IconSwitchHorizontal,
  IconFileDescription,
  IconCertificate,
  IconFiles,
  IconCalendarPlus,
  IconMessageCircle2,
} from '@tabler/icons-react';
import { Group } from '@mantine/core';
import { usePermission } from '../../hooks/usePermission';
import logo from '../../assets/TLU_Standard_version-03.png';
import classes from './Navbar.module.css';

const data = [
  { link: '/dashboard', label: 'Bảng điều khiển', icon: IconLayoutDashboard },
  { link: '/students', label: 'Sinh viên', icon: IconUsers },
  { link: '/programs', label: 'Chương trình đào tạo', icon: IconBook2 },
  { link: '/majors', label: 'Ngành', icon: IconAtom },
  { link: '/subjects', label: 'Môn học', icon: IconAtom },
  { link: '/semesters', label: 'Học kỳ', icon: IconCalendarEvent },
  { link: '/classes', label: 'Lớp học phần', icon: IconCalendarEvent },
  { link: '/lecturers', label: 'Giảng viên', icon: IconChalkboard },
  { link: '/student-classes', label: 'Lớp sinh viên', icon: IconUsers },
  { link: '/departments', label: 'Khoa / Bộ môn', icon: IconBuildingBank },
  { link: '/exams', label: 'Lịch thi', icon: IconFileDescription },
  { link: '/enrollment-periods', label: 'Đăng ký học', icon: IconCalendarPlus },
  { link: '/notifications', label: 'Thông báo', icon: IconBellRinging },
  { link: '/notification-templates', label: 'Mẫu thông báo', icon: IconBellRinging },
  { link: '/requests', label: 'Đơn từ', icon: IconClipboardList },
  { link: '/news', label: 'Tin tức', icon: IconNews },
  { link: '/payments', label: 'Học phí', icon: IconCreditCard },
  { link: '/documents', label: 'Tài liệu AI', icon: IconFiles },
  { link: '/academic-results', label: 'Kết quả học tập', icon: IconCertificate },
  { link: '/feedback', label: 'Feedback / Góp ý', icon: IconMessageCircle2 },
];

export function Navbar() {
  const { instance } = useMsal();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    instance.logoutRedirect();
  };

  const handleChangeAccount = () => {
    instance.logoutRedirect();
  };

  const { canAccessPage } = usePermission();

  const visible = data.filter((d) => canAccessPage(d.link));

  const links = visible.map((item) => (
    <NavLink
      to={item.link}
      className={({ isActive }) => (isActive ? `${classes.link} ${classes.active}` : classes.link)}
      key={item.label}
      end={item.link === '/dashboard'}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </NavLink>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} gap="sm">
          <img src={logo} alt="logo" style={{ width: 150, padding: '8px' }} />
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => { event.preventDefault(); handleChangeAccount(); }}>
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change account</span>
        </a>
        <a href="#" className={classes.link} onClick={(event) => { event.preventDefault(); handleLogout(); }}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
