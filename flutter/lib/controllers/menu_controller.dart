import 'package:boton/constants/navigation.dart';
import 'package:get/get.dart';

class MenuControllerr extends GetxController {
  var selectedSection = DrawerSection.dashboard.obs;

  void selectSection(DrawerSection section) {
    selectedSection.value = section;
  }
}
