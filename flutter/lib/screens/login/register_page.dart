// lib/pages/register_page.dart

import 'package:boton/screens/login/components/gradient_background.dart';
import 'package:boton/components/responsivcont.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:boton/components/my_button.dart';
import 'package:boton/models/location_model.dart';
import 'package:boton/services/location_service.dart';
// کامپوننت‌های سفارشی که برای استایل‌دهی لازم داریم

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final LocationService _locationService = LocationService();

  List<Province> _provinces = [];
  List<City> _citiesForSelectedProvince = [];
  Province? _selectedProvince;
  City? _selectedCity;
  bool _isLoadingProvinces = true;
  bool _isLoadingCities = false;

  @override
  void initState() {
    super.initState();
    _loadProvinces();
  }

  Future<void> _loadProvinces() async {
    // ... (منطق این توابع بدون تغییر باقی می‌ماند)
    setState(() => _isLoadingProvinces = true);
    _provinces = await _locationService.getProvinces();
    setState(() => _isLoadingProvinces = false);
  }

  Future<void> _loadCities(int provinceId) {
    // ... (منطق این توابع بدون تغییر باقی می‌ماند)
    setState(() {
      _isLoadingCities = true;
      _citiesForSelectedProvince = [];
    });
    return _locationService.getCitiesForProvince(provinceId).then((cities) {
      setState(() {
        _citiesForSelectedProvince = cities;
        _isLoadingCities = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.primaryColor;

    return Scaffold(
      // ۱. این دو خط برای شفاف کردن AppBar و نمایش گرادیان در پس‌زمینه آن است
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('ایجاد حساب کاربری'),
        centerTitle: true,
        // این موارد AppBar را شفاف و بدون سایه می‌کنند
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: BackButton(color: Colors.white),
      ),
      // ۲. استفاده از ویجت پس‌زمینه گرادیانی
      body: GradientBackground(
        // ۳. استفاده از ویجت واکنش‌گرا برای محدود کردن عرض فرم
        child: RespCont(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 100.0), // پدینگ برای فاصله از بالا
              child:
                  // ۴. قرار دادن کل فرم داخل یک Card با استایل شیشه‌ای مشابه صفحه لاگین
                  Card(
                elevation: 15,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                shadowColor: Colors.black.withOpacity(0.6),
                color: Colors.white.withOpacity(0.95),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // ۵. استایل‌دهی به عنوان اصلی فرم
                        Text(
                          'ثبت نام آزمایشگاه',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                            color: primaryColor,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'اطلاعات خود را برای ایجاد حساب وارد کنید',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.titleSmall?.copyWith(
                            color: Colors.grey.shade700,
                          ),
                        ),
                        const SizedBox(height: 30),

                        _buildTextFormField(label: 'نام'),
                        _buildTextFormField(label: 'نام خانوادگی'),
                        _buildTextFormField(label: 'نام آزمایشگاه'),
                        _buildProvinceDropdown(),
                        const SizedBox(height: 16),
                        _buildCityDropdown(),
                        const SizedBox(height: 16),
                        _buildTextFormField(label: 'شماره تماس (نام کاربری)'),
                        _buildTextFormField(label: 'رمز عبور', obscureText: true),
                        _buildTextFormField(label: 'کد معرف (اختیاری)', isRequired: false),
                        const SizedBox(height: 40),

                        // ۶. استفاده از دکمه‌های سفارشی با رنگ‌های درخواستی
                        MyButton(
                          ontap: () {
                            if (_formKey.currentState!.validate()) {
                              print('فرم معتبر است. در حال ثبت نام...');
                              // TODO: اضافه کردن منطق ثبت نام و نمایش اسنک‌بار
                            }
                          },
                          matn: 'ثبت نام',
                          buttonColor: Colors.green.shade600,
                          textColor: Colors.white,
                        ),
                        const SizedBox(height: 16),
                        // دکمه بازگشت به صفحه لاگین
                        MyButton(
                          ontap: () => Get.back(),
                          matn: 'بازگشت به فرم ورود',
                          buttonColor: Colors.blue.shade700,
                          textColor: Colors.white,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // توابع کمکی بدون تغییر باقی می‌مانند
  Widget _buildTextFormField({ required String label, bool obscureText = false, bool isRequired = true,}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        obscureText: obscureText,
        textAlign: TextAlign.right,
        // استایل فیلدها به طور خودکار از Theme برنامه خوانده می‌شود
        decoration: InputDecoration(
          labelText: label,
        ),
        validator: (value) {
          if (isRequired && (value == null || value.isEmpty)) {
            return 'لطفاً $label را وارد کنید';
          }
          return null;
        },
      ),
    );
  }

  Widget _buildProvinceDropdown() {
    return DropdownButtonFormField<Province>(
      decoration: const InputDecoration(
        labelText: 'استان',
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      isExpanded: true,
      hint: _isLoadingProvinces ? const Text('در حال بارگذاری...') : const Text('- انتخاب کنید -'),
      value: _selectedProvince,
      items: _provinces.map((p) => DropdownMenuItem(value: p, child: Text(p.name))).toList(),
      onChanged: (province) {
        if (province != null) {
          setState(() {
            _selectedProvince = province;
            _selectedCity = null;
          });
          _loadCities(province.id);
        }
      },
      validator: (v) => v == null ? 'لطفاً استان را انتخاب کنید' : null,
    );
  }

  Widget _buildCityDropdown() {
    return DropdownButtonFormField<City>(
      decoration: const InputDecoration(
        labelText: 'شهر',
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      isExpanded: true,
      hint: _selectedProvince == null ? const Text('ابتدا استان را انتخاب کنید') : _isLoadingCities ? const Text('در حال بارگذاری...') : const Text('- انتخاب کنید -'),
      value: _selectedCity,
      items: _citiesForSelectedProvince.map((c) => DropdownMenuItem(value: c, child: Text(c.name))).toList(),
      onChanged: _selectedProvince == null ? null : (city) => setState(() => _selectedCity = city),
      validator: (v) => v == null ? 'لطفاً شهر را انتخاب کنید' : null,
    );
  }
}
