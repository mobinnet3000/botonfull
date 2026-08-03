import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:math';

class ProfessionalDashboardScreen extends StatefulWidget {
  // const ReportDashboardScreen({super.key});

  @override
  _ProfessionalDashboardScreenState createState() =>
      _ProfessionalDashboardScreenState();
}

class _ProfessionalDashboardScreenState
    extends State<ProfessionalDashboardScreen> {
  // --- MOCK DATA ---
  final int totalProjects = 124;
  final int completedProjects = 98;
  final String avgTurnaroundTime = "3.2 روز";
  final int totalSamplesTaken = 1850;
  final double clientSatisfaction = 4.8;
  final double totalIncome = 89500000;

  // Data for the line chart
  final List<FlSpot> monthlySamples = const [
    FlSpot(0, 120),
    FlSpot(1, 150),
    FlSpot(2, 130),
    FlSpot(3, 180),
    FlSpot(4, 210),
    FlSpot(5, 250),
    FlSpot(6, 230),
    FlSpot(7, 280),
  ];

  // Data for the table
  final List<Map<String, dynamic>> recentProjects = [
    {
      'id': '#P-1024',
      'name': 'برج مدرن الهیه',
      'status': 'فعال',
      'samples': 45,
    },
    {'id': '#P-1023', 'name': 'ویلای لواسان', 'status': 'تکمیل', 'samples': 12},
    {
      'id': '#P-1022',
      'name': 'مجتمع اداری سهروردی',
      'status': 'فعال',
      'samples': 88,
    },
    {
      'id': '#P-1021',
      'name': 'پارکینگ طبقاتی ملت',
      'status': 'عقب افتاده',
      'samples': 120,
    },
    {
      'id': '#P-1020',
      'name': 'فونداسیون کارخانه',
      'status': 'تکمیل',
      'samples': 35,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LayoutBuilder(
        builder: (context, constraints) {
          // Use a different layout for web (wide screens) vs mobile (narrow screens)
          if (constraints.maxWidth > 900) {
            return _buildWebLayout();
          } else {
            return _buildMobileLayout();
          }
        },
      ),
    );
  }

  // Layout for wide screens (Web/Desktop)
  Widget _buildWebLayout() {
    return Row(
      children: [
        // This could be a navigation rail in a real app
        // For now, it's just a colored bar
        Container(width: 80, color: Theme.of(context).primaryColor),
        Expanded(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(24.0),
            child: Column(
              children: [
                _buildDashboardHeader(),
                SizedBox(height: 24),
                _buildKpiGrid(crossAxisCount: 3, childAspectRatio: 2.5),
                SizedBox(height: 24),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 3, // Main content takes more space
                      child: Column(
                        children: [
                          _buildSectionCard(
                            title: "روند نمونه‌گیری ماهانه",
                            child: _buildTimeSeriesChart(),
                          ),
                          SizedBox(height: 24),
                          _buildSectionCard(
                            title: "پروژه‌های اخیر",
                            child: _buildProjectsTable(),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(width: 24),
                    Expanded(
                      flex: 2, // Sidebar content takes less space
                      child: Column(
                        children: [
                          _buildSectionCard(
                            title: "وضعیت کلی پروژه‌ها",
                            child: _buildProjectsDoughnutChart(),
                          ),
                          SizedBox(height: 24),
                          _buildSectionCard(
                            title: "هشدارها و نکات مهم",
                            child: _buildAlertsList(),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // Layout for narrow screens (Mobile)
  Widget _buildMobileLayout() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.0),
      child: Column(
        children: [
          _buildDashboardHeader(),
          SizedBox(height: 16),
          _buildKpiGrid(crossAxisCount: 2, childAspectRatio: 2.0),
          SizedBox(height: 16),
          _buildSectionCard(
            title: "روند نمونه‌گیری ماهانه",
            child: _buildTimeSeriesChart(),
          ),
          SizedBox(height: 16),
          _buildSectionCard(
            title: "وضعیت کلی پروژه‌ها",
            child: _buildProjectsDoughnutChart(),
          ),
          SizedBox(height: 16),
          _buildSectionCard(
            title: "پروژه‌های اخیر",
            child: _buildProjectsTable(),
          ),
          SizedBox(height: 16),
          _buildSectionCard(
            title: "هشدارها و نکات مهم",
            child: _buildAlertsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          "داشبورد مدیریتی",
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
        ),
        IconButton(
          icon: Icon(Icons.refresh, color: Colors.grey[700]),
          onPressed: () {
            // Add logic to refresh data
            setState(() {});
          },
        ),
      ],
    );
  }

  Widget _buildKpiGrid({
    required int crossAxisCount,
    required double childAspectRatio,
  }) {
    return GridView.count(
      crossAxisCount: crossAxisCount,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      childAspectRatio: childAspectRatio,
      children: [
        _buildKpiCard(
          'کل پروژه‌ها',
          totalProjects.toString(),
          Icons.business_center,
          Colors.blue,
        ),
        _buildKpiCard(
          'نمونه‌گیری‌ها',
          totalSamplesTaken.toString(),
          Icons.science,
          Colors.orange,
        ),
        _buildKpiCard(
          'زمان پاسخ',
          avgTurnaroundTime,
          Icons.timer,
          Colors.purple,
        ),
        _buildKpiCard(
          'پروژه‌های تکمیل',
          completedProjects.toString(),
          Icons.check_circle,
          Colors.green,
        ),
        _buildKpiCard(
          'رضایت مشتری',
          '$clientSatisfaction / 5',
          Icons.star,
          Colors.amber,
        ),
        _buildKpiCard(
          'درآمد (میلیون)',
          (totalIncome / 1000000).toStringAsFixed(1),
          Icons.attach_money,
          Colors.teal,
        ),
      ],
    );
  }

  Widget _buildKpiCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: color.withOpacity(0.15),
            radius: 24,
            child: Icon(icon, color: color),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  value,
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  title,
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({required String title, required Widget child}) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 20),
          child,
        ],
      ),
    );
  }

  // Advanced line chart with gradient and tooltips
  Widget _buildTimeSeriesChart() {
    return SizedBox(
      height: 250,
      child: LineChart(
        LineChartData(
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              // tooltipBgColor: Colors.blueGrey.withOpacity(0.8),
            ),
          ),
          gridData: FlGridData(show: false),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(
              sideTitles: SideTitles(showTitles: true, reservedSize: 40),
            ),
            rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 30,
                getTitlesWidget: (value, meta) {
                  const months = [
                    'فر',
                    'ارد',
                    'خر',
                    'تیر',
                    'مر',
                    'شهر',
                    'مهر',
                    'آبان',
                  ];
                  return Text(months[value.toInt() % months.length]);
                },
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: monthlySamples,
              isCurved: true,
              color: Colors.blueAccent,
              barWidth: 4,
              isStrokeCapRound: true,
              dotData: FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  colors: [
                    Colors.blueAccent.withOpacity(0.3),
                    Colors.blueAccent.withOpacity(0.0),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProjectsDoughnutChart() {
    return SizedBox(
      height: 200,
      child: PieChart(
        PieChartData(
          pieTouchData: PieTouchData(
            touchCallback: (event, response) {
              // Add interactivity logic here if needed
            },
          ),
          sectionsSpace: 4,
          centerSpaceRadius: 50,
          sections: [
            PieChartSectionData(
              value: 98,
              title: 'تکمیل',
              color: Colors.green,
              radius: 50,
            ),
            PieChartSectionData(
              value: 23,
              title: 'فعال',
              color: Colors.blue,
              radius: 50,
            ),
            PieChartSectionData(
              value: 3,
              title: 'عقب افتاده',
              color: Colors.red,
              radius: 50,
            ),
          ],
        ),
      ),
    );
  }

  /// ===================================================================
  /// FIXED: Horizontally Scrollable DataTable
  /// ===================================================================
  Widget _buildProjectsTable() {
    // Wrap the DataTable with a SingleChildScrollView for horizontal scrolling
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        headingRowColor: MaterialStateProperty.all(Colors.grey[100]),
        columns: const [
          DataColumn(label: Text('شناسه')),
          DataColumn(label: Text('نام پروژه')),
          DataColumn(label: Text('وضعیت')),
          DataColumn(label: Text('نمونه‌ها'), numeric: true),
        ],
        rows:
            recentProjects
                .map(
                  (p) => DataRow(
                    cells: [
                      DataCell(Text(p['id'])),
                      DataCell(Text(p['name'])),
                      DataCell(_buildStatusChip(p['status'])),
                      DataCell(Text(p['samples'].toString())),
                    ],
                  ),
                )
                .toList(),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    switch (status) {
      case 'تکمیل':
        color = Colors.green;
        break;
      case 'فعال':
        color = Colors.blue;
        break;
      case 'عقب افتاده':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }
    return Chip(
      label: Text(status, style: TextStyle(color: Colors.white, fontSize: 12)),
      backgroundColor: color,
      padding: EdgeInsets.symmetric(horizontal: 4, vertical: 0),
      labelPadding: EdgeInsets.zero,
    );
  }

  Widget _buildAlertsList() {
    return Column(
      children: [
        _buildAlertItem(
          Icons.warning_amber_rounded,
          "دستگاه کمپرسور نیاز به کالیبراسیون دارد.",
          Colors.orange,
        ),
        Divider(),
        _buildAlertItem(
          Icons.error_outline,
          "3 فاکتور از شرکت 'آرمان سازه' پرداخت نشده است.",
          Colors.red,
        ),
        Divider(),
        _buildAlertItem(
          Icons.info_outline,
          "5 پروژه جدید در هفته گذشته اضافه شده است.",
          Colors.blue,
        ),
      ],
    );
  }

  Widget _buildAlertItem(IconData icon, String text, Color color) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(text, style: TextStyle(fontSize: 14)),
      contentPadding: EdgeInsets.zero,
    );
  }
}
