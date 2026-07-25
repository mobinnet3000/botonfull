// import 'package:flutter/material.dart';

// // ignore: must_be_immutable
// class RespCont extends StatelessWidget {
//   RespCont({super.key, required this.child});
//   Widget child;
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: Center(
//         child: Container(
//           constraints: BoxConstraints(maxWidth: 1000),
//           child: child,
//         ),
//       ),
//     );
//   }
// }
//--------------------------------------------------------------------------------------------------------
// lib/widgets/resp_cont.dart
// import 'package:flutter/material.dart';

// class RespCont extends StatelessWidget {
//   final Widget child;

//   const RespCont({
//     Key? key,
//     required this.child,
//   }) : super(key: key);

//   @override
//   Widget build(BuildContext context) {
//     return Center(
//       // از یک Box با حداکثر عرض ثابت استفاده می‌کنیم
//       child: Container(
//         // این عرض برای فرم‌های لاگین در وب بسیار استاندارد و مناسب است
//         constraints: const BoxConstraints(maxWidth: 500),
//         padding: const EdgeInsets.all(16.0), // در همه حالت‌ها یک پدینگ جزئی دارد
//         child: child,
//       ),
//     );
//   }
// }

//--------------------------------------------------------------------------------------------------------
// lib/widgets/resp_cont.dart
import 'package:flutter/material.dart';

class RespCont extends StatelessWidget {
  final Widget child;
  const RespCont({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        // افزایش عرض حداکثری به یک مقدار بهتر
        constraints: const BoxConstraints(maxWidth: 580),
        padding: const EdgeInsets.all(16.0),
        child: child,
      ),
    );
  }
}
