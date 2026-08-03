import 'package:boton/controllers/base_controller.dart';
import 'package:boton/models/ProjectForCreation_model.dart'; // ✅ مسیر صحیح مدل شما
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

class AddProjectScreen extends StatefulWidget {
  const AddProjectScreen({super.key});

  @override
  State<AddProjectScreen> createState() => _AddProjectScreenState();
}

class _AddProjectScreenState extends State<AddProjectScreen> {
  final _formKey = GlobalKey<FormState>();
  final ProjectController _projectController = Get.find();

  // استفاده از یک Map برای مدیریت آسان تمام کنترلرها
  final Map<String, TextEditingController> _controllers = {
    'fileNumber': TextEditingController(),
    'projectName': TextEditingController(),
    'clientName': TextEditingController(),
    'clientPhoneNumber': TextEditingController(),
    'supervisorName': TextEditingController(),
    'supervisorPhoneNumber': TextEditingController(),
    'requesterName': TextEditingController(),
    'requesterPhoneNumber': TextEditingController(),
    'municipalityZone': TextEditingController(),
    'address': TextEditingController(),
    'projectUsageType': TextEditingController(),
    'floorCount': TextEditingController(),
    'occupiedArea': TextEditingController(),
    'contractPrice': TextEditingController(),
    'testType': TextEditingController(),

  };

  // تعریف FocusNode برای هر فیلد
  final Map<String, FocusNode> _focusNodes = {
    'fileNumber': FocusNode(),
    'projectName': FocusNode(),
    'clientName': FocusNode(),
    'clientPhoneNumber': FocusNode(),
    'supervisorName': FocusNode(),
    'supervisorPhoneNumber': FocusNode(),
    'requesterName': FocusNode(),
    'requesterPhoneNumber': FocusNode(),
    'municipalityZone': FocusNode(),
    'address': FocusNode(),
    'projectUsageType': FocusNode(),
    'floorCount': FocusNode(),
    'cementType': FocusNode(),
    'occupiedArea': FocusNode(),
    'moldType': FocusNode(),
    'contractPrice': FocusNode(),
  };

  @override
  void dispose() {
    // پاکسازی کنترلرها و فوکوس نودها برای جلوگیری از نشت حافظه
    _controllers.forEach((_, controller) => controller.dispose());
    _focusNodes.forEach((_, focusNode) => focusNode.dispose());
    super.dispose();
  }

