import 'package:boton/constants/app_theme.dart';
import 'package:boton/constants/navigation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DrawerItem {
  final DrawerSection section;
  final String label;
  final IconData icon;
  final IconData selectedIcon;

  const DrawerItem({
    required this.section,
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });
}

class DrawerItems {
  static const List<DrawerItem> items = [
    DrawerItem(
      section: DrawerSection.dashboard,
      label: 'پیشخوان',
      icon: Icons.dashboard_outlined,
      selectedIcon: Icons.dashboard,
    ),
    DrawerItem(
      section: DrawerSection.projects,
      label: 'پروژه‌ها',
      icon: Icons.folder_copy_outlined,
      selectedIcon: Icons.folder_copy,
    ),
    DrawerItem(
      section: DrawerSection.dailyTest,
      label: 'آزمایشهای روزانه',
      icon: Icons.today_outlined,
      selectedIcon: Icons.today,
    ),
    DrawerItem(
      section: DrawerSection.activityReport,
      label: 'گزارش فعالیت',
      icon: Icons.history_edu_outlined,
      selectedIcon: Icons.history_edu,
    ),
    DrawerItem(
      section: DrawerSection.financialReport,
      label: 'گزارش مالی',
      icon: Icons.monetization_on_outlined,
      selectedIcon: Icons.monetization_on,
    ),
    DrawerItem(
      section: DrawerSection.managers,
      label: 'مدیریت',
      icon: Icons.admin_panel_settings_outlined,
      selectedIcon: Icons.admin_panel_settings,
    ),
    DrawerItem(
      section: DrawerSection.support,
      label: 'پشتیبانی',
      icon: Icons.support_agent_outlined,
      selectedIcon: Icons.support_agent,
    ),
  ];

  static List<NavigationRailDestination> getDestinationss() {
    return items
        .map(
          (item) => NavigationRailDestination(
            icon: Icon(item.icon),
            selectedIcon: Icon(item.selectedIcon),
            label: Text(item.label),
          ),
        )
        .toList();
  }

  static List<NavigationRailDestination> getRailDestinations() {
    return getDestinationss();
  }
}
