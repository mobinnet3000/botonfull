// lib/widgets/register_form_card.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:boton/constants/mypaddings.dart';
import 'package:boton/components/my_button.dart';

class RegisterFormCard extends StatefulWidget {
  const RegisterFormCard({super.key});

  @override
  State<RegisterFormCard> createState() => _RegisterFormCardState();
}

class _RegisterFormCardState extends State<RegisterFormCard> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();
  String? selectedRole;

  void _handleRegister() {
    // TODO: اینجا منطق اعتبارسنجی و ثبت‌نام را پیاده‌سازی کن
    if (selectedRole == null) {
      print("نقش انتخاب نشده است.");
      return;
    }
    if (passwordController.text != confirmPasswordController.text) {
      print("رمزهای عبور یکسان نیستند.");
      return;
    }
    print("ثبت نام با موفقیت انجام شد: ${usernameController.text}");
    Get.back(); // بازگشت به صفحه لاگین
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.primaryColor;
    final accentColor = theme.colorScheme.secondary;

    return Card(
      elevation: 15,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
      color: Colors.white.withOpacity(0.95),
      child: Padding(
        padding: MyPadings.large,
        child: Column(
          children: [
            Text('ایجاد حساب کاربری جدید', style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900, color: primaryColor)),
            const SizedBox(height: 30),
            
            // انتخاب نقش
            Row(
              children: [
                Expanded(child: MyButton(ontap: () => setState(() => selectedRole = 'پیمانکار'), matn: 'پیمانکار', buttonColor: selectedRole == 'پیمانکار' ? accentColor : primaryColor, textColor: selectedRole == 'پیمانکار' ? Colors.black : Colors.white)),
                const SizedBox(width: 25),
                Expanded(child: MyButton(ontap: () => setState(() => selectedRole = 'کارفرما'), matn: 'کارفرما', buttonColor: selectedRole == 'کارفرما' ? accentColor : primaryColor, textColor: selectedRole == 'کارفرما' ? Colors.black : Colors.white)),
              ],
            ),
            const SizedBox(height: 40),

            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'نام و نام خانوادگی', prefixIcon: Icon(Icons.badge_outlined))),
            const SizedBox(height: 20),
            TextField(controller: usernameController, decoration: const InputDecoration(labelText: 'نام کاربری', prefixIcon: Icon(Icons.person_outline))),
            const SizedBox(height: 20),
            TextField(controller: passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'رمز عبور', prefixIcon: Icon(Icons.lock_outline))),
            const SizedBox(height: 20),
            TextField(controller: confirmPasswordController, obscureText: true, decoration: const InputDecoration(labelText: 'تکرار رمز عبور', prefixIcon: Icon(Icons.lock_reset))),
            const SizedBox(height: 40),

            MyButton(ontap: _handleRegister, matn: 'ثبت نام', buttonColor: accentColor, textColor: Colors.black),
          ],
        ),
      ),
    );
  }
}
