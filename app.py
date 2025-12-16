from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow requests from frontend/backend


def simple_fake_news_classifier(text: str):
    """
    Temporary rule-based classifier to simulate AI behavior.
    Later we'll replace this with a BERT/DistilBERT model.
    """
    text_lower = text.lower()

    # Very basic keyword-based rules (just for demo)
    fake_indicators = [
        "you won't believe",
        "shocking",
        "miracle cure",
        "earn money fast",
        "click here",
        "100% guaranteed",
        "secret method"
    ]

    real_indicators = [
        "according to",
        "researchers",
        "reported by",
        "official statement",
        "confirmed by",
        "study shows",
        "data from"
    ]

    score = 50
    label = "uncertain"
    explanation = []

    if any(kw in text_lower for kw in fake_indicators):
        label = "fake"
        score = 20
        explanation.append("Detected clickbait / scam-like phrases.")
    elif any(kw in text_lower for kw in real_indicators):
        label = "real"
        score = 80
        explanation.append("Detected research/official-style wording.")
    else:
        explanation.append("No strong indicators found; marked as uncertain.")

    return label, score, explanation


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "OK",
        "message": "FraudEye ML service is running 🧠",
        "model": "simple-rule-based-v1"
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Expected JSON body:
    {
      "content": "full text or snippet of the article/content",
      "url": "optional – URL of the article"
    }
    """
    data = request.get_json() or {}

    content = data.get("content")
    url = data.get("url")

    if not content:
        return jsonify({"message": "content field is required"}), 400

    label, score, explanation = simple_fake_news_classifier(content)

    return jsonify({
        "label": label,
        "credibilityScore": score,   # 0–100 (higher = more likely real)
        "explanation": explanation,
        "modelVersion": "simple-rule-based-v1",
        "sourceUrl": url
    })


if __name__ == "__main__":
    # We'll run this on port 8000 so Node (5000) and React (3000) can co-exist.
    app.run(host="0.0.0.0", port=8000, debug=True)
