#!/usr/bin/env bash
set -e

# Move to script dir
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# 1) Download MovieLens ml-latest-small (if wget not available, try curl)
ML_ZIP="ml-latest-small.zip"
if [ ! -f "data/movies.csv" ]; then
  echo "Downloading MovieLens (ml-latest-small)..."
  if command -v wget >/dev/null 2>&1; then
    wget -q -O "$ML_ZIP" "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"
  else
    curl -s -L -o "$ML_ZIP" "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"
  fi
  unzip -o "$ML_ZIP" -d data >/dev/null
  # movies.csv is now in data/ml-latest-small/movies.csv or data/movies.csv (older zips)
  if [ -f data/ml-latest-small/movies.csv ]; then
    mv -f data/ml-latest-small/movies.csv data/movies.csv
    rm -rf data/ml-latest-small
  fi
fi

# 2) Create a small cleaned movies.csv if not present (title, genres, movieId)
if [ ! -f data/movies.csv ]; then
  echo "No dataset downloaded; creating small sample dataset..."
  cat > data/movies.csv <<'CSV'
movieId,title,genres
1,The Matrix (1999),Action|Sci-Fi
2,Inception (2010),Action|Sci-Fi|Thriller
3,Interstellar (2014),Adventure|Drama|Sci-Fi
4,The Godfather (1972),Crime|Drama
5,The Dark Knight (2008),Action|Crime|Drama
6,La La Land (2016),Romance|Drama|Music
7,Toy Story (1995),Animation|Adventure|Comedy
8,The Shawshank Redemption (1994),Drama
9,Pulp Fiction (1994),Crime|Drama
10,The Terminator (1984),Action|Sci-Fi
CSV
fi

# 3) Write recommender (content-based TF-IDF) - app/recommender_core.py
cat > app/recommender_core.py <<'PY'
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'movies.csv')

class Recommender:
    def __init__(self):
        self.df = pd.read_csv(DATA_PATH)
        # keep only relevant cols
        if 'genres' not in self.df.columns:
            self.df['genres'] = ''
        if 'title' not in self.df.columns:
            self.df['title'] = self.df.get('movieId', '').astype(str)
        # create combined text
        self.df['text'] = self.df['title'].fillna('') + ' ' + self.df['genres'].fillna('')
        self.tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1,2))
        self.tfidf_matrix = self.tfidf.fit_transform(self.df['text'])

    def recommend(self, title_query, topn=10):
        q = title_query.strip().lower()
        # find best matching title by substring or fallback to exact similarity on title text
        matches = self.df[self.df['title'].str.lower().str.contains(q, na=False)]
        if matches.empty:
            # fallback: compute similarity of query string to titles
            # vectorize the query using the same vectorizer (transform of combined field)
            q_vec = self.tfidf.transform([title_query])
            cosine_similarities = linear_kernel(q_vec, self.tfidf_matrix).flatten()
            related_indices = cosine_similarities.argsort()[::-1][:topn]
            return self.df.iloc[related_indices][['title','genres']].drop_duplicates().head(topn)
        idx = matches.index[0]
        cosine_similarities = linear_kernel(self.tfidf_matrix[idx:idx+1], self.tfidf_matrix).flatten()
        cosine_similarities[idx] = -1
        related_indices = cosine_similarities.argsort()[::-1][:topn]
        return self.df.iloc[related_indices][['title','genres']].drop_duplicates().head(topn)
PY

# 4) Write Flask web app - app/webapp.py
cat > app/webapp.py <<'PY'
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
PY

# 5) Minimal HTML template and CSS (templates/index.html + static/style.css)
cat > templates/index.html <<'HTML'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CODSOFT Recommender</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
  <main class="card">
    <h1>CODSOFT — Movie Recommender</h1>
    <p>Type a movie name (partial allowed), press Recommend.</p>
    <form id="form">
      <input id="title" name="title" placeholder="e.g. Inception" autocomplete="off"/>
      <select id="topn" name="topn">
        <option value="5">5</option><option value="8" selected>8</option><option value="12">12</option>
      </select>
      <button type="submit">Recommend</button>
    </form>
    <div id="results"></div>
    <small class="note">Dataset: MovieLens (ml-latest-small)</small>
  </main>

  <script>
  const form = document.getElementById('form');
  const results = document.getElementById('results');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    results.innerHTML = 'Loading...';
    const title = document.getElementById('title').value;
    const topn = document.getElementById('topn').value;
    const res = await fetch('/recommend', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({title, topn})
    });
    if (!res.ok) {
      const err = await res.json(); results.innerHTML = '<b style="color:#c00">Error:</b> '+(err.error||'Unknown');
      return;
    }
    const json = await res.json();
    if (!json.results.length) { results.innerHTML = '<i>No recommendations found.</i>'; return; }
    results.innerHTML = '<ol>'+json.results.map(r => `<li><b>${r.title}</b> — <small>${r.genres}</small></li>`).join('')+'</ol>';
  });
  </script>
</body>
</html>
HTML

cat > static/style.css <<'CSS'
*{box-sizing:border-box;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial}
body{display:flex;min-height:100vh;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f172a 0%,#0b1220 100%);color:#e6eef8;margin:0;padding:20px}
.card{background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));padding:28px;border-radius:12px;max-width:720px;width:100%;box-shadow:0 8px 30px rgba(2,6,23,0.6)}
h1{margin:0 0 8px 0;font-size:20px}
p{margin:0 0 14px 0;color:#bcd3f5}
form{display:flex;gap:8px;margin-bottom:12px}
input[type="text"], input, select{flex:1;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:inherit}
button{padding:10px 14px;border-radius:8px;border:0;background:#2563eb;color:white;font-weight:600;cursor:pointer}
#results{margin-top:10px;color:#dceefe}
.note{display:block;margin-top:12px;color:#8fa9d9}
ol{padding-left:20px}
CSS

# 6) Create venv and install deps (if not present)
if [ ! -f venv/bin/python3 ]; then
  python3 -m venv venv
  ./venv/bin/python3 -m pip install --upgrade pip
  ./venv/bin/pip install pandas scikit-learn flask
fi

# 7) Start Flask app (background) and show instruction
echo "Starting Flask app at http://127.0.0.1:5000 — use Ctrl+C to stop."
./venv/bin/python3 app/webapp.py
