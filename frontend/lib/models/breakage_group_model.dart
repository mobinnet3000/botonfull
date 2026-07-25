import 'package:flutter/foundation.dart';
import 'mold_model.dart'; // مدل قالب را ایمپورت می‌کنیم

@immutable
class BreakageGroup {
  final String projectId;
  final String projectName;
  final DateTime deadline;
  final List<Mold> molds;

  const BreakageGroup({
    required this.projectId,
    required this.projectName,
    required this.deadline,
    required this.molds,
  });
}
