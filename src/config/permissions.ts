const permissions = {
  pages: {
    '/': ['ADMIN', 'LECTURER', 'STAFF'],
    '/dashboard': ['ADMIN', 'LECTURER', 'STAFF'],
    '/students': ['ADMIN', 'STAFF'],
    '/programs': ['ADMIN', 'STAFF'],
    '/majors': ['ADMIN', 'STAFF'],
    '/subjects': ['ADMIN', 'STAFF'],
    '/semesters': ['ADMIN', 'STAFF'],
    '/classes': ['ADMIN', 'STAFF'],
    '/lecturers': ['ADMIN', 'LECTURER'],
    '/student-classes': ['ADMIN', 'STAFF'],
    '/departments': ['ADMIN', 'STAFF'],
    '/exams': ['ADMIN', 'LECTURER'],
    '/enrollment-periods': ['ADMIN', 'STAFF'],
    '/notifications': ['ADMIN', 'STAFF', 'LECTURER'],
    '/notification-templates': ['ADMIN', 'STAFF'],
    '/requests': ['ADMIN', 'STAFF'],
    '/news': ['ADMIN', 'STAFF'],
    '/payments': ['ADMIN', 'STAFF'],
    '/documents': ['ADMIN', 'STAFF', 'LECTURER'],
    '/academic-results': ['ADMIN', 'LECTURER'],
    '/feedback': ['ADMIN', 'STAFF', 'LECTURER'],
  },
  features: {
    // feature keys can be used inside pages/components for fine-grained control
    view_payments: ['ADMIN', 'STAFF'],
    manage_users: ['ADMIN'],
    view_academic_results: ['ADMIN', 'LECTURER'],
  },
};

export default permissions;
