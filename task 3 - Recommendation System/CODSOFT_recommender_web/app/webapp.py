from flask import Flask, render_template, request, jsonify
from .recommender_core import Recommender
import os

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__),'..','templates'),
            static_folder=os.path.join(os.path.dirname(__file__),'..','static'))
recommender = Recommender()

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.form or request.get_json() or {}
    title = data.get('title','').strip()
    topn = int(data.get('topn') or 8)
    if not title:
        return jsonify({'error':'Please provide a movie title/query.'}), 400
    recs = recommender.recommend(title, topn=topn)
    results = [{'title': r['title'], 'genres': r['genres']} for _,r in recs.iterrows()]
    return jsonify({'query': title, 'results': results})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)
