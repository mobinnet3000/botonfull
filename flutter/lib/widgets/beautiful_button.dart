import 'package:flutter/material.dart';

class BeautifulButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final Color color;
  final double elevation;
  final double borderRadius;

  const BeautifulButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.color = Colors.blue,
    this.elevation = 2.0,
    this.borderRadius = 8.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: elevation,
      borderRadius: BorderRadius.circular(borderRadius),
      child: InkWell(
        borderRadius: BorderRadius.circular(borderRadius),
        onTap: onPressed,
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 12.0, horizontal: 24.0),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          child: Text(
            text,
            style: TextStyle(color: Colors.white, fontSize: 16.0),
          ),
        ),
      ),
    );
  }
}