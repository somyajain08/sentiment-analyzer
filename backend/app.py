from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer
import numpy as np
from scipy.special import softmax
import csv
import urllib.request

app = Flask(__name__)
CORS(app, resources={r"/predictTweet": {"origins": "http://localhost:3000"}})

# Load model and tokenizer
MODEL = "cardiffnlp/twitter-roberta-base-sentiment"
tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL)

# Load labels
labels = []
mapping_link = "https://raw.githubusercontent.com/cardiffnlp/tweeteval/main/datasets/sentiment/mapping.txt"
try:
    with urllib.request.urlopen(mapping_link) as f:
        html = f.read().decode('utf-8').split("\n")
        csvreader = csv.reader(html, delimiter='\t')
        labels = [row[1] for row in csvreader if len(row) > 1]
except:
    # Fallback labels if GitHub is unreachable
    labels = ["negative", "neutral", "positive"]

# Preprocess text function
def preprocess(text):
    new_text = []
    for t in text.split(" "):
        t = '@user' if t.startswith('@') and len(t) > 1 else t
        t = 'http' if t.startswith('http') else t
        new_text.append(t)
    return " ".join(new_text)

@app.route('/predictTweet', methods=['POST'])
def predict_sentiment():
    try:
        data = request.get_json()
        user_input = data['text']
        
        # Preprocess the text
        processed_text = preprocess(user_input)
        
        # Tokenize and get predictions
        encoded_input = tokenizer(processed_text, return_tensors='pt', truncation=True, max_length=512)
        output = model(**encoded_input)
        scores = output[0][0].detach().numpy()
        scores = softmax(scores)
        
        # Get sentiment results
        ranking = np.argsort(scores)
        ranking = ranking[::-1]
        
        # Get highest ranked sentiment
        sentiment_label = labels[ranking[0]]
        confidence = float(scores[ranking[0]])
        
        # Get all sentiment scores
        sentiment_scores = {}
        for i in range(scores.shape[0]):
            sentiment_scores[labels[i]] = float(scores[i])
            
        return jsonify({
            'sentiment': sentiment_label.capitalize(),
            'confidence': round(confidence, 4),
            'scores': sentiment_scores,
            'vader_score': {
                'neg': sentiment_scores.get('negative', 0),
                'neu': sentiment_scores.get('neutral', 0),
                'pos': sentiment_scores.get('positive', 0),
                'compound': sentiment_scores.get('positive', 0) - sentiment_scores.get('negative', 0)
            }
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)