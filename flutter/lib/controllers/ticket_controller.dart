import 'package:boton/controllers/base_controller.dart';
import 'package:boton/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:boton/models/ticket_model.dart'; // ❗️مسیر مدل را اصلاح کنید
import 'package:boton/utils/snackbar_helper.dart';

class TicketController extends GetxController {
  // وضعیت لودینگ برای فرم ارسال تیکت
  var isSubmitting = false.obs;
  // وضعیت لودینگ برای لیست تیکت‌ها
  var isFetchingList = false.obs;
  final ApiService _apiService = ApiService(DioClient.instance);

  // لیست تیکت‌ها به صورت ری‌اکتیو
  var tickets = <Ticket>[].obs;

  @override
  void onInit() {
    super.onInit();
    // به محض ساخته شدن کنترلر، لیست تیکت‌ها را دریافت کن
    fetchTickets();
  }

  /// متد برای دریافت لیست تیکت‌ها از سرور
  Future<void> fetchTickets() async {
    isFetchingList.value = true;
    try {
      tickets.value = Get.find<ProjectController>().user.value!.tickets;
    } catch (e) {
      SnackbarHelper.showError(
        title: 'خطا در دریافت اطلاعات',
        message: 'مشکلی در ارتباط با سرور پیش آمده است.',
      );
    } finally {
      isFetchingList.value = false;
    }
  }

  Future<bool> addtik({
    required String title,
    required String priority,
    required String message,
  }) async {
    Map<String, dynamic> ticketData = {"title": title, "priority": priority};

    try {
      isSubmitting(true);
      final createdticket = await _apiService.createtiket(ticketData);

      // Get.snackbar(
      //   'انجام شد!',
      //   ' با موفقیت ایجاد شد.',
      //   backgroundColor: Colors.green,
      //   colorText: Colors.white,
      // );
      Map<String, dynamic> ticketmasData = {
        "ticket": createdticket.id,
        "message": message,
      };
      addtikmas(mas: ticketmasData);

      return true; // ✅ موفقیت
    } catch (e) {
      Get.snackbar(
        'خطا',
        'متاسفانه در ایجاد پروژه مشکلی پیش آمد: $e',
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return false; // ✅ شکست
    } finally {
      isSubmitting(false);
    }
  }

  Future<bool> addtikmas({required Map<String, dynamic> mas}) async {
    // Map<String, dynamic> ticketData = {"title" : title ,"priority" : priority };

    try {
      isSubmitting(true);
      final createdticket = await _apiService.createtiketmas(mas);

      Get.snackbar(
        'انجام شد!',
        ' با موفقیت ایجاد شد.',
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
      // Map<String, dynamic> ticketmasData = {"ticket" : createdticket.id ,"message" : message ,};

      return true; // ✅ موفقیت
    } catch (e) {
      Get.snackbar(
        'خطا',
        'متاسفانه در ایجاد پروژه مشکلی پیش آمد: $e',
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return false; // ✅ شکست
    } finally {
      isSubmitting(false);
      Get.find<ProjectController>().loadInitialData();
      fetchTickets();
    }
  }
}
