# Car Price Prediction AI System

A comprehensive machine learning system that predicts car prices based on brand, features, and customer preferences using multiple advanced algorithms.

## Overview

This AI system combines multiple machine learning models to provide accurate car price predictions. It includes:

- **Data Generation & Management**: Realistic synthetic car dataset generation
- **Multiple ML Models**: Linear Regression, Ridge, Lasso, Random Forest, Gradient Boosting, XGBoost, LightGBM, SVM
- **Feature Engineering**: Advanced feature creation and optimization
- **Model Comparison**: Automatic evaluation and selection of best model
- **Visualizations**: Comprehensive performance and analysis charts
- **REST API**: Flask-based API for predictions
- **Interactive CLI**: Command-line interface for easy predictions
- **Batch Processing**: Support for bulk predictions

## Features

### Car Price Prediction Factors
- **Brand & Model**: Toyota, Honda, BMW, Mercedes-Benz, Audi, Volkswagen, Ford, Chevrolet, Tesla, and more
- **Vehicle Specifications**:
  - Model year
  - Mileage
  - Fuel type (Petrol, Diesel, Electric, Hybrid, LPG)
  - Transmission type (Manual, Automatic, CVT, Semi-Automatic)
  - Engine size and horsepower
  - Body type (Sedan, SUV, Coupe, Wagon, etc.)
  - Number of cylinders
  - Fuel efficiency

- **Condition & History**:
  - Accident history
  - Service history
  - Number of previous owners
  - Mileage category

### System Capabilities
- Single car price prediction
- Batch predictions from JSON files
- Price prediction ranges with confidence intervals
- Market price comparison and analysis
- Feature importance analysis
- Performance visualizations
- REST API for integration

## Installation

### Prerequisites
- Python 3.8+
- pip or conda

### Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Initialize project structure** (optional):
```bash
python setup.py
```

## Project Structure

```
car_predictor_ai/
├── src/
│   ├── __init__.py
│   ├── data_generator.py       # Data generation and loading
│   ├── preprocessing.py         # Data preprocessing and feature engineering
│   ├── model_training.py        # Model training and evaluation
│   ├── predictor.py             # Prediction engine
│   └── visualization.py         # Analysis visualizations
├── data/
│   └── car_data.csv            # Generated dataset
├── models/
│   ├── car_price_model.pkl     # Trained model
│   ├── preprocessor.pkl        # Data preprocessor
│   └── training_report.txt     # Training summary
├── visualizations/
│   ├── model_comparison.png
│   ├── feature_importance.png
│   └── ... (other charts)
├── train.py                     # Training pipeline
├── predict.py                   # Interactive prediction CLI
├── app.py                       # REST API server
├── requirements.txt             # Dependencies
└── README.md                    # This file
```

## Usage

### 1. Train the Model

Generate data and train all models:

```bash
python train.py
```

This will:
- Generate or load dataset (2000 samples by default)
- Perform data preprocessing
- Train 7 different ML models
- Compare performance
- Select the best model
- Generate visualizations
- Save model and preprocessor

### 2. Interactive Predictions

Start the interactive CLI for predictions:

```bash
python predict.py
```

Options:
- **Single Prediction**: Input car details interactively
- **Batch Prediction**: Load cars from JSON file
- **Exit**: Quit the program

Example car input:
```
Brand: Toyota
Model Year: 2022
Mileage: 30000
Fuel Type: Hybrid
Transmission: Automatic
Engine Size: 2.5
Horsepower: 200
...
```

### 3. REST API Server

Start the Flask API server:

```bash
python app.py
```

Server runs on: `http://localhost:5000`

### 4. API Endpoints

#### Health Check
```bash
GET /health
```

#### Single Prediction
```bash
POST /api/predict
Content-Type: application/json

{
  "brand": "Toyota",
  "model_year": 2022,
  "mileage": 30000,
  "fuel_type": "Hybrid",
  "transmission": "Automatic",
  "engine_size": 2.5,
  "horsepower": 200,
  "body_type": "Sedan",
  "color": "Black",
  "num_cylinders": 4,
  "fuel_efficiency": 38.0,
  "mileage_category": "Low",
  "owner_count": 1,
  "is_accident_free": 1,
  "has_service_history": 1
}
```

Response:
```json
{
  "predicted_price": 28500.50,
  "lower_bound": 25000.00,
  "upper_bound": 32000.00,
  "confidence_interval": "$25000.00 - $32000.00",
  "model_used": "XGBoost",
  "status": "success"
}
```

#### Batch Predictions
```bash
POST /api/predict/batch
Content-Type: application/json

[
  {car_data_1},
  {car_data_2},
  ...
]
```

#### Compare with Market Price
```bash
POST /api/predict/compare
Content-Type: application/json

{
  "car_data": {...},
  "market_price": 27000
}
```

Response:
```json
{
  "predicted_price": 28500.50,
  "market_price": 27000.00,
  "difference": -1500.50,
  "percentage_difference": -5.26,
  "recommendation": "UNDERPRICED",
  "status": "success"
}
```

#### Model Information
```bash
GET /api/info
```

## Model Performance

The system trains and compares the following models:

