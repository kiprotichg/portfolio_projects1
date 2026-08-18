"""
Main training pipeline - orchestrates the entire workflow
"""

import sys
from pathlib import Path
import pandas as pd # type: ignore

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from data_generator import load_or_generate_data # type: ignore
from preprocessing import DataPreprocessor, FeatureEngineer, get_data_statistics # type: ignore
from model_training import ModelTrainer, evaluate_models # type: ignore
from visualization import ModelVisualizer, create_summary_report # type: ignore
from predictor import CarPricePredictor # type: ignore


def main():
    """Main training pipeline"""
    
    print("\n" + "="*80)
    print("CAR PRICE PREDICTION AI SYSTEM - TRAINING PIPELINE")
    print("="*80 + "\n")
    
    # 1. Load or generate data
    print("Step 1: Loading/Generating Data")
    print("-" * 80)
    df = load_or_generate_data('data/car_data.csv', num_samples=2000)
    print(f"✓ Dataset loaded with shape: {df.shape}\n")
    
    # Display dataset statistics
    stats = get_data_statistics(df)
    print(f"Dataset Statistics:")
    print(f"  - Total Samples: {stats['total_samples']:,}")
    print(f"  - Price Range: ${stats['price_min']:,.2f} - ${stats['price_max']:,.2f}")
    print(f"  - Average Price: ${stats['price_mean']:,.2f}")
    print(f"  - Number of Brands: {stats['brands_count']}\n")
    
    # 2. Feature Engineering
    print("Step 2: Feature Engineering")
    print("-" * 80)
    df = FeatureEngineer.create_features(df)
    print(f"✓ Created engineered features\n")
    
    # 3. Data Preprocessing
    print("Step 3: Data Preprocessing")
    print("-" * 80)
    preprocessor = DataPreprocessor()
    X_train, X_test, y_train, y_test, feature_names = preprocessor.preprocess(
        df, target_column='price', is_training=True, test_size=0.2
    )
    
    print(f"✓ Data preprocessing completed")
    print(f"  - Training set: {X_train.shape}")
    print(f"  - Test set: {X_test.shape}")
    print(f"  - Number of features: {len(feature_names)}\n")
    
    # 4. Train Models
    print("Step 4: Training Models")
    print("-" * 80)
    trainer = ModelTrainer()
    results = trainer.train_models(X_train, y_train, X_test, y_test)
    
    # 5. Model Evaluation
    print("\nStep 5: Model Evaluation Summary")
    print("-" * 80)
    eval_df = evaluate_models(results)
    print(eval_df.to_string(index=False))
    print()
    
    # 6. Get Feature Importance
    print("Step 6: Feature Importance Analysis")
    print("-" * 80)
    feature_importance_df = trainer.get_feature_importance(feature_names)
    if feature_importance_df is not None:
        print("Top 10 Most Important Features:")
        print(feature_importance_df.head(10).to_string())
        print()
    
    # 7. Create Visualizations
    print("Step 7: Creating Visualizations")
    print("-" * 80)
    visualizer = ModelVisualizer('visualizations')
    y_pred_test = trainer.best_model.predict(X_test)
    filepaths = visualizer.create_all_visualizations(
        df, results, y_test, y_pred_test, feature_importance_df
    )
    print()
    
    # 8. Save Model and Preprocessor
    print("Step 8: Saving Models")
    print("-" * 80)
    trainer.save_model('models/car_price_model.pkl')
    preprocessor.save('models/preprocessor.pkl')
    print(f"✓ Model and preprocessor saved\n")
    
    # 9. Create Summary Report
    print("Step 9: Generating Report")
    print("-" * 80)
    report = create_summary_report(trainer, df, results, feature_importance_df)
    print(report)
    
    # Save report to file
    with open('models/training_report.txt', 'w') as f:
        f.write(report)
    print(f"✓ Report saved to models/training_report.txt\n")
    
    # 10. Test Predictions
    print("Step 10: Testing Predictions")
    print("-" * 80)
    predictor = CarPricePredictor('models/car_price_model.pkl', 'models/preprocessor.pkl')
    
    # Test with example car
    test_car = {
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
    
    prediction = predictor.predict_single(test_car)
    price_range = predictor.get_price_range(test_car)
    
    print(f"Test Car: {test_car['model_year']} {test_car['brand']} {test_car['body_type']}")
    print(f"Predicted Price: ${prediction['predicted_price']:,.2f}")
    print(f"Price Range (68% confidence): {price_range['confidence_interval']}")
    print(f"Model Used: {prediction['model_used']}\n")
    
    print("="*80)
    print("✓ TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print("="*80 + "\n")
    
    return {
        'trainer': trainer,
        'preprocessor': preprocessor,
        'predictor': predictor,
        'results': results,
        'df': df
    }


if __name__ == "__main__":
    pipeline_results = main()
