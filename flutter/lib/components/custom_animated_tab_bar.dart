// lib/widgets/common/custom_animated_tab_bar.dart
import 'package:flutter/material.dart';

class CustomAnimatedTabBar extends StatelessWidget
    implements PreferredSizeWidget {
  final TabController controller;
  final List<Tab> tabs;

  const CustomAnimatedTabBar({
    super.key,
    required this.controller,
    required this.tabs,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      child: Container(
        height: 45,
        decoration: BoxDecoration(
          color: Colors.blue.shade800.withOpacity(0.6),
          borderRadius: BorderRadius.circular(25.0),
        ),
        child: TabBar(
          isScrollable: true,

          controller: controller,
          // این بخش مهم‌ترین قسمت برای استایل جدید است
          indicator: BoxDecoration(
            borderRadius: BorderRadius.circular(25.0),
            color: Theme.of(context).colorScheme.secondary, // رنگ زرد که داشتیم
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          labelColor: Colors.black87,
          unselectedLabelColor: Colors.white,
          labelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal),
          tabs: tabs,
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);
}
