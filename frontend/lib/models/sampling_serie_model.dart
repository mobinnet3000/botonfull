import 'package:boton/models/allmodels.dart';
import 'package:boton/models/mold_model.dart';
import 'package:flutter/material.dart';

@immutable
class SamplingSerie {
  final int id;
  final String name;
  final double concreteTemperature;
  final String? concreteTemperatureImage; // ✅ عکس دمای بتن
  final double slump;
  final String? slumpImage; // ✅ عکس اسلامپ
  final String axis; // ✅ محور (A1-A2)
  final bool hasAdditive;
  final int sampleId;
  final List<Mold> molds;
  final List<String>? photos; // ✅ عکس‌های نمونه سری

  const SamplingSerie({
    required this.id,
    required this.name,
    required this.concreteTemperature,
    this.concreteTemperatureImage,
    required this.slump,
    this.slumpImage,
    required this.axis,
    required this.hasAdditive,
    required this.sampleId,
    required this.molds,
    this.photos,
  });

  factory SamplingSerie.fromJson(Map<String, dynamic> json) {
    return SamplingSerie(
      id: json['id'] as int,
      name: json['name'] ?? 'سری نامشخص',
      concreteTemperature:
          (json['concrete_temperature'] as num?)?.toDouble() ?? 0.0,
      concreteTemperatureImage: json['concrete_temperature_image'],
      slump: (json['slump'] as num?)?.toDouble() ?? 0.0,
      slumpImage: json['slump_image'],
      axis: json['axis'] ?? '',
      hasAdditive: json['has_additive'] ?? false,
      sampleId: json['sample'] ?? 0,
      molds: json['molds'] != null
          ? parseList(json['molds'], Mold.fromJson)
          : [],
      photos: json['photos'] != null
          ? List<String>.from(
              json['photos'].map((p) => p['image'] as String))
          : [],
    );
  }
}
