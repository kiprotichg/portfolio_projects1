"""
Car Price Prediction AI System
Comprehensive system for predicting car prices based on brand and customer preferences
"""

import os
import numpy as np
import pandas as pd
import pickle
from datetime import datetime
from pathlib import Path

# Create project structure
project_root = Path(__file__).parent
data_dir = project_root / "data"
models_dir = project_root / "models"
logs_dir = project_root / "logs"

# Create directories if they don't exist
data_dir.mkdir(exist_ok=True)
models_dir.mkdir(exist_ok=True)
logs_dir.mkdir(exist_ok=True)

print("Project structure initialized successfully!")
print(f"Project Root: {project_root}")
print(f"Data Directory: {data_dir}")
print(f"Models Directory: {models_dir}")
print(f"Logs Directory: {logs_dir}")
