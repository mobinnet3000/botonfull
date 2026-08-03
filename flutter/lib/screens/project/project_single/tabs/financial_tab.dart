// ignore_for_file: use_build_context_synchronously

import 'package:boton/controllers/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart' as intl;
import 'package:intl/date_symbol_data_local.dart';

// مسیر ایمپورت‌های زیر را مطابق با ساختار پروژه خودتان اصلاح کنید
import 'package:boton/models/project_model.dart';
import 'package:boton/models/transaction_model.dart';
import 'package:boton/screens/loading/loading.dart';

class FinancialTab extends StatefulWidget {
  final int projectId;

  const FinancialTab({super.key, required this.projectId});

  @override
  State<FinancialTab> createState() => _FinancialTabState();
}

class _FinancialTabState extends State<FinancialTab> {
  final ProjectController projectController = Get.find<ProjectController>();

  @override
  void initState() {
    super.initState();
    initializeDateFormatting('fa_IR', null);
  }

  /// متد نمایش دیالوگ برای افزودن تراکنش جدید با لودینگ و مدیریت خطا
  void _showAddTransactionDialog(BuildContext context, bool isIncome) {
    final amountController = TextEditingController();
    final descriptionController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        // متغیر لودینگ در اینجا تعریف می‌شود تا با هر بار بازسازی از بین نرود
        bool isLoading = false;
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              title: Text(
                isIncome ? 'افزودن واریزی جدید' : 'افزودن هزینه جدید',
              ),
              content: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      controller: amountController,
                      keyboardType: TextInputType.number,
                      textDirection: TextDirection.ltr,
                      decoration: const InputDecoration(
                        labelText: 'مبلغ (تومان)',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null ||
                            value.isEmpty ||
                            double.tryParse(value) == null) {
                          return 'لطفاً یک مبلغ معتبر وارد کنید.';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'توضیحات',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'توضیحات نمی‌تواند خالی باشد.';
                        }
                        return null;
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isLoading ? null : () => Navigator.of(ctx).pop(),
                  child: const Text('لغو'),
                ),
                ElevatedButton(
                  onPressed:
                      isLoading
                          ? null
                          : () async {
                            if (formKey.currentState!.validate()) {
                              setState(() => isLoading = true);

                              final transactionData = {
                                'project': widget.projectId,
                                'type': isIncome ? "income" : "expense",
                                'description': descriptionController.text,
                                'amount': amountController.text,
                                'date': DateTime.now().toIso8601String(),
                              };

                              try {
                                await projectController.addtrans(
                                  transactionData,
                                  widget.projectId,
                                );

                                Navigator.of(ctx).pop();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('تراکنش با موفقیت ثبت شد.'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'خطا در ثبت اطلاعات! لطفاً دوباره تلاش کنید.',
                                    ),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              } finally {
                                // این اطمینان می‌دهد که در صورت خطا، لودینگ متوقف شود
                                if (mounted) {
                                  setState(() => isLoading = false);
                                }
                              }
                            }
                          },
                  child:
                      isLoading
                          ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 3,
                              color: Colors.white,
                            ),
                          )
                          : const Text('افزودن'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final numberFormat = intl.NumberFormat("#,###", "fa_IR");

    return Scaffold(
      backgroundColor: Colors.grey[100], // بهبود رنگ پس‌زمینه
      body: Obx(() {
        if (projectController.isLoading.value) {
          return const Loadingg();
        }

        final project = projectController.projects.firstWhere(
          (p) => p.id == widget.projectId,
        );

        if (project.id == 0) {
          return const Center(child: Text("پروژه یافت نشد."));
        }

        final totalIncome = project.transactions
            .where((t) => t.type == TransactionType.income)
            .fold<double>(0, (sum, item) => sum + item.amount);
        final totalExpense = project.transactions
            .where((t) => t.type == TransactionType.expense)
            .fold<double>(0, (sum, item) => sum + item.amount);
        final balance = totalIncome - totalExpense;
        final paymentProgress =
            (project.contractPrice > 0)
                ? (totalIncome / project.contractPrice).clamp(0.0, 1.0)
                : 0.0;

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildFinancialSummaryCard(
                context,
                project,
                numberFormat,
                totalIncome,
                totalExpense,
                balance,
                paymentProgress,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: _buildActionButton(context, TransactionType.income),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildActionButton(context, TransactionType.expense),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Text(
                  "تاریخچه تراکنش‌ها",
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 8),
              if (project.transactions.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 32.0),
                    child: Column(
                      children: [
                        Image.asset(
                          'assets/images/empty_state.png', // مسیر تصویر را اصلاح کنید
                          height: 120,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          "هیچ تراکنشی ثبت نشده است.",
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ListView.builder(
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  itemCount: project.transactions.length,
                  itemBuilder: (context, index) {
                    final transaction =
                        project.transactions.reversed.toList()[index];
                    return _buildTransactionListItem(transaction, numberFormat);
                  },
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildActionButton(BuildContext context, TransactionType type) {
    bool isIncome = type == TransactionType.income;
    return ElevatedButton.icon(
      onPressed: () {
        _showAddTransactionDialog(context, isIncome);
      },
      icon: Icon(
        isIncome ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
      ),
      label: Text(isIncome ? 'افزودن واریزی' : 'افزودن هزینه'),
      style: ElevatedButton.styleFrom(
        backgroundColor:
            isIncome ? const Color(0xFF2E7D32) : const Color(0xFFC62828),
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 2,
        textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
    );
  }

  Widget _buildFinancialSummaryCard(
    BuildContext context,
    Project project,
    intl.NumberFormat numberFormat,
    double totalIncome,
    double totalExpense,
    double balance,
    double paymentProgress,
  ) {
    return Card(
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.blue.shade700, Colors.blue.shade900],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "خلاصه وضعیت مالی",
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "مبلغ کل قرارداد: ${numberFormat.format(project.contractPrice)} تومان",
                style: TextStyle(color: Colors.blue.shade100, fontSize: 16),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "میزان پرداخت",
                    style: TextStyle(color: Colors.blue.shade200),
                  ),
                  Text(
                    "${(paymentProgress * 100).toStringAsFixed(1)}%",
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: paymentProgress,
                minHeight: 8,
                borderRadius: BorderRadius.circular(4),
                backgroundColor: Colors.blue.shade700,
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16.0),
                child: Divider(color: Colors.white24),
              ),
              _buildSummaryRow(
                "کل واریزی:",
                "+ ${numberFormat.format(totalIncome)}",
                color: Colors.greenAccent.shade400,
              ),
              const SizedBox(height: 8),
              _buildSummaryRow(
                "کل برداشتی:",
                "- ${numberFormat.format(totalExpense)}",
                color: Colors.red.shade300,
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16.0),
                child: Divider(color: Colors.white24),
              ),
              _buildSummaryRow(
                "مانده حساب:",
                "${numberFormat.format(balance)} تومان",
                isBold: true,
                color: Colors.white,
                valueFontSize: 18,
              ),
              const SizedBox(height: 8),
              _buildSummaryRow(
                "مانده پروژه:",
                "${numberFormat.format(project.contractPrice - totalIncome)} تومان",
                isBold: true,
                color: Colors.white,
                valueFontSize: 18,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(
    String title,
    String value, {
    Color? color,
    bool isBold = false,
    double valueFontSize = 16,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 15,
            color: Colors.blue.shade100,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: valueFontSize,
            fontWeight: FontWeight.bold,
            color: color ?? Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionListItem(
    Transaction transaction,
    intl.NumberFormat numberFormat,
  ) {
    final isIncome = transaction.type == TransactionType.income;
    final color = isIncome ? const Color(0xFF2E7D32) : const Color(0xFFC62828);
    final icon =
        isIncome ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded;
    final formattedDate = intl.DateFormat(
      'y/MM/dd',
      'fa',
    ).format(transaction.date);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.15),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(
            vertical: 8,
            horizontal: 16,
          ),
          leading: CircleAvatar(
            backgroundColor: color.withOpacity(0.1),
            child: Icon(icon, color: color),
          ),
          title: Text(
            transaction.description,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4.0),
            child: Text(
              formattedDate,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
          trailing: Text(
            '${isIncome ? '+' : '-'} ${numberFormat.format(transaction.amount)}',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: color,
            ),
          ),
        ),
      ),
    );
  }
}
