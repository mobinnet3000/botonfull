import 'package:boton/controllers/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

// ✅✅ اطمینان حاصل کنید که مسیرهای زیر در پروژه شما صحیح است ✅✅
import 'package:boton/models/project_model.dart';

class DetailsTab extends StatefulWidget {
  final Project project;
  const DetailsTab({super.key, required this.project});

  @override
  State<DetailsTab> createState() => _DetailsTabState();
}

class _DetailsTabState extends State<DetailsTab> {
  bool _isEditing = false;
  final _formKey = GlobalKey<FormState>();

  // پیدا کردن کنترلر اصلی برنامه با GetX
  final ProjectController _projectController = Get.find();

  // ----- کنترلرها برای فیلدهای فرم ویرایش -----
  late TextEditingController _projectNameController;
  late TextEditingController _fileNumberController;
  late TextEditingController _clientNameController;
  late TextEditingController _clientPhoneController;
  late TextEditingController _supervisorNameController;
  late TextEditingController _supervisorPhoneController;
  late TextEditingController _requesterNameController;
  late TextEditingController _requesterPhoneController;
  late TextEditingController _addressController;
  late TextEditingController _municipalityZoneController;
  late TextEditingController _floorCountController;
  late TextEditingController _occupiedAreaController;
  late TextEditingController _projectUsageTypeController;
  late TextEditingController _testTypeController;

  @override
  void initState() {
    super.initState();
    // مقداردهی اولیه تمام کنترلرها با داده‌های پروژه
    _initializeControllers(widget.project);
  }

