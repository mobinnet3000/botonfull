import 'package:get/get.dart';

class MainTabController extends GetxController {
  // این متغیر، ایندکس تب فعال را نگه می‌دارد
  var tabIndex = 0.obs;

  // متدی برای تغییر تب از هر جای برنامه
  void changeTab(int index) {
    tabIndex.value = index;
  }
}
