"""
Interactive prediction interface
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from predictor import CarPricePredictor, PredictionAnalyzer # type: ignore
import json


def get_user_input():
    """Get car information from user"""
    print("\n" + "="*80)
    print("CAR PRICE PREDICTION - INTERACTIVE MODE")
    print("="*80 + "\n")
    
    car_data = {}
    
    # Brand
    brands = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 
              'Ford', 'Chevrolet', 'Tesla', 'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Subaru', 'Lexus']
    print("Available Brands:")
    for i, brand in enumerate(brands, 1):
        print(f"  {i}. {brand}")
    choice = int(input("Select brand (number): ")) - 1
    car_data['brand'] = brands[choice]
    
    # Model Year
    car_data['model_year'] = int(input("Enter model year (2010-2024): "))
    
    # Mileage
    car_data['mileage'] = int(input("Enter mileage (km): "))
    
    # Fuel Type
    fuel_types = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG']
    print("\nFuel Types:")
    for i, ft in enumerate(fuel_types, 1):
        print(f"  {i}. {ft}")
    choice = int(input("Select fuel type (number): ")) - 1
    car_data['fuel_type'] = fuel_types[choice]
    
    # Transmission
    transmissions = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic']
    print("\nTransmissions:")
    for i, trans in enumerate(transmissions, 1):
        print(f"  {i}. {trans}")
    choice = int(input("Select transmission (number): ")) - 1
    car_data['transmission'] = transmissions[choice]
    
    # Engine Size
    car_data['engine_size'] = float(input("Enter engine size (liters, e.g., 2.5): "))
    
    # Horsepower
    car_data['horsepower'] = int(input("Enter horsepower: "))
    
    # Body Type
    body_types = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon', 'Convertible', 'Pickup']
    print("\nBody Types:")
    for i, bt in enumerate(body_types, 1):
        print(f"  {i}. {bt}")
    choice = int(input("Select body type (number): ")) - 1
    car_data['body_type'] = body_types[choice]
    
    # Color
    colors = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Yellow', 'Orange', 'Brown']
    print("\nColors:")
    for i, color in enumerate(colors, 1):
        print(f"  {i}. {color}")
    choice = int(input("Select color (number): ")) - 1
    car_data['color'] = colors[choice]
    
    # Number of Cylinders
    car_data['num_cylinders'] = int(input("Enter number of cylinders (4, 6, 8, 12): "))
    
    # Fuel Efficiency
    car_data['fuel_efficiency'] = float(input("Enter fuel efficiency (km/l): "))
    
    # Mileage Category
    mileage_categories = ['Low', 'Medium', 'High']
    print("\nMileage Category:")
    for i, mc in enumerate(mileage_categories, 1):
        print(f"  {i}. {mc}")
    choice = int(input("Select mileage category (number): ")) - 1
    car_data['mileage_category'] = mileage_categories[choice]
    
    # Owner Count
    car_data['owner_count'] = int(input("Enter number of previous owners (1-3): "))
    
    # Accident Free
    car_data['is_accident_free'] = int(input("Accident free? (1=Yes, 0=No): "))
    
    # Service History
    car_data['has_service_history'] = int(input("Has complete service history? (1=Yes, 0=No): "))
    
    return car_data


def batch_prediction_mode():
    """Batch prediction from JSON file"""
    print("\nEnter path to JSON file with car data (e.g., data/cars_to_predict.json): ")
    filepath = input().strip()
    
    try:
        with open(filepath, 'r') as f:
            cars_data = json.load(f)
        
        if not isinstance(cars_data, list):
            cars_data = [cars_data]
        
        predictor = CarPricePredictor('models/car_price_model.pkl', 'models/preprocessor.pkl')
        predictions_df = predictor.predict_batch(cars_data)
        
        print("\n" + "="*80)
        print("BATCH PREDICTION RESULTS")
        print("="*80 + "\n")
        
        for idx, row in predictions_df.iterrows():
            print(f"Car {idx + 1}:")
            print(f"  Brand: {row['input_data']['brand']}")
            print(f"  Model Year: {row['input_data']['model_year']}")
            print(f"  Predicted Price: ${row['predicted_price']:,.2f}\n")
        
        # Summary statistics
        analysis = PredictionAnalyzer.analyze_predictions(predictions_df)
        print(f"Summary Statistics:")
        print(f"  Average Price: ${analysis['average_price']:,.2f}")
        print(f"  Median Price: ${analysis['median_price']:,.2f}")
        print(f"  Price Range: ${analysis['price_min']:,.2f} - ${analysis['price_max']:,.2f}\n")
        
    except FileNotFoundError:
        print(f"File not found: {filepath}")


def single_prediction_mode():
    """Single car prediction"""
    try:
        predictor = CarPricePredictor('models/car_price_model.pkl', 'models/preprocessor.pkl')
        
        car_data = get_user_input()
        
        # Get prediction
        prediction = predictor.predict_single(car_data)
        price_range = predictor.get_price_range(car_data)
        
        print("\n" + "="*80)
        print("PREDICTION RESULTS")
        print("="*80 + "\n")
        
        print(f"Car Details:")
        print(f"  Brand: {car_data['brand']}")
        print(f"  Year: {car_data['model_year']}")
        print(f"  Body Type: {car_data['body_type']}")
        print(f"  Fuel Type: {car_data['fuel_type']}")
        print(f"  Transmission: {car_data['transmission']}")
        print(f"  Mileage: {car_data['mileage']:,} km")
        print(f"  Engine Size: {car_data['engine_size']} L")
        print(f"  Horsepower: {car_data['horsepower']} HP\n")
        
        print(f"Prediction:")
        print(f"  Predicted Price: ${prediction['predicted_price']:,.2f}")
        print(f"  Confidence Interval (68%): {price_range['confidence_interval']}")
        print(f"  Model Used: {prediction['model_used']}\n")
        
    except FileNotFoundError:
        print("\n✗ Error: Model files not found. Please train the model first using: python train.py")
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")


def main():
    """Main interactive interface"""
    while True:
        print("\n" + "="*80)
        print("CAR PRICE PREDICTION SYSTEM - MAIN MENU")
        print("="*80)
        print("\n1. Single Car Price Prediction")
        print("2. Batch Predictions (from JSON file)")
        print("3. Exit\n")
        
        choice = input("Select option (1-3): ").strip()
        
        if choice == '1':
            single_prediction_mode()
        elif choice == '2':
            batch_prediction_mode()
        elif choice == '3':
            print("\n✓ Thank you for using Car Price Prediction System!")
            break
        else:
            print("\n✗ Invalid option. Please try again.")


if __name__ == "__main__":
    main()
