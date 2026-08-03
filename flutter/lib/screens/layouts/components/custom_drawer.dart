import 'package:boton/constants/app_theme.dart';
import 'package:boton/controllers/menu_controller.dart';
import 'package:boton/screens/layouts/components/item_drawer.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomDrawer extends StatelessWidget {
  const CustomDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final MenuControllerr menuController = Get.find();

    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primary,
                    AppTheme.primary.withOpacity(0.8),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppTheme.onPrimary.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(
                      Icons.science_outlined,
                      size: 40,
                      color: AppTheme.onPrimary,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'آزمایشگاه بتن',
                          style: TextStyle(
                            color: AppTheme.onPrimary,
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            fontFamily: 'DANA',
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'پنل مدیریت',
                          style: AppTextStyles.caption.copyWith(
                            color: AppTheme.onPrimary.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  ...DrawerItems.items.map(
                    (item) => Obx(() {
                      final isSelected =
                          menuController.selectedSection.value == item.section;
                      return ListTile(
                        leading: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 200),
                          child: Icon(
                            isSelected ? item.selectedIcon : item.icon,
                            key: ValueKey<bool>(isSelected),
                            color: isSelected
                                ? AppTheme.primary
                                : const Color(0xFF9E9E9E),
                          ),
                        ),
                        title: Text(
                          item.label,
                          style: isSelected
                              ? AppTextStyles.navLabel.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.primary,
                                )
                              : AppTextStyles.navLabel.copyWith(
                                  color: const Color(0xFF616161),
                                ),
                        ),
                        selected: isSelected,
                        selectedTileColor: AppTheme.primaryContainer,
                        hoverColor: AppTheme.surfaceContainer,
                        onTap: () {
                          menuController.selectSection(item.section);
                          if (Scaffold.of(context).isDrawerOpen) {
                            Navigator.of(context).pop();
                          }
                        },
                      );
                    }),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: ListTile(
                leading: const Icon(Icons.logout_outlined),
                title: Text(
                  'خروج',
                  style: AppTextStyles.navLabel.copyWith(color: AppTheme.error),
                ),
                onTap: () {
                  Get.back();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('خروج')),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
