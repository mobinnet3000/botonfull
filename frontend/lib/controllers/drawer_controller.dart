import 'package:get/get.dart';

class DrawerControllerr extends GetxController {
  var opacity1 = 0.0.obs;
  var opacity2 = 0.0.obs;
  var opacity3 = 0.0.obs;
  var opacity4 = 0.0.obs;
  var opacity5 = 0.0.obs;
  var opacity6 = 0.0.obs;
  var opacity7 = 0.0.obs;
  var opacity8 = 0.0.obs;


  var padding1 = 25.0.obs;
  var padding2 = 25.0.obs;
  var padding3 = 25.0.obs;
  var padding4 = 25.0.obs;
  var padding5 = 25.0.obs;
  var padding6 = 25.0.obs;
  var padding7 = 25.0.obs;
  var padding8 = 25.0.obs;


  @override
  void onInit() {
    super.onInit();
    loadAnimations();
  }

  loadAnimations() async {
    await Future.delayed(const Duration(milliseconds: 300));
    opacity1.value = 1;
    padding1.value = 0;

    await Future.delayed(const Duration(milliseconds: 300));
    opacity2.value = 1;
    padding2.value = 0;

    await Future.delayed(const Duration(milliseconds: 300));
    opacity3.value = 1;
    padding3.value = 0;

    await Future.delayed(const Duration(milliseconds: 300));
    opacity4.value = 1;
    padding4.value = 0;

    await Future.delayed(const Duration(milliseconds: 300));
    opacity5.value = 1;
    padding5.value = 0;

    await Future.delayed(const Duration(milliseconds: 300));
    opacity6.value = 1;
    padding6.value = 0;

    await Future.delayed(const Duration(milliseconds: 300));
    opacity7.value = 1;
    padding7.value = 0;

    await Future.delayed(const Duration(milliseconds: 300));
    opacity8.value = 1;
    padding8.value = 0;
  }
}

enum DrawerSection {
  dashboard,
  projects,
  dailyTest,
  activityReport,
  financialReport,
  managers,
  settings,
  support,
}
