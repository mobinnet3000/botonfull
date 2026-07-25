import 'package:boton/models/ProjectForCreation_model.dart';
import 'package:boton/models/Sample_model.dart';
import 'package:boton/models/sampling_serie_model.dart';
import 'package:boton/utils/snackbar_helper.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:collection/collection.dart';
import 'package:intl/intl.dart'; // برای فرمت‌دهی بهتر تاریخ
import '../models/user_model.dart';
import '../models/project_model.dart';
import '../models/breakage_group_model.dart';
import '../models/mold_model.dart';
import '../services/api_service.dart';

class _MoldWithProjectInfo {
  final Mold mold;
  final int projectId;
  final String projectName;

  _MoldWithProjectInfo({
    required this.mold,
    required this.projectId,
    required this.projectName,
  });
}

class ProjectController extends GetxController {
  // final MockApiService _apiService = MockApiService();
  final ApiService _apiService = ApiService(DioClient.instance);
  // final ApiService _apiService = ApiService(); // ✅ این خط جایگزین می‌شود
  // final Dio _dio = Dio(
  //   BaseOptions(
  //     baseUrl: 'http://127.0.0.1:8000/api', // آدرس پایه API شما
  //     // می‌توانید هدرهای ثابت مثل توکن را هم اینجا اضافه کنید
  //     // headers: {
  //     //   'Authorization': 'Token YOUR_SAVED_TOKEN',
  //     // },
  //   ),
  // );
  var isLoading = true.obs;
  var user = Rxn<User>();
  var projects = <Project>[].obs;
  var breakageGroups = <BreakageGroup>[].obs;
  var isAddingProject = false.obs;
  var isUpdatingProject = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadInitialData();
  }

  Future<void> loadInitialData() async {
    try {
      isLoading(true);
      final apiResponse = await _apiService.getFullUserData();
      user.value = apiResponse.user;
      projects.value = apiResponse.projects;
      _groupMoldsForBreakage();
      // <<-- فراخوانی متد لاگ در انتهای فرآیند -->>
      _logFinalState();
    } catch (e, stacktrace) {
      Get.snackbar('خطا!', 'خطا در پردازش اطلاعات: $e');
      print(e);
      print("Stacktrace: $stacktrace");
    } finally {
      isLoading(false);
    }
  }


  Future<void> updateMoldResult({
    // ✅ فقط پارامترهایی که واقعا نیاز داریم باقی می‌مانند
    required int moldId,
    required Map<String, dynamic> resultData,
  }) async {
    // isLoading را در ابتدای کار true می‌کنیم تا لودر نمایش داده شود
    isLoading.value = true;
    try {
      // ۱. متد سرویس را برای ارسال داده به سرور فراخوانی می‌کنیم
      final updatedMold = await _apiService.updateMold(moldId, resultData);

      // ✅✅✅ منطق جدید: جستجو و جایگزینی در لیست محلی ✅✅✅
      bool moldWasFoundAndUpdated = false;
      for (var project in projects) {
        for (var sample in project.samples) {
          for (var series in sample.series) {
            // در لیست قالب‌های هر سری، به دنبال ایندکس قالب مورد نظر می‌گردیم
            final moldIndex = series.molds.indexWhere((m) => m.id == moldId);
            
            if (moldIndex != -1) {
              // پیدا شد! حالا آن را با نسخه آپدیت شده از سرور جایگزین می‌کنیم.
              series.molds[moldIndex] = updatedMold;
              
              // پرچم را برای اطلاع از موفقیت‌آمیز بودن جستجو، true می‌کنیم
              moldWasFoundAndUpdated = true;
              
              // با break از حلقه‌ها خارج می‌شویم تا جستجوی اضافه انجام نشود
              break; 
            }
          }
          if (moldWasFoundAndUpdated) break;
        }
        if (moldWasFoundAndUpdated) break;
      }

      if (moldWasFoundAndUpdated) {
        // اگر قالب پیدا و آپدیت شد، به GetX اطلاع می‌دهیم تا UI را رفرش کند
        projects.refresh();
        print("Mold with ID $moldId updated locally!");
      } else {
        // این حالت به ندرت اتفاق می‌افتد، مگر اینکه داده‌ها از قبل هماهنگ نباشند
        // به عنوان یک راه حل جایگزین، کل داده‌ها را رفرش می‌کنیم
        print("Mold not found in local state, performing a full reload as a fallback.");
        await loadInitialData();
      }

    } catch (e) {
      // بخش مدیریت خطای شما که صحیح است
      print("================ ERROR CATCHED ===============");
      if (e is DioException) {
        print(" DioException Response Data: ${e.response?.data}");
      } else {
        print(" A non-Dio error occurred: $e");
      }
      print("==============================================");
      Get.snackbar('خطا', 'متاسفانه در ثبت اطلاعات مشکلی پیش آمد.');
    } finally {
      // در هر صورت (موفقیت یا شکست)، لودینگ را false می‌کنیم
      isLoading.value = false;
    }
  }

  // Future<void> addProject(ProjectForCreation projectData) async {
  //   try {
  //     isAddingProject(true); // لودینگ شروع می‌شود
  //     // متد سرویس را که در گام قبل ساختیم، فراخوانی می‌کنیم
  //     final createdProject = await _apiService.createProject(projectData);
  //     // پروژه جدیدی که از سرور آمده را به ابتدای لیست پروژه‌ها اضافه می‌کنیم
  //     // projects.insert(0, createdProject);
  //     Get.back(); // از صفحه فرم به صفحه لیست برمی‌گردیم
  //     // یک پیام موفقیت به کاربر نمایش می‌دهیم
  //     Get.snackbar(
  //       'انجام شد!',
  //       'پروژه "${createdProject.projectName}" با موفقیت ایجاد شد.',
  //       backgroundColor: Colors.green,
  //       colorText: Colors.white,
  //       margin: const EdgeInsets.all(12),
  //       duration: const Duration(seconds: 4),
  //     );
  //   } catch (e) {
  //     // در صورت بروز خطا، یک پیام خطا نمایش می‌دهیم
  //     Get.snackbar(
  //       'خطا',
  //       'متاسفانه در ایجاد پروژه مشکلی پیش آمد: $e',
  //       backgroundColor: Colors.red,
  //       colorText: Colors.white,
  //       margin: const EdgeInsets.all(12),
  //       duration: const Duration(seconds: 4),
  //     );
  //   } finally {
  //     isAddingProject(false); // در هر صورت، لودینگ تمام می‌شود
  //   }
  // }

  Future<bool> updateProject(Project updatedProject) async {
    try {
      isUpdatingProject(true);

      // فراخوانی سرویس API
      final result = await _apiService.updateProject(
        updatedProject.id,
        updatedProject,
      );

      // پیدا کردن ایندکس پروژه قدیمی در لیست
      final index = projects.indexWhere((p) => p.id == updatedProject.id);

      if (index != -1) {
        // جایگزین کردن پروژه قدیمی با پروژه جدیدی که از سرور آمده
        projects[index] = result;
        // به‌روزرسانی لیست برای اعمال تغییرات در UI
        projects.refresh();
      }

      Get.snackbar(
        'موفقیت',
        'پروژه با موفقیت به‌روزرسانی شد.',
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
      loadInitialData();
      return true;
    } catch (e) {
      Get.snackbar(
        'خطا',
        'خطا در به‌روزرسانی پروژه: $e',
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return false;
    } finally {
      isUpdatingProject(false);
    }
  }

  Future<bool> updateLabProfile(LabProfile lab) async {
    try {
      isUpdatingProject(true);

      // فراخوانی سرویس API
      final result = await _apiService.updateLab(lab.id, lab);

      loadInitialData();

      Get.snackbar(
        'موفقیت',
        'پروژه با موفقیت به‌روزرسانی شد.',
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
      return true;
    } catch (e) {
      Get.snackbar(
        'خطا',
        'خطا در به‌روزرسانی پروژه: $e',
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return false;
    } finally {
      isUpdatingProject(false);
    }
  }

  Future<bool> addProject(ProjectForCreation projectData) async {
    try {
      isAddingProject(true);

      // ایجاد پروژه سمت سرور
      var createdProject = await _apiService.createProject(projectData);

      // تعداد نمونه‌ها (2 * floorCount + 1)
      final totalSamples = (2 * (createdProject.floorCount ?? 0)) + 1;

      createdProject.samples ??= [];

      for (int i = 0; i < totalSamples; i++) {
        final sampleName = i == 0
            ? 'فنداسیون'
            : i.isOdd
                ? 'ستون ${(i / 2).ceil()}'
                : 'سقف ${(i / 2).ceil()}';

        // ایجاد هر نمونه (Sample)
        final sample = Sample.fromJson({
          'id': i + 1,
          'project': createdProject.id,
          'cement_type': 'Type I',
          'ambient_temperature': 25,
          'specimen_type': 'cube',
          'specimen_size': '150x150x150',
          'sampling_location': sampleName,
          'concrete_production_method': 'بچینگ کارخانه',
          'series': [],
        });

        // حجم بتن برای این نمونه
        final double volume =
            double.tryParse(createdProject.samplingVolume?.toString() ?? '0') ?? 0;

        // تعداد سری‌های نمونه (ceil(volume / 30))
        final seriesCount = (volume / 30).ceil().clamp(1, 20);

        for (int j = 0; j < seriesCount; j++) {
          // ساخت هر سری نمونه
          final serie = SamplingSerie.fromJson({
            'id': j + 1,
            'name': '$sampleName-${j + 1}',
            'axis': 'A${j + 1}',
            'concrete_temperature': 0.0,
            'has_additive': false,
            'concrete_temperature_image': null,
            'slump_image': null,
            'photos': [],
            'molds': [],
          });

          // افزودن 3 عدد قالب به هر سری
          final List<Mold> molds = List.generate(3, (mIdx) {
            return Mold(
              id: 0,
              ageInDays: [7, 14, 28][mIdx],
              mass: 0.0,
              breakingLoad: 0.0,
              createdAt: DateTime.now(),
              completedAt: null,
              deadline: DateTime.now().add(Duration(days: [7, 14, 28][mIdx])),
              sampleIdentifier: '${sampleName}-${j + 1}-M${mIdx + 1}',
              extraData: {},
              seriesId: 0,
              isDone: false,
              preBreakImage: null,
              postBreakImage: null,
            );
          });

          serie.molds.addAll(molds);
          sample.series.add(serie);
        }

        createdProject.samples.add(sample);
      }

      projects.insert(0, createdProject);

      Get.snackbar(
        'انجام شد!',
        'پروژه "${createdProject.projectName}" با موفقیت ایجاد شد.',
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );

      return true;
    } catch (e) {
      Get.snackbar(
        'خطا',
        'متاسفانه در ایجاد پروژه مشکلی پیش آمد: $e',
        backgroundColor: Colors.red,
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        margin: const EdgeInsets.all(12),
      );
      return false;
    } finally {
      isAddingProject(false);
    }
  }



  Future<void> addSampleToProject(
    Map<String, dynamic> sampleData,
    int projectId,
  ) async {
    try {
      isLoading(true); // نمایش لودینگ
      // ۱. متد سرویس را برای ارسال داده به سرور فراخوانی می‌کنیم
      final newSample = await _apiService.createSample(sampleData);

      // ۲. پروژه مورد نظر را در لیست پروژه‌های کنترلر پیدا می‌کنیم
      final projectIndex = projects.indexWhere((p) => p.id == projectId);
      if (projectIndex != -1) {
        // ۳. نمونه جدیدی که از سرور آمده را به لیست samples آن پروژه اضافه می‌کنیم
        projects[projectIndex].samples.add(newSample);
        // ۴. به GetX اطلاع می‌دهیم که لیست پروژه‌ها تغییر کرده تا UI به‌روز شود
        projects.refresh();
        loadInitialData();
      }

      SnackbarHelper.showSuccess(message: 'نمونه جدید با موفقیت ثبت شد.');
    } catch (e) {
      Get.snackbar('خطا', 'خطا در ثبت نمونه: ${e.toString()}');
    } finally {
      isLoading(false); // پنهان کردن لودینگ
    }
  }

  var isUpdatingProfile = false.obs;

  // Future<bool> updateLabProfile(Map<String, dynamic> updatedData) async {
  //   if (user.value?.labProfile == null) return false;
  //   try {
  //     isUpdatingProfile(true);
  //     final profileId = user.value!.labProfile!.id;
  //     final updatedProfile = await _apiService.updateProfile(
  //       profileId,
  //       updatedData,
  //     );
  //     user.update((currentUser) {
  //       // currentUser?. = updatedProfile;
  //     });
  //     loadInitialData();
  //     Get.snackbar('موفقیت', 'اطلاعات با موفقیت به‌روزرسانی شد.');
  //     return true;
  //   } catch (e) {
  //     Get.snackbar('خطا', 'خطا در به‌روزرسانی: ${e.toString()}');
  //     return false;
  //   } finally {
  //     isUpdatingProfile(false);
  //   }
  // }

  Future<void> addtrans(Map<String, dynamic> transData, int projectId) async {
    try {
      isLoading(true); // نمایش لودینگ
      // ۱. متد سرویس را برای ارسال داده به سرور فراخوانی می‌کنیم
      final newSample = await _apiService.createTrans(transData);

      // ۲. پروژه مورد نظر را در لیست پروژه‌های کنترلر پیدا می‌کنیم
      // final projectIndex = projects.indexWhere((p) => p.id == projectId);
      // if (projectIndex != -1) {
      // ۳. نمونه جدیدی که از سرور آمده را به لیست samples آن پروژه اضافه می‌کنیم
      // projects[projectIndex].transactions.add(newSample);
      // ۴. به GetX اطلاع می‌دهیم که لیست پروژه‌ها تغییر کرده تا UI به‌روز شود
      // projects.refresh();
      // loadInitialData();
      // }

      SnackbarHelper.showSuccess(message: 'تراکنش جدید با موفقیت ثبت شد.');
      loadInitialData();
      projects.refresh();
    } catch (e) {
      Get.snackbar('خطا', 'خطا در ثبت نمونه: ${e.toString()}');
    } finally {
      isLoading(false); // پنهان کردن لودینگ
    }
  }

  Future<void> addSerieToSample(
    Map<String, dynamic> serieData,
    int projectId,
    int sampleId,
  ) async {
    try {
      isLoading(true); // یا یک لودینگ مخصوص برای این عملیات

      // ۱. متد سرویس را برای ارسال داده به بک‌اند فراخوانی می‌کنیم
      final newSerie = await _apiService.createSerie(serieData);

      // ۲. پروژه مورد نظر را در لیست پروژه‌های کنترلر پیدا می‌کنیم
      final projectIndex = projects.indexWhere((p) => p.id == projectId);
      if (projectIndex == -1) return; // اگر پروژه پیدا نشد، خارج شو

      // ۳. نمونه (Sample) مورد نظر را در آن پروژه پیدا می‌کنیم
      final sampleIndex = projects[projectIndex].samples.indexWhere(
        (s) => s.id == sampleId,
      );
      if (sampleIndex == -1) return; // اگر نمونه پیدا نشد، خارج شو

      // ۴. سری جدیدی که از سرور آمده را به لیست series آن نمونه اضافه می‌کنیم
      projects[projectIndex].samples[sampleIndex].series.add(newSerie);

      // ۵. به GetX اطلاع می‌دهیم که لیست پروژه‌ها تغییر کرده تا UI به‌روز شود
      projects.refresh();

      Get.back();
      SnackbarHelper.showSuccess(message: 'سری جدید با موفقیت ثبت شد.');
      loadInitialData();
    } catch (e) {
      Get.snackbar('خطا', 'خطا در ثبت سری جدید: ${e.toString()}');
    } finally {
      isLoading(false);
    }
  }

  void _groupMoldsForBreakage() {
    final allMoldsWithInfo =
        projects.expand((project) {
          return project.samples.expand((sample) {
            return sample.series.expand((serie) {
              return serie.molds.map(
                (mold) => _MoldWithProjectInfo(
                  mold: mold,
                  projectId: project.id,
                  projectName: project.projectName,
                ),
              );
            });
          });
        }).toList();

    final groupedData = groupBy(
      allMoldsWithInfo,
      (info) =>
          '${info.projectId}-${info.mold.deadline.year}-${info.mold.deadline.month}-${info.mold.deadline.day}',
    );

    final result =
        groupedData.values.map((groupItems) {
          final firstItem = groupItems.first;
          return BreakageGroup(
            projectId: firstItem.projectId.toString(),
            projectName: firstItem.projectName,
            deadline: firstItem.mold.deadline,
            molds: groupItems.map((info) => info.mold).toList(),
          );
        }).toList();

    result.sort((a, b) => a.deadline.compareTo(b.deadline));
    breakageGroups.value = result;
  }

  /// متد جدید برای چاپ وضعیت نهایی کنترلر در کنسول
  void _logFinalState() {
    print('✅ ==========================================');
    print('✅          گزارش وضعیت نهایی کنترلر         ');
    print('✅ ==========================================');

    // 1. لاگ اطلاعات کاربر
    if (user.value != null) {
      print('\n👤 کاربر شناسایی شد:');
      // print('   - نام: ${user.value!.fullName}');
      print('   - ایمیل: ${user.value!.email}');
      // print('   - آزمایشگاه: ${user.value!.labName}');
    } else {
      print('\n❌ کاربر شناسایی نشد.');
    }

    // 2. لاگ اطلاعات پروه‌ها
    print('\n🏢 پروژه‌های یافت شده: ${projects.length}');
    for (var project in projects) {
      print('   - پروژه #${project.id}: "${project.projectName}"');
      print('     - تعداد نمونه‌ها (Samples): ${project.samples.length}');
      final totalMolds =
          project.samples
              .expand((s) => s.series)
              .expand((se) => se.molds)
              .length;
      print('     - مجموع قالب‌ها (Molds): $totalMolds');
    }

    // 3. لاگ اطلاعات گروه‌های شکست
    print(
      '\n🔬 گروه‌های شکست (Breakage Groups) ایجاد شده: ${breakageGroups.length}',
    );
    for (var group in breakageGroups) {
      // فرمت کردن تاریخ برای نمایش بهتر
      final formattedDate = DateFormat('yyyy-MM-dd').format(group.deadline);
      print('   - گروه برای پروژه "${group.projectName}"');
      print('     - تاریخ ددلاین: $formattedDate');
      print('     - تعداد قالب‌ها برای شکست: ${group.molds.length}');
    }

    print('\n✅ ==========================================');
    print('✅             پایان گزارش               ');
    print('✅ ==========================================');
  }
}
