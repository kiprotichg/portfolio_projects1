"""
Model training and evaluation module
Trains multiple models and compares their performance
"""

import numpy as np # type: ignore
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor # type: ignore
from sklearn.linear_model import LinearRegression, Ridge, Lasso # type: ignore
from sklearn.svm import SVR # type: ignore
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score # type: ignore
import xgboost as xgb # type: ignore
import lightgbm as lgb # type: ignore
import joblib # type: ignore
import os
from datetime import datetime


class ModelTrainer:
    """Train and manage multiple regression models"""
    
    def __init__(self):
        self.models = {}
        self.best_model = None
        self.best_model_name = None
        self.training_history = []
    
    def create_models(self):
        """
        Create dictionary of models to train
        
        Returns:
        --------
        dict
            Dictionary with model name as key and model instance as value
        """
        models = {
            'Linear Regression': LinearRegression(),
            'Ridge Regression': Ridge(alpha=1.0),
            'Lasso Regression': Lasso(alpha=1.0),
            'Random Forest': RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            ),
            'Gradient Boosting': GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            ),
            'XGBoost': xgb.XGBRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                min_child_weight=1,
                random_state=42,
                verbosity=0
            ),
            'LightGBM': lgb.LGBMRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                num_leaves=31,
                random_state=42,
                verbose=-1
            ),
            'SVR': SVR(kernel='rbf', C=100, epsilon=0.1)
        }
        
        return models
    
    def train_models(self, X_train, y_train, X_test, y_test):
        """
        Train all models and evaluate their performance
        
        Parameters:
        -----------
        X_train : np.ndarray or pd.DataFrame
            Training features
        y_train : np.ndarray or pd.Series
            Training target values
        X_test : np.ndarray or pd.DataFrame
            Test features
        y_test : np.ndarray or pd.Series
            Test target values
            
        Returns:
        --------
        dict
            Dictionary with model names and their performance metrics
        """
        models = self.create_models()
        results = {}
        
        print("\n" + "="*80)
        print("TRAINING AND EVALUATING MODELS")
        print("="*80 + "\n")
        
        for model_name, model in models.items():
            print(f"Training {model_name}...")
            
            try:
                # Train model
                model.fit(X_train, y_train)
                
                # Make predictions
                y_pred_train = model.predict(X_train)
                y_pred_test = model.predict(X_test)
                
                # Calculate metrics
                train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
                test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
                train_mae = mean_absolute_error(y_train, y_pred_train)
                test_mae = mean_absolute_error(y_test, y_pred_test)
                train_r2 = r2_score(y_train, y_pred_train)
                test_r2 = r2_score(y_test, y_pred_test)
                
                # Store results
                results[model_name] = {
                    'model': model,
                    'train_rmse': train_rmse,
                    'test_rmse': test_rmse,
                    'train_mae': train_mae,
                    'test_mae': test_mae,
                    'train_r2': train_r2,
                    'test_r2': test_r2,
                    'status': 'Success'
                }
                
                self.models[model_name] = model
                
                # Print metrics
                print(f"  ✓ {model_name} trained successfully")
                print(f"    Train RMSE: ${train_rmse:,.2f} | Test RMSE: ${test_rmse:,.2f}")
                print(f"    Train R²: {train_r2:.4f} | Test R²: {test_r2:.4f}\n")
                
            except Exception as e:
                print(f"  ✗ Error training {model_name}: {str(e)}\n")
                results[model_name] = {'status': 'Failed', 'error': str(e)}
        
        # Select best model based on test R²
        best_r2 = -np.inf
        for model_name, result in results.items():
            if result['status'] == 'Success' and result['test_r2'] > best_r2:
                best_r2 = result['test_r2']
                self.best_model_name = model_name
                self.best_model = result['model']
        
        print("="*80)
        print(f"BEST MODEL: {self.best_model_name} (R² = {best_r2:.4f})")
        print("="*80 + "\n")
        
        return results
    
    def get_feature_importance(self, feature_names):
        """
        Get feature importance from tree-based models
        
        Parameters:
        -----------
        feature_names : list
            List of feature names
            
        Returns:
        --------
        pd.DataFrame
            Features sorted by importance
        """
        if self.best_model is None:
            return None
        
        model = self.best_model
        
        # Check if model has feature importance
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        else:
            return None
        
        # Create dataframe
        feature_importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importances
        }).sort_values('importance', ascending=False)
        
        return feature_importance_df
    
    def save_model(self, model_path, preprocessor_path=None):
        """Save trained model and preprocessor"""
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        model_data = {
            'model': self.best_model,
            'model_name': self.best_model_name,
            'training_date': datetime.now().isoformat(),
            'all_models': self.models
        }
        
        joblib.dump(model_data, model_path)
        print(f"Model saved to {model_path}")
    
    @staticmethod
    def load_model(model_path):
        """Load trained model"""
        model_data = joblib.load(model_path)
        trainer = ModelTrainer()
        trainer.best_model = model_data['model']
        trainer.best_model_name = model_data['model_name']
        trainer.models = model_data.get('all_models', {})
        return trainer


def evaluate_models(results_dict):
    """
    Create evaluation summary
    
    Parameters:
    -----------
    results_dict : dict
        Dictionary with model results
        
    Returns:
    --------
    pd.DataFrame
        Evaluation metrics summary
    """
    eval_data = []
    
    for model_name, result in results_dict.items():
        if result['status'] == 'Success':
            eval_data.append({
                'Model': model_name,
                'Train RMSE': result['train_rmse'],
                'Test RMSE': result['test_rmse'],
                'Train MAE': result['train_mae'],
                'Test MAE': result['test_mae'],
                'Train R²': result['train_r2'],
                'Test R²': result['test_r2']
            })
    
    df_eval = pd.DataFrame(eval_data).sort_values('Test R²', ascending=False)
    return df_eval
