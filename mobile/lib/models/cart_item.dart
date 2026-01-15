import 'product.dart';

class CartItem {
  final Product product;
  int quantity;
  final String? size;
  final String? color;

  CartItem({
    required this.product,
    this.quantity = 1,
    this.size,
    this.color,
  });

  double get totalPrice => product.effectivePrice * quantity;
}
