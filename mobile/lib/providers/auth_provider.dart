import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider with ChangeNotifier {
  String? _token;
  String? _email;
  String? _fullName;

  bool get isAuthenticated => _token != null;
  String? get token => _token;
  String? get email => _email;
  String? get fullName => _fullName;

  Future<void> login(String email, String password) async {
    // TODO: Implement actual API call
    await Future.delayed(const Duration(seconds: 1));
    _token = 'dummy_token';
    _email = email;
    _fullName = 'User';
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', _token!);
    await prefs.setString('email', _email!);
    
    notifyListeners();
  }

  Future<void> register(String email, String password, String fullName) async {
    // TODO: Implement actual API call
    await Future.delayed(const Duration(seconds: 1));
    _token = 'dummy_token';
    _email = email;
    _fullName = fullName;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', _token!);
    await prefs.setString('email', _email!);
    await prefs.setString('fullName', _fullName!);
    
    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    _email = null;
    _fullName = null;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('email');
    await prefs.remove('fullName');
    
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('token')) return;
    
    _token = prefs.getString('token');
    _email = prefs.getString('email');
    _fullName = prefs.getString('fullName');
    notifyListeners();
  }
}
