"""
System verification and testing script
Run this to verify the installation
"""

import sys
import os

def check_python_version():
    """Check Python version"""
    print("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✓ Python {version.major}.{version.minor}.{version.micro} - OK\n")
        return True
    else:
        print(f"✗ Python {version.major}.{version.minor} - REQUIRES 3.8+\n")
        return False


def check_dependencies():
    """Check all required dependencies"""
    print("Checking dependencies...")
    
    dependencies = {
        'pandas': '2.0.3',
        'numpy': '1.24.3',
        'sklearn': '1.3.0 (scikit-learn)',
        'xgboost': '2.0.0',
        'lightgbm': '4.0.0',
        'matplotlib': '3.7.2',
        'seaborn': '0.12.2',
        'flask': '2.3.3',
        'joblib': '1.3.1',
    }
    
    all_ok = True
    for package, version in dependencies.items():
        try:
            if package == 'sklearn':
                __import__('sklearn')
            else:
                __import__(package)
            print(f"✓ {package} {version}")
        except ImportError:
            print(f"✗ {package} NOT INSTALLED")
            all_ok = False
    
    print()
    return all_ok


def check_directory_structure():
    """Check if directory structure exists or can be created"""
    print("Checking project structure...")
    
    required_dirs = [
        'src',
        'data',
    ]
    
    all_ok = True
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"✓ {dir_name}/ exists")
        else:
            print(f"⚠ {dir_name}/ not found (will be created)")
    
    print()
    return True


def check_source_files():
    """Check if all source files exist"""
    print("Checking source files...")
    
    required_files = {
        'train.py': 'Training pipeline',
        'predict.py': 'Interactive predictions',
        'app.py': 'REST API server',
        'setup.py': 'Project setup',
        'config.py': 'Configuration',
        'requirements.txt': 'Dependencies',
        'src/data_generator.py': 'Data generation',
        'src/preprocessing.py': 'Data preprocessing',
        'src/model_training.py': 'Model training',
        'src/predictor.py': 'Prediction engine',
        'src/visualization.py': 'Visualizations',
    }
    
    all_ok = True
    for file_path, description in required_files.items():
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✓ {file_path} ({size} bytes) - {description}")
        else:
            print(f"✗ {file_path} NOT FOUND")
            all_ok = False
    
    print()
    return all_ok


def check_documentation():
    """Check if documentation files exist"""
    print("Checking documentation...")
    
    docs = {
        'README.md': 'Full documentation',
        'QUICKSTART.md': 'Quick start guide',
        'INSTALLATION.md': 'Installation guide',
        'API.md': 'API reference',
        'SUMMARY.md': 'Project summary',
        'INDEX.md': 'Project index',
    }
    
    all_ok = True
    for file_name, description in docs.items():
        if os.path.exists(file_name):
            print(f"✓ {file_name} - {description}")
        else:
            print(f"⚠ {file_name} - {description} (MISSING)")
    
    print()
    return True


def test_imports():
    """Test if all modules can be imported"""
    print("Testing module imports...")
    
    try:
        sys.path.insert(0, 'src')
        
        from data_generator import CarDataGenerator, load_or_generate_data # type: ignore
        print("✓ data_generator module")
        
        from preprocessing import DataPreprocessor, FeatureEngineer # type: ignore
        print("✓ preprocessing module")
        
        from model_training import ModelTrainer, evaluate_models # type: ignore
        print("✓ model_training module")
        
        from predictor import CarPricePredictor, PredictionAnalyzer # type: ignore
        print("✓ predictor module")
        
        from visualization import ModelVisualizer, create_summary_report # type: ignore
        print("✓ visualization module")
        
        print("\n✓ All modules import successfully!\n")
        return True
        
    except Exception as e:
        print(f"\n✗ Import error: {str(e)}\n")
        return False


def test_data_generation():
    """Test if data can be generated"""
    print("Testing data generation...")
    
    try:
        sys.path.insert(0, 'src')
        from data_generator import CarDataGenerator # type: ignore
        
        print("Generating 10 sample cars...")
        df = CarDataGenerator.generate_dataset(num_samples=10)
        
        print(f"✓ Generated {len(df)} samples")
        print(f"✓ Columns: {len(df.columns)}")
        print(f"✓ Price range: ${df['price'].min():,.0f} - ${df['price'].max():,.0f}")
        print(f"✓ Average price: ${df['price'].mean():,.0f}\n")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Data generation error: {str(e)}\n")
        return False


def main():
    """Run all checks"""
    print("\n" + "="*80)
    print("CAR PRICE PREDICTION SYSTEM - INSTALLATION VERIFICATION")
    print("="*80 + "\n")
    
    results = {
        'Python Version': check_python_version(),
        'Dependencies': check_dependencies(),
        'Directory Structure': check_directory_structure(),
        'Source Files': check_source_files(),
        'Documentation': check_documentation(),
        'Module Imports': test_imports(),
        'Data Generation': test_data_generation(),
    }
    
    print("="*80)
    print("VERIFICATION SUMMARY")
    print("="*80 + "\n")
    
    all_ok = True
    for check_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {check_name}")
        if not result:
            all_ok = False
    
    print("\n" + "="*80)
    
    if all_ok:
        print("✓ ALL CHECKS PASSED - SYSTEM READY!")
        print("\nNext steps:")
        print("1. Read QUICKSTART.md")
        print("2. Run: python train.py")
        print("3. Run: python predict.py")
        print("="*80 + "\n")
        return 0
    else:
        print("✗ SOME CHECKS FAILED - SEE ABOVE FOR DETAILS")
        print("\nPlease fix the issues and try again.")
        print("See INSTALLATION.md for help.")
        print("="*80 + "\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
