import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:math';

class FinancialDashboardScreen extends StatefulWidget {
  const FinancialDashboardScreen({super.key});

  @override
  _FinancialDashboardScreenState createState() =>
      _FinancialDashboardScreenState();
}

class _FinancialDashboardScreenState extends State<FinancialDashboardScreen> {
  // --- MOCK FINANCIAL DATA ---
  final Map<String, dynamic> revenueData = {
    'value': 125000000.0,
    'change': 5.2,
  };
  final Map<String, dynamic> expenseData = {
    'value': 78000000.0,
    'change': -2.1,
  };
  final Map<String, dynamic> profitData = {'value': 47000000.0, 'change': 15.8};
  final Map<String, dynamic> profitMarginData = {'value': 37.6, 'change': 3.5};

  final List<Map<String, double>> monthlyData = [
    {'income': 18, 'expense': 12},
    {'income': 22, 'expense': 14},
    {'income': 25, 'expense': 15},
    {'income': 23, 'expense': 16},
    {'income': 28, 'expense': 18},
    {'income': 32, 'expense': 20},
  ];

  final List<Map<String, dynamic>> latestInvoices = [
    {
      'id': 'INV-051',
      'client': 'شرکت آرمان سازه',
      'amount': 12500000,
      'due_date': '1404/04/10',
      'status': 'پرداخت شده',
    },
    {
      'id': 'INV-052',
      'client': 'پروژه برج شهریار',
      'amount': 8000000,
      'due_date': '1404/05/01',
      'status': 'در انتظار',
    },
    {
      'id': 'INV-053',
      'client': 'جناب آقای محمدی',
      'amount': 3200000,
      'due_date': '1404/03/15',
      'status': 'دیرکرد',
    },
    {
      'id': 'INV-054',
      'client': 'شرکت راه و ساخت',
      'amount': 25000000,
      'due_date': '1404/04/28',
      'status': 'در انتظار',
    },
    {
      'id': 'INV-055',
      'client': 'ویلایی دماوند',
      'amount': 6800000,
      'due_date': '1404/02/20',
      'status': 'پرداخت شده',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text("تحلیل جامع مالی"),
        centerTitle: true,
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return constraints.maxWidth > 1000
              ? _buildWebLayout()
              : _buildMobileLayout();
        },
      ),
    );
  }

  // --- LAYOUTS (No changes here) ---
  Widget _buildWebLayout() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(24),
      child: Column(
        children: [
          _buildHeader(),
          SizedBox(height: 24),
          _buildFinancialKpis(crossAxisCount: 4, childAspectRatio: 2.8),
          SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: _buildSectionCard(
                  title: "درآمد، هزینه و سود (میلیون تومان)",
                  child: _buildIncomeExpenseProfitChart(),
                ),
              ),
              SizedBox(width: 24),
              Expanded(
                flex: 2,
                child: Column(
                  children: [
                    _buildSectionCard(
                      title: "عمر بدهی‌ها (مبالغ دریافتنی)",
                      child: _buildReceivableAging(),
                    ),
                    SizedBox(height: 24),
                    _buildSectionCard(
                      title: "مشتریان برتر بر اساس درآمد",
                      child: _buildTopClients(),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 24),
          _buildSectionCard(
            title: "فاکتورهای اخیر",
            child: _buildInvoicesTable(),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileLayout() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          _buildHeader(),
          SizedBox(height: 16),
          _buildFinancialKpis(crossAxisCount: 2, childAspectRatio: 2.2),
          SizedBox(height: 16),
          _buildSectionCard(
            title: "درآمد، هزینه و سود",
            child: _buildIncomeExpenseProfitChart(),
          ),
          SizedBox(height: 16),
          _buildSectionCard(
            title: "عمر بدهی‌ها",
            child: _buildReceivableAging(),
          ),
          SizedBox(height: 16),
          _buildSectionCard(title: "مشتریان برتر", child: _buildTopClients()),
          SizedBox(height: 16),
          _buildSectionCard(
            title: "فاکتورهای اخیر",
            child: _buildInvoicesTable(),
          ),
        ],
      ),
    );
  }

  // --- WIDGETS ---
  // Unchanged widgets: _buildHeader, _buildFinancialKpis, _buildKpiCard, _buildSectionCard,
  // _buildReceivableAging, _buildTopClients, _buildStatusChip
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          "داشبورد مالی",
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        Wrap(
          spacing: 8.0,
          children: [
            OutlinedButton(onPressed: () {}, child: Text("امروز")),
            OutlinedButton(onPressed: () {}, child: Text("این ماه")),
            ElevatedButton(onPressed: () {}, child: Text("امسال")),
          ],
        ),
      ],
    );
  }

  Widget _buildFinancialKpis({
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
        _buildKpiCard('درآمد کل', revenueData, Icons.trending_up, Colors.green),
        _buildKpiCard(
          'کل هزینه‌ها',
          expenseData,
          Icons.trending_down,
          Colors.red,
        ),
        _buildKpiCard(
          'سود خالص',
          profitData,
          Icons.account_balance_wallet,
          Colors.blue,
        ),
        _buildKpiCard(
          'حاشیه سود',
          profitMarginData,
          Icons.pie_chart,
          Colors.purple,
          isPercentage: true,
        ),
      ],
    );
  }

  Widget _buildKpiCard(
    String title,
    Map<String, dynamic> data,
    IconData icon,
    Color color, {
    bool isPercentage = false,
  }) {
    double value = data['value'];
    double change = data['change'];

    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color),
              SizedBox(width: 8),
              Text(title, style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          SizedBox(height: 12),
          Expanded(
            child: FittedBox(
              fit: BoxFit.contain,
              child: Text(
                isPercentage
                    ? "% ${value.toStringAsFixed(1)}"
                    : "${(value / 1000000).toStringAsFixed(1)} م",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          SizedBox(height: 4),
          Row(
            children: [
              Icon(
                change > 0 ? Icons.arrow_upward : Icons.arrow_downward,
                color: change > 0 ? Colors.green : Colors.red,
                size: 16,
              ),
              SizedBox(width: 4),
              Text(
                "${change.abs()}%",
                style: TextStyle(
                  color: change > 0 ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                " نسبت به دوره قبل",
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),
            ],
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

  /// ===================================================================
  /// FIXED: Combined Chart using a Stack
  /// ===================================================================
  Widget _buildIncomeExpenseProfitChart() {
    // Shared title data for both charts to align them
    final FlTitlesData titlesData = FlTitlesData(
      leftTitles: AxisTitles(
        sideTitles: SideTitles(showTitles: true, reservedSize: 40),
      ),
      rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
      topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
      bottomTitles: AxisTitles(
        sideTitles: SideTitles(
          showTitles: true,
          reservedSize: 30,
          getTitlesWidget: (value, meta) => Text("${value.toInt() + 1}"),
        ),
      ),
    );

    return SizedBox(
      height: 320,
      child: Stack(
        // Use a Stack to overlay charts
        children: [
          // Bar Chart for Income and Expense
          BarChart(
            BarChartData(
              barTouchData: BarTouchData(
                enabled: true,
                touchTooltipData: BarTouchTooltipData(
                  // tooltipBgColor: Colors.black87
                ),
              ),
              titlesData: titlesData,
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                horizontalInterval: 10,
              ),
              borderData: FlBorderData(show: false),
              barGroups: List.generate(monthlyData.length, (index) {
                final data = monthlyData[index];
                return BarChartGroupData(
                  x: index,
                  barRods: [
                    BarChartRodData(
                      toY: data['income']!,
                      color: Colors.green[300],
                      width: 15,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    BarChartRodData(
                      toY: data['expense']!,
                      color: Colors.red[300],
                      width: 15,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                );
              }),
            ),
          ),
          // Line Chart for Profit, drawn on top
          LineChart(
            LineChartData(
              lineTouchData: LineTouchData(
                enabled: false,
              ), // Disable touch on line to avoid conflict
              titlesData: titlesData, // Use same titles to align
              gridData: FlGridData(show: false), // Hide grid for the overlay
              borderData: FlBorderData(
                show: false,
              ), // Hide border for the overlay
              lineBarsData: [
                LineChartBarData(
                  spots: List.generate(monthlyData.length, (index) {
                    final data = monthlyData[index];
                    return FlSpot(
                      index.toDouble(),
                      data['income']! - data['expense']!,
                    );
                  }),
                  isCurved: true,
                  color: Colors.blue,
                  barWidth: 3,
                  isStrokeCapRound: true,
                  dotData: FlDotData(show: true),
                  belowBarData: BarAreaData(show: false),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// ===================================================================
  /// FIXED: Horizontally Scrollable DataTable
  /// ===================================================================
  Widget _buildInvoicesTable() {
    return SingleChildScrollView(
      // Wrap with SingleChildScrollView
      scrollDirection: Axis.horizontal, // Set scroll direction to horizontal
      child: DataTable(
        columnSpacing: 24, // Add some spacing between columns
        columns: [
          DataColumn(label: Text('شناسه')),
          DataColumn(label: Text('مشتری')),
          DataColumn(label: Text('مبلغ (تومان)')),
          DataColumn(label: Text('تاریخ سررسید')),
          DataColumn(label: Text('وضعیت')),
          DataColumn(label: Text('عملیات')),
        ],
        rows:
            latestInvoices.map((invoice) {
              return DataRow(
                cells: [
                  DataCell(Text(invoice['id'])),
                  DataCell(Text(invoice['client'])),
                  DataCell(Text((invoice['amount'] as int).toStringAsFixed(0))),
                  DataCell(Text(invoice['due_date'])),
                  DataCell(_buildStatusChip(invoice['status'])),
                  DataCell(
                    IconButton(
                      onPressed: () {
                        // Add logic to view invoice details
                      },
                      icon: Icon(Icons.more_vert),
                    ),
                  ),
                ],
              );
            }).toList(),
      ),
    );
  }

  Widget _buildReceivableAging() {
    return Column(
      children: [
        _buildAgingRow("جاری (۱-۳۰ روز)", 12000000, 0.65, Colors.green),
        Divider(),
        _buildAgingRow("دیرکرد (۳۱-۶۰ روز)", 4500000, 0.24, Colors.orange),
        Divider(),
        _buildAgingRow("دیرکرد (۶۱-۹۰ روز)", 1500000, 0.08, Colors.deepOrange),
        Divider(),
        _buildAgingRow("بیش از ۹۰ روز", 500000, 0.03, Colors.red),
      ],
    );
  }

  Widget _buildAgingRow(
    String title,
    double amount,
    double percentage,
    Color color,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title),
              Text("${(amount / 1000000).toStringAsFixed(1)} م"),
            ],
          ),
          SizedBox(height: 4),
          LinearProgressIndicator(
            value: percentage,
            color: color,
            backgroundColor: color.withOpacity(0.2),
          ),
        ],
      ),
    );
  }

  Widget _buildTopClients() {
    return Column(
      children: [
        ListTile(
          leading: CircleAvatar(child: Text("آس")),
          title: Text("شرکت آرمان سازه"),
          trailing: Text("45 م"),
        ),
        ListTile(
          leading: CircleAvatar(child: Text("رس")),
          title: Text("شرکت راه و ساخت"),
          trailing: Text("25 م"),
        ),
        ListTile(
          leading: CircleAvatar(child: Text("بش")),
          title: Text("پروژه برج شهریار"),
          trailing: Text("18 م"),
        ),
      ],
    );
  }

  Widget _buildStatusChip(String status) {
    Color bgColor, fgColor;
    switch (status) {
      case 'پرداخت شده':
        bgColor = Colors.green.shade100;
        fgColor = Colors.green.shade800;
        break;
      case 'در انتظار':
        bgColor = Colors.amber.shade100;
        fgColor = Colors.amber.shade800;
        break;
      case 'دیرکرد':
        bgColor = Colors.red.shade100;
        fgColor = Colors.red.shade800;
        break;
      default:
        bgColor = Colors.grey.shade200;
        fgColor = Colors.grey.shade800;
    }
    return Chip(
      label: Text(
        status,
        style: TextStyle(color: fgColor, fontWeight: FontWeight.bold),
      ),
      backgroundColor: bgColor,
    );
  }
}
