import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static const Color primary = Color(0xFF1976D2);
  static const Color primaryContainer = Color(0xFFE3F2FD);
  static const Color secondary = Color(0xFFFFA000);
  static const Color secondaryContainer = Color(0xFFFFF8E1);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceContainer = Color(0xFFF5F5F5);
  static const Color error = Color(0xFFBA1A00);

  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onSecondary = Color(0xFF1A0E00);
  static const Color onSurface = Color(0xFF1F1B1B);
  static const Color onError = Color(0xFFFFFFFF);

  static const Color success = Color(0xFF2E7D32);
  static const Color successContainer = Color(0xFFE8F5E9);
  static const Color onSuccess = Color(0xFFFFFFFF);

  static const Color warning = Color(0xFFEF6C00);
  static const Color warningContainer = Color(0xFFFFE0B2);
  static const Color onWarning = Color(0xFFFFFFFF);

  static const Color outline = Color(0xFFCAC4B8);
  static const Color outlineVariant = Color(0xFFE8E0D5);
  static const Color shadow = Color(0x1A000000);
  static const Color surfaceTint = Color(0xFF1976D2);

  static ColorScheme get lightColorScheme => ColorScheme(
    brightness: Brightness.light,
    primary: primary,
    onPrimary: onPrimary,
    primaryContainer: primaryContainer,
    onPrimaryContainer: const Color(0xFF001D3D),
    secondary: secondary,
    onSecondary: onSecondary,
    secondaryContainer: secondaryContainer,
    onSecondaryContainer: const Color(0xFF351900),
    tertiary: secondary,
    onTertiary: onSecondary,
    error: error,
    onError: onError,
    surface: surface,
    onSurface: onSurface,
    surfaceContainer: surfaceContainer,
    outline: outline,
    outlineVariant: outlineVariant,
    shadow: shadow,
    surfaceTint: surfaceTint,
  );

  static TextTheme get textTheme => TextTheme(
    headlineLarge: _headlineLarge,
    headlineMedium: _headlineMedium,
    headlineSmall: _headlineSmall,
    titleLarge: _titleLarge,
    titleMedium: _titleMedium,
    titleSmall: _titleSmall,
    bodyLarge: _bodyLarge,
    bodyMedium: _bodyMedium,
    bodySmall: _bodySmall,
    labelLarge: _labelLarge,
    labelMedium: _labelMedium,
    labelSmall: _labelSmall,
  );

  static const TextStyle _headlineLarge = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w800,
    fontFamily: 'DANA',
    height: 1.2,
  );

  static const TextStyle _headlineMedium = TextStyle(
    fontSize: 26,
    fontWeight: FontWeight.w700,
    fontFamily: 'DANA',
    height: 1.2,
  );

  static const TextStyle _headlineSmall = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    fontFamily: 'DANA',
    height: 1.3,
  );

  static const TextStyle _titleLarge = TextStyle(
    fontSize: 19,
    fontWeight: FontWeight.w600,
    fontFamily: 'DANA',
    height: 1.3,
  );

  static const TextStyle _titleMedium = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    fontFamily: 'DANA',
    height: 1.4,
  );

  static const TextStyle _titleSmall = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    fontFamily: 'DANA',
    height: 1.4,
  );

  static const TextStyle _bodyLarge = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    fontFamily: 'DANA',
    height: 1.5,
  );

  static const TextStyle _bodyMedium = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    fontFamily: 'DANA',
    height: 1.5,
  );

  static const TextStyle _bodySmall = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w400,
    fontFamily: 'DANA',
    height: 1.4,
  );

  static const TextStyle _labelLarge = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    fontFamily: 'DANA',
    height: 1.4,
  );

  static const TextStyle _labelMedium = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    fontFamily: 'DANA',
    height: 1.4,
  );

  static const TextStyle _labelSmall = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    fontFamily: 'DANA',
    letterSpacing: 0.5,
    height: 1.4,
  );

  static BorderRadius get radius => BorderRadius.circular(12);
  static BorderRadius get radiusCard => BorderRadius.circular(16);
  static BorderRadius get radiusBadge => BorderRadius.circular(20);

  static const EdgeInsets screenPadding = EdgeInsets.all(24);
  static const EdgeInsets cardPadding = EdgeInsets.all(20);
  static const EdgeInsets sectionGap = EdgeInsets.symmetric(vertical: 24);
  static const EdgeInsets itemGap = EdgeInsets.symmetric(vertical: 8);
  static const EdgeInsets rowGap = EdgeInsets.symmetric(horizontal: 12);

  static BoxDecoration cardDecoration({
    Color? color,
    double? elevation,
    bool withBorder = false,
  }) {
    return BoxDecoration(
      color: color ?? surface,
      borderRadius: radiusCard,
      boxShadow: [
        BoxShadow(
          color: shadow,
          blurRadius: elevation ?? 2,
          offset: const Offset(0, 2),
        ),
      ],
      border: withBorder
          ? Border.all(color: outlineVariant, width: 1)
          : null,
    );
  }

  static BoxDecoration cardDecorationSecondary({
    Color? color,
    Color? borderColor,
  }) {
    return BoxDecoration(
      color: color ?? primaryContainer,
      borderRadius: radiusCard,
      border: Border.all(
        color: borderColor ?? primary.withOpacity(0.2),
        width: 1,
      ),
    );
  }

  static BoxDecoration badgeDecoration(Color color) => BoxDecoration(
    color: color.withOpacity(0.1),
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: color, width: 1),
  );

  static TextStyle getStatusStyle(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'تکمیل':
        return const TextStyle(
          color: Color(0xFF2E7D32),
          fontWeight: FontWeight.w600,
          fontSize: 12,
          fontFamily: 'DANA',
        );
      case 'active':
      case 'فعال':
        return const TextStyle(
          color: Color(0xFF1565C0),
          fontWeight: FontWeight.w600,
          fontSize: 12,
          fontFamily: 'DANA',
        );
      case 'overdue':
      case 'عقب افتاده':
        return const TextStyle(
          color: Color(0xFFB71C1C),
          fontWeight: FontWeight.w600,
          fontSize: 12,
          fontFamily: 'DANA',
        );
      default:
        return const TextStyle(
          color: Color(0xFF616161),
          fontWeight: FontWeight.w600,
          fontSize: 12,
          fontFamily: 'DANA',
        );
    }
  }
}

