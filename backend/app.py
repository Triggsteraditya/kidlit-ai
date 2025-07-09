from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from azure.core.credentials import AzureKeyCredential
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import UserMessage
import os

# Load environment variables
load_dotenv()
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
AZURE_KEY = os.getenv("AZURE_KEY")
GPT_MODEL = os.getenv("GPT_MODEL")

# Initialize clients
app = Flask(__name__)
CORS(app)
credential = AzureKeyCredential(AZURE_KEY)
chat_client = ChatCompletionsClient(endpoint=AZURE_ENDPOINT, credential=credential)

@app.route("/", methods=["GET"])
def home():
    return "🎉 KidLit AI Backend is running!"

@app.route("/generate_story", methods=["POST"])
def generate_story():
    try:
        data = request.get_json()
        name = data.get("name", "the child")
        age = data.get("age", "5")
        theme = data.get("theme", "a magical forest")

        # Prompt for GPT
        prompt = f"""Write a short story for a {age} year old child named {name} about {theme} in Studio Ghibli style.
Start with the story title on the first line, then two newlines, then the story body.
Example:
The Magical Adventure

Once upon a time..."""

        # Generate story
        response = chat_client.complete(
            messages=[UserMessage(prompt)],
            model=GPT_MODEL,
            temperature=0.9,
            top_p=1
        )
        story_full = response.choices[0].message.content.strip()

        if "\n\n" in story_full:
            title, story_body = story_full.split("\n\n", 1)
        else:
            title = "Untitled"
            story_body = story_full

        # Paginate story (40 words per page)
        words = story_body.strip().split()
        pages = []
        for i in range(0, len(words), 40):
            chunk = " ".join(words[i:i+40])
            pages.append({
                "text": chunk,
                "image_url": ""  # placeholder for future image
            })

        return jsonify({
            "title": title.strip(),
            "cover_image": "",  # placeholder for future cover
            "pages": pages
        })

    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
