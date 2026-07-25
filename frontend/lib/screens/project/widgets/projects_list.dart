import 'package:boton/controllers/project_controller.dart';
import 'package:boton/screens/project/widgets/project_list_item_card.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProjectListPage extends StatelessWidget {
  const ProjectListPage({super.key});

  @override
  Widget build(BuildContext context) {
    final ProjectListController controller = Get.put(ProjectListController());
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            onChanged: controller.updateSearchQuery,
            decoration: InputDecoration(
              hintText: 'جستجو...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 15),
            ),
          ),
        ),
        _SortableHeader(), // هدر جدید ما
        const Divider(height: 1),
        Expanded(
          child: Obx(
            () =>
                controller.displayedProjects.isEmpty
                    ? const Center(child: Text('هیچ پروژه‌ای یافت نشد.'))
                    : ListView.builder(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      itemCount: controller.displayedProjects.length,
                      itemBuilder: (context, index) {
                        final projectiid =
                            controller.displayedProjects[index].id;
                        return ProjectListItemCard(
                          projectid: projectiid,
                          onDelete: () => controller.deleteProject(projectiid),
                        );
                      },
                    ),
          ),
        ),
        _PaginationControls(), // کنترل‌های صفحه‌بندی
      ],
    );
  }
}

// ویجت هدر قابل مرتب‌سازی
class _SortableHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final ProjectListController controller = Get.find();
    return Obx(
      () => SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Row(
          children: [
            _buildHeaderItem(context, controller, 'نام پروژه', 0),
            _buildHeaderItem(context, controller, 'تاریخ', 1),
            _buildHeaderItem(context, controller, 'کارفرما', 2),
            _buildHeaderItem(context, controller, 'ناظر', 3),
            _buildHeaderItem(context, controller, 'منطقه', 4),
            _buildHeaderItem(context, controller, 'شماره پرونده', 5),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderItem(
    BuildContext context,
    ProjectListController controller,
    String title,
    int index,
  ) {
    final bool isActive = controller.sortColumnIndex.value == index;
    return TextButton.icon(
      onPressed: () => controller.updateSortColumn(index),
      icon: Icon(
        isActive
            ? (controller.isSortAscending.value
                ? Icons.arrow_upward
                : Icons.arrow_downward)
            : null,
        size: 16,
        color: isActive ? Theme.of(context).primaryColor : Colors.grey,
      ),
      label: Text(
        title,
        style: TextStyle(
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          color:
              isActive ? Theme.of(context).primaryColor : Colors.grey.shade700,
        ),
      ),
    );
  }
}

// ویجت کنترل‌های صفحه‌بندی
class _PaginationControls extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final ProjectListController controller = Get.find();
    return Obx(
      () => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Text('تعداد در صفحه:'),
                const SizedBox(width: 8),
                DropdownButton<int>(
                  value: controller.itemsPerPage.value,
                  items:
                      [10, 20, 50]
                          .map(
                            (size) => DropdownMenuItem(
                              value: size,
                              child: Text(size.toString()),
                            ),
                          )
                          .toList(),
                  onChanged: (value) => controller.changeItemsPerPage(value!),
                ),
              ],
            ),
            Row(
              children: [
                IconButton(
                  onPressed:
                      controller.currentPage.value > 1
                          ? () => controller.goToPage(
                            controller.currentPage.value - 1,
                          )
                          : null,
                  icon: const Icon(Icons.chevron_right),
                ), // Right for RTL
                Text(
                  'صفحه ${controller.currentPage.value} از ${controller.totalPages}',
                ),
                IconButton(
                  onPressed:
                      controller.currentPage.value < controller.totalPages
                          ? () => controller.goToPage(
                            controller.currentPage.value + 1,
                          )
                          : null,
                  icon: const Icon(Icons.chevron_left),
                ), // Left for RTL
              ],
            ),
          ],
        ),
      ),
    );
  }
}
