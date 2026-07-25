import 'package:boton/controllers/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

// مدل اصلی پروژه و کنترلر اصلی را ایمپورت می‌کنیم
// توجه: مسیر این import ها را مطابق با پروژه خودتان تنظیم کنید
import '../models/project_model.dart';
import '../utils/snackbar_helper.dart'; // ابزار کمکی برای نمایش اسنک‌بار

class ProjectListController extends GetxController {
  // ۱. اتصال به کنترلر اصلی برای دریافت داده‌های خام
  final ProjectController _mainController = Get.find<ProjectController>();

  // --- متغیرهای وضعیت برای نمایش در UI ---

  // لیست کامل و اصلی پروژه‌ها که از کنترلر اصلی گرفته می‌شود
  final _allProjects = <Project>[].obs;

  // لیستی که پس از اعمال فیلتر، مرتب‌سازی و صفحه‌بندی، در UI نمایش داده می‌شود
  var displayedProjects = <Project>[].obs;

  // متغیری برای نگهداری متن جستجو شده توسط کاربر
  var searchQuery = ''.obs;

  // --- متغیرهای وضعیت برای مرتب‌سازی و صفحه‌بندی ---

  // ستونی که بر اساس آن مرتب‌سازی انجام می‌شود (0: نام، 1: تاریخ و...)
  var sortColumnIndex = 1.obs; // پیش‌فرض روی ستون تاریخ (اندیس ۱)

  // جهت مرتب‌سازی (true = صعودی, false = نزولی)
  var isSortAscending = false.obs; // پیش‌فرض نزولی (جدیدترین پروژه‌ها اول)

  // تعداد آیتم‌ها در هر صفحه
  var itemsPerPage = 10.obs;

  // شماره صفحه فعلی
  var currentPage = 1.obs;

  // یک لیست داخلی برای نگهداری نتایج فیلتر و مرتب‌شده قبل از صفحه‌بندی
  final RxList<Project> _filteredAndSortedProjects = <Project>[].obs;

  // --- متدهای محاسباتی (Getters) ---

  // محاسبه تعداد کل صفحات بر اساس لیست فیلتر شده
  int get totalPages {
    if (_filteredAndSortedProjects.isEmpty) return 1;
    return (_filteredAndSortedProjects.length / itemsPerPage.value).ceil();
  }

  // --- متدهای چرخه حیات GetX ---

  @override
  void onInit() {
    super.onInit();
    // داده‌ها را از کنترلر اصلی بارگذاری می‌کنیم
    _loadProjectsFromMainController();

    // به لیست پروژه‌های کنترلر اصلی گوش می‌دهیم تا در صورت تغییر (مثلا حذف)
    // لیست ما هم به صورت خودکار آپدیت شود.
    _mainController.projects.listen((_) => _loadProjectsFromMainController());

    // با استفاده از debounce، جستجو را بهینه می‌کنیم تا با هر تغییر حرف،
    // درخواست تکراری ارسال نشود و ۴۰۰ میلی‌ثانیه صبر کند.
    debounce(
      searchQuery,
      (_) => _filterAndSortProjects(),
      time: const Duration(milliseconds: 400),
    );
  }

  // --- متدهای داخلی برای مدیریت منطق ---

  void _loadProjectsFromMainController() {
    _allProjects.value = _mainController.projects;
    _filterAndSortProjects(); // پس از هر بارگذاری، لیست را پردازش می‌کنیم
  }

