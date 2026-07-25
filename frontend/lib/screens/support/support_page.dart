import 'package:boton/screens/support/ticket_details_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:boton/utils/snackbar_helper.dart'; // ❗️مسیر را اصلاح کنید
import 'package:boton/controllers/ticket_controller.dart'; // ✅ کنترلر جدید را ایمپورت کنید
import 'package:boton/models/ticket_model.dart'; // ✅ مدل جدید را ایمپورت کنید

// Enum برای اولویت
enum Priority { normal, important, urgent }

extension PriorityExtension on Priority {
  String get name {
    switch (this) {
      case Priority.normal:
        return 'عادی';
      case Priority.important:
        return 'مهم';
      case Priority.urgent:
        return 'فوری';
    }
  }

  String get toApiValue {
    switch (this) {
      case Priority.normal:
        return 'low';
      case Priority.important:
        return 'medium';
      case Priority.urgent:
        return 'high';
    }
  }
}

// ویجت اصلی صفحه پشتیبانی
class SupportPage extends StatelessWidget {
  const SupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    Get.put(TicketController());

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          elevation: 1,
          title: TabBar(
            onTap: (value) => Get.find<TicketController>().fetchTickets(),
            tabs: [Tab(text: 'ارسال تیکت جدید'), Tab(text: 'لیست تیکت‌های من')],
          ),
        ),
        body: const TabBarView(children: [SubmitTicketView(), MyTicketsView()]),
      ),
    );
  }
}

// ویجت فرم ارسال تیکت (بدون تغییرات عمده)
class SubmitTicketView extends StatefulWidget {
  const SubmitTicketView({super.key});

  @override
  State<SubmitTicketView> createState() => _SubmitTicketViewState();
}

class _SubmitTicketViewState extends State<SubmitTicketView> {
  final TicketController ticketController = Get.find<TicketController>();
  final _formKey = GlobalKey<FormState>();
  String? _selectedDepartment;
  Priority _selectedPriority = Priority.normal;
  final _titleController = TextEditingController();
  final _messageController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitTicket() async {
    if (_formKey.currentState!.validate()) {
      final success = await ticketController.addtik(
        title: _titleController.text,
        priority: _selectedPriority.toApiValue,
        message: _messageController.text,
      );

      if (success) {
        setState(() {
          _formKey.currentState!.reset();
          _titleController.clear();
          _messageController.clear();
          _selectedDepartment = null;
          _selectedPriority = Priority.normal;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // UI این بخش بدون تغییر باقی می‌ماند
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ... (تمام فیلدهای فرم شما اینجا قرار می‌گیرند)
            Text(
              'ارسال تیکت جدید',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'لطفاً مشکل خود را با جزئیات کامل شرح دهید تا سریع‌تر به آن رسیدگی شود.',
            ),
            const SizedBox(height: 32),
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'عنوان تیکت'),
              validator:
                  (value) =>
                      (value == null || value.isEmpty)
                          ? 'لطفاً عنوان تیکت را وارد کنید'
                          : null,
            ),
            const SizedBox(height: 20),
            DropdownButtonFormField<String>(
              value: _selectedDepartment,
              decoration: const InputDecoration(labelText: 'بخش مربوطه'),
              hint: const Text('یک بخش را انتخاب کنید'),
              items:
                  ['پشتیبانی فنی', 'امور مالی', 'پیشنهادات و انتقادات']
                      .map(
                        (label) =>
                            DropdownMenuItem(value: label, child: Text(label)),
                      )
                      .toList(),
              onChanged: (value) => setState(() => _selectedDepartment = value),
              validator:
                  (value) =>
                      value == null ? 'لطفاً بخش مربوطه را انتخاب کنید' : null,
            ),
            const SizedBox(height: 24),
            const Text(
              'اولویت:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            SegmentedButton<Priority>(
              segments:
                  Priority.values.map((priority) {
                    return ButtonSegment<Priority>(
                      value: priority,
                      label: Text(priority.name),
                    );
                  }).toList(),
              selected: {_selectedPriority},
              onSelectionChanged: (newSelection) {
                setState(() => _selectedPriority = newSelection.first);
              },
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _messageController,
              decoration: const InputDecoration(
                labelText: 'متن پیام',
                alignLabelWithHint: true,
                hintText: 'مشکل خود را به طور کامل شرح دهید...',
              ),
              maxLines: 5,
              validator:
                  (value) =>
                      (value == null || value.isEmpty)
                          ? 'لطفاً متن پیام را وارد کنید'
                          : null,
            ),
            // const SizedBox(height: 24),
            // OutlinedButton.icon(
            //   onPressed: () {
            //     /* TODO: Implement file picking */
            //   },
            //   icon: const Icon(Icons.attach_file),
            //   label: const Text('پیوست کردن فایل'),
            // ),
            const SizedBox(height: 40),
            Obx(() {
              return ElevatedButton(
                onPressed:
                    ticketController.isSubmitting.value ? null : _submitTicket,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                ),
                child:
                    ticketController.isSubmitting.value
                        ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(color: Colors.white),
                        )
                        : const Text('ارسال تیکت'),
              );
            }),
          ],
        ),
      ),
    );
  }
}

// ✅✅ ویجت نمایش لیست تیکت‌ها (کاملاً بازنویسی شده) ✅✅
class MyTicketsView extends StatelessWidget {
  const MyTicketsView({super.key});

  @override
  Widget build(BuildContext context) {
    final TicketController controller = Get.find<TicketController>();
    controller.fetchTickets();

    return Obx(() {
      if (controller.isFetchingList.value && controller.tickets.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      if (controller.tickets.isEmpty) {
        return const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.inbox_outlined, size: 60, color: Colors.grey),
              SizedBox(height: 16),
              Text(
                'هیچ تیکتی برای نمایش وجود ندارد.',
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
            ],
          ),
        );
      }

      return RefreshIndicator(
        onRefresh: () => controller.fetchTickets(),
        child: ListView.builder(
          padding: const EdgeInsets.all(8.0),
          itemCount: controller.tickets.length,
          itemBuilder: (ctx, index) {
            final ticket = controller.tickets[index];
            return TicketCard(ticket: ticket);
          },
        ),
      );
    });
  }
}

// یک ویجت کارت برای نمایش زیباتر هر تیکت
class TicketCard extends StatelessWidget {
  final Ticket ticket;
  const TicketCard({super.key, required this.ticket});

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'open':
        return Colors.green;
      case 'closed':
        return Colors.red;
      case 'pending':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat(
      'yyyy/MM/dd – kk:mm',
    ).format(ticket.createdAt);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 6.0),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          // TODO: ناوبری به صفحه جزئیات تیکت
          Get.to(TicketDetailsPage(ticketId: ticket.id));
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      ticket.title,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(ticket.status).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      ticket.statusDisplay,
                      style: TextStyle(
                        color: _getStatusColor(ticket.status),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'اولویت: ${ticket.priorityDisplay}',
                    style: const TextStyle(fontSize: 13, color: Colors.black54),
                  ),
                  Text(
                    formattedDate,
                    style: const TextStyle(fontSize: 13, color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
