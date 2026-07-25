enum TransactionType { income, expense }

class Transaction {
  final int id;
  final int projectId; // برای اتصال به پروژه
  final TransactionType type;
  final String description;
  final double amount;
  final DateTime date;

  Transaction({
    required this.id,
    required this.projectId,
    required this.type,
    required this.description,
    required this.amount,
    required this.date,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      projectId: json['project'],
      type:
          (json['type'] as String) == 'income'
              ? TransactionType.income
              : TransactionType.expense,
      description: json['description'],
      amount: double.tryParse(json['amount'] as String? ?? '0.0') ?? 0.0,
      date: DateTime.parse(json['date']),
    );
  }
}
