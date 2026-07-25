import 'package:get/get.dart';
import '../controllers/base_controller.dart';
import '../controllers/project_list_controller.dart'; // کنترلر جدید را اضافه کنید

class AppBindings extends Bindings {
  @override
  void dependencies() {
    // کنترلر اصلی که داده‌ها را از سرویس می‌گیرد
    Get.lazyPut<ProjectController>(() => ProjectController(), fenix: true);

    // کنترلر مخصوص ویوی لیست پروژه‌ها
    Get.lazyPut<ProjectListController>(() => ProjectListController());
  }
}