  /// متد ارسال فرم که حالا هوشمندتر شده است
  void _submitForm() async {
    // اگر فرم معتبر نیست، یک پیام خطا نمایش بده و خارج شو
    if (!_formKey.currentState!.validate()) {
      Get.snackbar(
        'خطا',
        'لطفاً تمام فیلدهای الزامی را پر کنید.',
        backgroundColor: Colors.orange.shade800,
        colorText: Colors.white,
      );
      return;
    }

    // ساخت آبجکت پروژه از داده‌های فرم
  final newProjectData = ProjectForCreation(
    fileNumber: _controllers['fileNumber']!.text,
    projectName: _controllers['projectName']!.text,
    clientName: _controllers['clientName']!.text,
    clientPhoneNumber: _controllers['clientPhoneNumber']!.text,
    supervisorName: _controllers['supervisorName']!.text,
    supervisorPhoneNumber: _controllers['supervisorPhoneNumber']!.text,
    requesterName: _controllers['requesterName']!.text,
    requesterPhoneNumber: _controllers['requesterPhoneNumber']!.text,
    municipalityZone: _controllers['municipalityZone']!.text,
    address: _controllers['address']!.text,
    projectUsageType: _controllers['projectUsageType']!.text,
    floorCount: int.tryParse(_controllers['floorCount']!.text) ?? 0,
    testType: _controllers['testType']!.text, // ✅ جایگزین cementType و moldType
    occupiedArea: double.tryParse(_controllers['occupiedArea']!.text) ?? 0.0,
    contractPrice: double.tryParse(
      _controllers['contractPrice']!.text.replaceAll(',', ''),
    ) ?? 0.0,
  );


    // منتظر نتیجه از کنترلر بمان
    final bool success = await _projectController.addProject(newProjectData);

    // اگر عملیات موفق بود و صفحه هنوز در حال نمایش بود
    if (success && mounted) {
      // ۱. تمام فیلدهای فرم را پاک کن
      _controllers.forEach((key, controller) {
        controller.clear();
      });
      // ۲. به تب اول (ایندکس ۰) برگرد
      DefaultTabController.of(context).animateTo(0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Form(
        key: _formKey,
        // فعالسازی پیمایش با کلید Tab
        child: FocusTraversalGroup(
          child: ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              _buildSectionCard(
                title: 'اطلاعات اصلی پروژه',
                icon: Icons.foundation,
                children: [
                  _CustomTextFormField(
                    controller: _controllers['projectName']!,
                    focusNode: _focusNodes['projectName']!,
                    nextFocusNode: _focusNodes['fileNumber']!,
                    labelText: 'نام پروژه',
                    icon: Icons.business,
                  ),
                  _CustomTextFormField(
                    controller: _controllers['fileNumber']!,
                    focusNode: _focusNodes['fileNumber']!,
                    nextFocusNode: _focusNodes['clientName']!,
                    labelText: 'شماره پرونده',
                    icon: Icons.folder_copy,
                  ),
                ],
              ),
              _buildSectionCard(
                title: 'اطلاعات کارفرما و درخواست‌کننده',
                icon: Icons.person_pin,
                children: [
                  _CustomTextFormField(
                    controller: _controllers['clientName']!,
                    focusNode: _focusNodes['clientName']!,
                    nextFocusNode: _focusNodes['clientPhoneNumber']!,
                    labelText: 'نام کارفرما',
                    icon: Icons.person,
                  ),
                  _CustomTextFormField(
                    controller: _controllers['clientPhoneNumber']!,
                    focusNode: _focusNodes['clientPhoneNumber']!,
                    nextFocusNode: _focusNodes['requesterName']!,
                    labelText: 'شماره تماس کارفرما',
                    icon: Icons.phone,
                    keyboardType: TextInputType.phone,
                  ),
                  _CustomTextFormField(
                    controller: _controllers['requesterName']!,
                    focusNode: _focusNodes['requesterName']!,
                    nextFocusNode: _focusNodes['requesterPhoneNumber']!,
                    labelText: 'نام درخواست‌کننده',
                    icon: Icons.person_search,
                  ),
                  _CustomTextFormField(
                    controller: _controllers['requesterPhoneNumber']!,
                    focusNode: _focusNodes['requesterPhoneNumber']!,
                    nextFocusNode: _focusNodes['supervisorName']!,
                    labelText: 'شماره تماس درخواست‌کننده',
                    icon: Icons.phone_android,
                    keyboardType: TextInputType.phone,
                  ),
                ],
              ),
              _buildSectionCard(
                title: 'اطلاعات ناظر',
                icon: Icons.engineering,
                children: [
                  _CustomTextFormField(
                    controller: _controllers['supervisorName']!,
                    focusNode: _focusNodes['supervisorName']!,
                    nextFocusNode: _focusNodes['supervisorPhoneNumber']!,
                    labelText: 'نام ناظر',
                    icon: Icons.person_4,
                  ),
                  _CustomTextFormField(
                    controller: _controllers['supervisorPhoneNumber']!,
                    focusNode: _focusNodes['supervisorPhoneNumber']!,
                    nextFocusNode: _focusNodes['address']!,
                    labelText: 'شماره تماس ناظر',
                    icon: Icons.phone,
                    keyboardType: TextInputType.phone,
                  ),
                ],
              ),
              _buildSectionCard(
                title: 'مشخصات فنی و مکانی',
                icon: Icons.location_city,
                children: [
                  _CustomTextFormField(
                    controller: _controllers['address']!,
                    focusNode: _focusNodes['address']!,
                    nextFocusNode: _focusNodes['municipalityZone']!,
                    labelText: 'آدرس پروژه',
                    icon: Icons.location_on,
                  ),
                  _CustomTextFormField(
                    controller: _controllers['municipalityZone']!,
                    focusNode: _focusNodes['municipalityZone']!,
                    nextFocusNode: _focusNodes['projectUsageType']!,
                    labelText: 'منطقه شهرداری',
                    icon: Icons.map,
                  ),
                  _CustomTextFormField(
                    controller: _controllers['projectUsageType']!,
                    focusNode: _focusNodes['projectUsageType']!,
                    nextFocusNode: _focusNodes['floorCount']!,
                    labelText: 'نوع کاربری',
                    icon: Icons.home_work,
                  ),
                  _CustomTextFormField(
                    controller: _controllers['floorCount']!,
                    focusNode: _focusNodes['floorCount']!,
                    nextFocusNode: _focusNodes['occupiedArea']!,
                    labelText: 'تعداد طبقات',
                    icon: Icons.layers,
                    keyboardType: TextInputType.number,
                  ),
                  _CustomTextFormField(
                    controller: _controllers['occupiedArea']!,
                    focusNode: _focusNodes['occupiedArea']!,
                    nextFocusNode: _focusNodes['cementType']!,
                    labelText: 'سطح اشغال (متر مربع)',
                    icon: Icons.square_foot,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                  ),
                ],
              ),
              _buildSectionCard(
                title: 'مشخصات قرارداد و بتن',
                icon: Icons.receipt_long,
                children: [
                Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: DropdownButtonFormField<String>(
                    value: _controllers['testType']!.text.isEmpty
                        ? null
                        : _controllers['testType']!.text,
                    decoration: InputDecoration(
                      labelText: 'نوع آزمایش',
                      prefixIcon: const Icon(Icons.science_outlined),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: Colors.grey.shade50,
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: 'compressive',
                        child: Text('مقاومت فشاری'),
                      ),
                      DropdownMenuItem(
                        value: 'schmidt',
                        child: Text('چکش اشمیت'),
                      ),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        _controllers['testType']!.text = value;
                      }
                    },
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'نوع آزمایش را انتخاب کنید';
                      }
                      return null;
                    },
                  ),
                ),

                  _CustomTextFormField(
                    controller: _controllers['contractPrice']!,
                    focusNode: _focusNodes['contractPrice']!,
                    onEditingComplete:
                        _submitForm, // ✅ این آخرین فیلد است و فرم را ثبت می‌کند
                    labelText: 'مبلغ قرارداد (ریال)',
                    icon: Icons.monetization_on,
                    keyboardType: TextInputType.number,
                    isCurrency: true,
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Obx(() {
                return ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed:
                      _projectController.isAddingProject.value
                          ? null
                          : _submitForm,
                  icon:
                      _projectController.isAddingProject.value
                          ? const SizedBox.shrink()
                          : const Icon(Icons.save),
                  label:
                      _projectController.isAddingProject.value
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                            'ذخیره و ایجاد پروژه',
                            style: TextStyle(fontSize: 16),
                          ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 20),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
        side: BorderSide(color: theme.dividerColor),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: theme.primaryColor, size: 24),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(height: 24, thickness: 1),
            ...children,
          ],
        ),
      ),
    );
  }
}

