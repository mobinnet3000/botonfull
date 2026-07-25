import 'package:boton/models/ProjectForCreation_model.dart';
import 'package:boton/models/Sample_model.dart';
import 'package:boton/models/mold_model.dart';
import 'package:boton/models/project_model.dart';
import 'package:boton/models/sampling_serie_model.dart';
import 'package:boton/models/ticket_model.dart';
import 'package:boton/models/transaction_model.dart';
import 'package:boton/models/user_model.dart';
import 'package:dio/dio.dart';
import '../models/api_response_model.dart';

class ApiService {
  final Dio _dio;

  ApiService(this._dio);

  /// دریافت کل اطلاعات کاربر
  Future<ApiResponse> getFullUserData() async {
    try {
      final response = await _dio.get('/api/full-data/');
      if (response.statusCode == 200) {
        return ApiResponse.fromJson(response.data);
      } else {
        throw Exception('کد وضعیت نامعتبر: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching full data: $e');
      throw Exception('خطا در دریافت داده از سرور.');
    }
  }

  /// ایجاد پروژه جدید
  Future<Project> createProject(ProjectForCreation newProjectData) async {
    try {
      final response = await _dio.post(
        '/api/projects/',
        data: newProjectData.toJson(),
      );

      if (response.statusCode == 201) {
        return Project.fromJson(response.data);
      } else {
        throw Exception('ایجاد پروژه ناموفق بود: ${response.statusCode}');
      }
    } on DioException catch (e) {
      print('Dio Error creating project: ${e.response?.data ?? e.message}');
      throw Exception('خطا در برقراری ارتباط با سرور هنگام ایجاد پروژه.');
    }
  }

  /// بروزرسانی پروژه‌ی موجود
  Future<Project> updateProject(int projectId, Project projectToUpdate) async {
    try {
      // ✅ مدل اصلاح شده بر اساس ساختار جدید پروژه در بک‌اند
      final updateData = ProjectForCreation(
        fileNumber: projectToUpdate.fileNumber,
        projectName: projectToUpdate.projectName,
        clientName: projectToUpdate.clientName,
        clientPhoneNumber: projectToUpdate.clientPhoneNumber,
        supervisorName: projectToUpdate.supervisorName,
        supervisorPhoneNumber: projectToUpdate.supervisorPhoneNumber,
        requesterName: projectToUpdate.requesterName,
        requesterPhoneNumber: projectToUpdate.requesterPhoneNumber,
        municipalityZone: projectToUpdate.municipalityZone,
        address: projectToUpdate.address,
        projectUsageType: projectToUpdate.projectUsageType,
        floorCount: projectToUpdate.floorCount,
        testType: projectToUpdate.testType, // ✅ فیلد جدید اضافه‌شده به بک‌اند
        occupiedArea: projectToUpdate.occupiedArea,
        contractPrice: projectToUpdate.contractPrice,
      );

      final response = await _dio.put(
        '/api/projects/$projectId/',
        data: updateData.toJson(),
      );

      if (response.statusCode == 200) {
        return Project.fromJson(response.data);
      } else {
        throw Exception('بروزرسانی پروژه ناموفق بود: ${response.statusCode}');
      }
    } on DioException catch (e) {
      print('Error: ${e.response?.data}');
      throw Exception('خطا در بروزرسانی پروژه.');
    }
  }

  /// بروزرسانی پروفایل آزمایشگاه
  Future<LabProfile> updateLab(int profileId, LabProfile labToUpdate) async {
    try {
      final response = await _dio.put(
        '/api/profiles/$profileId/',
        data: labToUpdate.toJson(),
      );
      if (response.statusCode == 200) {
        return LabProfile.fromJson(response.data);
      } else {
        throw Exception('بروزرسانی پروفایل ناموفق بود.');
      }
    } on DioException catch (e) {
      print('Error updating LabProfile: ${e.response?.data}');
      throw Exception('خطا در بروزرسانی اطلاعات کاربر.');
    }
  }

  /// ایجاد نمونه جدید
  Future<Sample> createSample(Map<String, dynamic> sampleData) async {
    try {
      final response = await _dio.post('/api/samples/', data: sampleData);
      if (response.statusCode == 201) {
        return Sample.fromJson(response.data);
      } else {
        throw Exception('ایجاد نمونه ناموفق بود.');
      }
    } on DioException catch (e) {
      print('Error creating sample: ${e.response?.data}');
      throw Exception('خطا در ایجاد نمونه.');
    }
  }

  /// ساخت تیکت
  Future<Ticket> createtiket(Map<String, dynamic> tiketData) async {
    try {
      final response = await _dio.post('/api/tickets/', data: tiketData);
      if (response.statusCode == 201) {
        return Ticket.fromJson(response.data);
      } else {
        throw Exception('ایجاد تیکت ناموفق بود.');
      }
    } on DioException catch (e) {
      print('Error creating ticket: ${e.response?.data}');
      throw Exception('خطا در ساخت تیکت.');
    }
  }

  /// ارسال پیام داخل تیکت
  Future<TicketMessage> createtiketmas(Map<String, dynamic> tiketmasData) async {
    try {
      final response =
          await _dio.post('/api/ticket-messages/', data: tiketmasData);
      if (response.statusCode == 201) {
        return TicketMessage.fromJson(response.data);
      } else {
        throw Exception('خطا در ایجاد پیام.');
      }
    } on DioException catch (e) {
      print('Error creating ticket message: ${e.response?.data}');
      throw Exception('خطا در ارتباط با سرور هنگام پیام‌دهی.');
    }
  }

  /// افزودن تراکنش مالی
  Future<Transaction> createTrans(Map<String, dynamic> transData) async {
    try {
      final response = await _dio.post('/api/transactions/', data: transData);
      if (response.statusCode == 201) {
        return Transaction.fromJson(response.data);
      } else {
        throw Exception('ایجاد تراکنش ناموفق بود.');
      }
    } on DioException catch (e) {
      print('Error creating transaction: ${e.response?.data}');
      throw Exception('خطا در ثبت تراکنش.');
    }
  }

  /// بروزرسانی قالب (Mold)
  Future<Mold> updateMold(int moldId, Map<String, dynamic> data) async {
    try {
      final response = await _dio.patch('/api/molds/$moldId/', data: data);
      return Mold.fromJson(response.data);
    } on DioException catch (e) {
      print('Error updating mold: ${e.response?.data}');
      throw Exception('خطا در بروزرسانی قالب.');
    }
  }

  /// ایجاد سری نمونه جدید (Sampling Series)
  Future<SamplingSerie> createSerie(Map<String, dynamic> serieData) async {
    try {
      final response = await _dio.post('/api/series/', data: serieData);
      if (response.statusCode == 201) {
        return SamplingSerie.fromJson(response.data);
      } else {
        throw Exception('ایجاد سری ناموفق بود.');
      }
    } on DioException catch (e) {
      print('Error creating series: ${e.response?.data}');
      throw Exception('خطا در برقراری ارتباط با سرور هنگام ایجاد سری.');
    }
  }
}

class DioClient {
  static const String _manualAuthToken =
      '1a9a3c2b359a18bdb1ea2a32bb0b3e4dc28128b9';

  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: 'http://127.0.0.1:8000', // به بک‌اند DRF فعلیت متصل می‌شود
      connectTimeout: const Duration(seconds: 25),
      receiveTimeout: const Duration(seconds: 25),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token $_manualAuthToken',
        'Accept': '*/*',
      },
    ),
  )..interceptors.add(
      LogInterceptor(
        request: true,
        requestHeader: true,
        requestBody: true,
        responseHeader: false,
        responseBody: true,
        error: true,
      ),
    );

  static Dio get instance => _dio;
}
