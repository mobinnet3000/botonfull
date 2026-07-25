import 'package:boton/screens/layouts/main_layout.dart';
import 'package:boton/screens/login/register_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:boton/screens/login/login_page.dart'; // مسیر صفحه لاگین شما
import 'package:boton/constants/routs.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'پنل مدیریت بتن',
      debugShowCheckedModeBanner: false,

      //======================================================================
      // بخش پشتیبانی از زبان فارسی و راست‌چین کردن (RTL)
      //======================================================================
      locale: Locale('fa', 'IR'),
      fallbackLocale: const Locale('fa', 'IR'),
      supportedLocales: const [Locale('fa', 'IR'), Locale('en', 'US')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],

      //======================================================================
      // بخش تم (Theme) مدرن و اصلاح‌شده برای ثبات رنگ‌ها
      //======================================================================
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        fontFamily: 'DANA', // Make sure to add Vazir font to your project
        scaffoldBackgroundColor: Colors.grey[100],
        // inputDecorationTheme: InputDecorationTheme(
        //   filled: true,
        //   fillColor: Colors.white,
        //   border: OutlineInputBorder(
        //     borderRadius: BorderRadius.circular(12.0),
        //     borderSide: BorderSide.none,
        //   ),
        //   prefixIconColor: Colors.indigo[400],
        // ),
        cardTheme: CardTheme(
          elevation: 4.0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15.0),
          ),
          margin: EdgeInsets.symmetric(vertical: 10.0, horizontal: 8.0),
        ),
        // استفاده از ColorScheme به عنوان منبع اصلی رنگ‌ها
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue.shade700, // رنگ پایه برای تولید پالت
          primary: Colors.blue.shade700, // تعریف صریح رنگ اصلی
          secondary: Colors.amber.shade700, // تعریف صریح رنگ ثانویه
          brightness: Brightness.light, // تم روشن
        ),

        // فعال کردن طراحی متریال ۳ برای ظاهری مدرن‌تر
        useMaterial3: true,
        // fontFamily: 'Vazirmatn', // فونت پیش‌فرض کل برنامه
        // استایل سفارشی برای AppBar
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.blue.shade700,
          foregroundColor: Colors.black, // رنگ متن و آیکون‌ها در AppBar
          elevation: 2,
        ),

        // استایل سفارشی برای فیلدهای ورودی
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: const BorderSide(width: 1.5),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide(color: Colors.amber.shade700, width: 2.5),
          ),
          labelStyle: TextStyle(
            color: Colors.blue.shade800,
            fontWeight: FontWeight.w500,
            fontFamily: 'DANA',
          ),
          filled: true,
          fillColor: Colors.white.withOpacity(0.85),
          contentPadding: const EdgeInsets.symmetric(
            vertical: 18,
            horizontal: 20,
          ),
        ),

        // استایل سفارشی برای دکمه‌های اصلی
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            padding: const EdgeInsets.symmetric(vertical: 16),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              fontFamily: 'DANA',
            ),
          ),
        ),
      ),

      // اولین صفحه‌ای که برنامه با آن شروع می‌شود
      // home: const LoginPage(),
      initialRoute: Main_Layout,
      routes: {
        init_route: (context) => LoginPage(),
        Main_Layout: (context) => MainLayout(),
        Register_Page: (context) => RegisterPage(),
        // intro_route: (context) => ,
        // auth_route: (context) =>
      },
    );
  }
}
