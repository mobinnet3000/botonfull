// // lib/pages/mold_detail_page.dart

// import 'package:boton/models/mold_model.dart';
// import 'package:flutter/material.dart';
// import 'package:intl/intl.dart';

// // مدل Mold را ایمپورت کنید

// class MoldDetailPage extends StatefulWidget {
//   final Mold mold;
//   const MoldDetailPage({super.key, required this.mold});

//   @override
//   State<MoldDetailPage> createState() => _MoldDetailPageState();
// }

// class _MoldDetailPageState extends State<MoldDetailPage> {
//   bool _isEditing = false;
//   final _formKey = GlobalKey<FormState>();

//   late TextEditingController _massController;
//   late TextEditingController _breakingLoadController;
//   late DateTime? _completedAt;

//   @override
//   void initState() {
//     super.initState();
//     _initializeControllers();
//   }

//   void _initializeControllers() {
//     _massController = TextEditingController(text: widget.mold.mass.toString());
//     _breakingLoadController = TextEditingController(
//       text: widget.mold.breakingLoad.toString(),
//     );
//     _completedAt = widget.mold.completedAt;
//   }

//   @override
//   void dispose() {
//     _massController.dispose();
//     _breakingLoadController.dispose();
//     super.dispose();
//   }

//   Future<void> _selectCompletedDate() async {
//     final pickedDate = await showDatePicker(
//       context: context,
//       initialDate: _completedAt ?? DateTime.now(),
//       firstDate: widget.mold.createdAt,
//       lastDate: DateTime.now().add(const Duration(days: 365)),
//     );
//     if (pickedDate != null) {
//       setState(() {
//         _completedAt = pickedDate;
//       });
//     }
//   }

//   void _toggleEditMode() {
//     if (_isEditing) {
//       if (_formKey.currentState!.validate()) {
//         final updatedMold = widget.mold.copyWith(
//           mass: double.tryParse(_massController.text) ?? widget.mold.mass,
//           breakingLoad:
//               double.tryParse(_breakingLoadController.text) ??
//               widget.mold.breakingLoad,
//           completedAt: _completedAt,
//         );
//         // TODO: آبجکت updatedMold را به کنترلر اصلی برای ذخیره در سرور ارسال کنید
//         print('قالب آپدیت شد: ${updatedMold.toJson()}');
//         ScaffoldMessenger.of(context).showSnackBar(
//           const SnackBar(
//             content: Text('تغییرات با موفقیت ذخیره شد'),
//             backgroundColor: Colors.green,
//           ),
//         );

//         setState(() => _isEditing = false);
//       }
//     } else {
//       setState(() => _isEditing = true);
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text('جزئیات قالب - ${widget.mold.sampleIdentifier}'),
//       ),
//       floatingActionButton: FloatingActionButton.extended(
//         onPressed: _toggleEditMode,
//         label: Text(_isEditing ? 'ذخیره تغییرات' : 'ویرایش'),
//         icon: Icon(_isEditing ? Icons.save_alt_outlined : Icons.edit_outlined),
//       ),
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.all(16.0),
//         child: _isEditing ? _buildEditForm() : _buildDisplayInfo(),
//       ),
//     );
//   }

//   Widget _buildDisplayInfo() {
//     final mold = widget.mold;
//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         _buildInfoCard('اطلاعات پایه', [
//           _buildInfoRow(
//             Icons.insert_drive_file_outlined,
//             'شناسه نمونه:',
//             mold.sampleIdentifier,
//           ),
//           _buildInfoRow(Icons.numbers, 'عمر (روز):', mold.ageInDays.toString()),
//           _buildInfoRow(
//             Icons.calendar_today,
//             'تاریخ ایجاد:',
//             DateFormat('yyyy/MM/dd').format(mold.createdAt),
//           ),
//           _buildInfoRow(
//             Icons.timer_off_outlined,
//             'تاریخ تکمیل:',
//             mold.completedAt != null
//                 ? DateFormat('yyyy/MM/dd').format(mold.completedAt!)
//                 : 'تکمیل نشده',
//           ),
//           _buildInfoRow(
//             Icons.crisis_alert,
//             'ددلاین شکست:',
//             DateFormat('yyyy/MM/dd').format(mold.deadline),
//           ),
//         ]),
//         const SizedBox(height: 16),
//         _buildInfoCard('نتایج آزمون', [
//           _buildInfoRow(Icons.scale_outlined, 'جرم (گرم):', '${mold.mass} gr'),
//           _buildInfoRow(
//             Icons.compress_outlined,
//             'بار گسیختگی (KN):',
//             '${mold.breakingLoad} KN',
//           ),
//         ]),
//       ],
//     );
//   }

//   Widget _buildEditForm() {
//     return Form(
//       key: _formKey,
//       child: Column(
//         children: [
//           _buildInfoCard('ویرایش نتایج آزمون', [
//             TextFormField(
//               controller: _massController,
//               decoration: const InputDecoration(
//                 labelText: 'جرم (گرم)',
//                 prefixIcon: Icon(Icons.scale_outlined),
//               ),
//               keyboardType: const TextInputType.numberWithOptions(
//                 decimal: true,
//               ),
//               validator: (v) => v!.isEmpty ? 'این فیلد الزامی است' : null,
//             ),
//             const SizedBox(height: 16),
//             TextFormField(
//               controller: _breakingLoadController,
//               decoration: const InputDecoration(
//                 labelText: 'بار گسیختگی (KN)',
//                 prefixIcon: Icon(Icons.compress_outlined),
//               ),
//               keyboardType: const TextInputType.numberWithOptions(
//                 decimal: true,
//               ),
//               validator: (v) => v!.isEmpty ? 'این فیلد الزامی است' : null,
//             ),
//             const SizedBox(height: 16),
//             ListTile(
//               leading: const Icon(Icons.timer_off_outlined),
//               title: const Text('تاریخ تکمیل'),
//               subtitle: Text(
//                 _completedAt != null
//                     ? DateFormat('yyyy/MM/dd').format(_completedAt!)
//                     : 'انتخاب نشده',
//               ),
//               onTap: _selectCompletedDate,
//               trailing: const Icon(Icons.edit_calendar),
//             ),
//           ]),
//         ],
//       ),
//     );
//   }

//   Widget _buildInfoCard(String title, List<Widget> children) {
//     return Card(
//       elevation: 2,
//       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//       child: Padding(
//         padding: const EdgeInsets.all(16.0),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             Text(
//               title,
//               style: Theme.of(
//                 context,
//               ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
//             ),
//             const Divider(height: 24),
//             ...children,
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildInfoRow(IconData icon, String label, String value) {
//     return Padding(
//       padding: const EdgeInsets.symmetric(vertical: 8.0),
//       child: Row(
//         children: [
//           Icon(icon, size: 20, color: Theme.of(context).primaryColor),
//           const SizedBox(width: 12),
//           Text(label, style: const TextStyle(color: Colors.black54)),
//           const Spacer(),
//           Text(
//             value,
//             style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
//           ),
//         ],
//       ),
//     );
//   }
// }
