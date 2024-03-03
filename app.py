from flask import Flask, request, jsonify,send_file
from flask_cors import CORS
from google.cloud import speech
from google.oauth2 import service_account
from google.cloud import texttospeech
from openai import OpenAI #openai-1.12.0
import io
import os
import uuid
import os
import subprocess
import json
from analyze import *
from generate import *
import requests
app = Flask(__name__)
CORS(app)

with open("config.json", "r") as f:
    data = json.load(f)


CREDENTIALS = service_account.Credentials.from_service_account_file(
    'creds.json')
WEBHOOK_URL = data["WEBHOOK"]
UPLOAD_FOLDER = 'audios'
GENERATED_AUDIO_FOLDER = 'audios/generated-audios'
client = speech.SpeechClient(credentials=CREDENTIALS)
text_to_speech_client = texttospeech.TextToSpeechClient(credentials=CREDENTIALS)
def convert_audio(input_path, output_path, sample_rate=8000):
    try:
        
        command = [
            'powershell', '-Command', 
            'ffmpeg', 
            '-i', input_path,       # Input file
            '-acodec', 'pcm_s16le', # Output codec
            '-ar', str(sample_rate),# Sample rate
            '-y',                   # Overwrite output file if it exists
            output_path             # Output file
        ]

        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error occurred: {e.stderr.decode()}")
def post_to_discord(webhook_url, content):
    data = {
        "content": content,
        "username": "Webhook Logger"
    }
    response = requests.post(webhook_url, json=data)
    return response

def text_to_speech(text, output_file_path, speaking_rate=1):
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Studio-O",
        ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.LINEAR16,
        speaking_rate=speaking_rate
    )

    response = text_to_speech_client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )
    with open(output_file_path, "wb") as out:
        out.write(response.audio_content)
@app.route('/tts', methods=['POST'])
def handle_text_to_speech():
    text = request.args.get('text')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    audio_filename = str(uuid.uuid4()) + '.wav'
    output_file_path = os.path.join(GENERATED_AUDIO_FOLDER, audio_filename)
    text_to_speech(text, output_file_path)

    response = send_file(output_file_path, as_attachment=True)
    response.headers["Content-Disposition"] = "attachment; filename={}".format(audio_filename)
    return response

@app.route('/transcribe', methods=['POST'])
def upload_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio part"}), 400

        file = request.files['audio']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        random_filename = str(uuid.uuid4())
        original_file_path = os.path.join(UPLOAD_FOLDER, random_filename + '.wav')
        modified_file_path = os.path.join(UPLOAD_FOLDER,random_filename + '_modified' + '.wav')
        file.save(original_file_path)
        print("file saved")
        convert_audio('audios/' + random_filename + '.wav','convertedaud/' + random_filename + '_modified' + '.wav')
        print("audio converted")
        with io.open('convertedaud/' + random_filename + '_modified' + '.wav', 'rb') as audio_file:
            content = audio_file.read()

        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=8000,
            language_code='en-US'
        )
        print("audio transcribed")
        response = client.recognize(config=config, audio=audio)
        transcript = ''.join(result.alternatives[0].transcript for result in response.results)

        return jsonify({"transcript": transcript, "uid": random_filename + '_modified.wav'})

    except Exception as e:
        # Handle exceptions
        return jsonify({"error": str(e)}), 500

    
@app.route('/generateques',methods=['GET'])
def generatequestions():
    diff = request.args.get('difficulty')
    resp = (generatequest(diff))
    content = f"Question generated with difficulty {diff}\n Question: {resp}"
    post_to_discord(WEBHOOK_URL, content)
    return resp, 200
@app.route('/analyze',methods=['GET'])
def analyze():
    question = request.args.get('question')
    answer = request.args.get('answer')
    resp = json.loads(analyzeresponse(question,answer))
    content = f"Analysis performed for question: {question} and answer: {answer}\n Analysis: {resp}"
    post_to_discord(WEBHOOK_URL, content)
    return resp, 200

if __name__ == '__main__':
    app.run(debug=True)