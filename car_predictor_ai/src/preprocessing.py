"""
Data preprocessing and feature engineering module
Handles data cleaning, transformation, and feature preparation
"""

import pandas as pd # type: ignore
import numpy as np # type: ignore
from sklearn.preprocessing import StandardScaler, LabelEncoder # type: ignore
from sklearn.model_selection import train_test_split # type: ignore
import joblib # type: ignore
import os

class DataPreprocessor:
    """Handle data preprocessing and feature engineering"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = None
        self.categorical_features = None
        self.numerical_features = None
    
    def preprocess(self, df, target_column='price', is_training=True, test_size=0.2):
        """
        Preprocess the dataset
        
        Parameters:
        -----------
        df : pd.DataFrame
            Raw dataset
        target_column : str
            Name of the target variable
        is_training : bool
            Whether this is training data (will scale)
        test_size : float
            Test split ratio
            
        Returns:
        --------
        tuple
            X_train, X_test, y_train, y_test, feature_names
        """
        # Create a copy to avoid modifying original
        df = df.copy()
        
        # Separate features and target
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Identify feature types
        self.categorical_features = X.select_dtypes(include=['object']).columns.tolist()
        self.numerical_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        
        # Encode categorical features
        for col in self.categorical_features:
            if is_training:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                self.label_encoders[col] = le
            else:
                le = self.label_encoders[col]
                # Handle unknown categories
                X[col] = X[col].map(lambda x: le.transform([x])[0] if x in le.classes_ else -1)
        
        # Store feature columns
        self.feature_columns = X.columns.tolist()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Scale numerical features
        if is_training:
            X_train[self.numerical_features] = self.scaler.fit_transform(
                X_train[self.numerical_features]
            )
            X_test[self.numerical_features] = self.scaler.transform(
                X_test[self.numerical_features]
            )
        else:
            X_train[self.numerical_features] = self.scaler.transform(
                X_train[self.numerical_features]
            )
            X_test[self.numerical_features] = self.scaler.transform(
                X_test[self.numerical_features]
            )
        
        return X_train, X_test, y_train, y_test, self.feature_columns
    
    def transform_single(self, data_dict):
        """
        Transform a single sample for prediction
        
        Parameters:
        -----------
        data_dict : dict
            Dictionary with feature values
            
        Returns:
        --------
        np.ndarray
            Transformed feature array
        """
        df = pd.DataFrame([data_dict])
        
        # Apply feature engineering first
        df = FeatureEngineer.create_features(df)
        
        # Encode categorical features
        for col in self.categorical_features:
            if col in df.columns:
                le = self.label_encoders[col]
                if df[col].iloc[0] in le.classes_:
                    df[col] = le.transform(df[col].astype(str))
                else:
                    df[col] = -1
        
        # Scale numerical features - must use EXACT columns from training with same order
        # Ensure all numerical features exist before scaling
        for col in self.numerical_features:
            if col not in df.columns:
                df[col] = 0.0
        
        # Scale with proper column order from training
        df[self.numerical_features] = self.scaler.transform(df[self.numerical_features])
        
        # Ensure all feature columns exist (fill missing with 0)
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        # Select only the expected features in the correct order
        return df[self.feature_columns].values[0]
    
    def save(self, filepath):
        """Save preprocessor objects"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_columns': self.feature_columns,
            'categorical_features': self.categorical_features,
            'numerical_features': self.numerical_features
        }, filepath)
    
    @staticmethod
    def load(filepath):
        """Load preprocessor objects"""
        preprocessor = DataPreprocessor()
        data = joblib.load(filepath)
        preprocessor.scaler = data['scaler']
        preprocessor.label_encoders = data['label_encoders']
        preprocessor.feature_columns = data['feature_columns']
        preprocessor.categorical_features = data['categorical_features']
        preprocessor.numerical_features = data['numerical_features']
        return preprocessor


class FeatureEngineer:
    """Create and manage engineered features"""
    
    @staticmethod
    def create_features(df):
        """
        Create new features from existing ones
        
        Parameters:
        -----------
        df : pd.DataFrame
            Original dataset
            
        Returns:
        --------
        pd.DataFrame
            Dataset with engineered features
        """
        df = df.copy()
        
        # Already included in data_generator, but keeping for reference
        if 'age_years' not in df.columns and 'model_year' in df.columns:
            df['age_years'] = 2024 - df['model_year']
        
        if 'price_per_hp' not in df.columns and 'price' in df.columns and 'horsepower' in df.columns:
            df['price_per_hp'] = df['price'] / df['horsepower']
        
        if 'price_per_cc' not in df.columns and 'price' in df.columns and 'engine_size' in df.columns:
            df['price_per_cc'] = df['price'] / (df['engine_size'] * 1000)
        
        # Additional features
        if 'mileage' in df.columns and 'age_years' in df.columns:
            df['annual_mileage'] = df['mileage'] / (df['age_years'] + 1)
        
        if 'fuel_efficiency' in df.columns and 'engine_size' in df.columns:
            df['efficiency_per_cc'] = df['fuel_efficiency'] / df['engine_size']
        
        return df


def get_data_statistics(df):
    """Get comprehensive statistics about the dataset"""
    stats = {
        'total_samples': len(df),
        'price_mean': df['price'].mean(),
        'price_std': df['price'].std(),
        'price_min': df['price'].min(),
        'price_max': df['price'].max(),
        'brands_count': df['brand'].nunique(),
        'body_types': df['body_type'].unique().tolist() if 'body_type' in df.columns else [],
        'fuel_types': df['fuel_type'].unique().tolist() if 'fuel_type' in df.columns else [],
    }
    return stats
