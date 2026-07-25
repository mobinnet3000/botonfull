import 'package:boton/controllers/base_controller.dart';
import 'package:boton/models/user_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'dart:math';

// ✅ مسیرهای صحیح مدل‌ها و کنترلر خود را وارد کنید
import 'package:boton/controllers/project_controller.dart';

//======================================================================
// ویجت اصلی که Tab ها را مدیریت می‌کند
//======================================================================
class TabsScreenImproved extends StatelessWidget {
  const TabsScreenImproved({super.key});

  @override
  Widget build(BuildContext context) {
    // کنترلر اصلی برنامه را یک بار اینجا پیدا می‌کنیم
    final ProjectController controller = Get.find();

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              // TabBar سفارشی شما
              Container(
                margin: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 10.0,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.2),
                      spreadRadius: 1,
                      blurRadius: 5,
                    ),
                  ],
                ),
                child: const TabBar(
                  labelColor: Colors.teal,
                  indicatorColor: Colors.teal,
                  unselectedLabelColor: Colors.indigo,
                  tabs: [
                    Tab(icon: Icon(Icons.business_center), text: 'آزمایشگاه'),
                    Tab(icon: Icon(Icons.layers), text: 'بتن'),
                    Tab(
                      icon: Icon(Icons.notifications_active),
                      text: 'اطلاع رسانی',
                    ),
                  ],
                ),
              ),
              // محتوای تب‌ها
              Expanded(
                child: TabBarView(
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    // هر تب حالا یک ویجت مستقل و تمیز است
                    LaboratoryTab(controller: controller),
                    ConcreteTab(controller: controller),
                    NotificationTab(controller: controller),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

//======================================================================
// ✅ ویجت تب آزمایشگاه (بازنویسی شده و متصل به بک‌اند)
//======================================================================
class LaboratoryTab extends StatefulWidget {
  final ProjectController controller;
  const LaboratoryTab({super.key, required this.controller});

  @override
  State<LaboratoryTab> createState() => _LaboratoryTabState();
}

class _LaboratoryTabState extends State<LaboratoryTab> {
  // کنترلرها فقط در حالت ویرایش استفاده می‌شوند و در initState مقداردهی می‌شوند
  late TextEditingController _labNameController;
  late TextEditingController _officePhoneController;
  late TextEditingController _samplerPhoneController;
  late TextEditingController _landlineController;
  late TextEditingController _addressController;

  // وضعیت محلی برای مدیریت حالت نمایش یا ویرایش
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    // مقداردهی اولیه کنترلرها با داده‌های کنترلر اصلی
    _initializeControllers();
  }

  void _initializeControllers() {
    final profile = widget.controller.user.value?.labProfile;
    _labNameController = TextEditingController(text: profile?.labName ?? '');
    _officePhoneController = TextEditingController(
      text: profile?.labPhoneNumber ?? '',
    ); // فرض بر اینکه نام فیلد این است
    _samplerPhoneController = TextEditingController(
      text: profile?.labMobileNumber ?? '',
    );
    _landlineController = TextEditingController(
      text: profile?.province ?? '',
    ); // نام فیلد را مطابق مدل خود تغییر دهید
    _addressController = TextEditingController(text: profile?.labAddress ?? '');
  }

  @override
  void dispose() {
    // آزادسازی تمام کنترلرها
    _labNameController.dispose();
    _officePhoneController.dispose();
    _samplerPhoneController.dispose();
    _landlineController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  // متد برای ذخیره تغییرات
  void _onSaveChanges() async {
    final updatedData = {
      "lab_name": _labNameController.text,
      "lab_phone_number": _officePhoneController.text,
      "lab_mobile_number": _samplerPhoneController.text,
      "landline_number":
          _landlineController.text, // نام فیلد را مطابق API خود تغییر دهید
      "lab_address": _addressController.text,
      // سایر فیلدهای پروفایل مثل نام و ایمیل اگر نیاز به آپدیت دارند
      "first_name": widget.controller.user.value?.firstName,
      "last_name": widget.controller.user.value?.lastName,
      "email": widget.controller.user.value?.email,
    };

    // فراخوانی متد کنترلر برای آپدیت
    // final success = await widget.controller.updateLabProfile(updatedData);

    // فقط اگر عملیات موفق بود، از حالت ویرایش خارج شو
    // if (success && mounted) {
    // setState(() => _isEditing = false);
    // }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: Obx(
        () => FloatingActionButton.extended(
          onPressed:
              widget.controller.isUpdatingProfile.value
                  ? null // غیرفعال کردن دکمه هنگام لودینگ
                  : () =>
                      _isEditing
                          ? _onSaveChanges()
                          : setState(() => _isEditing = true),
          label: Text(_isEditing ? 'ذخیره' : 'ویرایش'),
          icon:
              widget.controller.isUpdatingProfile.value
                  ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                  : Icon(_isEditing ? Icons.save : Icons.edit),
        ),
      ),
      body: Obx(() {
        // به داده‌های کاربر در کنترلر گوش می‌دهیم
        final profile = widget.controller.user.value?.labProfile;

        if (widget.controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (profile == null) {
          return const Center(child: Text('اطلاعات پروفایل دریافت نشد.'));
        }

        // اگر در حالت ویرایش هستیم، فرم را نمایش بده
        if (_isEditing) {
          return _buildEditForm();
        }

        // در غیر این صورت، اطلاعات را نمایش بده
        return _buildDisplayInfo(profile);
      }),
    );
  }

  // ویجت برای نمایش اطلاعات (حالت فقط خواندنی)
  Widget _buildDisplayInfo(LabProfile profile) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              _buildDisplayRow(
                Icons.business,
                'نام آزمایشگاه',
                profile.labName,
              ),
              _buildDisplayRow(
                Icons.phone,
                'شماره تماس دفتر',
                profile.labPhoneNumber,
              ),
              _buildDisplayRow(
                Icons.phone_android,
                'شماره تماس نمونه گیر',
                profile.labMobileNumber,
              ),
              _buildDisplayRow(Icons.call, 'استان', profile.province),
              _buildDisplayRow(
                Icons.location_on,
                'آدرس',
                profile.labAddress,
                maxLines: 3,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ویجت برای فرم ویرایش
  Widget _buildEditForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              _buildTextField(
                _labNameController,
                'نام آزمایشگاه',
                Icons.business,
              ),
              _buildTextField(
                _officePhoneController,
                'شماره تماس دفتر',
                Icons.phone,
                keyboardType: TextInputType.phone,
              ),
              _buildTextField(
                _samplerPhoneController,
                'شماره تماس نمونه گیر',
                Icons.phone_android,
                keyboardType: TextInputType.phone,
              ),
              _buildTextField(
                _landlineController,
                'شماره تماس ثابت',
                Icons.call,
                keyboardType: TextInputType.phone,
              ),
              _buildTextField(
                _addressController,
                'آدرس آزمایشگاه',
                Icons.location_on,
                maxLines: 3,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

//======================================================================
// ویجت‌های کمکی
//======================================================================
Widget _buildTextField(
  TextEditingController controller,
  String label,
  IconData icon, {
  int maxLines = 1,
  TextInputType keyboardType = TextInputType.text,
}) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 8.0),
    child: TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
    ),
  );
}

Widget _buildDisplayRow(
  IconData icon,
  String label,
  String value, {
  int maxLines = 1,
}) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 10.0),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.grey.shade600),
        const SizedBox(width: 16),
        Text('$label:', style: TextStyle(color: Colors.grey.shade700)),
        const Spacer(),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            maxLines: maxLines,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
      ],
    ),
  );
}

//======================================================================
// ویجت‌های Placeholder برای تب‌های دیگر
//======================================================================
class ConcreteTab extends StatelessWidget {
  final ProjectController controller;
  const ConcreteTab({super.key, required this.controller});
  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('محتوای تب بتن در اینجا قرار می‌گیرد'));
  }
}

class NotificationTab extends StatelessWidget {
  final ProjectController controller;
  const NotificationTab({super.key, required this.controller});
  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('محتوای تب اطلاع‌رسانی در اینجا قرار می‌گیرد'),
    );
  }
}
