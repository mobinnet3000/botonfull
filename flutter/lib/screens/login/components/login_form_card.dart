// lib/components/login_form_card.dart
import 'package:boton/constants/routs.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:boton/constants/mypaddings.dart';
import 'package:boton/components/my_button.dart';
import 'package:boton/utils/snackbar_helper.dart';

class LoginFormCard extends StatefulWidget {
  const LoginFormCard({super.key});

  @override
  State<LoginFormCard> createState() => _LoginFormCardState();
}

class _LoginFormCardState extends State<LoginFormCard> {
  String? selectedRole;
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  void _handleLogin() {
    if (selectedRole == null) {
      SnackbarHelper.showError(message: 'لطفاً نقش خود را انتخاب کنید.');
      return;
    }
    
    if (usernameController.text.isNotEmpty && passwordController.text.isNotEmpty) {
      SnackbarHelper.showSuccess(
        title: 'ورود موفق',
        message: 'خوش آمدید، $selectedRole گرامی!',
      );

      // *** این خط باید از حالت کامنت خارج شود ***
      Get.offAllNamed(Main_Layout);

    } else {
      SnackbarHelper.showError(
        message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.primaryColor;
    final accentColor = theme.colorScheme.secondary;

    return Card(
      elevation: 15,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
      shadowColor: Colors.black.withOpacity(0.6),
      color: Colors.white.withOpacity(0.95),
      child: Padding(
        padding: MyPadings.large, // پدینگ داخلی کارت
        child: Column(
          mainAxisSize: MainAxisSize.min, // باعث می‌شود کارت ارتفاع اضافی نگیرد
          children: [
            Text('به اپلیکیشن بتن خوش آمدید!', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900, color: primaryColor), textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text('لطفاً نقش خود را برای ورود انتخاب کنید:', style: theme.textTheme.titleMedium?.copyWith(color: Colors.grey.shade700), textAlign: TextAlign.center),
            const SizedBox(height: 24), // <<-- فاصله کم شد

            Row(
              children: [
                Expanded(child: MyButton(ontap: () => setState(() { selectedRole = 'پیمانکار'; usernameController.clear(); passwordController.clear(); }), matn: 'پیمانکار', buttonColor: selectedRole == 'پیمانکار' ? accentColor : primaryColor.withOpacity(0.9), textColor: selectedRole == 'پیمانکار' ? Colors.black87 : Colors.white)),
                const SizedBox(width: 20),
                Expanded(child: MyButton(ontap: () => setState(() { selectedRole = 'کارفرما'; usernameController.clear(); passwordController.clear(); }), matn: 'کارفرما', buttonColor: selectedRole == 'کارفرما' ? accentColor : primaryColor.withOpacity(0.9), textColor: selectedRole == 'کارفرما' ? Colors.black87 : Colors.white)),
              ],
            ),
            
            // اگر نقشی انتخاب شده بود، فرم را نمایش بده
            if (selectedRole != null)
              Padding(
                // انیمیشن برای ظاهر شدن نرم فرم
                padding: const EdgeInsets.only(top: 30.0), // <<-- فاصله کم شد
                child: Column(
                  children: [
                    Text("ورود به حساب کاربری $selectedRole", style: theme.textTheme.headlineSmall?.copyWith(color: primaryColor, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 24), // <<-- فاصله کم شد
                    TextField(controller: usernameController, textDirection: TextDirection.ltr, textAlign: TextAlign.left, decoration: const InputDecoration(labelText: 'نام کاربری', prefixIcon: Icon(Icons.person_outline))),
                    const SizedBox(height: 16), // <<-- فاصله کم شد
                    TextField(controller: passwordController, obscureText: true, textDirection: TextDirection.ltr, textAlign: TextAlign.left, decoration: const InputDecoration(labelText: 'رمز عبور', prefixIcon: Icon(Icons.lock_outline))),
                    const SizedBox(height: 24), // <<-- فاصله کم شد
                    MyButton(ontap: _handleLogin, matn: 'ورود به $selectedRole', buttonColor: accentColor, textColor: Colors.black),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton(onPressed: () => SnackbarHelper.showWarning(message: 'برای بازیابی رمز عبور با پشتیبانی تماس بگیرید.'), child: const Text("فراموشی رمز عبور؟")),
                        TextButton(onPressed: () => Get.toNamed(Register_Page), child: const Text("ثبت نام")),
                      ],
                    )
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
