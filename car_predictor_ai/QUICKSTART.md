# Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies (2 min)
```bash
pip install -r requirements.txt
```

### Step 2: Train the Model (2 min)
```bash
python train.py
```

This will:
- Generate 2000 sample cars
- Train 8 different ML models
- Select the best one (usually XGBoost)
- Create visualizations
- Save model and preprocessor

### Step 3: Make Your First Prediction (1 min)

```bash
python predict.py
```

Select option 1 and fill in car details when prompted.

---

## Running the System

### 1. Interactive Predictions
```bash
python predict.py
```
- Option 1: Single car prediction
- Option 2: Batch predictions from JSON
- Interactive menu-driven interface

### 2. REST API Server
```bash
python app.py
```
Server runs on: `http://localhost:5000`

See [API.md](API.md) for API documentation.

### 3. Retrain the Model
```bash
python train.py
```
Use this if you:
- Want to change dataset size
- Modify model parameters
- Update training data

---

## Example: Predict a Car Price

### Using Python
```python
from src.predictor import CarPricePredictor

predictor = CarPricePredictor('models/car_price_model.pkl', 
                             'models/preprocessor.pkl')

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
print(f"Price: ${result['predicted_price']:,.2f}")
```

### Using REST API
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

## Directory Structure

```
car_predictor_ai/
├── train.py              ← Start here to train
├── predict.py            ← Use for predictions
├── app.py                ← REST API server
├── setup.py              ← Initialize project
├── requirements.txt      ← Dependencies
├── config.py             ← Configuration
├── src/                  ← Source code
│   ├── data_generator.py
│   ├── preprocessing.py
│   ├── model_training.py
│   ├── predictor.py
│   └── visualization.py
├── data/                 ← Datasets
├── models/               ← Trained models
└── visualizations/       ← Charts
```

---

## File Descriptions

| File | Purpose |
|------|---------|
| `train.py` | Main training pipeline |
| `predict.py` | Interactive prediction CLI |
| `app.py` | REST API server |
| `config.py` | Configuration settings |
| `requirements.txt` | Python dependencies |
| `README.md` | Full documentation |
| `INSTALLATION.md` | Installation guide |
| `API.md` | API reference |
| `src/` | Source code modules |

---

## Common Tasks

### Change Dataset Size
Edit `train.py`, line ~45:
```python
df = load_or_generate_data('data/car_data.csv', num_samples=5000)
```

### Add New Brand
Edit `src/data_generator.py`:
```python
BRANDS = {
    ...
    'YourBrand': {'base': 30000, 'range': 60000}
}
```

### Modify Model Parameters
Edit `src/model_training.py` in `create_models()`:
```python
'XGBoost': xgb.XGBRegressor(
    n_estimators=200,  # More trees
    learning_rate=0.05,  # Slower learning
    max_depth=8,  # Deeper trees
)
```

### Change API Port
Edit `app.py`, last line:
```python
app.run(debug=True, host='0.0.0.0', port=8000)  # Port 8000
```

---

## Troubleshooting

**Error: "Model files not found"**
- Run `python train.py` first

**Error: "ModuleNotFoundError"**
- Activate virtual environment
- Reinstall requirements: `pip install -r requirements.txt`

**Slow performance**
- Reduce dataset size in train.py
- Use fewer model types

**API won't start**
- Ensure port 5000 is free
- Check firewall settings

---

## Next Steps

1. ✓ Install dependencies
2. ✓ Train model
3. ✓ Make predictions
4. → Explore the generated visualizations
5. → Read full documentation in README.md
6. → Integrate with your application
7. → Fine-tune model hyperparameters

---

## Performance Notes

Typical execution times:
- Training: 2-5 minutes (2000 samples)
- Single prediction: < 100ms
- Batch prediction (100 cars): < 1 second
- API startup: 3-5 seconds

---

## Need Help?

1. Check [README.md](README.md) for full documentation
2. Review [INSTALLATION.md](INSTALLATION.md) for setup issues
3. See [API.md](API.md) for API documentation
4. Check generated `models/training_report.txt`

---

## Key Supported Brands

Toyota, Honda, BMW, Mercedes-Benz, Audi, Volkswagen, Ford, Chevrolet, Tesla, Hyundai, Kia, Nissan, Mazda, Subaru, Lexus

---

**Ready to predict car prices!** 🚗
