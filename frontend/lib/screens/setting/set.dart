import 'package:boton/controllers/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

// ❗️❗️ مسیرهای زیر را مطابق با ساختار پروژه خودتان تنظیم کنید ❗️❗️
import 'package:boton/models/user_model.dart'; // مسیری که LabProfile در آن است

/// این ویجت برای نمایش و ویرایش جزئیات پروفایل آزمایشگاه (LabProfile) طراحی شده است.
/// این ویجت فرض می‌کند که شما یک `ProfileController` دارید که از طریق GetX قابل دسترسی است
/// و این کنترلر یک آبجکت `User` را به صورت reactive مدیریت می‌کند.
class ProfileDetailsTab extends StatefulWidget {
  /// پروفایل اولیه برای نمایش در ویجت.
  /// این داده معمولاً از صفحه قبلی به این ویجت پاس داده می‌شود.
  final LabProfile labProfile;

  const ProfileDetailsTab({super.key, required this.labProfile});

  @override
  State<ProfileDetailsTab> createState() => _ProfileDetailsTabState();
}

class _ProfileDetailsTabState extends State<ProfileDetailsTab> {
  bool _isEditing = false;
  final _formKey = GlobalKey<FormState>();

  // پیدا کردن کنترلر پروفایل از طریق GetX.
  // مطمئن شوید که این کنترلر قبل از استفاده از این ویجت، ثبت (injected) شده باشد.
  final ProjectController _projectController = Get.find();

  // ----- کنترلرها برای فیلدهای فرم ویرایش پروفایل -----
  late TextEditingController _labNameController;
  late TextEditingController _labPhoneNumberController;
  late TextEditingController _labMobileNumberController;
  late TextEditingController _labAddressController;
  late TextEditingController _provinceController;
  late TextEditingController _cityController;
  late TextEditingController _telegramIdController;
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;

  @override
  void initState() {
    super.initState();
    // مقداردهی اولیه تمام کنترلرها با داده‌های اولیه‌ای که به ویجت پاس داده شده.
    _initializeControllers(widget.labProfile);
  }

