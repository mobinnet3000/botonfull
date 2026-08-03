import 'package:flutter/material.dart';

class MyPadings {
  MyPadings._();
  static EdgeInsetsGeometry normal = EdgeInsets.all(10);
  static EdgeInsetsGeometry large = EdgeInsets.all(18);
  static EdgeInsetsGeometry small = EdgeInsets.all(5);
  static EdgeInsetsGeometry xlarge = EdgeInsets.all(25);
}

class MyShados {
  static BoxShadow projectsshadow = BoxShadow(
    color: const Color.fromARGB(60, 0, 0, 0),
    blurRadius: 8,
    offset: Offset(4, 8),
  );
}
