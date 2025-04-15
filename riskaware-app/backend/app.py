from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

client = OpenAI(
    api_key="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",
    base_url="https://api.groq.com/openai/v1"
)

app = Flask(__name__)
CORS(app)

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
    ## modify later
    myprompt = (
        "You are a preventive health coach analyzing a patient's disease risk scores, which are each rated from 0 to 100 and higher means greater risk.\n\n"
        "Here is the patient's data:\n"
        "- Heart Disease Risk: 75/100\n"
        "- Diabetes Risk: 0/100\n"
        "- Stroke Risk: 45/100\n"
        "- Cancer Risk: 30/100\n"
        "- Age: 45\n"
        "- Gender: Male\n\n"
        "Give exactly 4 personalized and practical medical tips, one for each disease above, to help reduce the patient's risk."
        "Format your output strictly as a plain bullet list using dashes. No headings or extra commentary."
        "the format should be like: Heart Disease Risk (75/100): some recommendations"
    )

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are a health coach AI."},
            {"role": "user", "content": myprompt}
        ]
    )

    tips = response.choices[0].message.content
    return jsonify({"recommendations": tips}), 200

@app.route('/synthea_patient_ids', methods=['GET'])
def get_all_patient_ids():
    docs = synthea_patients_ref.stream()
    patient_ids = [doc.to_dict().get("Id") for doc in docs if "Id" in doc.to_dict()]
    return jsonify(patient_ids), 200

@app.route('/synthea_patient_info', methods=['GET'])
def get_synthea_patient_info():
    user_id = request.args.get("user_id")
    if not user_id:
        return "Missing user_id", 400

    docs = synthea_patients_ref.where(filter=FieldFilter("Id", "==", user_id)).stream()
    for doc in docs:
        return jsonify(doc.to_dict()), 200

    return "Patient not found", 404

@app.route('/update_patient_info', methods=['POST'])
def update_patient_info():
    data = request.get_json()
    patient_id = data.get("patientId")

    docs = synthea_patients_ref.where(filter=FieldFilter("Id", "==", patient_id)).stream()
    patient_doc = next(docs, None)

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

    synthea_patients_ref.document(patient_doc.id).update(update_data)

    return jsonify({"message": "Patient info updated successfully"}), 200


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
