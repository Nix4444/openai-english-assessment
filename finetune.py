from openai import OpenAI
import os,json


with open("config.json", "r") as f:
    data = json.load(f)
client = OpenAI(api_key=data["KEY"])

def upload_file():
        client.files.create(
    file=open("data.jsonl", "rb"),
    purpose="fine-tune"
    )

def create_model():
    client.fine_tuning.jobs.create(
    training_file=data["FILE_ID"], 
    model="gpt-3.5-turbo",
    suffix="Chat Support"
    )
#print(client.fine_tuning.jobs.list(limit=10))
print(client.fine_tuning.jobs.retrieve("ftjob-data.jsonl"))