/// ویجت سفارشی برای فیلدهای متنی که حالا منطق فوکوس را هم دارد
class _CustomTextFormField extends StatelessWidget {
  final TextEditingController controller;
  final String labelText;
  final IconData icon;
  final TextInputType? keyboardType;
  final bool isCurrency;
  final FocusNode focusNode;
  final FocusNode? nextFocusNode;
  final VoidCallback? onEditingComplete;

  const _CustomTextFormField({
    required this.controller,
    required this.labelText,
    required this.icon,
    required this.focusNode,
    this.nextFocusNode,
    this.onEditingComplete,
    this.keyboardType,
    this.isCurrency = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        controller: controller,
        focusNode: focusNode,
        decoration: InputDecoration(
          labelText: labelText,
          prefixIcon: Icon(icon),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
          fillColor: Colors.grey.shade50,
        ),
        keyboardType: keyboardType,
        validator: (value) {
          if (value == null || value.isEmpty) {
            return '$labelText نمی‌تواند خالی باشد';
          }
          return null;
        },
        inputFormatters:
            isCurrency
                ? [CurrencyInputFormatter()]
                : (keyboardType == TextInputType.phone ||
                        keyboardType == TextInputType.number
                    ? [FilteringTextInputFormatter.digitsOnly]
                    : []),
        textInputAction:
            nextFocusNode != null ? TextInputAction.next : TextInputAction.done,
        onFieldSubmitted: (_) {
          if (nextFocusNode != null) {
            FocusScope.of(context).requestFocus(nextFocusNode);
          } else if (onEditingComplete != null) {
            onEditingComplete!();
          }
        },
      ),
    );
  }
}

/// فرمت‌دهنده سفارشی برای جدا کردن سه رقم سه رقم اعداد
class CurrencyInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue.copyWith(text: '');
    }
    String newText = newValue.text.replaceAll(',', '');
    if (int.tryParse(newText) == null) {
      return oldValue;
    }
    final formatter = NumberFormat('#,###');
    String formattedText = formatter.format(int.parse(newText));
    return TextEditingValue(
      text: formattedText,
      selection: TextSelection.collapsed(offset: formattedText.length),
    );
  }
}
