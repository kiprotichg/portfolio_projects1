"""
Data generation and loading module
Generates realistic synthetic car data for training
"""

import pandas as pd # type: ignore
import numpy as np # type: ignore
from datetime import datetime, timedelta
import os

class CarDataGenerator:
    """Generate synthetic car dataset with realistic values"""
    
    # Car brands and their typical price ranges
    BRANDS = {
        'Toyota': {'base': 20000, 'range': 50000},
        'Honda': {'base': 22000, 'range': 45000},
        'BMW': {'base': 45000, 'range': 80000},
        'Mercedes-Benz': {'base': 50000, 'range': 100000},
        'Audi': {'base': 42000, 'range': 90000},
        'Volkswagen': {'base': 25000, 'range': 55000},
        'Ford': {'base': 24000, 'range': 60000},
        'Chevrolet': {'base': 23000, 'range': 50000},
        'Tesla': {'base': 40000, 'range': 90000},
        'Hyundai': {'base': 18000, 'range': 40000},
        'Kia': {'base': 20000, 'range': 42000},
        'Nissan': {'base': 21000, 'range': 48000},
        'Mazda': {'base': 22000, 'range': 45000},
        'Subaru': {'base': 25000, 'range': 50000},
        'Lexus': {'base': 35000, 'range': 70000},
    }
    
    FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG']
    TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic']
    BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon', 'Convertible', 'Pickup']
    COLOR = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Yellow', 'Orange', 'Brown']
    
    @staticmethod
    def generate_dataset(num_samples=1000, random_state=42):
        """
        Generate synthetic car dataset
        
        Parameters:
        -----------
        num_samples : int
            Number of samples to generate
        random_state : int
            Random seed for reproducibility
            
        Returns:
        --------
        pd.DataFrame
            Generated car dataset
        """
        np.random.seed(random_state)
        
        data = {
            'brand': np.random.choice(list(CarDataGenerator.BRANDS.keys()), num_samples),
            'model_year': np.random.randint(2010, 2024, num_samples),
            'mileage': np.random.randint(0, 250000, num_samples),
            'fuel_type': np.random.choice(CarDataGenerator.FUEL_TYPES, num_samples),
            'transmission': np.random.choice(CarDataGenerator.TRANSMISSIONS, num_samples),
            'engine_size': np.random.uniform(1.0, 5.0, num_samples).round(1),
            'horsepower': np.random.randint(80, 500, num_samples),
            'body_type': np.random.choice(CarDataGenerator.BODY_TYPES, num_samples),
            'color': np.random.choice(CarDataGenerator.COLOR, num_samples),
            'num_cylinders': np.random.choice([4, 6, 8, 12], num_samples),
            'fuel_efficiency': np.random.uniform(10, 50, num_samples).round(1),
            'mileage_category': np.random.choice(['Low', 'Medium', 'High'], num_samples),
            'owner_count': np.random.randint(1, 4, num_samples),
            'is_accident_free': np.random.choice([0, 1], num_samples),
            'has_service_history': np.random.choice([0, 1], num_samples),
        }
        
        df = pd.DataFrame(data)
        
        # Add age_years first as it's needed for price calculation
        df['age_years'] = 2024 - df['model_year']
        
        # Calculate price based on features with some realistic relationships
        df['price'] = CarDataGenerator._calculate_price(df)
        
        # Add additional features
        df['price_per_hp'] = df['price'] / df['horsepower']
        df['price_per_cc'] = df['price'] / (df['engine_size'] * 1000)
        
        return df
    
    @staticmethod
    def _calculate_price(df):
        """Calculate car price based on features"""
        prices = []
        
        for idx, row in df.iterrows():
            brand = row['brand']
            base_price = CarDataGenerator.BRANDS[brand]['base']
            brand_range = CarDataGenerator.BRANDS[brand]['range']
            
            # Base price calculation
            price = base_price + np.random.uniform(0, brand_range)
            
            # Adjustments based on features
            age_factor = 0.9 ** row['age_years']
            mileage_factor = max(0.5, 1 - (row['mileage'] / 250000) * 0.5)
            fuel_type_multiplier = {
                'Petrol': 1.0,
                'Diesel': 1.1,
                'Electric': 1.5,
                'Hybrid': 1.3,
                'LPG': 0.95
            }
            
            transmission_multiplier = {
                'Manual': 1.0,
                'Automatic': 1.15,
                'CVT': 1.1,
                'Semi-Automatic': 1.12
            }
            
            body_type_multiplier = {
                'Sedan': 1.0,
                'SUV': 1.2,
                'Hatchback': 0.9,
                'Coupe': 1.3,
                'Wagon': 1.1,
                'Convertible': 1.4,
                'Pickup': 1.15
            }
            
            price *= age_factor
            price *= mileage_factor
            price *= fuel_type_multiplier.get(row['fuel_type'], 1.0)
            price *= transmission_multiplier.get(row['transmission'], 1.0)
            price *= body_type_multiplier.get(row['body_type'], 1.0)
            
            # Condition factors
            if row['is_accident_free'] == 1:
                price *= 1.05
            if row['has_service_history'] == 1:
                price *= 1.03
            
            # Owner factor
            price *= (1 - (row['owner_count'] - 1) * 0.05)
            
            # Horsepower factor (luxury/performance)
            if row['horsepower'] > 300:
                price *= 1.2
            elif row['horsepower'] > 200:
                price *= 1.1
            
            prices.append(max(5000, price))  # Minimum price
        
        return np.array(prices)


def load_or_generate_data(data_path='data/car_data.csv', num_samples=1000):
    """
    Load existing data or generate new data if not exists
    
    Parameters:
    -----------
    data_path : str
        Path to the data file
    num_samples : int
        Number of samples to generate if creating new data
        
    Returns:
    --------
    pd.DataFrame
        Car dataset
    """
    if os.path.exists(data_path):
        print(f"Loading existing data from {data_path}")
        return pd.read_csv(data_path)
    else:
        print(f"Generating new dataset with {num_samples} samples...")
        df = CarDataGenerator.generate_dataset(num_samples)
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)
        print(f"Dataset saved to {data_path}")
        return df
