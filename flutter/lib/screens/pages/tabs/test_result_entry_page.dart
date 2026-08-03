// // pages/test_result_entry_page.dart

// import 'package:boton/models/concrete_sample_model.dart';
// import 'package:flutter/material.dart';
// // import 'models/concrete_sample.dart';
// // import 'package:get/get.dart';

// class TestResultEntryPage extends StatefulWidget {
//   final ConcreteSample sample;

//   const TestResultEntryPage({super.key, required this.sample});

//   @override
//   State<TestResultEntryPage> createState() => _TestResultEntryPageState();
// }

// class _TestResultEntryPageState extends State<TestResultEntryPage> {
//   final _formKey = GlobalKey<FormState>();
//   final _forceController = TextEditingController();
//   final _lengthController = TextEditingController(text: '15'); // cm
//   final _widthController = TextEditingController(text: '15'); // cm

//   void _calculateAndSaveChanges() {
//     if (_formKey.currentState!.validate()) {
//       final force = double.tryParse(_forceController.text) ?? 0;
//       final length = double.tryParse(_lengthController.text) ?? 15;
//       final width = double.tryParse(_widthController.text) ?? 15;

//       // محاسبه مساحت سطح مقطع به cm2
//       final area = length * width;
      
//       // محاسبه مقاومت (kg/cm2)
//       final double strength = (area > 0) ? force / area : 0;
      
//       // آپدیت کردن آبجکت نمونه با مقادیر جدید
//       final updatedSample = widget.sample; // این بخش باید برای عدم تغییر مستقیم state اصلاح شود
//       updatedSample.appliedForce = force;
//       updatedSample.cubicStrength = strength;
//       updatedSample.actualBreakDate = DateTime.now();
      
//       // اینجا کد ارسال به بک‌اند قرار می‌گیرد
//       print('Sending to backend: ${updatedSample.id}, Strength: ${updatedSample.cubicStrength}');
      
//       // بازگشت به صفحه قبل و ارسال نمونه آپدیت شده
//       // Get.back(result: updatedSample);

//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('نتیجه محاسبه شد: ${strength.toStringAsFixed(2)} kg/cm²'))
//       );
//     }
//   }

//   @override
//   void dispose() {
//     _forceController.dispose();
//     _lengthController.dispose();
//     _widthController.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text('ثبت مقاومت بتن شماره: ${widget.sample.id}'),
//       ),
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.all(16.0),
//         child: Form(
//           key: _formKey,
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               Text('ابعاد نمونه (cm)', style: Theme.of(context).textTheme.titleMedium),
//               Row(
//                 children: [
//                   Expanded(child: _buildTextField(_lengthController, 'طول')),
//                   const SizedBox(width: 10),
//                   Expanded(child: _buildTextField(_widthController, 'عرض')),
//                   const SizedBox(width: 10),
//                   Expanded(child: TextFormField(initialValue: '15', enabled: false, decoration: InputDecoration(labelText: 'ارتفاع'))),
//                 ],
//               ),
//               const SizedBox(height: 20),
//               _buildTextField(_forceController, 'نیروی وارده (kg)'),
//               const SizedBox(height: 30),
//               Center(
//                 child: ElevatedButton(
//                   onPressed: _calculateAndSaveChanges,
//                   child: Text('محاسبه و ذخیره نتایج'),
//                   style: ElevatedButton.styleFrom(
//                     padding: EdgeInsets.symmetric(horizontal: 40, vertical: 15),
//                   ),
//                 ),
//               )
//             ],
//           ),
//         ),
//       ),
//     );
//   }

//   TextFormField _buildTextField(TextEditingController controller, String label) {
//     return TextFormField(
//       controller: controller,
//       keyboardType: TextInputType.number,
//       decoration: InputDecoration(
//         labelText: label,
//         border: OutlineInputBorder(),
//       ),
//       validator: (value) {
//         if (value == null || value.isEmpty) {
//           return 'این فیلد نباید خالی باشد';
//         }
//         if (double.tryParse(value) == null) {
//           return 'لطفا یک عدد معتبر وارد کنید';
//         }
//         return null;
//       },
//     );
//   }
// }
