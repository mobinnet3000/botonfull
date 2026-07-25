class Province {
  final int id;
  final String name;

  Province({required this.id, required this.name});
}

class City {
  final int id;
  final String name;
  final int provinceId; // کلید خارجی برای اتصال به استان

  City({required this.id, required this.name, required this.provinceId});
}
