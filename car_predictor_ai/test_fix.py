#!/usr/bin/env python
"""Quick test script to verify fixes"""
import sys
sys.path.insert(0, 'src')

try:
    from data_generator import CarDataGenerator
    print('Testing data generation...')
    df = CarDataGenerator.generate_dataset(num_samples=5)
    print('✓ Generated', len(df), 'samples')
    print('✓ Columns:', len(df.columns))
    print('✓ Price range: $' + str(int(df['price'].min())) + ' - $' + str(int(df['price'].max())))
    print('✓ Data generation works correctly!')
except Exception as e:
    print('✗ Error:', str(e))
    import traceback
    traceback.print_exc()
