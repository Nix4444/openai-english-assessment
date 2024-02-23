from flask import Flask, request, jsonify,send_file
from flask_cors import CORS
from google.cloud import speech
from google.oauth2 import service_account
from google.cloud import texttospeech
from openai import OpenAI
import io
import os
import uuid
import os
import subprocess
from langchain.document_loaders import TextLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
import json
from analyze import *
from generate import *
app = Flask(__name__)
CORS(app)

with open("config.json", "r") as f:
    data = json.load(f)


CREDENTIALS = service_account.Credentials.from_service_account_file(
    'creds.json')
UPLOAD_FOLDER = 'audios'
GENERATED_AUDIO_FOLDER = 'audios/generated-audios'
client = speech.SpeechClient(credentials=CREDENTIALS)
text_to_speech_client = texttospeech.TextToSpeechClient(credentials=CREDENTIALS)
def convert_audio(input_path, output_path, sample_rate=8000):
    try:
        # Define the ffmpeg command as a PowerShell command
        command = [
            'powershell', '-Command', 
            'ffmpeg', 
            '-i', input_path,       # Input file
            '-acodec', 'pcm_s16le', # Output codec
            '-ar', str(sample_rate),# Sample rate
            '-y',                   # Overwrite output file if it exists
            output_path             # Output file
        ]

        # Execute the command
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error occurred: {e.stderr.decode()}")

def text_to_speech(text, output_file_path, speaking_rate=1):
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Studio-O",  # "F" denotes female voice
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
    text = request.args.get('text')  # Consider using request.form or request.json for POST requests

    if not text:
        return jsonify({"error": "No text provided"}), 400

    audio_filename = str(uuid.uuid4()) + '.wav'
    output_file_path = os.path.join(GENERATED_AUDIO_FOLDER, audio_filename)

    # Assuming text_to_speech is a function that converts text to speech and saves the audio file at output_file_path
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
        convert_audio('audios/' + random_filename + '.wav','convertedaud/' + random_filename + '_modified' + '.wav')
        with io.open('convertedaud/' + random_filename + '_modified' + '.wav', 'rb') as audio_file:
            content = audio_file.read()

        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=8000,  # This now matches the audio file's sample rate
            language_code='en-US'
        )

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
    
    return resp, 200
@app.route('/analyze',methods=['GET'])
def analyze():
    question = request.args.get('question')
    answer = request.args.get('answer')
    resp = json.loads(analyzeresponse(question,answer))
    
    return resp, 200

if __name__ == '__main__':
    app.run(debug=True)