import 'package:boton/models/allmodels.dart';
import 'package:boton/models/sampling_serie_model.dart';
import 'package:flutter/material.dart';

@immutable
class Sample {
  final int id;
  final DateTime date;
  final String samplingVolume;
  final String cementGrade;
  final String cementType; // ✅ تیپ سیمان
  final double ambientTemperature; // ✅ دمای محیط
  final String specimenType; // ✅ نوع نمونه (مکعبی یا استوانه‌ای)
  final String specimenSize; // ✅ اندازه نمونه
  final String samplingLocation; // ✅ محل نمونه‌برداری
  final String concreteProductionMethod; // ✅ دستی یا بچینگ
  final String category;
  final String weatherCondition;
  final String concreteFactory;
  final int projectId;
  final List<SamplingSerie> series;

  const Sample({
    required this.id,
    required this.date,
    required this.samplingVolume,
    required this.cementGrade,
    required this.cementType,
    required this.ambientTemperature,
    required this.specimenType,
    required this.specimenSize,
    required this.samplingLocation,
    required this.concreteProductionMethod,
    required this.category,
    required this.weatherCondition,
    required this.concreteFactory,
    required this.projectId,
    required this.series,
  });

  factory Sample.fromJson(Map<String, dynamic> json) {
    return Sample(
      id: json['id'] as int,
      date: DateTime.parse(json['date'] as String),
      samplingVolume: json['sampling_volume']?.toString() ?? '0',
      cementGrade: json['cement_grade'] ?? '',
      cementType: json['cement_type'] ?? '',
      ambientTemperature:
          (json['ambient_temperature'] as num?)?.toDouble() ?? 0.0,
      specimenType: json['specimen_type'] ?? '',
      specimenSize: json['specimen_size'] ?? '',
      samplingLocation: json['sampling_location'] ?? '',
      concreteProductionMethod: json['concrete_production_method'] ?? '',
      category: json['category'] ?? '',
      weatherCondition: json['weather_condition'] ?? '',
      concreteFactory: json['concrete_factory'] ?? '',
      projectId: json['project'] as int,
      series: json['series'] != null
          ? parseList(json['series'], SamplingSerie.fromJson)
          : [],
    );
  }
}
