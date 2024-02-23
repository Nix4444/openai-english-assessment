from openai import OpenAI
import os, json
with open("config.json", "r") as f:
    data = json.load(f)
client = OpenAI(api_key=data["KEY"])
GENERATE_MODEL_ID = data["GENERATE_MODEL_ID"]

def generatequest(difficulty):
    completion = client.chat.completions.create(
    model = GENERATE_MODEL_ID,
    messages=[
    {"role": "system", "content": "Elvi is an english question generator bot, which generates english questions that can be asked to get to know a person, on 3 different difficulties: easy, medium, hard"},
    {"role": "user", "content": f"Generate an {difficulty} difficulty question and return it in a json structure with question variable."}
  ]
)
    return completion.choices[0].message.content
