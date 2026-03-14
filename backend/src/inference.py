# src/inference.py

def predict(input_df, model):
    result = model.predict(input_df)
    return float(result[0])

