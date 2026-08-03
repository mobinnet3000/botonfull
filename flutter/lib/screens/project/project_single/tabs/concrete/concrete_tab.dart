import 'package:boton/controllers/base_controller.dart';
import 'package:boton/models/Sample_model.dart';
import 'package:boton/models/project_model.dart';
import 'package:boton/models/sampling_serie_model.dart';
import 'package:boton/screens/project/project_single/tabs/concrete/serie_detail_page.dart';
import 'package:boton/screens/project/project_single/tabs/concrete/series_list.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:shamsi_date/shamsi_date.dart';

//======================================================================
// ۱. ویجت اصلی و نگهدارنده‌ی تب بتن
//======================================================================
class ConcreteTab extends StatelessWidget {
  ConcreteTab({super.key, required this.project});
  final Project project;

  @override
  Widget build(BuildContext context) {
    final ProjectController projectController = Get.find();

    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          TabBar(
            labelColor: Theme.of(context).primaryColor,
            unselectedLabelColor: Colors.grey,
            indicatorColor: Theme.of(context).primaryColor,
            tabs: const [
              Tab(text: 'افزودن و مدیریت نمونه'),
              Tab(text: 'لیست کل نمونه‌ها'),
              Tab(text: 'گزارش بتن'),
            ],
          ),
          Expanded(
            child: TabBarView(
              physics: NeverScrollableScrollPhysics(),
              children: [
                // ✅ استفاده از Obx برای واکنش به تغییرات در لیست نمونه‌ها
                Obx(() {
                  // پیدا کردن آخرین نسخه پروژه از کنترلر
                  final updatedProject = projectController.projects.firstWhere(
                    (p) => p.id == project.id,
                    orElse:
                        () => project, // اگر پیدا نشد، از نسخه اولیه استفاده کن
                  );
                  return AddConcreteView(project: updatedProject);
                }),
                // ✅ این بخش هم باید واکنش‌گرا باشد
                Obx(() {
                  final updatedProject = projectController.projects.firstWhere(
                    (p) => p.id == project.id,
                    orElse: () => project,
                  );
                  return ConcreteListView(project: updatedProject);
                }),
                const Center(child: Text('گزارش کلی و نمودارهای بتن')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

//======================================================================
// ۲. ویجت تب "افزودن و مدیریت نمونه" با منطق نهایی
//======================================================================
class AddConcreteView extends StatelessWidget {
  // ✅ تبدیل به StatelessWidget چون State توسط GetX مدیریت می‌شود
  const AddConcreteView({super.key, required this.project});
  final Project project;

  String toPersianDate(DateTime date) {
    final f = Jalali.fromDateTime(date).formatter;
    return "${f.dd} ${f.mN} ${f.yy}";
  }

  IconData _getIconForCategory(String categoryName) {
    final nameLower = categoryName.toLowerCase();
    if (nameLower.contains('فونداسیون')) return Icons.foundation;
    if (nameLower.contains('ستون')) return Icons.view_column_outlined;
    if (nameLower.contains('سقف')) return Icons.roofing_outlined;
    if (nameLower.contains('دیوار')) return Icons.view_week_outlined;
    return Icons.category_outlined;
  }

  Widget _buildDetailRow(
    BuildContext context,
    IconData icon,
    String label,
    String value,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0, horizontal: 16.0),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Theme.of(context).primaryColor),
          const SizedBox(width: 12),
          Text('$label:', style: const TextStyle(color: Colors.black54)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  /// متد نمایش صفحه مودال از پایین (Bottom Sheet) برای مدیریت سری‌های نمونه‌گیری
  void _showSeriesManagementSheet(BuildContext context, Sample sample) {
    final theme = Theme.of(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
      builder:
          (ctx) => Padding(
            padding: EdgeInsets.fromLTRB(
              20,
              20,
              20,
              MediaQuery.of(ctx).viewInsets.bottom + 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'مدیریت سری‌ها: ${sample.category}',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const Divider(height: 24),
                if (sample.series.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40.0),
                    child: Column(
                      children: [
                        Icon(
                          Icons.inbox_outlined,
                          size: 50,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'هیچ سری نمونه‌گیری برای این نمونه ثبت نشده است.',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  )
                else
                  // استفاده از Flexible برای محدود کردن ارتفاع ListView
                  Flexible(
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: sample.series.length,
                      itemBuilder: (context, index) {
                        final serie = sample.series[index];
                        return Card(
                          elevation: 2,
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          child: ListTile(
                            leading: CircleAvatar(child: Text('${index + 1}')),
                            title: Text(' ${serie.name}'),
                            subtitle: Text(
                            'افزودنی: ${serie.hasAdditive ? "دارد" : "ندارد"} - محور: ${serie.axis} - اسلامپ: ${serie.slump}cm - دمای بتن: ${serie.concreteTemperature}°C',
                              maxLines: 2,
                            ),
                            onTap: () {
                              // ✅✅✅ این بخش برای ناوبری استفاده می‌شود ✅✅✅
                              Navigator.of(context).pop(); // اول BottomSheet را ببند
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => SerieDetailPage(
                                    serieId: serie.id, // فقط ID را پاس می‌دهیم
                                    projectId: project.id,
                                    sampleId: sample.id,
                                  ),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    // ✅ فراخوانی تابع جدید برای نمایش دیالوگ افزودن سری
                    showAddSerieDialog(
                      projectId: project.id,
                      context: context, // از context اصلی استفاده می‌کنیم
                      sampleId: sample.id, // شناسه نمونه والد را پاس می‌دهیم
                    );
                  },
                  icon: const Icon(Icons.add_circle_outline),
                  label: const Text('افزودن سری جدید'),
                ),
              ],
            ),
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // لیست نمونه‌ها مستقیما از ویجت پدر خوانده می‌شود
    final List<Sample> samples = project.samples;

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        icon: const Icon(Icons.add),
        label: const Text('افزودن نمونه جدید'),
        onPressed: () {
          // ✅ فراخوانی تابع جدید که به کنترلر متصل است
          showAddSampleDialog(context: context, projectId: project.id);
        },
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Expanded(
          child:
              samples.isEmpty
                  ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.inbox_outlined,
                          size: 60,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'هیچ نمونه‌ای برای این پروژه ثبت نشده است.',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                  : ListView.builder(
                    itemCount: samples.length,
                    itemBuilder: (context, index) {
                      final sample = samples[index];
                      return Card(
                        elevation: 2,
                        margin: const EdgeInsets.symmetric(
                          vertical: 6,
                          horizontal: 8,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: ExpansionTile(
                          // بخش هدر
                          leading: Icon(
                            _getIconForCategory(sample.category),
                            color: Theme.of(context).primaryColor,
                          ),
                          title: Text(
                            sample.category,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            'تاریخ: ${toPersianDate(sample.date)}',
                          ),

                          // ✅✅✅ بخش اضافه شده اینجاست ✅✅✅
                          trailing: Chip(
                            label: Text(
                              '${sample.series.length} سری', // نمایش تعداد سری‌های نمونه‌گیری
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Colors.grey[700],
                              ),
                            ),
                            backgroundColor: Colors.grey.shade200,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8.0,
                            ),
                          ),
                          // ✅✅✅ پایان بخش اضافه شده ✅✅✅

                          // محتوای بازشونده
                          children: [
                            const Divider(height: 1, indent: 16, endIndent: 16),
                            _buildDetailRow(
                              context,
                              Icons.speed_outlined,
                              'عیار سیمان',
                              sample.cementGrade,
                            ),
                            _buildDetailRow(
                              context,
                              Icons.factory_outlined,
                              'کارخانه بتن',
                              sample.concreteFactory,
                            ),
                            _buildDetailRow(
                              context,
                              Icons.wb_sunny_outlined,
                              'وضعیت جوی',
                              sample.weatherCondition,
                            ),

                            // دکمه مدیریت سری‌ها
                            Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: ElevatedButton.icon(
                                icon: const Icon(Icons.settings_outlined),
                                onPressed:
                                    () => _showSeriesManagementSheet(
                                      context,
                                      sample,
                                    ),
                                label: const Text('مدیریت سری‌های نمونه‌گیری'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Theme.of(
                                    context,
                                  ).primaryColor.withOpacity(0.1),
                                  foregroundColor:
                                      Theme.of(context).primaryColor,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
        ),
      ),
    );
  }
}

//======================================================================
// ۲. ویجت اصلی که لیست سری‌ها را نمایش می‌دهد
//======================================================================

class _AddSampleFormContent extends StatefulWidget {
  // کلید فرم از بیرون به این ویجت داده می‌شود تا به دکمه‌ها دسترسی داشته باشیم
  const _AddSampleFormContent({super.key, this.initialCategory});

  final String? initialCategory;

  @override
  State<_AddSampleFormContent> createState() => _AddSampleFormContentState();
}

class _AddSampleFormContentState extends State<_AddSampleFormContent> {
  final formKey = GlobalKey<FormState>();

  // کنترلرها و متغیرها داخل State تعریف می‌شوند
  late TextEditingController categoryController;
  final dateController = TextEditingController();
  final samplingVolumeController = TextEditingController();
  final concreteFactoryController = TextEditingController();

  DateTime? selectedDate;
  String? selectedCementGrade = 'C25';
  String? selectedWeatherCondition = 'آفتابی';

  @override
  void initState() {
    super.initState();
    categoryController = TextEditingController(text: widget.initialCategory);
  }

  @override
  void dispose() {
    // فلاتر به صورت خودکار و در زمان مناسب این متد را فراخوانی می‌کند
    categoryController.dispose();
    dateController.dispose();
    samplingVolumeController.dispose();
    concreteFactoryController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (pickedDate != null) {
      setState(() {
        selectedDate = pickedDate;
        dateController.text = DateFormat('yyyy/MM/dd').format(pickedDate);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // این متد فقط UI فرم را می‌سازد
    return Form(
      key: formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextFormField(
            controller: categoryController,
            decoration: const InputDecoration(
              labelText: 'عنوان نمونه*',
              prefixIcon: Icon(Icons.title),
            ),
            validator: (v) => v!.isEmpty ? 'این فیلد الزامی است' : null,
          ),
          const SizedBox(height: 16),

          const SizedBox(height: 16),
          TextFormField(
            controller: dateController,
            decoration: const InputDecoration(
              labelText: 'تاریخ نمونه‌گیری*',
              prefixIcon: Icon(Icons.calendar_today_outlined),
            ),
            readOnly: true,
            onTap: _selectDate,
            validator: (v) => v!.isEmpty ? 'تاریخ الزامی است' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: samplingVolumeController,
            decoration: const InputDecoration(
              labelText: 'حجم بتن ریزی (m³)',
              prefixIcon: Icon(Icons.opacity_outlined),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            validator: (v) => v!.isEmpty ? 'این فیلد الزامی است' : null,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: selectedCementGrade,
            decoration: const InputDecoration(
              labelText: 'عیار سیمان*',
              prefixIcon: Icon(Icons.speed_outlined),
            ),
            items:
                ['C20', 'C25', 'C30', 'C35']
                    .map((l) => DropdownMenuItem(value: l, child: Text(l)))
                    .toList(),
            onChanged: (v) => setState(() => selectedCementGrade = v!),
            validator: (v) => v == null ? 'این فیلد الزامی است' : null,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: selectedWeatherCondition,
            decoration: const InputDecoration(
              labelText: 'وضعیت جوی*',
              prefixIcon: Icon(Icons.wb_sunny_outlined),
            ),
            items:
                ['آفتابی', 'ابری', 'بارانی', 'برفی']
                    .map((l) => DropdownMenuItem(value: l, child: Text(l)))
                    .toList(),
            onChanged: (v) => setState(() => selectedWeatherCondition = v!),
            validator: (v) => v == null ? 'این فیلد الزامی است' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: concreteFactoryController,
            decoration: const InputDecoration(
              labelText: 'نام کارخانه بتن*',
              prefixIcon: Icon(Icons.factory_outlined),
            ),
            validator: (v) => v!.isEmpty ? 'این فیلد الزامی است' : null,
          ),
        ],
      ),
    );
  }
}

//======================================================================
// ۲. تابع اصلی برای نمایش دیالوگ که حالا از ویجت بالا استفاده می‌کند
//======================================================================
Future<void> showAddSampleDialog({
  // ✅ خروجی تابع void است چون دیگر نیازی به بازگرداندن نمونه نداریم
  required BuildContext context,
  required int projectId,
  String? initialCategory,
}) async {
  final formWidgetKey = GlobalKey<_AddSampleFormContentState>();

  return showDialog<void>(
    // ✅ اینجا هم void است
    context: context,
    barrierDismissible: false,
    builder: (ctx) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('ایجاد نمونه جدید'),
        content: SingleChildScrollView(
          child: _AddSampleFormContent(
            key: formWidgetKey,
            initialCategory: initialCategory,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('انصراف'),
          ),
          ElevatedButton(
            onPressed: () async {
              // ✅ دکمه ثبت باید async باشد
              final formState = formWidgetKey.currentState;
              if (formState != null &&
                  formState.formKey.currentState!.validate()) {
                // ✅ ۱. ساختن Map داده‌ها برای ارسال به API
                final sampleData = {
                  'project': projectId,
                  'date': formState.selectedDate!.toIso8601String(),
                  'sampling_volume': formState.samplingVolumeController.text,
                  'cement_grade': formState.selectedCementGrade!,
                  'cement_type': 'تیپ 2',
                  'ambient_temperature': 20.0,
                  'specimen_type': 'مکعبی',
                  'specimen_size': '15x15x15',
                  'sampling_location': 'کارگاه',
                  'concrete_production_method': 'دستی',
                  'category': formState.categoryController.text.trim(),
                  'weather_condition': formState.selectedWeatherCondition!,
                  'concrete_factory': formState.concreteFactoryController.text,
                };


                // ✅ ۲. فراخوانی متد کنترلر برای ارسال داده و آپدیت state
                await Get.find<ProjectController>().addSampleToProject(
                  sampleData,
                  projectId,
                );

                // ✅ ۳. بستن دیالوگ پس از اتمام کار
                if (ctx.mounted) Navigator.pop(ctx);
              }
            },
            child: const Text('ثبت'),
          ),
        ],
      );
    },
  );
}

// //======================================================================
// // ویجت داخلی و stateful برای فرم "افزودن سری"
// //======================================================================
// class _AddSerieFormContent extends StatefulWidget {
//   // کلید فرم از بیرون به این ویجت داده می‌شود
//   const _AddSerieFormContent({super.key});

//   @override
//   State<_AddSerieFormContent> createState() => __AddSerieFormContentState();
// }

// class __AddSerieFormContentState extends State<_AddSerieFormContent> {
//   final formKey = GlobalKey<FormState>();

//   // کنترلرها و متغیرهای فرم
//   final _concreteTempController = TextEditingController();
//   final _ambientTempController = TextEditingController();
//   final _slumpController = TextEditingController();
//   final _rangeController = TextEditingController();
//   final _airPercentageController = TextEditingController();
//   bool _hasAdditive = false;
//   final List<int> _moldAges = [7, 28, 90, 120]; // مقادیر پیش‌فرض
//   final _moldAgeController =
//       TextEditingController(); // کنترلر برای فیلد ورودی سن قالب

//   @override
//   void dispose() {
//     // پاک کردن کنترلرها
//     _concreteTempController.dispose();
//     _ambientTempController.dispose();
//     _slumpController.dispose();
//     _rangeController.dispose();
//     _moldAgeController.dispose(); // ✅ کنترلر جدید را هم dispose کنید

//     _airPercentageController.dispose();
//     super.dispose();
//   }

//   void _addMoldAge() {
//     final ageText = _moldAgeController.text;
//     if (ageText.isNotEmpty) {
//       final age = int.tryParse(ageText);
//       if (age != null && age > 0) {
//         // از setState استفاده می‌کنیم تا UI فرم به‌روز شود
//         setState(() {
//           if (!_moldAges.contains(age)) {
//             // از افزودن مقادیر تکراری جلوگیری کن
//             _moldAges.add(age);
//             _moldAges.sort();
//           }
//           _moldAgeController.clear();
//         });
//       }
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Form(
//       key: formKey,
//       child: Column(
//         mainAxisSize: MainAxisSize.min,
//         children: [
//           TextFormField(
//             controller: _concreteTempController,
//             decoration: const InputDecoration(
//               labelText: 'دمای بتن (°C)',
//               prefixIcon: Icon(Icons.thermostat_outlined),
//             ),
//             keyboardType: const TextInputType.numberWithOptions(decimal: true),
//           ),
//           const SizedBox(height: 16),
//           TextFormField(
//             controller: _ambientTempController,
//             decoration: const InputDecoration(
//               labelText: 'دمای محیط (°C)',
//               prefixIcon: Icon(Icons.wb_sunny_outlined),
//             ),
//             keyboardType: const TextInputType.numberWithOptions(decimal: true),
//           ),
//           const SizedBox(height: 16),
//           TextFormField(
//             controller: _slumpController,
//             decoration: const InputDecoration(
//               labelText: 'مقدار اسلامپ (cm)',
//               prefixIcon: Icon(Icons.format_line_spacing_outlined),
//             ),
//             keyboardType: const TextInputType.numberWithOptions(decimal: true),
//           ),
//           const SizedBox(height: 16),
//           TextFormField(
//             controller: _rangeController,
//             decoration: const InputDecoration(
//               labelText: 'محدوده (مثال: اسلامپ)',
//               prefixIcon: Icon(Icons.unfold_more_outlined),
//             ),
//           ),
//           const SizedBox(height: 16),
//           TextFormField(
//             controller: _airPercentageController,
//             decoration: const InputDecoration(
//               labelText: 'درصد هوا (%)',
//               prefixIcon: Icon(Icons.air_outlined),
//             ),
//             keyboardType: const TextInputType.numberWithOptions(decimal: true),
//           ),const SizedBox(height: 24),
//           const Divider(),
//           Padding(
//             padding: const EdgeInsets.symmetric(vertical: 8.0),
//             child: Text(
//               'سن شکست قالب‌ها (روز)',
//               style: Theme.of(context).textTheme.titleSmall,
//             ),
//           ),
//           // ویجت Wrap برای نمایش چیپ‌ها در کنار هم
//           Wrap(
//             spacing: 8.0,
//             runSpacing: 4.0,
//             children: _moldAges.map((age) {
//               return Chip(
//                 label: Text('$age روز'),
//                 backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
//                 side: BorderSide(color: Theme.of(context).primaryColor.withOpacity(0.3)),
//                 onDeleted: () {
//                   setState(() {
//                     _moldAges.remove(age);
//                   });
//                 },
//               );
//             }).toList(),
//           ),
//           const SizedBox(height: 12),
//           // فیلد ورودی و دکمه افزودن
//           Row(
//             children: [
//               Expanded(
//                 child: TextFormField(
//                   controller: _moldAgeController,
//                   keyboardType: TextInputType.number,
//                   decoration: const InputDecoration(
//                     labelText: 'افزودن سن جدید',
//                     hintText: 'مثال: 7',
//                   ),
//                 ),
//               ),
//               const SizedBox(width: 8),
//               IconButton.filled(
//                 icon: const Icon(Icons.add),
//                 onPressed: _addMoldAge,
//               ),
//             ],
//           ),
//           // ✅✅✅ پایان بخش جدید ✅✅✅
//           const SizedBox(height: 12),

//           SwitchListTile(
//             title: const Text('افزودنی دارد؟'),
//             value: _hasAdditive,
//             onChanged: (newValue) {
//               setState(() {
//                 _hasAdditive = newValue;
//               });
//             },
//             secondary: const Icon(Icons.science_outlined),
//             contentPadding: EdgeInsets.zero,
//           ),
//         ],
//       ),
//     );
//   }
// }

// //======================================================================
// // تابع اصلی برای نمایش دیالوگ "افزودن سری"
// //======================================================================
// // ✅✅✅ کل تابع showAddSerieDialog قبلی را حذف کرده و این نسخه کامل را جایگزین آن کنید ✅✅✅

// Future<void> showAddSerieDialog({
//   required BuildContext context,
//   required int projectId, // ✅ به ID پروژه هم نیاز داریم
//   required int sampleId,
// }) async {
//   // ۱. تعریف کلید فرم و تمام کنترلرهای لازم در داخل تابع
//   final formKey = GlobalKey<FormState>();
//   final concreteTempController = TextEditingController();
//   final ambientTempController = TextEditingController();
//   final slumpController = TextEditingController();
//   final rangeController = TextEditingController();
//   final airPercentageController = TextEditingController();
//   bool hasAdditive = false;

//   // ۲. نمایش دیالوگ
//   await showDialog<void>(
//     context: context,
//     barrierDismissible: false,
//     builder: (ctx) {
//       // ۳. استفاده از StatefulBuilder برای مدیریت وضعیت Switch بدون نیاز به تغییر کل صفحه
//       return StatefulBuilder(
//         builder: (context, setStateInDialog) {
//           return AlertDialog(
//             shape: RoundedRectangleBorder(
//               borderRadius: BorderRadius.circular(16),
//             ),
//             title: const Text('افزودن سری نمونه‌گیری'),
//             content: SingleChildScrollView(
//               child: Form(
//                 key: formKey,
//                 child: Column(
//                   mainAxisSize: MainAxisSize.min,
//                   children: [
//                     TextFormField(
//                       controller: concreteTempController,
//                       decoration: const InputDecoration(
//                         labelText: 'دمای بتن (°C)',
//                       ),
//                       keyboardType: const TextInputType.numberWithOptions(
//                         decimal: true,
//                       ),
//                     ),
//                     const SizedBox(height: 16),
//                     TextFormField(
//                       controller: ambientTempController,
//                       decoration: const InputDecoration(
//                         labelText: 'دمای محیط (°C)',
//                       ),
//                       keyboardType: const TextInputType.numberWithOptions(
//                         decimal: true,
//                       ),
//                     ),
//                     const SizedBox(height: 16),
//                     TextFormField(
//                       controller: slumpController,
//                       decoration: const InputDecoration(
//                         labelText: 'مقدار اسلامپ (cm)',
//                       ),
//                       keyboardType: const TextInputType.numberWithOptions(
//                         decimal: true,
//                       ),
//                     ),
//                     const SizedBox(height: 16),
//                     TextFormField(
//                       controller: rangeController,
//                       decoration: const InputDecoration(
//                         labelText: 'محدوده (مثال: ۷-۵)',
//                       ),
//                     ),
//                     const SizedBox(height: 16),
//                     TextFormField(
//                       controller: airPercentageController,
//                       decoration: const InputDecoration(
//                         labelText: 'درصد هوا (%)',
//                       ),
//                       keyboardType: const TextInputType.numberWithOptions(
//                         decimal: true,
//                       ),
//                     ),
//                     const SizedBox(height: 12),
//                     SwitchListTile(
//                       title: const Text('افزودنی دارد؟'),
//                       value: hasAdditive,
//                       onChanged: (newValue) {
//                         // فقط ویجت‌های داخل دیالوگ را آپدیت می‌کند
//                         setStateInDialog(() {
//                           hasAdditive = newValue;
//                         });
//                       },
//                       contentPadding: EdgeInsets.zero,
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//             actions: [
//               TextButton(
//                 onPressed: () => Navigator.pop(ctx),
//                 child: const Text('انصراف'),
//               ),
//               ElevatedButton(
//           onPressed: () async { // ✅ دکمه را async کنید
//             final formState = formWidgetKey.currentState;
//             if (formState != null && formState.formKey.currentState!.validate()) {

//               // ✅ ساخت Map از داده‌ها، شامل فیلد جدید mold_ages
//               final serieData = {
//                 'sample': sampleId,
//                 'concrete_temperature': double.tryParse(formState._concreteTempController.text) ?? 0.0,
//                 'ambient_temperature': double.tryParse(formState._ambientTempController.text) ?? 0.0,
//                 'slump': double.tryParse(formState._slumpController.text) ?? 0.0,
//                 'range': formState._rangeController.text,
//                 'air_percentage': double.tryParse(formState._airPercentageController.text) ?? 0.0,
//                 'has_additive': formState._hasAdditive,
//                 'mold_ages': formState._moldAges, // ✅✅✅ ارسال لیست سن‌ها ✅✅✅
//               };

//               // ✅ فراخوانی کنترلر برای ارسال به بک‌اند
//               // projectId باید به این تابع پاس داده شود
//               await Get.find<ProjectController>().addSerieToSample(serieData, projectId, sampleId);

//               if (ctx.mounted) Navigator.pop(ctx);
//             }
//           },
//           child: const Text('ثبت'),
//         ),            ],
//           );
//         },
//       );
//     },
//   );

//   // ۷. پاکسازی کنترلرها برای جلوگیری از نشت حافظه
//   concreteTempController.dispose();
//   ambientTempController.dispose();
//   slumpController.dispose();
//   rangeController.dispose();
//   airPercentageController.dispose();
// }
//======================================================================
// ویجت مستقل و کامل برای فرم افزودن سری
//======================================================================
class _AddSerieForm extends StatefulWidget {
  final int projectId;
  final int sampleId;

  const _AddSerieForm({required this.projectId, required this.sampleId});

  @override
  State<_AddSerieForm> createState() => _AddSerieFormState();
}

class _AddSerieFormState extends State<_AddSerieForm> {
  final _formKey = GlobalKey<FormState>();

  // تمام کنترلرها و متغیرها در داخل همین کلاس مدیریت می‌شوند
  final _concreteTempController = TextEditingController();
  final _ambientTempController = TextEditingController();
  final _slumpController = TextEditingController();
  final _rangeController = TextEditingController();
  final _airPercentageController = TextEditingController();
  bool _hasAdditive = false;

  final List<int> _moldAges = [7, 28, 90, 120];
  final _moldAgeController = TextEditingController();

  @override
  void dispose() {
    _concreteTempController.dispose();
    _ambientTempController.dispose();
    _slumpController.dispose();
    _rangeController.dispose();
    _airPercentageController.dispose();
    _moldAgeController.dispose();
    super.dispose();
  }

  void _addMoldAge() {
    final ageText = _moldAgeController.text;
    if (ageText.isNotEmpty) {
      final age = int.tryParse(ageText);
      if (age != null && age > 0 && !_moldAges.contains(age)) {
        setState(() {
          _moldAges.add(age);
          _moldAges.sort();
          _moldAgeController.clear();
        });
      }
    }
  }

  Future<void> _submitForm() async {
    // چون فیلدهای این فرم اختیاری هستند، نیازی به ولیدیشن نداریم
    final serieData = {
      'sample': widget.sampleId,
      'concrete_temperature':
          double.tryParse(_concreteTempController.text) ?? 0.0,
      'slump': double.tryParse(_slumpController.text) ?? 0.0,
      'axis': 'A1',
      'has_additive': _hasAdditive,
      'photos': [],
      'concrete_temperature_image': null,
      'slump_image': null,
      'mold_ages': _moldAges,
    };

    await Get.find<ProjectController>().addSerieToSample(
      serieData,
      widget.projectId,
      widget.sampleId,
    );

    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _concreteTempController,
            decoration: const InputDecoration(labelText: 'دمای بتن (°C)'),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _ambientTempController,
            decoration: const InputDecoration(labelText: 'دمای محیط (°C)'),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
          const SizedBox(height: 16),

          // ✅✅✅ فیلدهای حذف شده به اینجا اضافه شدند ✅✅✅
          TextFormField(
            controller: _slumpController,
            decoration: const InputDecoration(labelText: 'مقدار اسلامپ (cm)'),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _rangeController,
            decoration: const InputDecoration(labelText: 'محدوده (مثال: ۷-۵)'),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _airPercentageController,
            decoration: const InputDecoration(labelText: 'درصد هوا (%)'),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),

          // ✅✅✅ پایان بخش اضافه شده ✅✅✅
          const SizedBox(height: 16),
          const Divider(),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Text(
              'سن شکست قالب‌ها (روز)',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ),
          Wrap(
            spacing: 8.0,
            children:
                _moldAges
                    .map(
                      (age) => Chip(
                        label: Text('$age روز'),
                        onDeleted: () => setState(() => _moldAges.remove(age)),
                      ),
                    )
                    .toList(),
          ),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _moldAgeController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'افزودن سن'),
                ),
              ),
              IconButton(icon: const Icon(Icons.add), onPressed: _addMoldAge),
            ],
          ),
          const SizedBox(height: 12),
          SwitchListTile(
            title: const Text('افزودنی دارد؟'),
            value: _hasAdditive,
            onChanged: (val) => setState(() => _hasAdditive = val),
            contentPadding: EdgeInsets.zero,
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('انصراف'),
              ),
              const SizedBox(width: 8),
              ElevatedButton(onPressed: _submitForm, child: const Text('ثبت')),
            ],
          ),
        ],
      ),
    );
  }
}

//======================================================================
// تابع اصلی برای نمایش دیالوگ "افزودن سری" (بسیار ساده شده)
//======================================================================
Future<void> showAddSerieDialog({
  required BuildContext context,
  required int projectId,
  required int sampleId,
}) async {
  return showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (ctx) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('افزودن سری نمونه‌گیری'),
        content: SingleChildScrollView(
          child: _AddSerieForm(projectId: projectId, sampleId: sampleId),
        ),
      );
    },
  );
}
