import 'package:flutter/material.dart';

@immutable
class Mold {
  final int id;
  final int ageInDays;
  final double mass;
  final double breakingLoad;
  final DateTime createdAt;
  final DateTime? completedAt;
  final DateTime deadline;
  final String sampleIdentifier;
  final Map<String, dynamic> extraData;
  final int seriesId;
  final String? preBreakImage; // ✅ عکس قبل شکست
  final String? postBreakImage; // ✅ عکس بعد شکست
  final bool isDone;

  const Mold({
    required this.id,
    required this.ageInDays,
    required this.mass,
    required this.breakingLoad,
    required this.createdAt,
    this.completedAt,
    required this.deadline,
    required this.sampleIdentifier,
    required this.extraData,
    required this.seriesId,
    this.preBreakImage,
    this.postBreakImage,
    required this.isDone,
  });

  factory Mold.fromJson(Map<String, dynamic> json) {
    return Mold(
      id: json['id'] as int,
      ageInDays: json['age_in_days'] ?? 0,
      mass: (json['mass'] as num?)?.toDouble() ?? 0.0,
      breakingLoad: (json['breaking_load'] as num?)?.toDouble() ?? 0.0,
      createdAt: DateTime.parse(json['created_at']),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'])
          : null,
      deadline: DateTime.parse(json['deadline']),
      sampleIdentifier: json['sample_identifier'] ?? '',
      extraData: json['extra_data'] ?? const {},
      seriesId: json['series'] ?? 0,
      preBreakImage: json['pre_break_image'],
      postBreakImage: json['post_break_image'],
      isDone: (json['is_done'] ?? false) as bool,
    );
  }
}
