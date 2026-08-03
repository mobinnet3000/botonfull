// lib/widgets/gradient_background.dart
import 'package:flutter/material.dart';

class GradientBackground extends StatelessWidget {
  final Widget child;
  const GradientBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          // تغییر زاویه برای پویایی بیشتر
          begin: Alignment.topCenter,
          end: Alignment.bottomRight,
          // استفاده از رنگ‌های عمیق‌تر و جذاب‌تر
          colors: [
            Color(0xFF0D47A1), // آبی بسیار تیره (سرمه‌ای)
            Color.fromARGB(255, 47, 141, 236), // آبی پررنگ
            Color.fromARGB(255, 164, 214, 255), // آبی روشن‌تر
          ],
          stops: [0.0, 0.5, 1.0], // کنترل نحوه ترکیب رنگ‌ها
        ),
      ),
      child: child,
    );
  }
}
