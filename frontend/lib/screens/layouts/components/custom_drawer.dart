import 'package:boton/controllers/drawer_controller.dart';
import 'package:boton/controllers/menu_controller.dart';
import 'package:boton/screens/layouts/components/item_drawer.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomDrawer extends StatefulWidget {
  const CustomDrawer({super.key});

  @override
  State<CustomDrawer> createState() => _CustomDrawerState();
}

class _CustomDrawerState extends State<CustomDrawer> {
  double Opacity1 = 0,
      Opacity2 = 0,
      Opacity3 = 0,
      Opacity4 = 0,
      Opacity5 = 0,
      Opacity6 = 0,
      Opacity7 = 0,
      Opacity8 = 0;
  double Padding1 = 25,
      Padding2 = 25,
      Padding3 = 25,
      Padding4 = 25,
      Padding5 = 25,
      Padding6 = 25,
      Padding7 = 25,
      Padding8 = 25;

  @override
  void initState() {
    super.initState();
    loadAnimations();
  }

  @override
  Widget build(BuildContext context) {
    final MenuControllerr menuController = Get.find();

    return Drawer(
      child: Obx(
        () => ListView(
          padding: EdgeInsets.zero,
          children: [
            // ایتم اول دراور
            DrawerHeader(
              duration: Duration(seconds: 3),
              decoration: BoxDecoration(color: Colors.white),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.grey,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Icon(Icons.image, size: 50),
                    ),
                  ),
                  SizedBox(width: 12),
                  Text(
                    'آزمایشگاه بتن',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
            ),

            // ExpansionTile(
            //   initiallyExpanded: [
            //     DrawerSection.projects,
            //     DrawerSection.dailyTest,
            //     DrawerSection.activityReport,
            //     DrawerSection.financialReport,
            //   ].contains(menuController.selectedSection.value),
            //   title: Text('پنل آزمایشگاه بتن'),
            // ),
            DrawerItems(
              opacity:
                  [
                        DrawerSection.projects,
                        DrawerSection.dailyTest,
                        DrawerSection.activityReport,
                        DrawerSection.financialReport,
                        DrawerSection.managers,
                        DrawerSection.settings,
                        DrawerSection.support,
                      ].contains(menuController.selectedSection.value)
                      ? Opacity1
                      : Opacity1,
              padding: Padding1,
              menuController: menuController,
              text: 'پیشخوان',
              icon: Icons.dashboard_outlined,
              selection: DrawerSection.dashboard,
            ),
            DrawerItems(
              opacity: Opacity2,
              padding: Padding2,
              menuController: menuController,
              text: 'پروژه‌ها',
              icon: Icons.folder_copy_outlined,
              selection: DrawerSection.projects,
            ),
            DrawerItems(
              opacity: Opacity3,
              padding: Padding3,
              menuController: menuController,
              text: 'آزمایشهای روزانه',
              icon: Icons.today_outlined,
              selection: DrawerSection.dailyTest,
            ),
            DrawerItems(
              opacity: Opacity4,
              padding: Padding4,
              menuController: menuController,
              text: 'گزارش فعالیت',
              icon: Icons.history_edu_outlined,
              selection: DrawerSection.activityReport,
            ),
            DrawerItems(
              opacity: Opacity5,
              padding: Padding5,
              menuController: menuController,
              text: 'گزارش مالی',
              icon: Icons.monetization_on_outlined,
              selection: DrawerSection.financialReport,
            ),
            DrawerItems(
              opacity: Opacity6,
              padding: Padding6,
              menuController: menuController,
              text: 'مدیریت',
              icon: Icons.admin_panel_settings_outlined,
              selection: DrawerSection.managers,
            ),
            // DrawerItems(
            //   opacity: Opacity7,
            //   padding: Padding7,
            //   menuController: menuController,
            //   text: 'تنظیمات',
            //   icon: Icons.settings_outlined,
            //   selection: DrawerSection.settings,
            // ),
            DrawerItems(
              opacity: Opacity8,
              padding: Padding8,
              menuController: menuController,
              text: 'پشتیبانی',
              icon: Icons.support_agent_outlined,
              selection: DrawerSection.support,
            ),
          ],
        ),
      ),
    );
  }

  loadAnimations() async {
    await Future.delayed(const Duration(milliseconds: 300));
    setState(() {
      Opacity1 = 1;
      Padding1 = 0;
    });
    await Future.delayed(const Duration(milliseconds: 300));
    setState(() {
      Opacity2 = 1;
      Padding2 = 0;
    });
    await Future.delayed(const Duration(milliseconds: 300));
    setState(() {
      Opacity3 = 1;
      Padding3 = 0;
    });
    await Future.delayed(const Duration(milliseconds: 300));
    setState(() {
      Opacity4 = 1;
      Padding4 = 0;
    });
    await Future.delayed(const Duration(milliseconds: 300));
    setState(() {
      Opacity5 = 1;
      Padding5 = 0;
    });
    await Future.delayed(const Duration(milliseconds: 300));
    setState(() {
      Opacity6 = 1;
      Padding6 = 0;
    });
    await Future.delayed(const Duration(milliseconds: 300));
    setState(() {
      Opacity7 = 1;
      Padding7 = 0;
    });
    await Future.delayed(const Duration(milliseconds: 300));
    setState(() {
      Opacity8 = 1;
      Padding8 = 0;
    });
  }
}
