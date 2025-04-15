import requests

url = "http://127.0.0.1:5000"
mimic_params = {"user_id": "14383"}
synthea_params= {"user_id": "9998e1a3-3ae4-8f69-73f9-75bd6f7ea33c"}

mimic_res = requests.get(url + "/mimic_user_data", mimic_params)
print(mimic_res.json())

synthea_res = requests.get(url + "/synthea_user_data", synthea_params)
print(synthea_res.json())