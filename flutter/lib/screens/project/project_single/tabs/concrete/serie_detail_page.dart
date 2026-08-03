import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shamsi_date/shamsi_date.dart';

// مسیر ایمپورت‌ها را مطابق ساختار پروژه خودتان اصلاح کنید
import 'package:boton/models/mold_model.dart';
import 'package:boton/models/sampling_serie_model.dart';
import 'package:boton/controllers/base_controller.dart';

// =======================================================================
// ویجت اصلی صفحه جزئیات سری
// =======================================================================
class SerieDetailPage extends StatelessWidget {
  final int serieId;
  final int projectId;
  final int sampleId;

  const SerieDetailPage({
    super.key,
    required this.serieId,
    required this.projectId,
    required this.sampleId,
  });

  @override
  Widget build(BuildContext context) {
    final ProjectController controller = Get.find<ProjectController>();

    return Scaffold(
      appBar: AppBar(
        title: Obx(() {
          final serie = controller.projects
              .firstWhereOrNull((p) => p.id == projectId)
              ?.samples
              .firstWhereOrNull((s) => s.id == sampleId)
              ?.series
              .firstWhereOrNull((se) => se.id == serieId);

          // ✅ نمایش محور سری (axis)
          return Text('سری ${serie?.name ?? "..."} (${serie?.axis ?? "-"})');
        }),
        elevation: 0,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      ),

      // ===================================================================
      // بدنه اصلی صفحه
      // ===================================================================
      body: Obx(() {
        final project =
            controller.projects.firstWhereOrNull((p) => p.id == projectId);
        if (project == null) {
          return const Center(child: Text('پروژه یافت نشد!'));
        }

        final sample =
            project.samples.firstWhereOrNull((s) => s.id == sampleId);
        if (sample == null) {
          return const Center(child: Text('نمونه یافت نشد!'));
        }

        final liveSerie =
            sample.series.firstWhereOrNull((se) => se.id == serieId);
        if (liveSerie == null) {
          return const Center(child: Text('سری نمونه‌گیری یافت نشد!'));
        }

        return ListView(
          padding: const EdgeInsets.all(12.0),
          children: [
            // ✅ خلاصه اطلاعات سری
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('محور: ${liveSerie.axis}',
                      style:
                          const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  Text('دمای بتن: ${liveSerie.concreteTemperature} °C'),
                  Text('اسلامپ: ${liveSerie.slump} cm'),
                  if (liveSerie.hasAdditive)
                    const Text('دارای افزودنی',
                        style: TextStyle(color: Colors.green)),
                  const Divider(thickness: 1, height: 20),
                ],
              ),
            ),

            // ✅ نمایش تصاویر سری
            if (liveSerie.photos != null && liveSerie.photos!.isNotEmpty)
              SizedBox(
                height: 100,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: liveSerie.photos!.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final photoUrl = liveSerie.photos![index];
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        photoUrl,
                        width: 100,
                        height: 100,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            const Icon(Icons.image_not_supported),
                      ),
                    );
                  },
                ),
              ),

            const SizedBox(height: 20),
            const Text(
              'لیست قالب‌ها:',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // ✅ لیست قالب‌ها
            ...liveSerie.molds.map((mold) {
              return MoldDataTile(
                key: ValueKey(mold.id),
                mold: mold,
                onSave: (updatedData) async {
                  await Get.find<ProjectController>().updateMoldResult(
                    moldId: mold.id,
                    resultData: updatedData,
                  );

                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                            'اطلاعات قالب ${mold.ageInDays} روزه با موفقیت ثبت شد.'),
                        backgroundColor: const Color(0xFF2E7D32),
                      ),
                    );
                  }
                },
              );
            }),
          ],
        );
      }),
    );
  }
}

// =======================================================================
// ویجت آکاردئونی برای هر قالب (Mold)
// =======================================================================
class MoldDataTile extends StatefulWidget {
  final Mold mold;
  final Future<void> Function(Map<String, dynamic> data) onSave;

  const MoldDataTile({super.key, required this.mold, required this.onSave});

  @override
  State<MoldDataTile> createState() => _MoldDataTileState();
}

class _LuxuryColors {
  static const Color doneBackground = Color(0xFFE8F5E9);
  static const Color doneIcon = Color(0xFF2E7D32);
  static const Color overdueBackground = Color(0xFFFFEBEE);
  static const Color overdueIcon = Color(0xFFC62828);
  static const Color todayBackground = Color(0xFFFFF8E1);
  static const Color todayIcon = Color(0xFFFFA000);
  static const Color pendingIcon = Color(0xFF757575);
}

