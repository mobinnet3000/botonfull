import 'package:boton/models/Sample_model.dart';
import 'package:boton/models/allmodels.dart';
import 'package:boton/models/transaction_model.dart';
import 'package:flutter/material.dart';

@immutable
class Project {
  final int id;
  final DateTime createdAt;
  final String fileNumber;
  final String projectName;
  final String clientName;
  final String clientPhoneNumber;
  final String supervisorName;
  final String supervisorPhoneNumber;
  final String requesterName;
  final String requesterPhoneNumber;
  final String municipalityZone;
  final String address;
  final String projectUsageType;
  final int floorCount;
  final String testType; // ✅ جایگزین cementType و moldType
  final double occupiedArea;
  final double contractPrice;
  final int ownerId;
  List<Sample> samples;
  List<Transaction> transactions;
  final double totalIncome;
  final double totalExpense;
  final double balance;

   Project({
    required this.id,
    required this.createdAt,
    required this.fileNumber,
    required this.projectName,
    required this.clientName,
    required this.clientPhoneNumber,
    required this.supervisorName,
    required this.supervisorPhoneNumber,
    required this.requesterName,
    required this.requesterPhoneNumber,
    required this.municipalityZone,
    required this.address,
    required this.projectUsageType,
    required this.floorCount,
    required this.testType,
    required this.occupiedArea,
    required this.contractPrice,
    required this.ownerId,
    required this.samples,
    required this.transactions,
    required this.totalIncome,
    required this.totalExpense,
    required this.balance,
  });
  Project copyWith({
    int? id,
    DateTime? createdAt,
    String? fileNumber,
    String? projectName,
    String? clientName,
    String? clientPhoneNumber,
    String? supervisorName,
    String? supervisorPhoneNumber,
    String? requesterName,
    String? requesterPhoneNumber,
    String? municipalityZone,
    String? address,
    String? projectUsageType,
    int? floorCount,
    String? testType,
    double? occupiedArea,
    double? contractPrice,
    int? ownerId,
    List<Sample>? samples,
    List<Transaction>? transactions,
    double? totalIncome,
    double? totalExpense,
    double? balance,
  }) {
    return Project(
      id: id ?? this.id,
      createdAt: createdAt ?? this.createdAt,
      fileNumber: fileNumber ?? this.fileNumber,
      projectName: projectName ?? this.projectName,
      clientName: clientName ?? this.clientName,
      clientPhoneNumber: clientPhoneNumber ?? this.clientPhoneNumber,
      supervisorName: supervisorName ?? this.supervisorName,
      supervisorPhoneNumber: supervisorPhoneNumber ?? this.supervisorPhoneNumber,
      requesterName: requesterName ?? this.requesterName,
      requesterPhoneNumber: requesterPhoneNumber ?? this.requesterPhoneNumber,
      municipalityZone: municipalityZone ?? this.municipalityZone,
      address: address ?? this.address,
      projectUsageType: projectUsageType ?? this.projectUsageType,
      floorCount: floorCount ?? this.floorCount,
      testType: testType ?? this.testType,
      occupiedArea: occupiedArea ?? this.occupiedArea,
      contractPrice: contractPrice ?? this.contractPrice,
      ownerId: ownerId ?? this.ownerId,
      samples: samples ?? this.samples,
      transactions: transactions ?? this.transactions,
      totalIncome: totalIncome ?? this.totalIncome,
      totalExpense: totalExpense ?? this.totalExpense,
      balance: balance ?? this.balance,
    );
  }

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] as int,
      createdAt: DateTime.parse(json['created_at'] as String),
      fileNumber: json['file_number'] as String,
      projectName: json['project_name'] as String,
      clientName: json['client_name'] as String,
      clientPhoneNumber: json['client_phone_number'] as String,
      supervisorName: json['supervisor_name'] as String,
      supervisorPhoneNumber: json['supervisor_phone_number'] as String,
      requesterName: json['requester_name'] as String,
      requesterPhoneNumber: json['requester_phone_number'] as String,
      municipalityZone: json['municipality_zone'] as String,
      address: json['address'] as String,
      projectUsageType: json['project_usage_type'] as String,
      floorCount: json['floor_count'] as int,
      testType: json['test_type'] ?? '',
      occupiedArea: (json['occupied_area'] as num?)?.toDouble() ?? 0.0,
      contractPrice:
          double.tryParse(json['contract_price'].toString()) ?? 0.0,
      ownerId: json['owner'] as int,
      samples: json['samples'] != null
          ? parseList(json['samples'], Sample.fromJson)
          : [],
      transactions: json['transactions'] != null
          ? parseList(json['transactions'], Transaction.fromJson)
          : [],
      totalIncome: (json['total_income'] as num?)?.toDouble() ?? 0.0,
      totalExpense: (json['total_expense'] as num?)?.toDouble() ?? 0.0,
      balance: (json['balance'] as num?)?.toDouble() ?? 0.0,
    );
  }

  get samplingVolume => null;
}


