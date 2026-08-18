"""
Configuration file for the Car Price Prediction System
"""

# Data Configuration
DATA_CONFIG = {
    'dataset_path': 'data/car_data.csv',
    'num_samples': 2000,
    'test_split': 0.2,
    'random_state': 42,
}  

# Model Configuration
MODEL_CONFIG = {
    'model_path': 'models/car_price_model.pkl',
    'preprocessor_path': 'models/preprocessor.pkl',
    'training_report_path': 'models/training_report.txt',
}

# Supported Car Brands
BRANDS = [
    'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
    'Ford', 'Chevrolet', 'Tesla', 'Hyundai', 'Kia', 'Nissan',
    'Mazda', 'Subaru', 'Lexus'
]

# Fuel Types
FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG']

# Transmissions
TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic']

# Body Types
BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon', 'Convertible', 'Pickup']

# Colors
COLORS = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Yellow', 'Orange', 'Brown']

# Mileage Categories
MILEAGE_CATEGORIES = ['Low', 'Medium', 'High']

# API Configuration
API_CONFIG = {
    'host': '0.0.0.0',
    'port': 5000,
    'debug': True,
}

# Feature Configuration
REQUIRED_FEATURES = [
    'brand',
    'model_year',
    'mileage',
    'fuel_type',
    'transmission',
    'engine_size',
    'horsepower',
    'body_type',
    'color',
    'num_cylinders',
    'fuel_efficiency',
    'mileage_category',
    'owner_count',
    'is_accident_free',
    'has_service_history',
    'age_years',
    'price_per_hp',
    'price_per_cc'
]

# Price Prediction Range Configuration
PREDICTION_CONFIG = {
    'min_price': 5000,
    'max_price': 200000,
    'uncertainty_percentage': 12,  # 12% uncertainty
    'confidence_std_dev': 1,  # 1 standard deviation = 68% confidence
}

# Visualization Configuration
VISUALIZATION_CONFIG = {
    'output_dir': 'visualizations',
    'dpi': 300,
    'figsize': (14, 8),
    'style': 'darkgrid',
}

# Logging Configuration
LOGGING_CONFIG = {
    'log_dir': 'logs',
    'level': 'INFO',
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
}
