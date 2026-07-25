// lib/pages/dashboard/projects_page.dart
import 'package:boton/controllers/project_controller.dart';
import 'package:boton/screens/project/widgets/add_project.dart';
import 'package:boton/screens/project/widgets/projects_list.dart';
import 'package:boton/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'widgets/project_list_item_card.dart';
import 'package:boton/models/project_model.dart';

class ProjectsPage extends StatelessWidget {
  const ProjectsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          Container(
            color: Theme.of(context).scaffoldBackgroundColor,
            child: TabBar(
              indicatorColor: Theme.of(context).primaryColor,
              labelColor: Theme.of(context).primaryColor,
              unselectedLabelColor: Colors.grey.shade600,
              tabs: const [
                Tab(text: 'لیست پروژه‌ها'),
                Tab(text: 'افزودن پروژه'),
              ],
            ),
          ),
          const Expanded(
            child: TabBarView(
              children: [ProjectListPage(), AddProjectScreen()],
            ),
          ),
        ],
      ),
    );
  }
}
