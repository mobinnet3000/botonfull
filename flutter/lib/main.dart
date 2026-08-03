import 'package:boton/constants/app_theme.dart';
import 'package:boton/constants/routs.dart';
import 'package:boton/screens/layouts/main_layout.dart';
import 'package:boton/screens/login/login_page.dart';
import 'package:boton/screens/login/register_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:get/get.dart';

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
      locale: const Locale('fa', 'IR'),
      fallbackLocale: const Locale('fa', 'IR'),
      supportedLocales: const [Locale('fa', 'IR'), Locale('en', 'US')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData(
        colorScheme: AppTheme.lightColorScheme,
        textTheme: AppTheme.textTheme,
        fontFamily: 'DANA',
        useMaterial3: true,
        scaffoldBackgroundColor: AppTheme.surfaceContainer,
        appBarTheme: AppBarTheme(
          backgroundColor: AppTheme.primary,
          foregroundColor: AppTheme.onPrimary,
          centerTitle: true,
          elevation: 0,
          shape: const Border(
            bottom: BorderSide(color: AppTheme.outlineVariant, width: 1),
          ),
          titleTextStyle: AppTheme.textTheme.titleLarge!.copyWith(
            color: AppTheme.onPrimary,
            fontWeight: FontWeight.w700,
          ),
          toolbarHeight: 56,
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: AppTheme.radiusCard,
          ),
          shadowColor: AppTheme.shadow,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            foregroundColor: AppTheme.onPrimary,
            shape: RoundedRectangleBorder(borderRadius: AppTheme.radius),
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
            textStyle: AppTheme.textTheme.labelLarge!.copyWith(
              color: AppTheme.onPrimary,
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: AppTheme.radius,
            borderSide: const BorderSide(color: AppTheme.outline, width: 1),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: AppTheme.radius,
            borderSide:
                const BorderSide(color: AppTheme.primary, width: 2),
          ),
          labelStyle: AppTheme.textTheme.bodyLarge!.copyWith(
            color: const Color(0xFF757575),
          ),
          filled: true,
          fillColor: AppTheme.surface,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: AppTheme.surface,
          selectedItemColor: AppTheme.primary,
          unselectedItemColor: const Color(0xFF9E9E9E),
          selectedLabelStyle: AppTextStyles.navLabel
              .copyWith(fontWeight: FontWeight.w700, color: AppTheme.primary),
          unselectedLabelStyle: AppTextStyles.navLabel,
          elevation: 8,
        ),
        bottomAppBarTheme:
const BottomAppBarThemeData(
  color: AppTheme.surface,
  elevation: 8,
),        drawerTheme: const DrawerThemeData(
          backgroundColor: AppTheme.surface,
          elevation: 8,
          shape: RoundedRectangleBorder(),
        ),
        navigationRailTheme: NavigationRailThemeData(
          backgroundColor: AppTheme.surface,
          // selectedIconColor: AppTheme.primary,
          // unselectedIconColor: const Color(0xFF9E9E9E),
          selectedLabelTextStyle: AppTextStyles.navLabel
              .copyWith(color: AppTheme.primary, fontWeight: FontWeight.w700),
          unselectedLabelTextStyle:
              AppTextStyles.navLabel.copyWith(color: Color(0xFF9E9E9E)),
          indicatorColor: AppTheme.primaryContainer,
          elevation: 0,
        ),
        snackBarTheme: SnackBarThemeData(
          backgroundColor: AppTheme.surface,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: AppTheme.radiusBadge,
          ),
          elevation: 4,
          contentTextStyle: AppTheme.textTheme.bodyMedium,
        ),
        dividerTheme: const DividerThemeData(
          color: AppTheme.outlineVariant,
          thickness: 1,
          space: 1,
        ),
      ),
      initialRoute: Main_Layout,
      routes: {
        init_route: (context) => const LoginPage(),
        Main_Layout: (context) => const MainLayout(),
        Register_Page: (context) => const RegisterPage(),
      },
    );
  }
}
