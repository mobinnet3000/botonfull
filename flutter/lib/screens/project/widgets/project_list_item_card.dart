// lib/pages/dashboard/widgets/project_list_item_card.dart
import 'package:boton/controllers/base_controller.dart';
import 'package:boton/models/project_model.dart';
import 'package:boton/screens/project/project_single/project_single_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

class ProjectListItemCard extends StatelessWidget {
  final int projectid;
  final VoidCallback onDelete;

  const ProjectListItemCard({
    super.key,
    required this.projectid,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final Project project = Get.find<ProjectController>().projects.firstWhere(
      (p) => p.id == projectid,
      orElse:
          () =>
              Get.find<ProjectController>()
                  .projects[0], // یک پروژه خالی برای جلوگیری از خطا
    );
    ;
    return Card(
      elevation: 3.0,
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200, width: 1.0),
      ),
      color: Colors.white, // رنگ صریح سفید برای کارت
      child: InkWell(
        onTap:
            () => Get.to(
              () => ProjectSinglePage(projectid: projectid),
              transition: Transition.rightToLeftWithFade,
            ),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.foundation,
                    color: Theme.of(context).primaryColor,
                    size: 40,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          project.projectName,
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'کارفرما: ${project.clientName}',
                          style: TextStyle(color: Colors.grey.shade700),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'تاریخ ساخت: ${DateFormat('yyyy/MM/dd').format(project.createdAt)}',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Chip(
                    label: Text(project.fileNumber),
                    backgroundColor: Colors.blue.shade50,
                  ),
                ],
              ),
              const Divider(height: 24),
              Row(
                children: [
                  Expanded(
                    child: _buildInfoChip(
                      Icons.engineering_outlined,
                      project.supervisorName,
                    ),
                  ),
                  SizedBox(width: 8.0), // برای ایجاد فاصله بین آیتم‌ها
                  Expanded(
                    child: _buildInfoChip(
                      Icons.layers_outlined,
                      '${project.floorCount} طبقه',
                    ),
                  ),
                  SizedBox(width: 8.0), // برای ایجاد فاصله بین آیتم‌ها
                  Expanded(
                    child: _buildInfoChip(
                      Icons.location_city_outlined,
                      'منطقه ${project.municipalityZone}',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Chip(
      avatar: Icon(icon, size: 16, color: Colors.black54),
      label: Text(text, style: const TextStyle(color: Colors.black54)),
      backgroundColor: Colors.grey.shade200,
      padding: const EdgeInsets.symmetric(horizontal: 8),
    );
  }
}
