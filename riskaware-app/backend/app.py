from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
import requests
from datetime import datetime, date
import sklearn

import model_inference

client = OpenAI(
    api_key="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", ## put api key here (found in repo readme)
    base_url="https://api.groq.com/openai/v1"
)

app = Flask(__name__)
CORS(app)

def calculate_age(birthdate, encounter_date):
    birthday = datetime.strptime(birthdate, '%Y-%m-%d')
    # today = datetime.strptime(encounter_date)
    today = datetime.strptime(encounter_date, '%Y-%m-%dT%H:%M:%S%z')
    return int(today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day)))

#firestore certificate json file name here, place file in same directory
cred = credentials.Certificate("cs6440-ca243-firebase-adminsdk-fbsvc-17837a36a9.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

conditions_ref = db.collection("sample_conditions")
drugs_ref = db.collection("sample_drugs")
measurements_ref = db.collection("sample_measurements")
notes_ref = db.collection("sample_notes")
persons_ref = db.collection("sample_persons")
procedures_ref = db.collection("sample_procedures")
visits_ref = db.collection("sample_visits")

mimic_refs = [conditions_ref, drugs_ref, measurements_ref, notes_ref, procedures_ref, visits_ref]
mimic_ref_names = ["conditions", "drugs", "measurements", "notes", "procedures", "visits"]

synthea_encounters_ref = db.collection("synthea_encounters")
synthea_observations_ref = db.collection("synthea_observations")
synthea_patients_ref = db.collection("synthea_patients")

synthea_refs = [synthea_encounters_ref, synthea_observations_ref]
synthea_ref_names = ["encounters", "observations"]

@app.route('/recommendations', methods=['POST', 'OPTIONS'])
def get_recommendations():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight OK"}), 200
    
    data = request.get_json()

    # encounter_res = requests.get("http://localhost:5000/synthea_user_data", params={"user_id": user_id})
    # if encounter_res.status_code ==200:
    #     encounter_date = encounter_res.json()["encounters"][-1]["START"]
    #     birthdate = data.get("BIRTHDATE")
    #     if birthdate and encounter_date:
    #         data["AGE"] = calculate_age(birthdate, encounter_date)

    heart = float(data.get("heart", 0))
    diabetes = float(data.get("diabetes", 0))
    stroke = float(data.get("stroke", 0))
    cancer = float(data.get("cancer", 0))
    # age = data.get("AGE")

    myprompt = (
    "You are a highly knowledgeable and practical preventive health coach"
    "Your role is to provide simple and personalized medical lifestyle tips to help patients reduce their disease risks"
    "Each disease risk is a score between 0 and 1, where higher values indicate greater risk.\n\n"

    "Patient's current disease risk scores:\n"
    f"- Cancer Risk: {cancer:.3f}/1\n"
    f"- Diabetes Risk: {diabetes:.3f}/1\n"
    f"- Heart Disease Risk: {heart:.3f}/1\n"
    f"- Stroke Risk: {stroke:.3f}/1\n\n"

    # "patient's age:"
    # f"- {age}"

    "Your task:\n"
    "- Provide exactly 4 personalized recommendations, one for each disease listed above.\n"
    "- Each recommendation must be realistic (focusing on diet, activity, habits, or routine screenings).\n"
    "- Avoid vague advice such as 'stay healthy'; be specific.\n"
    "- format each tip as a bullet point starting with a dash.\n"
    "- when having a low score (less than 0.2), you should give a positive feedback and then tips.\n"
    "- when having a high score (more than 0.8), you should give a negative feedback and then tips."
    # "- you also need to consider age"
    "- Each line must follow this example format:\n"
    "  - Cancer Risk ([0.2]/1): You have a 20% chance of having Cancer. My recommendation is drink more water.\n\n"

    "Now generate the 4 personalized recommendations for each diease based on the scores:"
)

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are a health coach AI."},
            {"role": "user", "content": myprompt}
        ]
    )

    content = response.choices[0].message.content

    tips = [line.strip() for line in content.split("\n") if line.strip().startswith("-")]

    return jsonify({"recommendations": tips}), 200

