// // lib/pages/dashboard/widgets/sortable_list_header.dart
// import 'package:flutter/material.dart';

// class SortableListHeader extends StatelessWidget {
//   final int sortColumnIndex;
//   final bool isSortAscending;
//   final Function(int) onSort;

//   const SortableListHeader({
//     super.key,
//     required this.sortColumnIndex,
//     required this.isSortAscending,
//     required this.onSort,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return Padding(
//       padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
//       child: Row(
//         children: [
//           _buildSortableHeaderItem(context, 'نام پروژه', 0),
//           _buildSortableHeaderItem(context, 'مهندس ناظر', 1),
//           _buildSortableHeaderItem(context, 'تاریخ', 2),
//         ],
//       ),
//     );
//   }

//   Widget _buildSortableHeaderItem(BuildContext context, String title, int columnIndex) {
//     final bool isActive = sortColumnIndex == columnIndex;
//     return Expanded(
//       child: InkWell(
//         onTap: () => onSort(columnIndex),
//         child: Row(
//           children: [
//             Text(
//               title,
//               style: TextStyle(
//                 fontWeight: FontWeight.bold,
//                 color: isActive ? Theme.of(context).primaryColor : Colors.grey.shade600,
//               ),
//             ),
//             const SizedBox(width: 4),
//             if (isActive)
//               Icon(
//                 isSortAscending ? Icons.arrow_upward : Icons.arrow_downward,
//                 size: 16,
//                 color: Theme.of(context).primaryColor,
//               ),
//           ],
//         ),
//       ),
//     );
//   }
// }