  // این متد تضمین می‌کند که اگر کاربر بین پروژه‌های مختلف جابجا شد،
  // اطلاعات نمایش داده شده همیشه به‌روز باشد.
  @override
  void didUpdateWidget(covariant DetailsTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.project.id != oldWidget.project.id) {
      _initializeControllers(widget.project);
    }
  }

  void _initializeControllers(Project project) {
    _projectNameController = TextEditingController(text: project.projectName);
    _fileNumberController = TextEditingController(text: project.fileNumber);
    _clientNameController = TextEditingController(text: project.clientName);
    _clientPhoneController = TextEditingController(
      text: project.clientPhoneNumber,
    );
    _supervisorNameController = TextEditingController(
      text: project.supervisorName,
    );
    _supervisorPhoneController = TextEditingController(
      text: project.supervisorPhoneNumber,
    );
    _requesterNameController = TextEditingController(
      text: project.requesterName,
    );
    _requesterPhoneController = TextEditingController(
      text: project.requesterPhoneNumber,
    );
    _addressController = TextEditingController(text: project.address);
    _municipalityZoneController = TextEditingController(
      text: project.municipalityZone,
    );
    _floorCountController = TextEditingController(
      text: project.floorCount.toString(),
    );
    _occupiedAreaController = TextEditingController(
      text: project.occupiedArea.toString(),
    );
    _projectUsageTypeController = TextEditingController(
      text: project.projectUsageType,
    );
    _testTypeController = TextEditingController(text: project.testType);

  }

  @override
  void dispose() {
    // آزادسازی تمام کنترلرها برای جلوگیری از نشت حافظه
    _projectNameController.dispose();
    _fileNumberController.dispose();
    _clientNameController.dispose();
    _clientPhoneController.dispose();
    _supervisorNameController.dispose();
    _supervisorPhoneController.dispose();
    _requesterNameController.dispose();
    _requesterPhoneController.dispose();
    _addressController.dispose();
    _municipalityZoneController.dispose();
    _floorCountController.dispose();
    _occupiedAreaController.dispose();
    _projectUsageTypeController.dispose();
    _testTypeController.dispose();
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
          'لطفاً تمام فیلدها را به درستی پر کنید.',
          backgroundColor: Colors.orange.shade800,
          colorText: Colors.white,
        );
        return;
      }

      // ساخت آبجکت پروژه با مقادیر جدید از فرم با استفاده از copyWith
      final updatedProject = widget.project.copyWith(
        projectName: _projectNameController.text,
        fileNumber: _fileNumberController.text,
        clientName: _clientNameController.text,
        clientPhoneNumber: _clientPhoneController.text,
        supervisorName: _supervisorNameController.text,
        supervisorPhoneNumber: _supervisorPhoneController.text,
        requesterName: _requesterNameController.text,
        requesterPhoneNumber: _requesterPhoneController.text,
        address: _addressController.text,
        municipalityZone: _municipalityZoneController.text,
        floorCount:
            int.tryParse(_floorCountController.text) ??
            widget.project.floorCount,
        occupiedArea:
            double.tryParse(_occupiedAreaController.text) ??
            widget.project.occupiedArea,
        projectUsageType: _projectUsageTypeController.text,
        testType: _testTypeController.text,
      );

      // فراخوانی متد کنترلر برای آپدیت پروژه در سرور و state برنامه
      final success = await _projectController.updateProject(updatedProject);

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
        // دکمه بر اساس وضعیت isUpdatingProject در کنترلر تغییر می‌کند
        final isLoading = _projectController.isUpdatingProject.value;
        return FloatingActionButton.extended(
          onPressed: isLoading ? null : _toggleEditMode,
          label: Text(
            isLoading
                ? 'در حال ذخیره...'
                : (_isEditing ? 'ذخیره تغییرات' : 'ویرایش جزئیات'),
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
    // برای خوانایی بهتر، از یک پروژه به‌روز شده در state استفاده می‌کنیم
    // این تضمین می‌کند که پس از ویرایش، اطلاعات جدید نمایش داده شود.
    final project =
        _projectController.projects.firstWhereOrNull(
          (p) => p.id == widget.project.id,
        ) ??
        widget.project;

    return Center(
      child: Container(
        constraints: BoxConstraints(maxWidth: 1000),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          key: const ValueKey('display'),
          children: [
            _buildDisplayCard(
              title: 'اطلاعات پایه',
              children: [
                _buildDisplayRow(
                  'نام پروژه:',
                  project.projectName,
                  Icons.business_center_outlined,
                ),
                _buildDisplayRow(
                  'شماره پرونده:',
                  project.fileNumber,
                  Icons.article_outlined,
                ),
                _buildDisplayRow(
                  'آدرس:',
                  project.address,
                  Icons.location_on_outlined,
                ),
                _buildDisplayRow(
                  'منطقه شهرداری:',
                  project.municipalityZone,
                  Icons.map_outlined,
                ),
                _buildDisplayRow(
                  'کاربری پروژه:',
                  project.projectUsageType,
                  Icons.category_outlined,
                ),
              ],
            ),
            _buildDisplayCard(
              title: 'اشخاص پروژه',
              children: [
                _buildDisplayRow(
                  'نام کارفرما:',
                  project.clientName,
                  Icons.person_outline,
                ),
                _buildDisplayRow(
                  'تماس کارفرما:',
                  project.clientPhoneNumber,
                  Icons.phone_outlined,
                ),
                _buildDisplayRow(
                  'نام ناظر:',
                  project.supervisorName,
                  Icons.engineering_outlined,
                ),
                _buildDisplayRow(
                  'تماس ناظر:',
                  project.supervisorPhoneNumber,
                  Icons.phone_outlined,
                ),
                _buildDisplayRow(
                  'نام درخواست دهنده:',
                  project.requesterName,
                  Icons.person_pin_outlined,
                ),
                _buildDisplayRow(
                  'تماس درخواست دهنده:',
                  project.requesterPhoneNumber,
                  Icons.phone_outlined,
                ),
              ],
            ),
            _buildDisplayCard(
              title: 'جزئیات فنی',
              children: [
                _buildDisplayRow(
                  'تعداد طبقات:',
                  project.floorCount.toString(),
                  Icons.layers_outlined,
                ),
                _buildDisplayRow(
                  'سطح زیربنا (متر مربع):',
                  project.occupiedArea.toString(),
                  Icons.square_foot_outlined,
                ),
                _buildDisplayRow('نوع آزمون:',
                  project.testType, 
                  Icons.science_outlined
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ==================== ویجت‌های حالت ویرایش ====================
  Widget _buildEditForm() {
    return Form(
      key: _formKey,
      child: Column(
        key: const ValueKey('edit'),
        children: [
          _buildSectionCard(
            title: 'اطلاعات پایه پروژه',
            children: [
              _buildTextFormField(
                controller: _projectNameController,
                label: 'نام پروژه',
                icon: Icons.business_center_outlined,
              ),
              _buildTextFormField(
                controller: _fileNumberController,
                label: 'شماره پرونده',
                icon: Icons.article_outlined,
              ),
              _buildTextFormField(
                controller: _addressController,
                label: 'آدرس پروژه',
                icon: Icons.location_on_outlined,
              ),
              _buildTextFormField(
                controller: _municipalityZoneController,
                label: 'منطقه شهرداری',
                icon: Icons.map_outlined,
              ),
              _buildTextFormField(
                controller: _projectUsageTypeController,
                label: 'کاربری پروژه',
                icon: Icons.category_outlined,
              ),
            ],
          ),
          _buildSectionCard(
            title: 'اشخاص پروژه',
            children: [
              _buildTextFormField(
                controller: _clientNameController,
                label: 'نام کارفرما',
                icon: Icons.person_outline,
              ),
              _buildTextFormField(
                controller: _clientPhoneController,
                label: 'شماره تماس کارفرما',
                icon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
              _buildTextFormField(
                controller: _supervisorNameController,
                label: 'نام مهندس ناظر',
                icon: Icons.engineering_outlined,
              ),
              _buildTextFormField(
                controller: _supervisorPhoneController,
                label: 'شماره تماس ناظر',
                icon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
              _buildTextFormField(
                controller: _requesterNameController,
                label: 'نام درخواست‌کننده',
                icon: Icons.person_pin_outlined,
              ),
              _buildTextFormField(
                controller: _requesterPhoneController,
                label: 'شماره تماس درخواست‌کننده',
                icon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
            ],
          ),
          _buildSectionCard(
            title: 'جزئیات فنی',
            children: [
              _buildTextFormField(
                controller: _floorCountController,
                label: 'تعداد طبقات',
                icon: Icons.layers_outlined,
                keyboardType: TextInputType.number,
              ),
              _buildTextFormField(
                controller: _occupiedAreaController,
                label: 'سطح زیربنا (متر مربع)',
                icon: Icons.square_foot_outlined,
                keyboardType: TextInputType.number,
              ),
              _buildDropdownFormField(
                controller: _testTypeController,
                label: 'نوع آزمون',
                icon: Icons.science_outlined,
                items: const ['مقاومت فشاری', 'چکش اشمیت'],
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

  Widget _buildDropdownFormField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required List<String> items,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: DropdownButtonFormField<String>(
        value: controller.text.isEmpty ? null : controller.text,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          border: const OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(12)),
          ),
        ),
        items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
        onChanged: (value) => controller.text = value ?? '',
        validator: (value) {
          if (value == null || value.isEmpty) return '$label را انتخاب کنید';
          return null;
        },
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
          if (value == null || value.isEmpty) {
            return '$label نمی‌تواند خالی باشد.';
          }
          return null;
        },
      ),
    );
  }
}