@app.route('/synthea_patient_ids', methods=['GET'])
def get_all_patient_ids():
    docs = synthea_patients_ref.stream()
    ids = []
    for doc in docs:
        docd = doc.to_dict()
        if "Id" in docd:
            ids.append(docd["Id"])
    return jsonify(ids), 200

@app.route('/synthea_patient_info', methods=['GET'])
def get_synthea_patient_info():
    user_id = request.args.get("user_id")
    if not user_id:
        return "Missing user_id", 400

    docs = synthea_patients_ref.where(filter=FieldFilter("Id", "==", user_id)).stream()
    for doc in docs:
        data = doc.to_dict()

        encounter_res = requests.get("http://localhost:5000/synthea_user_data", params={"user_id": user_id})
        if encounter_res.status_code ==200:
            encounter_date = encounter_res.json()["encounters"][-1]["START"]
            birthdate = data.get("BIRTHDATE")
            if birthdate and encounter_date:
                data["AGE"] = calculate_age(birthdate, encounter_date)

        return jsonify(data), 200

    return "Patient not found", 404

@app.route('/update_patient_info', methods=['POST'])
def update_patient_info():
    data = request.get_json()
    id = data.get("patientId")

    docs = synthea_patients_ref.where(filter=FieldFilter("Id", "==", id)).stream()
    doc = next(docs, None)

    update_data = {
        "FIRST": data.get("firstName", ""),
        "MIDDLE": data.get("middleName", ""),
        "LAST": data.get("lastName", ""),
        "BIRTHDATE": data.get("birthDate", ""),
        "GENDER": data.get("gender", ""),
        "RACE": data.get("race", ""),
        "STATE": data.get("state", ""),
        # "CANCER_GENETIC_RISK": data.get("cancerGeneticRisk", ""),
        # "CANCER_HISTORY": data.get("cancerHistory", "")
    }

    synthea_patients_ref.document(doc.id).update(update_data)

    return jsonify({"message": "patient info updated successfully"}), 200

@app.route("/get_scores", methods=["POST"])
def get_scores():
    patient_id = request.json.get("patientId")

    # try]
    scores = {
        "Heart Disease": model_inference.heart_disease(patient_id),
        "Cancer": model_inference.cancer(patient_id),
        "Stroke": model_inference.stroke(patient_id),
        "Diabetes": model_inference.diabetes(patient_id),
    }
    return jsonify(scores)
    

@app.route('/mimic_user_data', methods=['GET'])
def get_mimic_user_data():
    user_data = dict()
    user_id = request.args.get("user_id")
    if user_id is None:
        return "Must pass in user ID"
    filter = [item.to_dict() for item in persons_ref.where(filter=FieldFilter("person_id", "==", user_id)).stream()]
    if len(filter) == 0:
        return "User ID doesn't exist in database"
    user_data["person"] = filter
    for i in range(len(mimic_refs)):
        user_data[mimic_ref_names[i]] = [item.to_dict() for item in mimic_refs[i].where(filter=FieldFilter("person_id", "==", user_id)).stream()]
    return jsonify(user_data)

@app.route('/synthea_user_data', methods=['GET'])
def get_synthea_user_data():
    user_data = dict()
    user_id = request.args.get("user_id")
    if user_id is None:
        return "Must pass in user ID"
    filter = [item.to_dict() for item in synthea_patients_ref.where(filter=FieldFilter("Id", "==", user_id)).stream()]
    if len(filter) == 0:
        return "User ID doesn't exist in database"
    user_data["patient"] = filter
    for i in range(len(synthea_refs)):
        user_data[synthea_ref_names[i]] = [item.to_dict() for item in synthea_refs[i].where(filter=FieldFilter("PATIENT", "==", user_id)).stream()]
    return jsonify(user_data)

if __name__ == '__main__':
    app.run(debug=True)
