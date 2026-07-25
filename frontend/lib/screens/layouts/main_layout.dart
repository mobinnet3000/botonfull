// lib/layouts/main_layout.dart
import 'package:boton/controllers/base_controller.dart';
import 'package:boton/screens/loading/loading.dart';
import 'package:boton/controllers/drawer_controller.dart';
import 'package:boton/controllers/menu_controller.dart';
import 'package:boton/screens/daily/daily.dart';
import 'package:boton/screens/finance/finance_report.dart';
import 'package:boton/screens/layouts/components/costum_app_bar.dart';
import 'package:boton/screens/layouts/components/custom_drawer.dart';
import 'package:boton/screens/layouts/components/header.dart';
import 'package:boton/screens/layouts/components/item_drawer.dart';
import 'package:boton/screens/report/report.dart';
import 'package:boton/screens/setting/set.dart';
import 'package:boton/screens/setting/setting.dart';
import 'package:flutter/material.dart';
// صفحات مختلف داشبورد را اینجا وارد می‌کنیم
import 'package:boton/screens/dashboard/dashboard_home_page.dart';
import 'package:boton/screens/project/projects_page.dart';
import 'package:boton/screens/dashboard/placeholder_page.dart';
// --- ایمپورت جدید برای صفحه پشتیبانی ---
import 'package:boton/screens/support/support_page.dart';
import 'package:get/get.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0; // آیتم منوی انتخاب شده
  bool _isRailExpanded = true; // آیا منوی کناری در حالت دسکتاپ باز است یا بسته
  // final ProjectController controllerrr = Get.find<ProjectController>();
  Widget getBody(DrawerSection section) {
    switch (section) {
      case DrawerSection.dashboard:
        return DashboardHomePage();
      case DrawerSection.projects:
        return MainCirclesBackground(title: "پروژه ها ", base: ProjectsPage());
      case DrawerSection.dailyTest:
        return MainCirclesBackground(title: 'آزمایشهای روزانه', base: Daily());
      case DrawerSection.activityReport:
        return ProfessionalDashboardScreen();
      case DrawerSection.financialReport:
        return FinancialDashboardScreen();
      case DrawerSection.managers:
        return ProfileDetailsTab(
          labProfile: Get.find<ProjectController>().user.value!.labProfile,
        );
      case DrawerSection.settings:
        return ProfileDetailsTab(
          labProfile: Get.find<ProjectController>().user.value!.labProfile,
        );
      case DrawerSection.support:
        return MainCirclesBackground(title: " پشتیبانی ", base: SupportPage());

      // default:
      // return Center(child: Text('صفحه پیدا نشد'));
    }
  }

  static List ml = [
    DrawerSection.dashboard,
    DrawerSection.projects,
    DrawerSection.dailyTest,
    DrawerSection.activityReport,
    DrawerSection.financialReport,
    DrawerSection.managers,
    // DrawerSection.settings,
    DrawerSection.support,
  ]; // لیست صفحات ما که با انتخاب منو تغییر می‌کند
  // static const List<Widget> _pages = <Widget>[
  //   DashboardHomePage(), // پیشخوان
  //   ProjectsPage(), // پروژه‌ها
  //   PlaceholderPage(title: 'گزارش فعالیت'),
  //   PlaceholderPage(title: 'گزارش مالی'),
  //   PlaceholderPage(title: 'مدیریت'),
  //   SupportPage(), // <-- تغییر اصلی اینجاست: PlaceholderPage با SupportPage جایگزین شد
  // ];
  final MenuControllerr menuController = Get.put(MenuControllerr());
  final ProjectController controller = Get.put(ProjectController());

  @override
  Widget build(BuildContext context) {
    // با استفاده از MediaQuery اندازه صفحه را تشخیص می‌دهیم
    final isLargeScreen = MediaQuery.of(context).size.width > 800;

    return Obx(
      () => Scaffold(
        appBar: CustomAppBar(
          title:
              controller.isLoading.value
                  ? "پنل آزمایشگاه بتن"
                  : controller.user.value == null
                  ? "پنل آزمایشگاه من"
                  : controller
                      .user
                      .value!
                      .labProfile
                      .labName, // اینجا دیگر امن است
        ),
        // دراور فقط برای صفحات کوچک استفاده می‌شود
        drawer: isLargeScreen ? null : Drawer(child: CustomDrawer()),
        body: Row(
          children: [
            // منوی ثابت کناری (NavigationRail) فقط در صفحات بزرگ نمایش داده می‌شود
            if (isLargeScreen)
              // NavigationRail(
              //     selectedIndex: _seletedIndex,
              //     extended: _isRailExpanded, // کنترل باز و بسته بودن
              //     onDestinationSelected: (index) {
              //       setState(() {
              //         () => _selectedIndex = index;
              //         menuController.selectSection(ml[index]);
              //       });
              //     },
              //     leading: IconButton(
              //       icon: Icon(_isRailExpanded ? Icons.menu_open : Icons.menu),
              //       onPressed: () {
              //         setState(() => _isRailExpanded = !_isRailExpanded);
              //       },
              //     ),
              //     destinations: DrawerItems.getDestinationss(),
              //   ),
              AnimatedContainer(
                duration: Duration(milliseconds: 300), // مدت زمان انیمیشن
                curve: Curves.easeInOut, // نوع منحنی انیمیشن
                child: NavigationRail(
                  // labelType: NavigationRailLabelType.all,
                  backgroundColor: const Color.fromARGB(98, 164, 214, 255),
                  useIndicator: true,
                  unselectedLabelTextStyle: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    color: Colors.black,
                  ),
                  selectedLabelTextStyle: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w900,
                    color: Colors.blue,
                  ),
                  indicatorColor: const Color.fromARGB(255, 0, 106, 199),
                  selectedIndex: _selectedIndex,
                  extended: _isRailExpanded, // کنترل باز و بسته بودن
                  onDestinationSelected: (index) {
                    setState(() => _selectedIndex = index);
                    menuController.selectSection(ml[index]);
                  },

                  leading: Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          _isRailExpanded ? Icons.menu_open : Icons.menu,
                        ),
                        onPressed: () {
                          setState(() => _isRailExpanded = !_isRailExpanded);
                        },
                      ),
                      // Expanded(child: SizedBox()),
                    ],
                  ),
                  destinations: DrawerItems.getDestinationss(),
                ),
              ),

            const VerticalDivider(thickness: 1, width: 1),

            // محتوای اصلی صفحه
            Expanded(
              child: Obx(
                () =>
                    controller.isLoading.value
                        ? Loadingg()
                        : getBody(menuController.selectedSection.value),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