class AppTextStyles {
  AppTextStyles._();

  static const TextStyle pageTitle = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w800,
    fontFamily: 'DANA',
    height: 1.2,
    color: AppTheme.onSurface,
  );

  static const TextStyle sectionTitle = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    fontFamily: 'DANA',
    height: 1.3,
    color: AppTheme.onSurface,
  );

  static const TextStyle cardTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    fontFamily: 'DANA',
    height: 1.3,
    color: AppTheme.onSurface,
  );

  static const TextStyle cardSubtitle = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    fontFamily: 'DANA',
    height: 1.4,
    color: Color(0xFF757575),
  );

  static const TextStyle label = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    fontFamily: 'DANA',
    height: 1.4,
    color: AppTheme.onSurface,
  );

  static const TextStyle caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    fontFamily: 'DANA',
    height: 1.3,
    color: Color(0xFF9E9E9E),
  );

  static const TextStyle badgeLabel = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    fontFamily: 'DANA',
    letterSpacing: 0.3,
    height: 1.2,
  );

  static const TextStyle kpiValue = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w800,
    fontFamily: 'DANA',
    height: 1.1,
  );

  static const TextStyle kpiLabel = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    fontFamily: 'DANA',
    height: 1.4,
    color: Color(0xFF757575),
  );

  static const TextStyle navLabel = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    fontFamily: 'DANA',
    height: 1.3,
  );
}

class AppElevations {
  AppElevations._();

  static const List<BoxShadow> card = [
    BoxShadow(
      color: Color(0x0A000000),
      blurRadius: 10,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> cardHover = [
    BoxShadow(
      color: Color(0x14000000),
      blurRadius: 20,
      offset: Offset(0, 8),
    ),
  ];

  static const List<BoxShadow> bottomSheet = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 24,
      offset: Offset(0, 8),
    ),
  ];
}

class AppBreakpoints {
  AppBreakpoints._();

  static const double desktop = 1024;
  static const double tablet = 768;
  static const double mobile = 480;
  static const double narrowMobile = 360;
}
