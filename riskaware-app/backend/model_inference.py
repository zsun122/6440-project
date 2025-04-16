import pandas as pd
import numpy as np
import pickle
import requests
import json
from datetime import datetime, date

cvd_model = pickle.load(open('cvd_model.pkl', 'rb'))
cancer_model = pickle.load(open('cancer_model.pkl', 'rb'))
stroke_model = pickle.load(open('stroke_model.pkl', 'rb'))
diabetes_model = pickle.load(open('diabetes_model.pkl', 'rb'))

# Calculating age
def calculate_age(birthdate, encounter_date):
    birthday = datetime.strptime(birthdate, '%Y-%m-%d')
    today = datetime.strptime(encounter_date, '%Y-%m-%dT%H:%M:%S%z')
    return int(today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day)))

# Get model features
# Input: Patient ID
# Output: Pandas dataframe of all observations and encounters
def get_data(patient_id):
    url = "http://127.0.0.1:5000"
    synthea_params = {"user_id": f"{patient_id}"}

    synthea_res = requests.get(url + "/synthea_user_data", synthea_params)

    encounters_df = pd.DataFrame(synthea_res.json()['encounters'])
    patients_df = pd.DataFrame(synthea_res.json()['patient']).rename(columns={'Id': 'Patient_Id'})
    patients_df['Sex'] = np.where(patients_df['GENDER'] == 'M', 1, 0)
    observations_df = pd.DataFrame(synthea_res.json()['observations']).rename(columns={'DESCRIPTION': 'Observation_Desc'})
    observations_df = observations_df[observations_df['CATEGORY'] == 'ml']
    
    join_1_df = patients_df.merge(encounters_df, how='left', left_on='Patient_Id', right_on='PATIENT')
    join_2_df = join_1_df.merge(observations_df, how='right', left_on='Id', right_on='ENCOUNTER')

    join_2_df['Age'] = join_2_df.apply(lambda x: calculate_age(x['BIRTHDATE'], x['START']), axis=1)
    
    return join_2_df

# Get probabilities of heart disease at each encounter for a patient
# Input: Patient ID
# Output: Python dict of encounter date and probability
def heart_disease(patient_id):
    df = get_data(patient_id)
    res = {}

    encounter_ids = df['ENCOUNTER'].unique()


    for id in encounter_ids:
        features = []

        encounter = df[df['ENCOUNTER'] == id]
        encounter_date = datetime.strptime(encounter['START'].iloc[0], '%Y-%m-%dT%H:%M:%S%z').strftime("%Y-%m-%d")

        if float(encounter['Age'].iloc[0]) <= 2:
            continue

        features.append(float(encounter['Age'].iloc[0]))
        features.append(float(encounter['Sex'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Chest Pain Type']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Systolic Blood Pressure']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Cholesterol [Mass/volume]']['VALUE'].iloc[0]))
        features.append(int(float(encounter[encounter['Observation_Desc'] == 'Fasting Glucose']['VALUE'].iloc[0]) > 120))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Resting ECG']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Max Heart Rate Achieved']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Exercise Induced Angina']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'ST Depression']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Slope of ST Segment']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Number of Major Vessels Colored by Fluoroscopy']['VALUE'].iloc[0]))

        pred = cvd_model.predict_proba(np.array(features).reshape(1, -1))[0][1]

        res[encounter_date] = float(pred)

    return res
        
