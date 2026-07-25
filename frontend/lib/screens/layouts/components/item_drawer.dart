import 'package:boton/controllers/drawer_controller.dart';
import 'package:boton/controllers/menu_controller.dart';
import 'package:flutter/material.dart';

class DrawerItems extends StatelessWidget {
  const DrawerItems({
    super.key,
    required this.opacity,
    required this.padding,
    required this.menuController,
    required this.text,
    required this.icon,
    required this.selection,
  });

  final double opacity;
  final double padding;
  final IconData icon;
  final MenuControllerr menuController;
  final String text;
  final DrawerSection selection;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 600),
      opacity: opacity,
      child: AnimatedPadding(
        padding: EdgeInsets.only(right: padding),
        duration: const Duration(milliseconds: 600),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(2, 0, 2, 0),
          child: ListTile(
            style: ListTileStyle.list,

            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(5),
            ),
            focusColor: const Color.fromARGB(255, 255, 191, 0),
            selectedColor: Colors.pink,
            selectedTileColor: const Color.fromARGB(255, 21, 146, 249),
            splashColor: const Color.fromARGB(149, 7, 87, 153),

            leading: Icon(icon),
            title: Text(text),
            selected: menuController.selectedSection.value == selection,
            onTap: () {
              menuController.selectSection(selection);
              if (Scaffold.of(context).isDrawerOpen) {
                Navigator.of(context).pop();
              }
            },
          ),
        ),
      ),
    );
  }

  static List<NavigationRailDestination> getDestinationss() {
    return const [
      NavigationRailDestination(
        icon: Icon(Icons.dashboard_outlined),
        selectedIcon: Icon(Icons.dashboard),
        label: Text('پیشخوان'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.folder_copy_outlined),
        selectedIcon: Icon(Icons.folder_copy),
        label: Text('پروژه‌ها'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.today_outlined),
        selectedIcon: Icon(Icons.today),
        label: Text('گزارش روزانه'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.history_edu_outlined),
        selectedIcon: Icon(Icons.history_edu),
        label: Text('گزارش فعالیت'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.monetization_on_outlined),
        selectedIcon: Icon(Icons.monetization_on),
        label: Text('گزارش مالی'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.admin_panel_settings_outlined),
        selectedIcon: Icon(Icons.admin_panel_settings),
        label: Text('مدیریت'),
      ),
      // NavigationRailDestination(
      //   icon: Icon(Icons.settings_outlined),
      //   selectedIcon: Icon(Icons.settings),
      //   label: Text('تنظیمات'),
      // ),
      NavigationRailDestination(
        icon: Icon(Icons.support_agent_outlined),
        selectedIcon: Icon(Icons.support_agent),
        label: Text('پشتیبانی'),
      ),
    ];
  }
}
