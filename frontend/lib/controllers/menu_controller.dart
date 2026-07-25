import 'package:boton/controllers/drawer_controller.dart';
import 'package:get/get.dart';

class MenuControllerr extends GetxController {
  var selectedSection = DrawerSection.dashboard.obs;

  void selectSection(DrawerSection section) {
    selectedSection.value = section;
    // Get.back(); // برای بستن Drawer
    // Navigator.of(Get.context!).pop();
  }
}
