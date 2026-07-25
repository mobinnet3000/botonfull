// =============================================================
// 1. مدل TicketMessage (پیام‌های داخل یک تیکت)
// =============================================================
import 'package:flutter/material.dart';

@immutable
class TicketMessage {
  final int id;
  final int ticketId;
  final int userId;
  final String username;
  final String message;
  final DateTime createdAt;

  const TicketMessage({
    required this.id,
    required this.ticketId,
    required this.userId,
    required this.username,
    required this.message,
    required this.createdAt,
  });

  factory TicketMessage.fromJson(Map<String, dynamic> json) {
    return TicketMessage(
      id: json['id'] as int,
      ticketId: json['ticket'] as int,
      userId: json['user'] as int,
      username: json['username'] as String,
      message: json['message'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}

// =============================================================
// 2. مدل Ticket (به‌روز شده برای استفاده از TicketMessage)
// =============================================================
@immutable
class Ticket {
  final int id;
  final String title;
  final int userId;
  final String username;
  final String status;
  final String statusDisplay;
  final String priority;
  final String priorityDisplay;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<TicketMessage>
  messages; // ✅ تغییر: این فیلد حالا لیستی از TicketMessage است

  const Ticket({
    required this.id,
    required this.title,
    required this.userId,
    required this.username,
    required this.status,
    required this.statusDisplay,
    required this.priority,
    required this.priorityDisplay,
    required this.createdAt,
    required this.updatedAt,
    required this.messages,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    // تبدیل لیست پیام‌های JSON به لیستی از آبجکت‌های TicketMessage
    var messagesList =
        (json['messages'] as List<dynamic>)
            .map(
              (messageJson) =>
                  TicketMessage.fromJson(messageJson as Map<String, dynamic>),
            )
            .toList();

    return Ticket(
      id: json['id'] as int,
      title: json['title'] as String,
      userId: json['user'] as int,
      username: json['username'] as String,
      status: json['status'] as String,
      statusDisplay: json['status_display'] as String,
      priority: json['priority'] as String,
      priorityDisplay: json['priority_display'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      messages: messagesList, // ✅ استفاده از لیست تبدیل شده
    );
  }
}
