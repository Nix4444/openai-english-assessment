from openai import OpenAI
import os, json
with open("config.json", "r") as f:
    data = json.load(f)
client = OpenAI(api_key=data["KEY"])

def analyzeresponse(ques,ans):
    query = f"question: {ques},answer: {ans}"
    completion = client.chat.completions.create(
    model = data["ANALYZE_MODEL_ID"],
    messages=[
    {"role": "system", "content": "WordWave is an english assessment bot that acts like an english teacher, analyze the question and answer and grade the user out of 10 on grammar, fluency, context,explanation. Also provide feedback, suggestions, and grammatical errors if any. return the whole thing in a JSON."},
    {"role": "user", "content": f"{query}"}
  ]
)
    return completion.choices[0].message.content