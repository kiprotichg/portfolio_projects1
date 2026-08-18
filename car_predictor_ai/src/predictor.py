"""
Prediction module for making predictions on new car data
"""

import numpy as np # type: ignore
import pandas as pd # type: ignore
from preprocessing import DataPreprocessor
from model_training import ModelTrainer


class CarPricePredictor:
    """Main predictor class for car price prediction"""
    
    def __init__(self, model_path, preprocessor_path):
        """
        Initialize predictor with trained model and preprocessor
        
        Parameters:
        -----------
        model_path : str
            Path to saved model
        preprocessor_path : str
            Path to saved preprocessor
        """
        self.trainer = ModelTrainer.load_model(model_path)
        self.preprocessor = DataPreprocessor.load(preprocessor_path)
        self.model = self.trainer.best_model
    
    def predict_single(self, car_data):
        """
        Predict price for a single car
        
        Parameters:
        -----------
        car_data : dict
            Dictionary with car features
            Example:
            {
                'brand': 'Toyota',
                'model_year': 2020,
                'mileage': 50000,
                'fuel_type': 'Hybrid',
                'transmission': 'Automatic',
                'engine_size': 2.5,
                'horsepower': 200,
                'body_type': 'Sedan',
                'color': 'Black',
                'num_cylinders': 4,
                'fuel_efficiency': 35.0,
                'mileage_category': 'Low',
                'owner_count': 1,
                'is_accident_free': 1,
                'has_service_history': 1
            }
            
        Returns:
        --------
        dict
            Prediction with predicted price and confidence metrics
        """
        # Transform input data
        X = self.preprocessor.transform_single(car_data)
        
        # Make prediction
        prediction = self.model.predict(X.reshape(1, -1))[0]
        
        # Calculate confidence (from prediction variance if available)
        return {
            'predicted_price': max(0, prediction),
            'model_used': self.trainer.best_model_name,
            'input_data': car_data
        }
    
    def predict_batch(self, car_data_list):
        """
        Predict prices for multiple cars
        
        Parameters:
        -----------
        car_data_list : list
            List of dictionaries with car features
            
        Returns:
        --------
        pd.DataFrame
            DataFrame with predictions
        """
        predictions = []
        
        for car_data in car_data_list:
            result = self.predict_single(car_data)
            result['index'] = len(predictions)
            predictions.append(result)
        
        return pd.DataFrame(predictions)
    
    def get_price_range(self, car_data, std_dev=1):
        """
        Get price prediction range with confidence interval
        
        Parameters:
        -----------
        car_data : dict
            Dictionary with car features
        std_dev : float
            Standard deviations for confidence interval
            
        Returns:
        --------
        dict
            Price estimate with range
        """
        prediction = self.predict_single(car_data)
        predicted_price = prediction['predicted_price']
        
        # Estimate uncertainty (typically 10-15% of price for tree-based models)
        uncertainty = predicted_price * 0.12
        
        return {
            'predicted_price': predicted_price,
            'lower_bound': max(0, predicted_price - (std_dev * uncertainty)),
            'upper_bound': predicted_price + (std_dev * uncertainty),
            'confidence_interval': f"${max(0, predicted_price - (std_dev * uncertainty)):,.2f} - ${predicted_price + (std_dev * uncertainty):,.2f}",
            'model_used': self.trainer.best_model_name
        }
    
    def compare_with_market(self, car_data, market_price):
        """
        Compare predicted price with market price
        
        Parameters:
        -----------
        car_data : dict
            Dictionary with car features
        market_price : float
            Actual market price
            
        Returns:
        --------
        dict
            Comparison metrics
        """
        prediction = self.predict_single(car_data)
        predicted_price = prediction['predicted_price']
        difference = market_price - predicted_price
        percentage_diff = (difference / predicted_price) * 100
        
        return {
            'predicted_price': predicted_price,
            'market_price': market_price,
            'difference': difference,
            'percentage_difference': percentage_diff,
            'recommendation': 'OVERPRICED' if percentage_diff > 5 else 'UNDERPRICED' if percentage_diff < -5 else 'FAIRLY PRICED',
            'model_used': self.trainer.best_model_name
        }


class PredictionAnalyzer:
    """Analyze predictions and provide insights"""
    
    @staticmethod
    def analyze_predictions(predictions_df):
        """
        Analyze multiple predictions
        
        Parameters:
        -----------
        predictions_df : pd.DataFrame
            DataFrame with predictions
            
        Returns:
        --------
        dict
            Summary statistics and insights
        """
        analysis = {
            'total_predictions': len(predictions_df),
            'average_price': predictions_df['predicted_price'].mean(),
            'median_price': predictions_df['predicted_price'].median(),
            'price_std': predictions_df['predicted_price'].std(),
            'price_min': predictions_df['predicted_price'].min(),
            'price_max': predictions_df['predicted_price'].max(),
        }
        
        return analysis
    
    @staticmethod
    def get_price_by_feature(predictions_df, feature_column):
        """
        Analyze average price by feature
        
        Parameters:
        -----------
        predictions_df : pd.DataFrame
            DataFrame with predictions
        feature_column : str
            Feature to group by
            
        Returns:
        --------
        pd.DataFrame
            Average prices by feature
        """
        if 'input_data' in predictions_df.columns:
            # Extract feature values from input_data column
            feature_values = predictions_df['input_data'].apply(lambda x: x.get(feature_column))
            grouped = pd.DataFrame({
                feature_column: feature_values,
                'predicted_price': predictions_df['predicted_price']
            })
            
            return grouped.groupby(feature_column)['predicted_price'].agg(['mean', 'count']).sort_values('mean', ascending=False)
        
        return None
