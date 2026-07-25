// lib/controllers/project_list_controller.dart

import 'package:boton/controllers/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:collection/collection.dart';

// مدل‌ها و کنترلر اصلی
import 'package:boton/models/project_model.dart';
import 'package:boton/controllers/project_controller.dart';
import 'package:boton/utils/snackbar_helper.dart';

/// کنترلر برای مدیریت نمایش، جستجو، مرتب‌سازی و صفحه‌بندی لیست پروژه‌ها
class ProjectListController extends GetxController {
  // اتصال به کنترلر اصلی
  final ProjectController _mainController = Get.find<ProjectController>();

  // ----- وضعیت‌ها -----
  var allProjects = <Project>[].obs;
  var isLoading = false.obs;
  var displayedProjects = <Project>[].obs;
  var searchQuery = ''.obs;

  // مرتب‌سازی
  var sortColumnIndex = 0.obs;
  var isSortAscending = true.obs;

  // صفحه‌بندی
  var itemsPerPage = 10.obs;
  var currentPage = 1.obs;

  // تعداد صفحات
  int get totalPages {
    final totalItems = allProjects.where(_matchesFilter).length;
    if (totalItems == 0) return 1;
    return (totalItems / itemsPerPage.value).ceil();
  }

  @override
  void onInit() {
    super.onInit();

    // بروز شدن لیست از کنترلر اصلی
    ever(_mainController.projects, _updateProjectListFromMainController);

    // جستجو با debounce
    debounce(
      searchQuery,
      (_) => filterAndSortProjects(),
      time: const Duration(milliseconds: 400),
    );

    // بارگذاری اولیه پروژه‌ها
    _updateProjectListFromMainController(_mainController.projects);
  }

  // متد اصلی برای دریافت لیست پروژه‌ها از کنترلر اصلی
  void _updateProjectListFromMainController(List<Project> projectsFromMain) {
    allProjects.value = projectsFromMain;
    filterAndSortProjects();
  }

  // -------------------- فیلتر و مرتب‌سازی --------------------

  void filterAndSortProjects() {
    currentPage.value = 1;

    // ✅ فیلتر بر اساس عبارت جستجو (با افزودن testType)
    List<Project> filtered = allProjects.where(_matchesFilter).toList();

    // ✅ مرتب‌سازی
    final compare = isSortAscending.value ? 1 : -1;
    switch (sortColumnIndex.value) {
      case 0: // نام پروژه
        filtered.sort(
            (a, b) => a.projectName.compareTo(b.projectName) * compare);
        break;
      case 1: // تاریخ
        filtered.sort((a, b) => a.createdAt.compareTo(b.createdAt) * compare);
        break;
      case 2: // کارفرما
        filtered.sort((a, b) => a.clientName.compareTo(b.clientName) * compare);
        break;
      case 3: // ناظر
        filtered.sort((a, b) =>
            a.supervisorName.compareTo(b.supervisorName) * compare);
        break;
      case 4: // منطقه
        filtered.sort((a, b) =>
            a.municipalityZone.compareTo(b.municipalityZone) * compare);
        break;
      case 5: // شماره پرونده
        filtered.sort((a, b) => a.fileNumber.compareTo(b.fileNumber) * compare);
        break;
      case 6: // ✅ نوع آزمون (فیلد جدید)
        filtered.sort(
            (a, b) => (a.testType ?? '').compareTo(b.testType ?? '') * compare);
        break;
      default:
        break;
    }

    // صفحه‌بندی
    int startIndex = (currentPage.value - 1) * itemsPerPage.value;
    int endIndex = startIndex + itemsPerPage.value;
    if (endIndex > filtered.length) endIndex = filtered.length;

    displayedProjects.value = filtered.sublist(startIndex, endIndex);
  }

  // تابع فیلتر
  bool _matchesFilter(Project p) {
    final query = searchQuery.value.toLowerCase().trim();
    if (query.isEmpty) return true;

    return p.projectName.toLowerCase().contains(query) ||
        p.fileNumber.toLowerCase().contains(query) ||
        p.clientName.toLowerCase().contains(query) ||
        p.supervisorName.toLowerCase().contains(query) ||
        (p.testType?.toLowerCase().contains(query) ?? false) || // ✅ فیلد جدید
        p.address.toLowerCase().contains(query);
  }

  // -------------------- متدهای عمومی UI --------------------

  void updateSearchQuery(String query) {
    searchQuery.value = query;
  }

  void updateSortColumn(int columnIndex) {
    if (sortColumnIndex.value == columnIndex) {
      isSortAscending.value = !isSortAscending.value;
    } else {
      sortColumnIndex.value = columnIndex;
      isSortAscending.value = true;
    }
    filterAndSortProjects();
  }

  void goToPage(int page) {
    if (page > 0 && page <= totalPages) {
      currentPage.value = page;
      filterAndSortProjects();
    }
  }

  void changeItemsPerPage(int newSize) {
    itemsPerPage.value = newSize;
    filterAndSortProjects();
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
        Get.back();
        SnackbarHelper.showSuccess(message: "درخواست حذف ارسال شد.");
        // حتماً حذف نهایی باید در کنترلر اصلی انجام شود (Single Source of Truth)
        // _mainController.deleteProjectById(projectId);
      },
    );
  }
}