  /// این متد اصلی، تمام فیلترها و مرتب‌سازی‌ها را اعمال می‌کند
  void _filterAndSortProjects() {
    // مرحله ۱: فیلتر کردن بر اساس جستجو
    List<Project> filtered =
        _allProjects.where((p) {
          final query = searchQuery.value.toLowerCase();
          if (query.isEmpty) return true;
          return p.projectName.toLowerCase().contains(query) ||
              p.clientName.toLowerCase().contains(query) ||
              p.supervisorName.toLowerCase().contains(query) ||
              p.fileNumber.toLowerCase().contains(query);
        }).toList();

    // مرحله ۲: مرتب‌سازی لیست فیلتر شده
    final compare = isSortAscending.value ? 1 : -1;
    switch (sortColumnIndex.value) {
      case 0: // نام پروژه
        filtered.sort(
          (a, b) => a.projectName.compareTo(b.projectName) * compare,
        );
        break;
      case 1: // تاریخ ساخت (createdAt)
        filtered.sort((a, b) => a.createdAt.compareTo(b.createdAt) * compare);
        break;
      case 2: // نام کارفرما
        filtered.sort((a, b) => a.clientName.compareTo(b.clientName) * compare);
        break;
      case 3: // نام ناظر
        filtered.sort(
          (a, b) => a.supervisorName.compareTo(b.supervisorName) * compare,
        );
        break;
      case 4: // منطقه
        filtered.sort(
          (a, b) => a.municipalityZone.compareTo(b.municipalityZone) * compare,
        );
        break;
      case 5: // تعداد طبقات
        filtered.sort((a, b) => a.fileNumber.compareTo(b.fileNumber) * compare);
        break;
      // case 6: // نوع آزمون - این فیلد روی مدل پروژه نیست و نیاز به منطق جدا دارد.
      default:
        // اگر اندیس نامعتبر بود، کاری انجام نده
        break;
    }

    // نتیجه نهایی را در لیست موقت ذخیره کرده و به صفحه اول می‌رویم
    _filteredAndSortedProjects.value = filtered;
    goToPage(1);
  }

  /// این متد فقط صفحه‌بندی را روی لیست مرتب‌شده اعمال می‌کند
  void _applyPagination() {
    int startIndex = (currentPage.value - 1) * itemsPerPage.value;
    int endIndex = startIndex + itemsPerPage.value;
    if (endIndex > _filteredAndSortedProjects.length) {
      endIndex = _filteredAndSortedProjects.length;
    }

    if (startIndex > _filteredAndSortedProjects.length) {
      // جلوگیری از خطای رنج در صورتی که آیتم‌ها کم شوند
      startIndex = 0;
      endIndex = 0;
    }

    displayedProjects.value = _filteredAndSortedProjects.sublist(
      startIndex,
      endIndex,
    );
  }

  // --- متدهای عمومی برای فراخوانی از UI ---

  void updateSearchQuery(String query) => searchQuery.value = query;

  void changeItemsPerPage(int size) {
    itemsPerPage.value = size;
    _filterAndSortProjects();
  }

  void goToPage(int page) {
    if (page > 0 && page <= totalPages) {
      currentPage.value = page;
      _applyPagination();
    }
  }

  void updateSortColumn(int columnIndex) {
    if (sortColumnIndex.value == columnIndex) {
      isSortAscending.value = !isSortAscending.value;
    } else {
      sortColumnIndex.value = columnIndex;
      isSortAscending.value = true; // با انتخاب ستون جدید، جهت صعودی می‌شود
    }
    _filterAndSortProjects(); // مرتب‌سازی را دوباره از اول اعمال کن
  }

  void deleteProject(int projectId) {
    Get.defaultDialog(
      title: "تایید حذف",
      middleText: "آیا از حذف این پروژه اطمینان دارید؟",
      textConfirm: "بله، حذف کن",
      textCancel: "انصراف",
      confirmTextColor: Colors.white,
      buttonColor: Colors.red.shade600,
      onConfirm: () {
        // TODO: در برنامه واقعی باید یک درخواست DELETE به API ارسال شود
        // _mainController.deleteProjectOnServer(projectId);
        _mainController.projects.removeWhere((p) => p.id == projectId);
        Get.back();
        SnackbarHelper.showSuccess(message: "پروژه با موفقیت حذف شد.");
      },
    );
  }
}
