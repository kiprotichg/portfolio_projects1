"""
Flask REST API for car price predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from predictor import CarPricePredictor, PredictionAnalyzer # type: ignore
import os
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    },
    r"/health": {"origins": ["*"]},
    r"/": {"origins": ["*"]}
})

# Load model and preprocessor
try:
    predictor = CarPricePredictor('models/car_price_model.pkl', 'models/preprocessor.pkl')
    MODEL_LOADED = True
except Exception as e:
    print(f"⚠️ Model loading error: {e}")
    MODEL_LOADED = False


@app.route('/', methods=['GET'])
def index():
    """Root endpoint - provides API documentation"""
    return jsonify({
        'title': 'Car Price Prediction AI - REST API',
        'version': '1.0.0',
        'status': 'ready' if MODEL_LOADED else 'not_loaded',
        'endpoints': {
            'GET /': 'This page',
            'GET /health': 'Health check',
            'GET /api/info': 'Model information',
            'POST /api/predict': 'Single car price prediction',
            'POST /api/predict/batch': 'Batch predictions',
            'POST /api/predict/compare': 'Compare predicted vs market price'
        },
        'documentation': 'Visit http://localhost:5000/api/info for details'
    }), 200


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': MODEL_LOADED
    }), 200


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict car price
    
    Expected JSON:
    {
        "brand": "Toyota",
        "model_year": 2022,
        "mileage": 30000,
        "fuel_type": "Hybrid",
        ...
    }
    """
    if not MODEL_LOADED:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        car_data = request.json
        
        # Validate required fields
        required_fields = ['brand', 'model_year', 'mileage', 'fuel_type', 'transmission',
                         'engine_size', 'horsepower', 'body_type', 'color', 'num_cylinders',
                         'fuel_efficiency', 'mileage_category', 'owner_count',
                         'is_accident_free', 'has_service_history']
        
        for field in required_fields:
            if field not in car_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Make prediction
        prediction = predictor.predict_single(car_data)
        price_range = predictor.get_price_range(car_data)
        
        return jsonify({
            'predicted_price': round(prediction['predicted_price'], 2),
            'lower_bound': round(price_range['lower_bound'], 2),
            'upper_bound': round(price_range['upper_bound'], 2),
            'confidence_interval': price_range['confidence_interval'],
            'model_used': prediction['model_used'],
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    """
    Batch predict car prices
    
    Expected JSON (either format):
    [
        {car_data_1},
        {car_data_2},
        ...
    ]
    
    OR
    
    {
        "cars": [
            {car_data_1},
            {car_data_2}
        ]
    }
    """
    if not MODEL_LOADED:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        
        # Handle both list and object formats
        if isinstance(data, dict) and 'cars' in data:
            cars_data = data['cars']
        elif isinstance(data, list):
            cars_data = data
        else:
            cars_data = [data]
        
        predictions_df = predictor.predict_batch(cars_data)
        
        # Convert to JSON-friendly format
        results = []
        for idx, row in predictions_df.iterrows():
            results.append({
                'car_index': idx,
                'predicted_price': round(row['predicted_price'], 2),
                'brand': row['input_data']['brand'],
                'model_year': row['input_data']['model_year']
            })
        
        analysis = PredictionAnalyzer.analyze_predictions(predictions_df)
        
        return jsonify({
            'predictions': results,
            'summary': {
                'total_predictions': analysis['total_predictions'],
                'average_price': round(analysis['average_price'], 2),
                'median_price': round(analysis['median_price'], 2),
                'min_price': round(analysis['price_min'], 2),
                'max_price': round(analysis['price_max'], 2)
            },
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/predict/compare', methods=['POST'])
def compare_price():
    """
    Compare predicted price with market price
    
    Expected JSON:
    {
        "car_data": {...},
        "market_price": 25000
    }
    """
    if not MODEL_LOADED:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        car_data = data.get('car_data')
        market_price = data.get('market_price')
        
        if not car_data or market_price is None:
            return jsonify({'error': 'Missing car_data or market_price'}), 400
        
        comparison = predictor.compare_with_market(car_data, market_price)
        
        return jsonify({
            'predicted_price': round(comparison['predicted_price'], 2),
            'market_price': round(comparison['market_price'], 2),
            'difference': round(comparison['difference'], 2),
            'percentage_difference': round(comparison['percentage_difference'], 2),
            'recommendation': comparison['recommendation'],
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/info', methods=['GET'])
def info():
    """Get model information"""
    return jsonify({
        'model_name': predictor.trainer.best_model_name if MODEL_LOADED else 'N/A',
        'status': 'ready' if MODEL_LOADED else 'not_loaded',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'Health check',
            '/api/predict': 'Single prediction',
            '/api/predict/batch': 'Batch predictions',
            '/api/predict/compare': 'Compare with market price'
        }
    }), 200


if __name__ == '__main__':
    print("\n" + "="*80)
    print("CAR PRICE PREDICTION - REST API SERVER")
    print("="*80)
    print(f"\nModel Status: {'✓ Loaded' if MODEL_LOADED else '✗ Not Loaded'}")
    print("\nServer starting on http://localhost:5000")
    print("\nAvailable Endpoints:")
    print("  - GET  /health")
    print("  - GET  /api/info")
    print("  - POST /api/predict")
    print("  - POST /api/predict/batch")
    print("  - POST /api/predict/compare")
    print("\n" + "="*80 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