  // اگر ویجت والد آپدیت شود و یک پروفایل جدید به این ویجت بدهد،
  // کنترلرها نیز با اطلاعات جدید به‌روز می‌شوند.
  @override
  void didUpdateWidget(covariant ProfileDetailsTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.labProfile.id != oldWidget.labProfile.id) {
      _initializeControllers(widget.labProfile);
    }
  }

  void _initializeControllers(LabProfile profile) {
    _labNameController = TextEditingController(text: profile.labName);
    _labPhoneNumberController = TextEditingController(
      text: profile.labPhoneNumber,
    );
    _labMobileNumberController = TextEditingController(
      text: profile.labMobileNumber,
    );
    _labAddressController = TextEditingController(text: profile.labAddress);
    _provinceController = TextEditingController(text: profile.province);
    _cityController = TextEditingController(text: profile.city);
    _telegramIdController = TextEditingController(
      text: profile.telegramId ?? '',
    );
    _firstNameController = TextEditingController(text: profile.firstName);
    _lastNameController = TextEditingController(text: profile.lastName);
    _emailController = TextEditingController(text: profile.email);
  }

  @override
  void dispose() {
    // آزادسازی تمام کنترلرها برای جلوگیری از نشت حافظه
    _labNameController.dispose();
    _labPhoneNumberController.dispose();
    _labMobileNumberController.dispose();
    _labAddressController.dispose();
    _provinceController.dispose();
    _cityController.dispose();
    _telegramIdController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  /// متد اصلی برای مدیریت حالت ویرایش و ذخیره
  void _toggleEditMode() async {
    // اگر در حالت ویرایش هستیم، باید تغییرات را ذخیره کنیم
    if (_isEditing) {
      // اگر فرم معتبر نیست، یک پیام خطا نمایش بده و خارج شو
      if (!_formKey.currentState!.validate()) {
        Get.snackbar(
          'خطا',
          'لطفاً تمام فیلدهای الزامی را به درستی پر کنید.',
          backgroundColor: Colors.orange.shade800,
          colorText: Colors.white,
        );
        return;
      }

      // ساخت آبجکت پروفایل با مقادیر جدید از فرم با استفاده از copyWith
      final updatedProfile = widget.labProfile.copyWith(
        labName: _labNameController.text,
        labPhoneNumber: _labPhoneNumberController.text,
        labMobileNumber: _labMobileNumberController.text,
        labAddress: _labAddressController.text,
        province: _provinceController.text,
        city: _cityController.text,
        telegramId:
            _telegramIdController.text.isNotEmpty
                ? _telegramIdController.text
                : null,
        firstName: _firstNameController.text,
        lastName: _lastNameController.text,
        email: _emailController.text,
      );

      // فراخوانی متد کنترلر برای آپدیت پروفایل در سرور و state برنامه
      // ❗️ فرض شده نام متد در کنترلر شما updateLabProfile است
      final success = await _projectController.updateLabProfile(updatedProfile);

      // فقط اگر عملیات در سرور موفق بود، از حالت ویرایش خارج می‌شویم
      if (success && mounted) {
        setState(() {
          _isEditing = false;
        });
      }
    } else {
      // در غیر این صورت، فقط وارد حالت ویرایش می‌شویم
      setState(() {
        _isEditing = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: Obx(() {
        // ❗️ فرض شده نام متغیر لودینگ در کنترلر شما isUpdatingProfile است
        final isLoading = _projectController.isUpdatingProfile.value;
        return FloatingActionButton.extended(
          onPressed: isLoading ? null : _toggleEditMode,
          label: Text(
            isLoading
                ? 'در حال ذخیره...'
                : (_isEditing ? 'ذخیره تغییرات' : 'ویرایش پروفایل'),
          ),
          icon:
              isLoading
                  ? Container(
                    width: 24,
                    height: 24,
                    padding: const EdgeInsets.all(2.0),
                    child: const CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 3,
                    ),
                  )
                  : Icon(
                    _isEditing ? Icons.save_alt_outlined : Icons.edit_outlined,
                  ),
        );
      }),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(
          16,
          16,
          16,
          80,
        ), // فضا برای دکمه شناور
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          transitionBuilder: (child, animation) {
            return FadeTransition(opacity: animation, child: child);
          },
          // بر اساس وضعیت _isEditing، فرم یا اطلاعات نمایش داده می‌شود
          child: _isEditing ? _buildEditForm() : _buildDisplayInfo(),
        ),
      ),
    );
  }

  // ==================== ویجت‌های حالت نمایش ====================
  Widget _buildDisplayInfo() {
    // برای نمایش اطلاعات به‌روز، مستقیماً از state کنترلر می‌خوانیم.
    // ✅ این بخش اصلاح شد تا از مدل User شما استفاده کند.
    return Obx(() {
      final profile = _projectController.user.value!.labProfile;
      return Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: Column(
            key: const ValueKey('display_profile'),
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _buildDisplayCard(
                title: 'اطلاعات آزمایشگاه',
                children: [
                  _buildDisplayRow(
                    'نام آزمایشگاه:',
                    profile.labName,
                    Icons.science_outlined,
                  ),
                  _buildDisplayRow(
                    'تلفن ثابت:',
                    profile.labPhoneNumber,
                    Icons.phone_in_talk_outlined,
                  ),
                  _buildDisplayRow(
                    'آدرس:',
                    profile.labAddress,
                    Icons.location_on_outlined,
                  ),
                  _buildDisplayRow(
                    'استان:',
                    profile.province,
                    Icons.map_outlined,
                  ),
                  _buildDisplayRow(
                    'شهر:',
                    profile.city,
                    Icons.location_city_outlined,
                  ),
                ],
              ),
              _buildDisplayCard(
                title: 'اطلاعات کاربر',
                children: [
                  _buildDisplayRow(
                    'نام:',
                    profile.firstName,
                    Icons.person_outline,
                  ),
                  _buildDisplayRow(
                    'نام خانوادگی:',
                    profile.lastName,
                    Icons.person_outline,
                  ),
                  _buildDisplayRow(
                    'موبایل:',
                    profile.labMobileNumber,
                    Icons.phone_android_outlined,
                  ),
                  _buildDisplayRow(
                    'ایمیل:',
                    profile.email,
                    Icons.email_outlined,
                  ),
                  _buildDisplayRow(
                    'آی‌دی تلگرام:',
                    profile.telegramId ?? 'ثبت نشده',
                    Icons.telegram,
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    });
  }

  // ==================== ویجت‌های حالت ویرایش ====================
  Widget _buildEditForm() {
    return Form(
      key: _formKey,
      child: Column(
        key: const ValueKey('edit_profile'),
        children: [
          _buildSectionCard(
            title: 'اطلاعات آزمایشگاه',
            children: [
              _buildTextFormField(
                controller: _labNameController,
                label: 'نام آزمایشگاه',
                icon: Icons.science_outlined,
              ),
              _buildTextFormField(
                controller: _labPhoneNumberController,
                label: 'تلفن ثابت',
                icon: Icons.phone_in_talk_outlined,
                keyboardType: TextInputType.phone,
              ),
              _buildTextFormField(
                controller: _labAddressController,
                label: 'آدرس آزمایشگاه',
                icon: Icons.location_on_outlined,
              ),
              _buildTextFormField(
                controller: _provinceController,
                label: 'استان',
                icon: Icons.map_outlined,
              ),
              _buildTextFormField(
                controller: _cityController,
                label: 'شهر',
                icon: Icons.location_city_outlined,
              ),
            ],
          ),
          _buildSectionCard(
            title: 'اطلاعات کاربر',
            children: [
              _buildTextFormField(
                controller: _firstNameController,
                label: 'نام',
                icon: Icons.person_outline,
              ),
              _buildTextFormField(
                controller: _lastNameController,
                label: 'نام خانوادگی',
                icon: Icons.person_outline,
              ),
              _buildTextFormField(
                controller: _labMobileNumberController,
                label: 'شماره موبایل',
                icon: Icons.phone_android_outlined,
                keyboardType: TextInputType.phone,
              ),
              _buildTextFormField(
                controller: _emailController,
                label: 'ایمیل',
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              _buildTextFormField(
                controller: _telegramIdController,
                label: 'آی‌دی تلگرام (اختیاری)',
                icon: Icons.telegram,
                isRequired: false,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==================== ویجت‌های کمکی (Helper Widgets) ====================

  Widget _buildDisplayCard({
    required String title,
    required List<Widget> children,
  }) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const Divider(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildDisplayRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: Theme.of(context).primaryColor, size: 20),
          const SizedBox(width: 12),
          Text(
            '$label ',
            style: const TextStyle(color: Colors.black54, fontSize: 15),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    List<Widget> children = const [],
  }) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const Divider(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildTextFormField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    bool isRequired = true,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          border: const OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(12)),
          ),
        ),
        validator: (value) {
          if (isRequired && (value == null || value.isEmpty)) {
            return '$label نمی‌تواند خالی باشد.';
          }
          if (keyboardType == TextInputType.emailAddress &&
              value != null &&
              value.isNotEmpty &&
              !GetUtils.isEmail(value)) {
            return 'فرمت ایمیل صحیح نیست.';
          }
          return null;
        },
      ),
    );
  }
}
