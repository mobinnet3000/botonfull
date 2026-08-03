import 'package:boton/models/Sample_model.dart';
import 'package:boton/models/project_model.dart';
import 'package:boton/models/sampling_serie_model.dart';
import 'package:boton/screens/project/project_single/tabs/concrete/serie_detail_page.dart';
import 'package:flutter/material.dart';
import 'package:shamsi_date/shamsi_date.dart';

//======================================================================
// تب "لیست کل نمونه‌ها" – نمایش تمام سری‌ها از تمام نمونه‌های یک پروژه
//======================================================================

class ConcreteListView extends StatelessWidget {
  final Project project;
  const ConcreteListView({super.key, required this.project});

  /// تابع کمکی برای تبدیل تاریخ میلادی به شمسی
  String _toPersianDate(DateTime date) {
    final f = Jalali.fromDateTime(date);
    return '${f.year}/${f.month.toString().padLeft(2, '0')}/${f.day.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    //------------------------------------------------------------------
    // مرحله ۱: ساخت لیست تمام سری‌ها در پروژه
    //------------------------------------------------------------------
    final List<SerieWithContext> allSeries = [];
    for (final sample in project.samples) {
      for (final serie in sample.series) {
        allSeries.add(SerieWithContext(serie: serie, parentSample: sample));
      }
    }

    // مرتب‌سازی بر اساس تاریخ نمونه‌گیری
    allSeries.sort(
      (a, b) => a.parentSample.date.compareTo(b.parentSample.date),
    );

    //------------------------------------------------------------------
    // مرحله ۲: ساخت نمای UI
    //------------------------------------------------------------------
    if (allSeries.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 60, color: Colors.grey[400]),
            const SizedBox(height: 16),
            const Text(
              'هیچ سری نمونه‌گیری در این پروژه ثبت نشده است.',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: allSeries.length,
      itemBuilder: (context, index) {
        final item = allSeries[index];
        final serie = item.serie;
        final parentSample = item.parentSample;

        //--------------------------------------------------------------
        // تعیین تاریخ شکست بعدی بر اساس کمترین deadline قالب‌ها
        //--------------------------------------------------------------
        String deadlineInfo = 'بدون قالب';
        if (serie.molds.isNotEmpty) {
          serie.molds.sort((a, b) => a.deadline.compareTo(b.deadline));
          final nextDeadline = serie.molds.first.deadline;
          deadlineInfo = 'تاریخ شکست بعدی: ${_toPersianDate(nextDeadline)}';
        }

        //--------------------------------------------------------------
        // عکس نمایه (اولین عکس سری در صورت وجود)
        //--------------------------------------------------------------
        String? previewImage =
            (serie.photos != null && serie.photos!.isNotEmpty)
                ? serie.photos!.first
                : null;

        //--------------------------------------------------------------
        // ساخت کارت نمایش سری
        //--------------------------------------------------------------
        return Card(
          elevation: 2,
          margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            contentPadding:
                const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: previewImage != null
                  ? Image.network(
                      previewImage,
                      width: 50,
                      height: 50,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          const Icon(Icons.image_not_supported, size: 30),
                    )
                  : CircleAvatar(
                      backgroundColor:
                          Theme.of(context).primaryColor.withOpacity(0.1),
                      child: Icon(Icons.science_outlined,
                          color: Theme.of(context).primaryColor),
                    ),
            ),
            title: Text(
              'سری ${serie.name} (${serie.axis})',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),

            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(deadlineInfo),
                const SizedBox(height: 4),
                Text(
                  'دما: ${serie.concreteTemperature}°C | اسلامپ: ${serie.slump}cm ${serie.hasAdditive ? "| افزودنی دارد" : ""}',
                  style: const TextStyle(color: Colors.black54, fontSize: 13),
                ),
              ],
            ),

            trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
            onTap: () {
              // بستن BottomSheet در صورت باز بودن
              Navigator.of(context).pop();
              // رفتن به صفحه جزئیات سری
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => SerieDetailPage(
                    serieId: serie.id,
                    projectId: project.id,
                    sampleId: parentSample.id,
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}

//======================================================================
// کلاس کمکی برای نگهداری رابطه سری با نمونه والد آن
//======================================================================
class SerieWithContext {
  final SamplingSerie serie;
  final Sample parentSample;

  SerieWithContext({required this.serie, required this.parentSample});
}
