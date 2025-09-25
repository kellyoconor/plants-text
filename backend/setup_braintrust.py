#!/usr/bin/env python3
"""
Setup script for Braintrust integration with Plant Texts
Run this script to initialize prompts and evaluation datasets
"""
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.evaluation_scripts import setup_braintrust, run_evaluation, test_personalities


def main():
    print("🧠 Setting up Braintrust for Plant Texts")
    print("=" * 50)
    
    # Check if Braintrust API key is set
    if not os.getenv('BRAINTRUST_API_KEY'):
        print("⚠️  BRAINTRUST_API_KEY environment variable not set!")
        print("Please set your Braintrust API key:")
        print("export BRAINTRUST_API_KEY=your_api_key_here")
        print("\nYou can get your API key from: https://www.braintrust.dev/app/settings")
        return
    
    try:
        # Setup Braintrust assets
        print("1. Setting up Braintrust prompts and datasets...")
        setup_braintrust()
        
        print("\n2. Running initial evaluation...")
        result = run_evaluation()
        
        if result:
            print("\n3. Testing all personality types...")
            test_personalities()
            
            print("\n✅ Braintrust setup complete!")
            print("\n🎯 Next steps:")
            print("- Visit https://www.braintrust.dev to view your evaluation results")
            print("- Use the Braintrust UI to iterate on prompts")
            print("- Run evaluations regularly to monitor personality quality")
        else:
            print("\n⚠️  Initial evaluation failed - check your setup")
    
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        print("Make sure you have:")
        print("1. Installed braintrust: pip install braintrust")
        print("2. Set BRAINTRUST_API_KEY environment variable")
        print("3. Valid OpenAI API key in your .env file")


if __name__ == "__main__":
    main()