1. **Linear Regression** - Baseline linear model
2. **Ridge Regression** - L2 regularized linear model
3. **Lasso Regression** - L1 regularized linear model
4. **Random Forest** - 100 trees ensemble
5. **Gradient Boosting** - Sequential boosting
6. **XGBoost** - Optimized gradient boosting
7. **LightGBM** - Fast gradient boosting
8. **Support Vector Regression** - Non-linear SVM

The best model (typically XGBoost or LightGBM) is automatically selected based on test R² score.

## Feature Importance

Top factors affecting car price (typically):
1. Model year / Age
2. Mileage
3. Horsepower / Engine size
4. Brand
5. Body type
6. Fuel efficiency
7. Transmission type
8. Number of cylinders
9. Fuel type
10. Service history

## Output Files

After training, the system generates:

- **models/car_price_model.pkl** - Trained best model
- **models/preprocessor.pkl** - Data preprocessor
- **models/training_report.txt** - Training summary
- **visualizations/model_comparison.png** - Model performance comparison
- **visualizations/feature_importance.png** - Feature importance chart
- **visualizations/predictions_vs_actual.png** - Prediction accuracy plot
- **visualizations/residuals_analysis.png** - Residual analysis
- **visualizations/price_by_brand.png** - Price distribution by brand
- **visualizations/price_by_fuel_type.png** - Price distribution by fuel type
- **data/car_data.csv** - Generated dataset

## Example Usage

### Python Code Integration

```python
from src.predictor import CarPricePredictor

# Load predictor
predictor = CarPricePredictor('models/car_price_model.pkl', 
                             'models/preprocessor.pkl')

# Single prediction
car = {
    'brand': 'Toyota',
    'model_year': 2022,
    'mileage': 30000,
    'fuel_type': 'Hybrid',
    'transmission': 'Automatic',
    'engine_size': 2.5,
    'horsepower': 200,
    'body_type': 'Sedan',
    'color': 'Black',
    'num_cylinders': 4,
    'fuel_efficiency': 38.0,
    'mileage_category': 'Low',
    'owner_count': 1,
    'is_accident_free': 1,
    'has_service_history': 1
}

result = predictor.predict_single(car)
print(f"Predicted Price: ${result['predicted_price']:,.2f}")

# Get price range
price_range = predictor.get_price_range(car)
print(f"Range: {price_range['confidence_interval']}")

# Compare with market
comparison = predictor.compare_with_market(car, market_price=27000)
print(f"Recommendation: {comparison['recommendation']}")
```

### JSON Batch File Example

Create `data/cars_to_predict.json`:

```json
[
  {
    "brand": "Toyota",
    "model_year": 2022,
    "mileage": 30000,
    "fuel_type": "Hybrid",
    "transmission": "Automatic",
    "engine_size": 2.5,
    "horsepower": 200,
    "body_type": "Sedan",
    "color": "Black",
    "num_cylinders": 4,
    "fuel_efficiency": 38.0,
    "mileage_category": "Low",
    "owner_count": 1,
    "is_accident_free": 1,
    "has_service_history": 1
  },
  {
    "brand": "BMW",
    "model_year": 2020,
    "mileage": 50000,
    "fuel_type": "Petrol",
    "transmission": "Automatic",
    "engine_size": 3.0,
    "horsepower": 300,
    "body_type": "SUV",
    "color": "Silver",
    "num_cylinders": 6,
    "fuel_efficiency": 28.0,
    "mileage_category": "Medium",
    "owner_count": 2,
    "is_accident_free": 1,
    "has_service_history": 1
  }
]
```

Run batch prediction:
```bash
python predict.py
# Select option 2 (Batch Predictions)
# Enter file path: data/cars_to_predict.json
```

## Model Metrics

Typical performance metrics on test set:

| Model | RMSE | R² Score |
|-------|------|----------|
| Linear Regression | $8,500 | 0.78 |
| Ridge Regression | $8,200 | 0.80 |
| Random Forest | $5,500 | 0.92 |
| Gradient Boosting | $4,800 | 0.94 |
| XGBoost | $4,200 | 0.96 |
| LightGBM | $4,100 | 0.97 |
| SVM | $6,200 | 0.88 |

*Metrics vary based on dataset and random seeds*

## Configuration

### Modify Dataset Size

Edit `train.py`:
```python
df = load_or_generate_data('data/car_data.csv', num_samples=5000)  # Change samples
```

### Adjust Model Hyperparameters

Edit `src/model_training.py` in the `create_models()` method:
```python
'XGBoost': xgb.XGBRegressor(
    n_estimators=200,      # Increase trees
    learning_rate=0.05,    # Lower learning rate
    max_depth=8,           # Increase depth
    ...
)
```

### API Configuration

Edit `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5000)  # Change port
```

## Troubleshooting

### Model not loading
- Ensure `models/car_price_model.pkl` exists
- Run `python train.py` first

### Low prediction accuracy
- Increase dataset size in `train.py`
- Tune model hyperparameters
- Add more relevant features

### API connection errors
- Ensure Flask app is running: `python app.py`
- Check firewall settings
- Verify correct API endpoint

## Future Enhancements

- [ ] Real car market data integration
- [ ] Deep learning models (Neural Networks)
- [ ] Real-time market price updates
- [ ] Web UI dashboard
- [ ] Docker containerization
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Advanced time-series analysis
- [ ] Multi-language support

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

## Authors

Car Price Prediction AI System - Version 1.0.0

---

**Last Updated**: January 2026
