// lib/pages/project_single/project_single_page.dart

import 'package:boton/models/project_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:boton/controllers/base_controller.dart';

import 'package:boton/components/custom_animated_tab_bar.dart';
import 'tabs/details_tab.dart';
import 'tabs/concrete/concrete_tab.dart';
import 'tabs/financial_tab.dart';

class ProjectSinglePage extends StatefulWidget {
  final int projectid;
  const ProjectSinglePage({super.key, required this.projectid});

  @override
  State<ProjectSinglePage> createState() => _ProjectSinglePageState();
}

class _ProjectSinglePageState extends State<ProjectSinglePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const List<Tab> _tabs = [
    Tab(text: 'جزئیات'),
    Tab(text: 'بتن'),
    Tab(text: 'مالی'),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ProjectController controller = Get.find<ProjectController>();

    return Scaffold(
      appBar: AppBar(
        title: Obx(() {
          // در حالت لودینگ یا عدم وجود داده‌ها
          if (controller.isLoading.value) {
            return const Text('در حال بارگذاری پروژه...');
          }

          final project = controller.projects
              .firstWhereOrNull((p) => p.id == widget.projectid);

          if (project == null) return const Text('پروژه یافت نشد');
          return Text('پروژه: ${project.projectName}');
        }),
        bottom: CustomAnimatedTabBar(controller: _tabController, tabs: _tabs),
        actions: [
          Obx(() {
            if (controller.isLoading.value) {
              return const Padding(
                padding: EdgeInsets.all(12.0),
                child: SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    color: Colors.white,
                  ),
                ),
              );
            }
            return IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'بارگذاری مجدد داده‌ها',
              onPressed: controller.loadInitialData,
            );
          }),
          const SizedBox(width: 8),
        ],
      ),

      //----------------------------------------------------------------------
      // 👇 محتوای تب‌ها
      //----------------------------------------------------------------------
      body: Obx(() {
        // بررسی وضعیت بارگذاری اولیه
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(strokeWidth: 3),
          );
        }

        // جستجوی پروژه هدف در داده‌های کنترلر
        final project = controller.projects
            .firstWhereOrNull((p) => p.id == widget.projectid);

        if (project == null) {
          return const Center(
            child: Text('پروژه‌ی مورد نظر یافت نشد!'),
          );
        }

        return TabBarView(
          controller: _tabController,
          physics: const BouncingScrollPhysics(),
          children: [
            DetailsTab(project: project),
            ConcreteTab(project: project),
            FinancialTab(projectId: project.id),
          ],
        );
      }),
    );
  }
}
