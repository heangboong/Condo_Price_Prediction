# src/preprocessor.py
import pandas as pd

def get_input_dataframe(area, bedroom, khan, sangkat):
    """
    Takes UI inputs and formats them into a DataFrame. 
    The Pipeline handles the 'encoding' (turning words into numbers) 
    internally, so we don't need to do it here.
    """
    data = {
        'area': [float(area)],
        'bedroom': [float(bedroom)],
        'khan': [str(khan)],
        'sangkat': [str(sangkat)]
    }
    return pd.DataFrame(data)