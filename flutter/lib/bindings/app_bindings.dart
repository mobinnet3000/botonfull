import 'package:get/get.dart';
import '../controllers/base_controller.dart';
import '../controllers/menu_controller.dart';
import '../controllers/project_list_controller.dart';
import '../controllers/ticket_controller.dart';

/// نقطهٔ اصلی تزریق وابستگی‌ها (Dependency Injection) با GetX.
/// همهٔ کنترلرها اینجا ثبت می‌شوند تا ویوها فقط `Get.find` کنند.
class AppBindings extends Bindings {
  @override
  void dependencies() {
    // کنترلر اصلی داده‌ها
    Get.lazyPut<ProjectController>(() => ProjectController(), fenix: true);

    // کنترلر منو / ناوبری
    Get.lazyPut<MenuControllerr>(() => MenuControllerr());

    // کنترلر لیست پروژه‌ها
    Get.lazyPut<ProjectListController>(() => ProjectListController());

    // کنترلر تیکت‌ها
    Get.lazyPut<TicketController>(() => TicketController());
  }
}