class _MoldDataTileState extends State<MoldDataTile> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _massController;
  late final TextEditingController _loadController;
  late final TextEditingController _breakDateController;

  DateTime? _selectedBreakDate;

  @override
  void initState() {
    super.initState();
    _selectedBreakDate = widget.mold.completedAt;
    _massController = TextEditingController(
      text: widget.mold.mass > 0 ? widget.mold.mass.toString() : '',
    );
    _loadController = TextEditingController(
      text:
          widget.mold.breakingLoad > 0 ? widget.mold.breakingLoad.toString() : '',
    );
    _breakDateController = TextEditingController(
      text:
          _selectedBreakDate != null ? _toPersianDate(_selectedBreakDate!) : '',
    );
  }

  @override
  void dispose() {
    _massController.dispose();
    _loadController.dispose();
    _breakDateController.dispose();
    super.dispose();
  }

  String _toPersianDate(DateTime date) {
    final f = Jalali.fromDateTime(date).formatter;
    return '${f.yyyy}/${f.mm}/${f.dd}';
  }

  Future<void> _selectBreakDate() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedBreakDate ?? DateTime.now(),
      firstDate: widget.mold.createdAt,
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (pickedDate != null) {
      setState(() {
        _selectedBreakDate = pickedDate;
        _breakDateController.text = _toPersianDate(pickedDate);
      });
    }
  }

  void _submitForm() {
    if (!_formKey.currentState!.validate()) return;

    final updatedData = {
      'mass': double.tryParse(_massController.text) ?? 0.0,
      'breaking_load': double.tryParse(_loadController.text) ?? 0.0,
      'completed_at': (_selectedBreakDate ?? DateTime.now()).toIso8601String(),
    };
    widget.onSave(updatedData);
    Get.find<ProjectController>().loadInitialData();
  }

  Color _getTileColor(BuildContext context) {
    if (widget.mold.isDone) return _LuxuryColors.doneBackground;
    final now = DateTime.now();
    if (DateUtils.isSameDay(now, widget.mold.deadline)) {
      return _LuxuryColors.todayBackground;
    }
    if (now.isAfter(widget.mold.deadline)) {
      return _LuxuryColors.overdueBackground;
    }
    return Theme.of(context).cardColor;
  }

  Color _getLeadingColor() {
    if (widget.mold.isDone) return _LuxuryColors.doneIcon;
    final now = DateTime.now();
    if (DateUtils.isSameDay(now, widget.mold.deadline)) {
      return _LuxuryColors.todayIcon;
    }
    if (now.isAfter(widget.mold.deadline)) return _LuxuryColors.overdueIcon;
    return _LuxuryColors.pendingIcon;
  }

  @override
  Widget build(BuildContext context) {
    final leadingColor = _getLeadingColor();
    final buttonText = widget.mold.isDone ? 'تغییر جزییات' : 'افزودن اطلاعات شکست';

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      elevation: 0.5,
      color: _getTileColor(context),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: leadingColor.withOpacity(0.3)),
      ),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: leadingColor.withOpacity(0.1),
          child: Text(
            widget.mold.ageInDays.toString(),
            style: TextStyle(fontWeight: FontWeight.bold, color: leadingColor),
          ),
        ),
        title: Text(
          'قالب ${widget.mold.ageInDays} روزه (${widget.mold.sampleIdentifier})',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle:
            Text('موعد شکست: ${_toPersianDate(widget.mold.deadline)}'),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildInfoRow(
                      'تاریخ نمونه‌گیری:', _toPersianDate(widget.mold.createdAt)),
                  _buildInfoRow('شناسه نمونه:', widget.mold.sampleIdentifier),
                  const Divider(height: 16),

                  // 🟢 عکس‌های قبل و بعد شکست
                  if (widget.mold.preBreakImage != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('📸 عکس قبل شکست:',
                              style: TextStyle(color: Colors.black54)),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              widget.mold.preBreakImage!,
                              height: 150,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  const Icon(Icons.image_not_supported_outlined),
                            ),
                          ),
                        ],
                      ),
                    ),

                  if (widget.mold.postBreakImage != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('📸 عکس بعد شکست:',
                              style: TextStyle(color: Colors.black54)),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              widget.mold.postBreakImage!,
                              height: 150,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  const Icon(Icons.image_not_supported_outlined),
                            ),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _breakDateController,
                    decoration: const InputDecoration(
                      labelText: 'تاریخ واقعی شکست',
                      prefixIcon: Icon(Icons.calendar_today_outlined),
                    ),
                    readOnly: true,
                    onTap: _selectBreakDate,
                    validator: (v) => v!.isEmpty ? 'تاریخ الزامی است' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _massController,
                    decoration: const InputDecoration(
                      labelText: 'جرم نمونه (گرم)',
                      prefixIcon: Icon(Icons.scale_outlined),
                    ),
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    validator: (v) => v!.isEmpty ? 'جرم الزامی است' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _loadController,
                    decoration: const InputDecoration(
                      labelText: 'بار گسیختگی (kN)',
                      prefixIcon: Icon(Icons.line_weight_rounded),
                    ),
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    validator: (v) =>
                        v!.isEmpty ? 'بار گسیختگی الزامی است' : null,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _submitForm,
                    icon: const Icon(Icons.save_alt_outlined),
                    label: Text(buttonText),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      backgroundColor: _LuxuryColors.doneIcon,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.black54)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
