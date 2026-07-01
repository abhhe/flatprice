import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def train():
    # Load dataset
    df = pd.read_excel("House_Prices_Missing_Data.xlsx")
    
    # Store column means for feature defaults and imputation
    means = {}
    for col in df.columns:
        mean_val = float(df[col].mean())
        means[col] = mean_val
        df[col] = df[col].fillna(mean_val)
        
    # Features and Target
    X = df.iloc[:, 0:5]
    y = df.iloc[:, -1]
    
    feature_names = list(X.columns)
    
    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=2
    )
    
    # Create and train model
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    
    # Predict on test data
    y_pred = lr.predict(X_test)
    
    # Evaluate model
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    print("=== Model Metrics ===")
    print(f"MAE : {mae:.4f}")
    print(f"MSE : {mse:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R2 Score: {r2:.4f}")
    
    print("\n=== Model Parameters ===")
    print(f"Intercept: {lr.intercept_:.6f}")
    for col, coef in zip(feature_names, lr.coef_):
        print(f"Coefficient for {col}: {coef:.6f}")
        
    # Save parameters to JSON
    model_data = {
        "features": feature_names,
        "means": means,
        "intercept": float(lr.intercept_),
        "coefficients": [float(c) for c in lr.coef_],
        "metrics": {
            "mae": float(mae),
            "mse": float(mse),
            "rmse": float(rmse),
            "r2": float(r2)
        }
    }
    
    with open("model_assets.json", "w") as f:
        json.dump(model_data, f, indent=4)
        
    print("\nSuccessfully saved parameters to 'model_assets.json'")

if __name__ == "__main__":
    train()
