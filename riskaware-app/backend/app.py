from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

client = OpenAI(
    api_key="",
    base_url="https://api.groq.com/openai/v1"
)

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True)
