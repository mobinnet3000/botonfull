// Helper function to handle potential null values for lists in fromJson
List<T> parseList<T>(
  List<dynamic>? jsonList,
  T Function(Map<String, dynamic>) fromJson,
) {
  if (jsonList == null) {
    return [];
  }
  return jsonList
      .map((item) => fromJson(item as Map<String, dynamic>))
      .toList();
}

// ------------------- Sampling & Concrete Models -------------------
