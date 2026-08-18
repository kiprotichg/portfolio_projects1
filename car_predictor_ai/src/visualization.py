"""
Visualization module for model analysis and predictions
"""

import matplotlib.pyplot as plt # type: ignore
import seaborn as sns # type: ignore
import pandas as pd # type: ignore
import numpy as np # type: ignore
from pathlib import Path

sns.set_style("darkgrid")
plt.rcParams['figure.figsize'] = (14, 8)


class ModelVisualizer:
    """Create visualizations for model analysis"""
    
    def __init__(self, output_dir='visualizations'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def plot_model_comparison(self, results_dict):
        """Plot comparison of all models"""
        models_data = []
        
        for model_name, result in results_dict.items():
            if result['status'] == 'Success':
                models_data.append({
                    'Model': model_name,
                    'Test RMSE': result['test_rmse'],
                    'Test R²': result['test_r2']
                })
        
        df = pd.DataFrame(models_data)
        
        fig, axes = plt.subplots(1, 2, figsize=(15, 5))
        
        # RMSE comparison
        ax1 = axes[0]
        colors = ['#2ecc71' if x == df['Test RMSE'].min() else '#3498db' for x in df['Test RMSE']]
        ax1.barh(df['Model'], df['Test RMSE'], color=colors)
        ax1.set_xlabel('Test RMSE ($)', fontsize=12, fontweight='bold')
        ax1.set_title('Model Comparison: Test RMSE', fontsize=14, fontweight='bold')
        ax1.grid(axis='x', alpha=0.3)
        
        # R² comparison
        ax2 = axes[1]
        colors = ['#2ecc71' if x == df['Test R²'].max() else '#3498db' for x in df['Test R²']]
        ax2.barh(df['Model'], df['Test R²'], color=colors)
        ax2.set_xlabel('Test R²', fontsize=12, fontweight='bold')
        ax2.set_title('Model Comparison: Test R²', fontsize=14, fontweight='bold')
        ax2.set_xlim([0, 1])
        ax2.grid(axis='x', alpha=0.3)
        
        plt.tight_layout()
        filepath = self.output_dir / 'model_comparison.png'
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def plot_feature_importance(self, feature_importance_df):
        """Plot feature importance"""
        top_features = feature_importance_df.head(15)
        
        fig, ax = plt.subplots(figsize=(12, 8))
        
        colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(top_features)))
        bars = ax.barh(top_features['feature'], top_features['importance'], color=colors)
        
        ax.set_xlabel('Importance Score', fontsize=12, fontweight='bold')
        ax.set_title('Top 15 Feature Importance for Car Price Prediction', fontsize=14, fontweight='bold')
        ax.invert_yaxis()
        ax.grid(axis='x', alpha=0.3)
        
        # Add value labels
        for i, bar in enumerate(bars):
            width = bar.get_width()
            ax.text(width, bar.get_y() + bar.get_height()/2, f'{width:.4f}', 
                   ha='left', va='center', fontsize=10)
        
        plt.tight_layout()
        filepath = self.output_dir / 'feature_importance.png'
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def plot_predictions_vs_actual(self, y_actual, y_predicted):
        """Plot predicted vs actual prices"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        ax.scatter(y_actual, y_predicted, alpha=0.5, s=30, edgecolors='k', linewidth=0.5)
        
        # Add perfect prediction line
        min_val = min(y_actual.min(), y_predicted.min())
        max_val = max(y_actual.max(), y_predicted.max())
        ax.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Perfect Prediction')
        
        ax.set_xlabel('Actual Price ($)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Predicted Price ($)', fontsize=12, fontweight='bold')
        ax.set_title('Predicted vs Actual Car Prices', fontsize=14, fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        filepath = self.output_dir / 'predictions_vs_actual.png'
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def plot_residuals(self, y_actual, y_predicted):
        """Plot residuals analysis"""
        residuals = y_actual - y_predicted
        
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        
        # Residuals vs Predicted
        ax1 = axes[0, 0]
        ax1.scatter(y_predicted, residuals, alpha=0.5, s=30, edgecolors='k', linewidth=0.5)
        ax1.axhline(y=0, color='r', linestyle='--', lw=2)
        ax1.set_xlabel('Predicted Price ($)', fontsize=11, fontweight='bold')
        ax1.set_ylabel('Residuals ($)', fontsize=11, fontweight='bold')
        ax1.set_title('Residuals vs Predicted Values', fontsize=12, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        
        # Residuals distribution
        ax2 = axes[0, 1]
        ax2.hist(residuals, bins=30, edgecolor='black', color='#3498db', alpha=0.7)
        ax2.set_xlabel('Residuals ($)', fontsize=11, fontweight='bold')
        ax2.set_ylabel('Frequency', fontsize=11, fontweight='bold')
        ax2.set_title('Distribution of Residuals', fontsize=12, fontweight='bold')
        ax2.grid(True, alpha=0.3, axis='y')
        
        # Q-Q plot
        from scipy import stats # type: ignore
        ax3 = axes[1, 0]
        stats.probplot(residuals, dist="norm", plot=ax3)
        ax3.set_title('Q-Q Plot', fontsize=12, fontweight='bold')
        ax3.grid(True, alpha=0.3)
        
        # Absolute residuals
        ax4 = axes[1, 1]
        abs_residuals = np.abs(residuals)
        ax4.scatter(y_predicted, abs_residuals, alpha=0.5, s=30, edgecolors='k', linewidth=0.5)
        ax4.set_xlabel('Predicted Price ($)', fontsize=11, fontweight='bold')
        ax4.set_ylabel('Absolute Residuals ($)', fontsize=11, fontweight='bold')
        ax4.set_title('Absolute Residuals vs Predicted Values', fontsize=12, fontweight='bold')
        ax4.grid(True, alpha=0.3)
        
        plt.tight_layout()
        filepath = self.output_dir / 'residuals_analysis.png'
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def plot_price_distribution_by_brand(self, df):
        """Plot price distribution by brand"""
        fig, ax = plt.subplots(figsize=(14, 8))
        
        # Top 10 brands by average price
        top_brands = df.groupby('brand')['price'].mean().sort_values(ascending=False).head(10).index
        df_top = df[df['brand'].isin(top_brands)]
        
        sns.boxplot(data=df_top, x='brand', y='price', ax=ax, palette='Set2')
        ax.set_xlabel('Brand', fontsize=12, fontweight='bold')
        ax.set_ylabel('Price ($)', fontsize=12, fontweight='bold')
        ax.set_title('Price Distribution by Top 10 Brands', fontsize=14, fontweight='bold')
        plt.xticks(rotation=45, ha='right')
        ax.grid(True, alpha=0.3, axis='y')
        
        plt.tight_layout()
        filepath = self.output_dir / 'price_by_brand.png'
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def plot_price_distribution_by_fuel_type(self, df):
        """Plot price distribution by fuel type"""
        fig, ax = plt.subplots(figsize=(12, 6))
        
        sns.boxplot(data=df, x='fuel_type', y='price', ax=ax, palette='Set1')
        ax.set_xlabel('Fuel Type', fontsize=12, fontweight='bold')
        ax.set_ylabel('Price ($)', fontsize=12, fontweight='bold')
        ax.set_title('Price Distribution by Fuel Type', fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3, axis='y')
        
        plt.tight_layout()
        filepath = self.output_dir / 'price_by_fuel_type.png'
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def create_all_visualizations(self, df, results_dict, y_actual, y_predicted, feature_importance_df):
        """Create all visualizations"""
        print("\nGenerating visualizations...")
        
        filepaths = {
            'model_comparison': self.plot_model_comparison(results_dict),
            'feature_importance': self.plot_feature_importance(feature_importance_df),
            'predictions_vs_actual': self.plot_predictions_vs_actual(y_actual, y_predicted),
            'residuals_analysis': self.plot_residuals(y_actual, y_predicted),
            'price_by_brand': self.plot_price_distribution_by_brand(df),
            'price_by_fuel_type': self.plot_price_distribution_by_fuel_type(df)
        }
        
        print(f"✓ Visualizations saved to {self.output_dir}")
        for name, path in filepaths.items():
            print(f"  - {name}: {path}")
        
        return filepaths


def create_summary_report(trainer, df, results_dict, feature_importance_df):
    """Create a text summary report"""
    report = f"""
{'='*80}
CAR PRICE PREDICTION MODEL - SUMMARY REPORT
{'='*80}

1. DATASET INFORMATION
   - Total Samples: {len(df):,}
   - Number of Brands: {df['brand'].nunique()}
   - Price Range: ${df['price'].min():,.2f} - ${df['price'].max():,.2f}
   - Average Price: ${df['price'].mean():,.2f}
   - Price Std Dev: ${df['price'].std():,.2f}

2. BEST MODEL
   - Model Name: {trainer.best_model_name}
   - Algorithm Type: Tree-based Ensemble

3. TOP 5 FEATURES BY IMPORTANCE
"""
    
    for idx, row in feature_importance_df.head(5).iterrows():
        report += f"   {idx+1}. {row['feature']}: {row['importance']:.4f}\n"
    
    report += f"\n4. MODEL PERFORMANCE\n"
    for model_name, result in results_dict.items():
        if result['status'] == 'Success':
            report += f"   {model_name}:\n"
            report += f"     - Test RMSE: ${result['test_rmse']:,.2f}\n"
            report += f"     - Test MAE: ${result['test_mae']:,.2f}\n"
            report += f"     - Test R²: {result['test_r2']:.4f}\n\n"
    
    report += f"{'='*80}\n"
    
    return report
