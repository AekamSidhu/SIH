import speech_recognition as sr
import requests
from gtts import gTTS
import os

r = sr.Recognizer()
with sr.Microphone() as source:
    print("മൊഴി പറയുക...")  
    audio = r.listen(source)
    user_text = r.recognize_google(audio, language="ml-IN")
    print("You said:", user_text)


response = requests.post("http://127.0.0.1:5000/chat", json={"message": user_text})
chatbot_text = response.json()["response"]
print("Chatbot says:", chatbot_text)


tts = gTTS(chatbot_text, lang="ml")
tts.save("response.mp3")
os.system("start response.mp3") 
