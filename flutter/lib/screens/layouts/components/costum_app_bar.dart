import 'package:boton/controllers/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;

  // Constructor برای دریافت عنوان اپ بار
  const CustomAppBar({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(
        title,
        style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900),
      ),
      backgroundColor: Colors.white, // رنگ پس‌زمینه اپ بار
      elevation: 8, // افزایش ارتفاع برای ایجاد سایه
      shadowColor: const Color.fromARGB(115, 0, 0, 0),
      actions: [
        IconButton(
          iconSize: 24,
          padding: EdgeInsets.all(8),
          constraints: BoxConstraints(minWidth: 48, minHeight: 48),
          color: const Color.fromARGB(255, 0, 9, 32),
          hoverColor: const Color.fromARGB(255, 0, 120, 219),
          mouseCursor: SystemMouseCursors.progress,
          tooltip: 'reload',
          icon: Icon(Icons.refresh), // آیکون جستجو
          onPressed: () {
            Get.find<ProjectController>().loadInitialData();

            // عملکردی که هنگام زدن آیکون جستجو انجام می‌شود
            // print('Search clicked');
          },
        ),
        IconButton(
          iconSize: 24,
          padding: EdgeInsets.all(8),
          constraints: BoxConstraints(minWidth: 48, minHeight: 48),
          color: const Color.fromARGB(255, 0, 9, 32),
          hoverColor: const Color.fromARGB(255, 0, 120, 219),
          mouseCursor: SystemMouseCursors.forbidden,
          tooltip: 'log out',
          icon: Icon(Icons.logout_outlined), // آیکون اعلان‌ها
          onPressed: () {
            // عملکردی که هنگام زدن آیکون اعلان‌ها انجام می‌شود
            print('Notifications clicked');
          },
        ),
      ],
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight); // ارتفاع اپ بار
}
