// ------------------- User & Profile Models -------------------

import 'package:boton/models/allmodels.dart';
import 'package:boton/models/ticket_model.dart';
import 'package:flutter/material.dart';

@immutable
class LabProfile {
  final int id;
  final String labName;
  final String labPhoneNumber;
  final String labMobileNumber;
  final String labAddress;
  final String province;
  final String city;
  final String? telegramId;
  final String firstName;
  final String lastName;
  final String email;
  final int userId;

  const LabProfile({
    required this.id,
    required this.labName,
    required this.labPhoneNumber,
    required this.labMobileNumber,
    required this.labAddress,
    required this.province,
    required this.city,
    this.telegramId,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.userId,
  });
  LabProfile copyWith({
    int? id,
    String? labName,
    String? labPhoneNumber,
    String? labMobileNumber,
    String? labAddress,
    String? province,
    String? city,
    String? telegramId,
    String? firstName,
    String? lastName,
    String? email,
    int? userId,
  }) {
    return LabProfile(
      id: id ?? this.id,
      labName: labName ?? this.labName,
      labPhoneNumber: labPhoneNumber ?? this.labPhoneNumber,
      labMobileNumber: labMobileNumber ?? this.labMobileNumber,
      labAddress: labAddress ?? this.labAddress,
      province: province ?? this.province,
      city: city ?? this.city,
      telegramId: telegramId ?? this.telegramId,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      userId: userId ?? this.userId,
    );
  }

  factory LabProfile.fromJson(Map<String, dynamic> json) {
    return LabProfile(
      id: json['id'] as int,
      labName: json['lab_name'] as String,
      labPhoneNumber: json['lab_phone_number'] as String,
      labMobileNumber: json['lab_mobile_number'] as String,
      labAddress: json['lab_address'] as String,
      province: json['province'] as String,
      city: json['city'] as String,
      telegramId: json['telegram_id'] as String?,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      email: json['email'] as String,
      userId: json['user'] as int,
    );
  }
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lab_name': labName,
      'lab_phone_number': labPhoneNumber,
      'lab_mobile_number': labMobileNumber,
      'lab_address': labAddress,
      'province': province,
      'city': city,
      'telegram_id': telegramId,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'user': userId,
    };
  }
}

@immutable
class User {
  final int id;
  final String username;
  final String firstName;
  final String lastName;
  final String email;
  final LabProfile labProfile;
  final List<Ticket> tickets;

  const User({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.labProfile,
    required this.tickets,
  });
  User copyWith({
    int? id,
    String? username,
    String? firstName,
    String? lastName,
    String? email,
    LabProfile? labProfile,
    List<Ticket>? tickets,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      labProfile: labProfile ?? this.labProfile,
      tickets: tickets ?? this.tickets,
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      username: json['username'] as String,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      email: json['email'] as String,
      labProfile: LabProfile.fromJson(
        json['lab_profile'] as Map<String, dynamic>,
      ),
      tickets: parseList(json['tickets'], Ticket.fromJson),
    );
  }
}
