// lib/components/my_button.dart

import 'package:flutter/material.dart';

// 1. اسم کلاس به PascalCase تغییر کرد که استاندارد دارت است
class MyButton extends StatelessWidget {
  final VoidCallback ontap;
  final String matn;
  // 2. پارامترهای رنگ به کلاس اضافه شدند
  final Color? buttonColor;
  final Color? textColor;

  // 3. پارامترهای جدید به کانستراکتور اضافه شدند
  const MyButton({
    super.key,
    required this.ontap,
    required this.matn,
    this.buttonColor, // می‌تواند null باشد
    this.textColor, // می‌تواند null باشد
  });

  @override
  Widget build(BuildContext context) {
    // 4. از پارامترهای رنگ در طراحی دکمه استفاده می‌کنیم
    return ElevatedButton(
      onPressed: ontap,
      style: ElevatedButton.styleFrom(
        foregroundColor:
            textColor ?? Colors.white, // رنگ متن (اگر نال بود، سفید)
        backgroundColor:
            buttonColor ??
            Theme.of(
              context,
            ).primaryColor, // رنگ پس‌زمینه (اگر نال بود، رنگ اصلی تم)
        padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        minimumSize: const Size(200, 60),
        elevation: 8,
        shadowColor: Colors.black.withOpacity(0.4),
      ),
      child: Text(
        matn,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }
}
