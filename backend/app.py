from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from azure.core.credentials import AzureKeyCredential
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import UserMessage
import os
import replicate
from datetime import datetime

# Load environment variables
load_dotenv()
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
AZURE_KEY = os.getenv("AZURE_KEY")
GPT_MODEL = os.getenv("GPT_MODEL")
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
REPLICATE_MODEL = os.getenv("REPLICATE_MODEL_NAME", "vectradmin/sdxl-v-transparent")

# Initialize clients
app = Flask(__name__)
CORS(app)
credential = AzureKeyCredential(AZURE_KEY)
chat_client = ChatCompletionsClient(endpoint=AZURE_ENDPOINT, credential=credential)
replicate_client = replicate.Client(api_token=REPLICATE_API_TOKEN)

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
            try:
                output = replicate_client.run(
                    f"{REPLICATE_MODEL}:latest",
                    input={
                        "prompt": f"Studio Ghibli style, isolated transparent PNG illustration of: {chunk}",
                        "width": 512,
                        "height": 512,
                        "output_format": "png"
                    }
                )
                image_url = output[0] if isinstance(output, list) else output
            except Exception as e:
                print("Image generation error:", e)
                image_url = ""

            pages.append({
                "text": chunk,
                "image_url": image_url
            })

        return jsonify({
            "title": title.strip(),
            "cover_image": pages[0]["image_url"] if pages else "",
            "pages": pages
        })

    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)