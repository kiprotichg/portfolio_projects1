# API Documentation

## Overview

The Car Price Prediction System provides a comprehensive REST API for integrating car price predictions into your applications.

## Base URL

```
http://localhost:5000
```

## Authentication

Currently, the API is open (no authentication required). For production deployment, implement API key authentication:

```python
# In app.py, add:
API_KEYS = ['your-api-key-here']

@app.before_request
def check_api_key():
    api_key = request.headers.get('X-API-Key')
    if api_key not in API_KEYS:
        return jsonify({'error': 'Invalid API key'}), 401
```

## Response Format

All responses are in JSON format:

### Success Response
```json
{
  "status": "success",
  "data": {...}
}
```

### Error Response
```json
{
  "status": "error",
  "error": "Error message description"
}
```

## Endpoints

### 1. Health Check

Check if the API is running and model is loaded.

**Request:**
```http
GET /health HTTP/1.1
Host: localhost:5000
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

---

### 2. Model Information

Get information about the loaded model.

**Request:**
```http
GET /api/info HTTP/1.1
Host: localhost:5000
```

**Response (200 OK):**
```json
{
  "model_name": "XGBoost",
  "status": "ready",
  "version": "1.0.0",
  "endpoints": {
    "/health": "Health check",
    "/api/predict": "Single prediction",
    "/api/predict/batch": "Batch predictions",
    "/api/predict/compare": "Compare with market price"
  }
}
```

---

### 3. Single Car Price Prediction

Predict the price for a single car.

**Request:**
```http
POST /api/predict HTTP/1.1
Host: localhost:5000
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

**Response (200 OK):**
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

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required field: brand",
  "status": "error"
}
```

**Required Fields:**
- `brand` (string): Car brand
- `model_year` (integer): Year of manufacture (2010-2024)
- `mileage` (integer): Odometer reading in km
- `fuel_type` (string): Petrol, Diesel, Electric, Hybrid, LPG
- `transmission` (string): Manual, Automatic, CVT, Semi-Automatic
- `engine_size` (float): Engine displacement in liters
- `horsepower` (integer): Engine horsepower
- `body_type` (string): Sedan, SUV, Hatchback, Coupe, Wagon, Convertible, Pickup
- `color` (string): Car color
- `num_cylinders` (integer): Number of cylinders
- `fuel_efficiency` (float): Fuel efficiency in km/l
- `mileage_category` (string): Low, Medium, High
- `owner_count` (integer): Number of previous owners
- `is_accident_free` (integer): 0 or 1
- `has_service_history` (integer): 0 or 1

---

### 4. Batch Predictions

Predict prices for multiple cars.

**Request:**
```http
POST /api/predict/batch HTTP/1.1
Host: localhost:5000
Content-Type: application/json

[
  {
    "brand": "Toyota",
    "model_year": 2022,
    ...
  },
  {
    "brand": "BMW",
    "model_year": 2020,
    ...
  }
]
```

**Response (200 OK):**
```json
{
  "predictions": [
    {
      "car_index": 0,
      "predicted_price": 28500.50,
      "brand": "Toyota",
      "model_year": 2022
    },
    {
      "car_index": 1,
      "predicted_price": 42000.00,
      "brand": "BMW",
      "model_year": 2020
    }
  ],
  "summary": {
    "total_predictions": 2,
    "average_price": 35250.25,
    "median_price": 35250.25,
    "min_price": 28500.50,
    "max_price": 42000.00
  },
  "status": "success"
}
```

---

### 5. Compare with Market Price

Compare predicted price with actual market price to identify deals.

**Request:**
```http
POST /api/predict/compare HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "car_data": {
    "brand": "Toyota",
    "model_year": 2022,
    "mileage": 30000,
    ...
  },
  "market_price": 27000
}
```

**Response (200 OK):**
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

**Recommendations:**
- **OVERPRICED**: Market price > predicted price + 5%
- **UNDERPRICED**: Market price < predicted price - 5%
- **FAIRLY PRICED**: Within ±5% of predicted price

---

## Example Usage

### Python Client

```python
import requests
import json

BASE_URL = "http://localhost:5000"

# Single prediction
car_data = {
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

response = requests.post(f"{BASE_URL}/api/predict", json=car_data)
prediction = response.json()

print(f"Predicted Price: ${prediction['predicted_price']:,.2f}")
print(f"Confidence Range: {prediction['confidence_interval']}")
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

const baseURL = 'http://localhost:5000';

const carData = {
  brand: 'Toyota',
  model_year: 2022,
  mileage: 30000,
  fuel_type: 'Hybrid',
  transmission: 'Automatic',
  engine_size: 2.5,
  horsepower: 200,
  body_type: 'Sedan',
  color: 'Black',
  num_cylinders: 4,
  fuel_efficiency: 38.0,
  mileage_category: 'Low',
  owner_count: 1,
  is_accident_free: 1,
  has_service_history: 1
};

axios.post(`${baseURL}/api/predict`, carData)
  .then(response => {
    console.log(`Predicted Price: $${response.data.predicted_price.toFixed(2)}`);
    console.log(`Confidence Range: ${response.data.confidence_interval}`);
  })
  .catch(error => console.error('Error:', error.response.data));
```

### cURL

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

---

## Error Handling

### Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Missing required field | Include all required fields |
| 400 | Invalid field value | Check field format and range |
| 500 | Model not loaded | Ensure model is trained: `python train.py` |
| 500 | Internal server error | Check server logs |

### Error Response Example

```json
{
  "error": "Missing required field: brand",
  "status": "error"
}
```

---

## Rate Limiting

Currently unlimited. For production, implement rate limiting:

```python
from flask_limiter import Limiter

limiter = Limiter(
    app=app,
    key_func=lambda: request.remote_addr,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/predict', methods=['POST'])
@limiter.limit("10 per minute")
def predict():
    ...
```

---

## Pagination (Future)

For batch operations with large datasets:

```json
{
  "predictions": [...],
  "pagination": {
    "total": 1000,
    "page": 1,
    "per_page": 50,
    "total_pages": 20
  }
}
```

---

## Versioning

The API follows semantic versioning:

**Current Version**: 1.0.0

Future versions may be accessed via:
```http
GET /v2/api/predict
```

---

## Testing with Postman

1. Import collection from `postman_collection.json`
2. Set environment variable: `BASE_URL` = `http://localhost:5000`
3. Test each endpoint

**Example Request:**
```
POST {{BASE_URL}}/api/predict
Content-Type: application/json

{...car_data...}
```

---

## CORS (Cross-Origin Resource Sharing)

Enable CORS for web applications:

```python
from flask_cors import CORS

CORS(app)

# Or specific origins:
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})
```

---

## Rate Limiting Example

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    storage_uri="memory://"
)

@app.route('/api/predict', methods=['POST'])
@limiter.limit("100 per hour")
def predict():
    ...
```

---

## Webhook Integration (Future)

For async processing of batch predictions:

```python
@app.route('/api/predict/async', methods=['POST'])
def predict_async():
    data = request.json
    webhook_url = data.get('webhook_url')
    
    # Queue job
    # When complete, send results to webhook_url
    
    return jsonify({'job_id': 'xyz123'}), 202
```

---

## Support

For API issues:
1. Check if model is trained: `python train.py`
2. Verify server is running: `python app.py`
3. Check firewall settings
4. Review error logs in `logs/` directory
