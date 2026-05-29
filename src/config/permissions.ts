const permissions = {
  pages: {
    '/dashboard': ['admin', 'lecturer', 'staff'],
    '/students': ['admin', 'staff'],
    '/programs': ['admin', 'staff'],
    '/majors': ['admin', 'staff'],
    '/subjects': ['admin', 'staff'],
    '/semesters': ['admin', 'staff'],
    '/classes': ['admin', 'staff'],
    '/lecturers': ['admin', 'lecturer'],
    '/student-classes': ['admin', 'staff'],
    '/departments': ['admin', 'staff'],
    '/exams': ['admin', 'lecturer'],
    '/enrollment-periods': ['admin', 'staff'],
    '/notifications': ['admin', 'staff', 'lecturer'],
    '/notification-templates': ['admin', 'staff'],
    '/requests': ['admin', 'staff'],
    '/news': ['admin', 'staff'],
    '/payments': ['admin', 'staff'],
    '/documents': ['admin', 'staff', 'lecturer'],
    '/academic-results': ['admin', 'lecturer'],
    '/feedback': ['admin', 'staff', 'lecturer'],
  },
  features: {
    // feature keys can be used inside pages/components for fine-grained control
    view_payments: ['admin', 'staff'],
    manage_users: ['admin'],
    view_academic_results: ['admin', 'lecturer'],
  },
};

export default permissions;
