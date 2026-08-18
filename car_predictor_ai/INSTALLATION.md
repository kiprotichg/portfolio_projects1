# Installation and Setup Guide

## System Requirements

- **Python Version**: 3.8 or higher
- **OS**: Windows, macOS, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 1GB for dependencies and data

## Step-by-Step Installation

### 1. Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd car_predictor_ai

# Or extract the downloaded zip file
cd car_predictor_ai
```

### 2. Create Virtual Environment (Recommended)

#### On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

#### On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Verify Installation

```bash
python -c "import pandas; import sklearn; import xgboost; print('✓ All dependencies installed successfully!')"
```

### 5. Initialize Project Structure

```bash
python setup.py
```

This creates necessary directories:
- `data/` - For datasets
- `models/` - For trained models
- `logs/` - For log files

## Troubleshooting Installation

### Issue: `pip: command not found`
**Solution**: Use `python -m pip` instead:
```bash
python -m pip install -r requirements.txt
```

### Issue: `ModuleNotFoundError` after installation
**Solution**: Ensure virtual environment is activated:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### Issue: XGBoost/LightGBM installation fails
**Solution**: Install pre-compiled wheels:
```bash
pip install --only-binary :all: xgboost
pip install --only-binary :all: lightgbm
```

### Issue: Scikit-learn version conflicts
**Solution**: Install compatible versions:
```bash
pip install scikit-learn==1.3.0 numpy==1.24.3
```

## Verify Complete Setup

Run this test script to verify everything is installed:

```python
# test_setup.py
import sys
print("Python version:", sys.version)

try:
    import pandas as pd
    print("✓ pandas:", pd.__version__)
except ImportError:
    print("✗ pandas not installed")

try:
    import numpy as np
    print("✓ numpy:", np.__version__)
except ImportError:
    print("✗ numpy not installed")

try:
    import sklearn
    print("✓ scikit-learn:", sklearn.__version__)
except ImportError:
    print("✗ scikit-learn not installed")

try:
    import xgboost as xgb
    print("✓ xgboost:", xgb.__version__)
except ImportError:
    print("✗ xgboost not installed")

try:
    import lightgbm as lgb
    print("✓ lightgbm:", lgb.__version__)
except ImportError:
    print("✗ lightgbm not installed")

try:
    import matplotlib
    print("✓ matplotlib:", matplotlib.__version__)
except ImportError:
    print("✗ matplotlib not installed")

try:
    import flask
    print("✓ flask:", flask.__version__)
except ImportError:
    print("✗ flask not installed")

print("\n✓ All dependencies verified!")
```

Run it:
```bash
python test_setup.py
```

## Environment Variables (Optional)

Create a `.env` file for configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=car_predictor

# API Configuration
API_HOST=0.0.0.0
API_PORT=5000
DEBUG=True

# Model Configuration
MODEL_PATH=models/car_price_model.pkl
DATA_PATH=data/car_data.csv
```

## Platform-Specific Notes

### Windows
- Use `python` (not `python3`)
- Virtual environment activation: `venv\Scripts\activate`
- PowerShell may require execution policy changes

### macOS
- May need Xcode Command Line Tools: `xcode-select --install`
- Use `python3` and `pip3` commands
- May need additional dependencies for some ML libraries

### Linux
- Ensure build tools are installed: `sudo apt-get install build-essential python3-dev`
- Use `python3` and `pip3` commands
- May require additional system libraries for some packages

## Docker Setup (Alternative)

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t car-predictor .
docker run -p 5000:5000 car-predictor
```

## Next Steps

After successful installation:

1. **Train the model**:
   ```bash
   python train.py
   ```

2. **Try interactive predictions**:
   ```bash
   python predict.py
   ```

3. **Start the API server**:
   ```bash
   python app.py
   ```

4. **Check the visualizations**:
   - Open `visualizations/` folder to view generated charts

## Getting Help

If you encounter issues:

1. Check Python version: `python --version`
2. Verify pip: `pip --version`
3. List installed packages: `pip list`
4. Check requirements match your system
5. Try updating pip: `pip install --upgrade pip`
6. Clear cache and reinstall: `pip install --force-reinstall -r requirements.txt`

## Uninstall

To remove the virtual environment:

```bash
# Windows
rmdir /s venv

# macOS/Linux
rm -rf venv
```

To remove all installed packages:
```bash
pip freeze > uninstall.txt
pip uninstall -r uninstall.txt -y
```
