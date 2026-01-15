class Product {
  final int id;
  final String name;
  final String? description;
  final double price;
  final double? discountPrice;
  final int stock;
  final String? imageUrl;
  final int? categoryId;
  final bool isActive;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.discountPrice,
    this.stock = 0,
    this.imageUrl,
    this.categoryId,
    this.isActive = true,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: json['price'].toDouble(),
      discountPrice: json['discount_price']?.toDouble(),
      stock: json['stock'] ?? 0,
      imageUrl: json['image_url'],
      categoryId: json['category_id'],
      isActive: json['is_active'] ?? true,
    );
  }

  double get effectivePrice => discountPrice ?? price;
  
  int get discountPercentage {
    if (discountPrice == null) return 0;
    return ((1 - discountPrice! / price) * 100).round();
  }
}
