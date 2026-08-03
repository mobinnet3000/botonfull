import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:boton/controllers/ticket_controller.dart';
import 'package:boton/models/ticket_model.dart';

class TicketDetailsPage extends StatefulWidget {
  final int ticketId;
  const TicketDetailsPage({super.key, required this.ticketId});

  @override
  State<TicketDetailsPage> createState() => _TicketDetailsPageState();
}

class _TicketDetailsPageState extends State<TicketDetailsPage> {
  final TicketController controller = Get.find<TicketController>();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (_messageController.text.trim().isNotEmpty) {
      controller.addtikmas(
        mas: {
          "ticket": widget.ticketId,
          "message": _messageController.text.trim(),
        },
      );
      _messageController.clear();
      Get.back();
      controller.fetchTickets();

      // اسکرول به پایین لیست پس از ارسال پیام
      Future.delayed(const Duration(milliseconds: 300), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Obx(() {
          final ticket = controller.tickets.firstWhere(
            (t) => t.id == widget.ticketId,
            // orElse: () => null,
          );
          return Text(ticket?.title ?? 'جزئیات تیکت');
        }),
      ),
      body: Column(
        children: [
          Expanded(
            child: Obx(() {
              final ticket = controller.tickets.firstWhere(
                (t) => t.id == widget.ticketId,
                // orElse: () => null,
              );

              if (ticket == null) {
                return const Center(child: Text("تیکت یافت نشد."));
              }
              if (ticket.messages.isEmpty) {
                return const Center(
                  child: Text("هنوز پیامی برای این تیکت ثبت نشده است."),
                );
              }

              return ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16.0),
                itemCount: ticket.messages.length,
                itemBuilder: (context, index) {
                  final message = ticket.messages[index];
                  // فرض می‌کنیم پیام‌های با یوزرآیدی ۱ متعلق به ادمین است
                  final isMyMessage = message.userId != 1;
                  return MessageBubble(
                    message: message,
                    isMyMessage: isMyMessage,
                  );
                },
              );
            }),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        boxShadow: [
          BoxShadow(
            offset: const Offset(0, -2),
            blurRadius: 5,
            color: Colors.black.withOpacity(0.05),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _messageController,
                decoration: const InputDecoration(
                  hintText: 'پیام خود را بنویسید...',
                  border: InputBorder.none,
                  filled: true,
                  fillColor: Colors.black12,
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 16.0,
                    vertical: 10.0,
                  ),
                ),
                onSubmitted: (value) => _sendMessage(),
              ),
            ),
            const SizedBox(width: 8),
            Obx(() {
              return IconButton(
                icon:
                    controller.isSubmitting.value
                        ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                        : const Icon(Icons.send),
                onPressed: controller.isSubmitting.value ? null : _sendMessage,
                color: Theme.of(context).primaryColor,
              );
            }),
          ],
        ),
      ),
    );
  }
}

// ویجت حباب برای نمایش هر پیام
class MessageBubble extends StatelessWidget {
  final TicketMessage message;
  final bool isMyMessage;

  const MessageBubble({
    super.key,
    required this.message,
    required this.isMyMessage,
  });

  @override
  Widget build(BuildContext context) {
    final alignment =
        isMyMessage ? CrossAxisAlignment.end : CrossAxisAlignment.start;
    final color =
        isMyMessage ? Theme.of(context).primaryColor : Colors.grey.shade300;
    final textColor = isMyMessage ? Colors.white : Colors.black87;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4.0),
      child: Column(
        crossAxisAlignment: alignment,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 14.0,
              vertical: 10.0,
            ),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(16).copyWith(
                bottomRight:
                    isMyMessage
                        ? const Radius.circular(2)
                        : const Radius.circular(16),
                bottomLeft:
                    !isMyMessage
                        ? const Radius.circular(2)
                        : const Radius.circular(16),
              ),
            ),
            child: Text(message.message, style: TextStyle(color: textColor)),
          ),
          const SizedBox(height: 4),
          Text(
            '${message.username} - ${DateFormat('kk:mm').format(message.createdAt)}',
            style: const TextStyle(fontSize: 11, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
