import '../models/location_model.dart';

class LocationService {
  // لیست کامل استان‌های ایران (برای نمونه چند مورد آورده شده)
  final List<Province> _provinces = [
    Province(id: 1, name: 'تهران'),
    Province(id: 2, name: 'اصفهان'),
    Province(id: 3, name: 'آذربایجان شرقی'),
    Province(id: 4, name: 'فارس'),
  ];

  // لیست کامل شهرهای ایران (برای نمونه چند مورد آورده شده)
  final List<City> _cities = [
    // شهرهای تهران
    City(id: 101, name: 'تهران', provinceId: 1),
    City(id: 102, name: 'شهریار', provinceId: 1),
    City(id: 103, name: 'قدس', provinceId: 1),
    City(id: 104, name: 'اسلام‌شهر', provinceId: 1),

    // شهرهای اصفهان
    City(id: 201, name: 'اصفهان', provinceId: 2),
    City(id: 202, name: 'کاشان', provinceId: 2),
    City(id: 203, name: 'خمینی‌شهر', provinceId: 2),
    City(id: 204, name: 'نجف‌آباد', provinceId: 2),

    // شهرهای آذربایجان شرقی
    City(id: 301, name: 'تبریز', provinceId: 3),
    City(id: 302, name: 'مراغه', provinceId: 3),
    City(id: 303, name: 'مرند', provinceId: 3),

    // شهرهای فارس
    City(id: 401, name: 'شیراز', provinceId: 4),
    City(id: 402, name: 'کازرون', provinceId: 4),
    City(id: 403, name: 'مرودشت', provinceId: 4),
  ];

  /// لیستی از تمام استان‌ها را برمی‌گرداند
  Future<List<Province>> getProvinces() async {
    // در یک اپ واقعی، اینجا یک درخواست به API زده می‌شود
    await Future.delayed(
      const Duration(milliseconds: 500),
    ); // شبیه‌سازی تاخیر شبکه
    return _provinces;
  }

  /// شهرهای مربوط به یک استان خاص را برمی‌گرداند
  Future<List<City>> getCitiesForProvince(int provinceId) async {
    // در یک اپ واقعی، اینجا هم یک درخواست API با آیدی استان زده می‌شود
    await Future.delayed(
      const Duration(milliseconds: 500),
    ); // شبیه‌سازی تاخیر شبکه
    return _cities.where((city) => city.provinceId == provinceId).toList();
  }
}
