import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class Loadingg extends StatelessWidget {
  const Loadingg({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SpinKitSpinningLines(color: Colors.blueGrey, lineWidth: 5, size: 100),
        Text("لطفا منتطر بمانید..."),
      ],
    );
  }
}
