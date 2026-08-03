// // lib/controllers/financial_controller.dart

// import 'package:get/get.dart';
// import '../models/project_model.dart';
// import '../models/transaction_model.dart';
// // import '../services/api_service.dart'; // سرویسی برای ارسال درخواست به API

// class FinancialController extends GetxController {
//   final Project project;

//   var transactions = <Transaction>[].obs;
//   var transactionTypeToAdd = TransactionType.income.obs;

//   FinancialController(this.project);

//   @override
//   void onInit() {
//     super.onInit();
//     // داده‌های اولیه را از پروژه گرفته شده، بارگذاری می‌کنیم
//     transactions.value = project.transactions;
//   }

//   // متدهای محاسباتی شما (کاملا صحیح و بدون تغییر)
//   double get totalIncome => transactions
//       .where((tx) => tx.type == TransactionType.income)
//       .fold(0, (sum, item) => sum + item.amount);

//   double get totalExpense => transactions
//       .where((tx) => tx.type == TransactionType.expense)
//       .fold(0, (sum, item) => sum + item.amount);

//   double get balance => totalIncome - totalExpense;

//   double get paymentProgress =>
//       (project.contractPrice > 0) ? totalIncome / project.contractPrice : 0.0;

//   // ✅✅✅ این متد را به کنترلر خود اضافه کنید تا ارور برطرف شود ✅✅✅
//   /// متدی برای افزودن تراکنش جدید به لیست و آپدیت خودکار UI
//   // Future<void> addTransaction(Transaction newTransaction) async {
//   //   // در این بخش، شما باید درخواست را به API بک‌اند ارسال کنید تا تراکنش در دیتابیس ذخیره شود.
//   //   // بعد از دریافت پاسخ موفق از سرور، تراکنش را به لیست محلی اضافه می‌کنیم.

//   //   // مثال برای ارسال به API:
//   //   // try {
//   //   //   final createdTransaction = await api.createTransaction(newTransaction.toJson());
//   //   //   transactions.add(createdTransaction);
//   //   // } catch (e) {
//   //   //   // مدیریت خطا
//   //   // }

//   //   // برای تست فعلی، تراکنش را مستقیماً به لیست .obs اضافه می‌کنیم.
//   //   // همین یک خط باعث رفرش شدن خودکار UI می‌شود.
//   //   transactions.add(newTransaction);
//   // }
// }
