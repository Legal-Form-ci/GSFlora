import {
  Home, Users, GraduationCap, BookOpen, Calendar, BarChart3, Bell, Settings,
  MessageSquare, FileText, ClipboardList, ClipboardCheck, AlertTriangle,
  DollarSign, CalendarDays, Building2, Megaphone, LayoutDashboard, CreditCard,
  Receipt, PieChart as PieChartIcon,
} from 'lucide-react';

export const studentNavItems = [
  { label: 'Tableau de bord', href: '/student', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/student/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Devoirs', href: '/student/assignments', icon: <FileText className="w-5 h-5" /> },
  { label: 'Quiz', href: '/student/quizzes', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Mes notes', href: '/student/grades', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/student/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/student/announcements', icon: <Bell className="w-5 h-5" /> },
];

export const teacherNavItems = [
  { label: 'Tableau de bord', href: '/teacher', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/teacher/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Devoirs', href: '/teacher/assignments', icon: <FileText className="w-5 h-5" /> },
  { label: 'Quiz', href: '/teacher/quizzes', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Bulletins', href: '/teacher/report-cards', icon: <FileText className="w-5 h-5" /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/teacher/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
];

export const censorNavItems = [
  { label: 'Tableau de bord', href: '/censor', icon: <Home className="w-5 h-5" /> },
  { label: 'Classes', href: '/censor/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Enseignants', href: '/censor/teachers', icon: <Users className="w-5 h-5" /> },
  { label: 'Programmes', href: '/censor/curriculum', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Emplois du temps', href: '/censor/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Rapports', href: '/censor/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/censor/announcements', icon: <Bell className="w-5 h-5" /> },
];

export const educatorNavItems = [
  { label: 'Tableau de bord', href: '/educator', icon: <Home className="w-5 h-5" /> },
  { label: 'Élèves', href: '/educator/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Présences', href: '/educator/attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/educator/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Discipline', href: '/educator/discipline', icon: <AlertTriangle className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/educator/announcements', icon: <Bell className="w-5 h-5" /> },
];

export const principalTeacherNavItems = [
  { label: 'Tableau de bord', href: '/principal-teacher', icon: <Home className="w-5 h-5" /> },
  { label: 'Ma classe', href: '/principal-teacher/class', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Mes élèves', href: '/principal-teacher/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/teacher/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Conseils de classe', href: '/principal-teacher/councils', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Bulletins', href: '/teacher/report-cards', icon: <FileText className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/principal-teacher/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/principal-teacher/announcements', icon: <Bell className="w-5 h-5" /> },
];

export const parentNavItems = [
  { label: 'Tableau de bord', href: '/parent', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes enfants', href: '/parent/children', icon: <Users className="w-5 h-5" /> },
  { label: 'Notes', href: '/parent/grades', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Présences', href: '/parent/attendance', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/parent/announcements', icon: <Bell className="w-5 h-5" /> },
];

export const adminNavItems = [
  { label: 'Tableau de bord', href: '/admin', icon: <Home className="w-5 h-5" /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', href: '/admin/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Matières', href: '/admin/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Emplois du temps', href: '/admin/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Cartes élèves', href: '/admin/student-cards', icon: <Users className="w-5 h-5" /> },
  { label: 'Comptabilité', href: '/accountant', icon: <DollarSign className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/admin/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Annonces', href: '/admin/announcements', icon: <Bell className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/settings', icon: <Settings className="w-5 h-5" /> },
];

export const directorNavItems = [
  { label: 'Tableau de bord', href: '/director', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Générateur EDT', href: '/director/schedule-generator', icon: <CalendarDays className="w-5 h-5" /> },
  { label: 'Emplois du temps', href: '/director/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Utilisateurs', href: '/director/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', href: '/director/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Matières', href: '/director/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Cartes élèves', href: '/admin/student-cards', icon: <FileText className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/director/statistics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Annonces', href: '/director/announcements', icon: <Megaphone className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/settings', icon: <Settings className="w-5 h-5" /> },
];

export const founderNavItems = [
  { label: 'Tableau de bord', href: '/founder', icon: <Home className="w-5 h-5" /> },
  { label: 'Vue d\'ensemble', href: '/founder/overview', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Comptabilité', href: '/accountant', icon: <DollarSign className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/founder/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Personnel', href: '/founder/staff', icon: <Users className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/settings', icon: <Settings className="w-5 h-5" /> },
];

export const accountantNavItems = [
  { label: 'Tableau de bord', href: '/accountant', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Paiements', href: '/accountant/payments', icon: <CreditCard className="w-5 h-5" /> },
  { label: 'Dépenses', href: '/accountant/expenses', icon: <Receipt className="w-5 h-5" /> },
  { label: 'Frais de scolarité', href: '/accountant/fees', icon: <PieChartIcon className="w-5 h-5" /> },
  { label: 'Rapports', href: '/accountant/reports', icon: <BarChart3 className="w-5 h-5" /> },
];

export const profileNavItems = [
  { label: 'Retour', href: '/', icon: <Home className="w-5 h-5" /> },
  { label: 'Profil', href: '/profile', icon: <Users className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/settings', icon: <Settings className="w-5 h-5" /> },
];
