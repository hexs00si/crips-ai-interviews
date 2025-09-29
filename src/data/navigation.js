export const navItems = [
  {
    name: 'Home',
    link: '/'
  },
  {
    name: 'About',
    link: '/about'
  }
];

export const protectedNavItems = [
  {
    name: 'Dashboard',
    link: '/dashboard',
    roles: ['interviewer', 'admin']
  },
  {
    name: 'Profile',
    link: '/profile',
    roles: ['interviewer', 'admin']
  },
  {
    name: 'Admin',
    link: '/admin',
    roles: ['admin']
  }
];