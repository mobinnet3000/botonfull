import 'package:boton/screens/login/components/gradient_background.dart';
import 'package:boton/components/responsivcont.dart';
import 'package:flutter/material.dart';
import 'package:boton/screens/login/components/login_form_card.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // این باعث می‌شود پس‌زمینه گرادیانی زیر AppBar هم نمایش داده شود
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text("ورود به سیستم"),
        centerTitle: true,
        backgroundColor: Colors.transparent, // AppBar کاملا شفاف
        elevation: 0, // بدون سایه
      ),
      body: GradientBackground(
        child: RespCont(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // فاصله از بالای صفحه تا محتوای اصلی
                const SizedBox(height: 80),

                // لوگو یا تصویر
                Padding(
                  padding: const EdgeInsets.only(bottom: 30.0),
                  child: Image.asset(
                    'assets/images/logo.png', // مطمئن شو این مسیر لوگو درست است
                    height: 150, // ارتفاع لوگو کمی کمتر شد تا فیت شود
                  ),
                ),

                // کارت اصلی که شامل فرم ورود است
                const LoginFormCard(),

                const SizedBox(height: 40), // کمی فاصله در پایین صفحه
              ],
            ),
          ),
        ),
      ),
    );
  }
}
