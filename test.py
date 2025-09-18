from flask import Flask, request, jsonify
from google import genai


client = genai.Client(api_key="AIzaSyAJo7wR8EeFtW0OdQnjPr8gcczBoJMB98c") 


def bot_instructions():
    return """
You are a chatbot with the following instructions:
You are a farming assistant chatbot made to help farmers.
Your only work is to assist farmers.
Respond accordingly.
"""

def create_prompt(user_message):
    instructions = bot_instructions()
    return f"{instructions}\nUser: {user_message}\nChatbot:"

def get_gemini_response(prompt):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text.strip()

app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    prompt = create_prompt(user_message)
    response = get_gemini_response(prompt)
    
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
