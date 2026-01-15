import 'package:flutter/material.dart';
import '../models/product.dart';
import '../widgets/product_card.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  String _selectedCategory = 'All';
  String _sortBy = 'Featured';

  final List<Product> _products = [
    Product(id: 1, name: 'Classic White T-Shirt', price: 1200, discountPrice: 999, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
    Product(id: 2, name: 'Denim Jacket', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'),
    Product(id: 3, name: 'Summer Dress', price: 2800, discountPrice: 2200, imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'),
    Product(id: 4, name: 'Casual Sneakers', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
    Product(id: 5, name: 'Formal Shirt', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'),
    Product(id: 6, name: 'Leather Belt', price: 800, discountPrice: 650, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
    Product(id: 7, name: 'Sunglasses', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'),
    Product(id: 8, name: 'Hoodie', price: 2500, discountPrice: 1999, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterBottomSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // Category chips
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: ['All', 'Men', 'Women', 'Accessories', 'Shoes']
                  .map((cat) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(cat),
                          selected: _selectedCategory == cat,
                          selectedColor: const Color(0xFFD946EF),
                          labelStyle: TextStyle(
                            color: _selectedCategory == cat ? Colors.white : Colors.black,
                          ),
                          onSelected: (selected) {
                            setState(() => _selectedCategory = cat);
                          },
                        ),
                      ))
                  .toList(),
            ),
          ),

          // Sort dropdown
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_products.length} Products',
                  style: const TextStyle(color: Colors.grey),
                ),
                DropdownButton<String>(
                  value: _sortBy,
                  underline: const SizedBox(),
                  items: ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest']
                      .map((sort) => DropdownMenuItem(value: sort, child: Text(sort, style: const TextStyle(fontSize: 14))))
                      .toList(),
                  onChanged: (value) {
                    setState(() => _sortBy = value!);
                  },
                ),
              ],
            ),
          ),

          // Products grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.7,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: _products.length,
              itemBuilder: (context, index) {
                return ProductCard(product: _products[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Filter', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              const Text('Price Range', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['Under ৳1000', '৳1000-৳2000', '৳2000-৳3000', 'Over ৳3000']
                    .map((range) => FilterChip(label: Text(range), onSelected: (_) {}))
                    .toList(),
              ),
              const SizedBox(height: 16),
              const Text('Size', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
                    .map((size) => FilterChip(label: Text(size), onSelected: (_) {}))
                    .toList(),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD946EF),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Apply Filters'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
