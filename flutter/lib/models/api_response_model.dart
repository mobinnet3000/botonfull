import 'user_model.dart';
import 'project_model.dart';

class ApiResponse {
  final User user;
  final List<Project> projects;

  ApiResponse({required this.user, required this.projects});

  factory ApiResponse.fromJson(Map<String, dynamic> json) {
    return ApiResponse(
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      projects:
          (json['projects'] as List<dynamic>)
              .map((p) => Project.fromJson(p as Map<String, dynamic>))
              .toList(),
    );
  }
}