# Get probabilities of cancer at each encounter for a patient
# Input: Patient ID
# Output: Python dict of encounter date and probability
def cancer(patient_id):
    df = get_data(patient_id)
    res = {}

    encounter_ids = df['ENCOUNTER'].unique()


    for id in encounter_ids:
        features = []

        encounter = df[df['ENCOUNTER'] == id]
        encounter_date = datetime.strptime(encounter['START'].iloc[0], '%Y-%m-%dT%H:%M:%S%z').strftime("%Y-%m-%d")

        if float(encounter['Age'].iloc[0]) <= 2:
            continue

        features.append(float(encounter['Age'].iloc[0]))
        features.append(float(encounter['Sex'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Body mass index (BMI) [Ratio]']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Tobacco smoking status']['VALUE'].iloc[0]))
        features.append(float(encounter['CANCER_GENETIC_RISK'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Physical Activity']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Alcohol Intake']['VALUE'].iloc[0]))
        features.append(float(encounter['CANCER_HISTORY'].iloc[0]))

        pred = cancer_model.predict_proba(np.array(features).reshape(1, -1))[0][1]

        res[encounter_date] = float(pred)

    return res

# Get probabilities of stroke at each encounter for a patient
# Input: Patient ID
# Output: Python dict of encounter date and probability
def stroke(patient_id):
    df = get_data(patient_id)
    res = {}

    encounter_ids = df['ENCOUNTER'].unique()


    for id in encounter_ids:
        features = []

        encounter = df[df['ENCOUNTER'] == id]
        encounter_date = datetime.strptime(encounter['START'].iloc[0], '%Y-%m-%dT%H:%M:%S%z').strftime("%Y-%m-%d")

        if float(encounter['Age'].iloc[0]) <= 2:
            continue

        features.append(float(encounter['Sex'].iloc[0]))
        features.append(float(encounter['Age'].iloc[0]))
        systolic_bp = float(encounter[encounter['Observation_Desc'] == 'Systolic Blood Pressure']['VALUE'].iloc[0])
        diastolic_bp = float(encounter[encounter['Observation_Desc'] == 'Diastolic Blood Pressure']['VALUE'].iloc[0])
        features.append(int((systolic_bp >= 130) | (diastolic_bp >= 80)))
        features.append(round(heart_disease(patient_id)[encounter_date]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Fasting Glucose']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Body mass index (BMI) [Ratio]']['VALUE'].iloc[0]))

        pred = stroke_model.predict_proba(np.array(features).reshape(1, -1))[0][1]

        res[encounter_date] = float(pred)

    return res

# Get probabilities of diabetes at each encounter for a patient
# Input: Patient ID
# Output: Python dict of encounter date and probability
def diabetes(patient_id):
    df = get_data(patient_id)
    res = {}

    encounter_ids = df['ENCOUNTER'].unique()


    for id in encounter_ids:
        features = []

        encounter = df[df['ENCOUNTER'] == id]
        encounter_date = datetime.strptime(encounter['START'].iloc[0], '%Y-%m-%dT%H:%M:%S%z').strftime("%Y-%m-%d")

        if float(encounter['Age'].iloc[0]) <= 2:
            continue

        features.append(float(encounter['Sex'].iloc[0]))
        features.append(float(encounter['Age'].iloc[0]))
        systolic_bp = float(encounter[encounter['Observation_Desc'] == 'Systolic Blood Pressure']['VALUE'].iloc[0])
        diastolic_bp = float(encounter[encounter['Observation_Desc'] == 'Diastolic Blood Pressure']['VALUE'].iloc[0])
        features.append(int((systolic_bp >= 130) | (diastolic_bp >= 80)))
        features.append(round(heart_disease(patient_id)[encounter_date]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Body mass index (BMI) [Ratio]']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'HbA1c']['VALUE'].iloc[0]))
        features.append(float(encounter[encounter['Observation_Desc'] == 'Fasting Glucose']['VALUE'].iloc[0]))

        pred = diabetes_model.predict_proba(np.array(features).reshape(1, -1))[0][1]

        res[encounter_date] = float(pred)

    return res

if __name__ == '__main__':
    # Patient ID
    patient_id = "9998e1a3-3ae4-8f69-73f9-75bd6f7ea33c"

    print(heart_disease(patient_id))
    print(cancer(patient_id))
    print(stroke(patient_id))
    print(diabetes(patient_id))