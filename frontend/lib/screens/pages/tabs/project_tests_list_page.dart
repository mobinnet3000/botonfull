// // pages/project_tests_list_page.dart

// import 'package:boton/models/concrete_sample_model.dart';
// import 'package:boton/screens/daily/tabs/test_result_entry_page.dart';
// import 'package:flutter/material.dart';
// import 'package:get/get.dart';
// import 'package:intl/intl.dart' as intl; // برای فرمت تاریخ
// import 'package:shamsi_date/shamsi_date.dart'; // برای نمایش تاریخ شمسی
// // import 'package:get/get.dart'; // اگر از GetX استفاده می‌کنید

// // مدل و صفحه ثبت نتایج را import کنید
// // import 'models/concrete_sample.dart';
// // import 'pages/test_result_entry_page.dart';

// class ProjectTestsListPage extends StatefulWidget {
//   // فرض می‌کنیم لیستی از نمونه‌های مربوط به یک پروژه به این صفحه فرستاده می‌شود
//   final List<ConcreteSample> samples;

//   const ProjectTestsListPage({super.key, required this.samples});

//   @override
//   State<ProjectTestsListPage> createState() => _ProjectTestsListPageState();
// }

// class _ProjectTestsListPageState extends State<ProjectTestsListPage> {
//   late List<ConcreteSample> _samples;

//   @override
//   void initState() {
//     super.initState();
//     _samples = widget.samples;
//   }

//   // تابع برای تبدیل تاریخ میلادی به شمسی
//   String _toPersianDate(DateTime date) {
//     final f = Jalali.fromDateTime(date);
//     return f.toString(); // فرمت YYYY/MM/DD
//   }

//   // تابع برای ناوبری به صفحه ثبت نتایج
//   void _navigateToTestEntry(ConcreteSample sample) async {
//     // با استفاده از GetX یا Navigator.push

//     final updatedSample = await Get.to(
//       () => TestResultEntryPage(sample: sample),
//     );

//     if (updatedSample != null) {
//       setState(() {
//         // آپدیت کردن نمونه در لیست
//         final index = _samples.indexWhere((s) => s.id == updatedSample.id);
//         if (index != -1) {
//           _samples[index] = updatedSample;
//         }
//       });
//     }

//     // نمایش یک پیام موقت
//     ScaffoldMessenger.of(context).showSnackBar(
//       SnackBar(content: Text('صفحه ثبت نتایج برای ${sample.id} باز می‌شود')),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     // اطلاعات پروژه از اولین نمونه گرفته می‌شود، چون همگی برای یک پروژه‌اند
//     final projectInfo = _samples.isNotEmpty ? _samples.first : null;

//     return Scaffold(
//       appBar: AppBar(
//         title: Text('لیست آزمایش‌های پروژه'),
//         backgroundColor: Colors.teal,
//       ),
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.all(16.0),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             // بخش اطلاعات بالای صفحه
//             if (projectInfo != null) _buildProjectHeader(projectInfo),

//             const SizedBox(height: 20),

//             // جدول نمایش آزمایش‌ها
//             Container(
//               width: double.infinity,
//               child: DataTable(
//                 headingRowColor: MaterialStateProperty.all(Colors.grey[200]),
//                 columnSpacing: 16.0,
//                 columns: const [
//                   DataColumn(label: Text('نوع نمونه')),
//                   DataColumn(label: Text('سن نمونه')),
//                   DataColumn(label: Text('تاریخ شکست')),
//                   DataColumn(label: Text('باقیمانده (روز)')),
//                   DataColumn(label: Text('مقاومت')),
//                 ],
//                 rows:
//                     _samples.map((sample) {
//                       return DataRow(
//                         cells: [
//                           DataCell(
//                             Text(
//                               '${sample.samplingLocation} (${sample.moldCount} قالب)',
//                             ),
//                             onTap: () => _navigateToTestEntry(sample),
//                           ),
//                           DataCell(Text('${sample.currentAge} روزه')),
//                           DataCell(
//                             Text(_toPersianDate(sample.requiredBreakDate)),
//                           ),
//                           DataCell(Text(sample.remainingDays.toString())),
//                           DataCell(
//                             Text(sample.cubicStrength?.toString() ?? '-'),
//                           ),
//                         ],
//                       );
//                     }).toList(),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildProjectHeader(ConcreteSample projectInfo) {
//     return Card(
//       elevation: 2,
//       child: Padding(
//         padding: const EdgeInsets.all(16.0),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.stretch,
//           children: [
//             Text(
//               'شماره پرونده: ${projectInfo.projectCaseNumber}',
//               style: TextStyle(fontSize: 16),
//             ),
//             SizedBox(height: 8),
//             Row(
//               children: [
//                 Text('نام پروژه: ', style: TextStyle(fontSize: 16)),
//                 InkWell(
//                   onTap: () {
//                     // TODO: ناوبری به صفحه خود پروژه
//                     ScaffoldMessenger.of(context).showSnackBar(
//                       SnackBar(
//                         content: Text(
//                           'رفتن به صفحه پروژه ${projectInfo.projectName}',
//                         ),
//                       ),
//                     );
//                   },
//                   child: Text(
//                     projectInfo.projectName,
//                     style: TextStyle(
//                       fontSize: 16,
//                       color: Colors.blue,
//                       fontWeight: FontWeight.bold,
//                     ),
//                   ),
//                 ),
//               ],
//             ),
//             SizedBox(height: 8),
//             Text(
//               'نام کارفرما: ${projectInfo.clientName}',
//               style: TextStyle(fontSize: 16),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
