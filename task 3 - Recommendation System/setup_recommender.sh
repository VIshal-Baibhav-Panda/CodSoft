#!/usr/bin/env bash
set -e
echo "Creating project structure..."
rm -rf CODSOFT_recommender
mkdir -p CODSOFT_recommender/{data,app}
cat > CODSOFT_recommender/data/movies.csv <<'CSV'
movie_id,title,genres,description
1,The Matrix,Action|Sci-Fi,"A hacker discovers reality is a simulation and joins a rebellion."
2,Inception,Action|Sci-Fi|Thriller,"A thief who steals corporate secrets through dream-sharing technology."
3,Interstellar,Adventure|Drama|Sci-Fi,"A team travels through a wormhole to ensure humanity's survival."
4,The Godfather,Crime|Drama,"The aging patriarch of an organized crime dynasty transfers control to his son."
5,The Dark Knight,Action|Crime|Drama,"Batman faces the Joker, a criminal mastermind creating chaos in Gotham."
6,La La Land,Romance|Drama|Music,"An aspiring actress and a jazz musician pursue their dreams in Los Angeles."
7,Toy Story,Animation|Adventure|Comedy,"Toys come to life when humans aren't around; Woody and Buzz form a friendship."
8,The Shawshank Redemption,Drama,"Two imprisoned men bond over years, finding solace and eventual redemption."
9,Pulp Fiction,Crime|Drama,"Interwoven tales of crime and redemption in Los Angeles."
10,The Terminator,Action|Sci-Fi,"A cyborg is sent back in time to kill the mother of the future leader."
CSV

cat > CODSOFT_recommender/app/recommender.py <<'PY'
#!/usr/bin/env python3
"""
Simple content-based movie recommender using TF-IDF on 'title + genres + description'.
Usage: python recommender.py "Movie Title" 5
If no args given, shows an example recommending for "Inception".
"""
import sys
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

DATA_PATH = "../data/movies.csv"

def load_data(path=DATA_PATH):
    df = pd.read_csv(path)
    df['text'] = df['title'].fillna('') + ' ' + df['genres'].fillna('') + ' ' + df['description'].fillna('')
    return df

def build_model(df):
    tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1,2))
    tfidf_matrix = tfidf.fit_transform(df['text'])
    return tfidf_matrix

def recommend(df, tfidf_matrix, title, topn=5):
    matches = df[df['title'].str.lower().str.contains(title.lower(), na=False)]
    if matches.empty:
        print(f'No exact or partial matches found for "{title}". Showing top popular (by index).')
        return df.head(topn)[['title','genres']]
    idx = matches.index[0]
    cosine_similarities = linear_kernel(tfidf_matrix[idx:idx+1], tfidf_matrix).flatten()
    cosine_similarities[idx] = -1
    related_indices = cosine_similarities.argsort()[::-1][:topn]
    return df.iloc[related_indices][['title','genres']]

def main():
    df = load_data()
    tfidf_matrix = build_model(df)
    if len(sys.argv) >= 2:
        title = sys.argv[1]
        try:
            topn = int(sys.argv[2]) if len(sys.argv) >= 3 else 5
        except ValueError:
            topn = 5
    else:
        title = "Inception"
        topn = 5
    print(f'Recommendations for: "{title}" (top {topn})\n')
    recs = recommend(df, tfidf_matrix, title, topn)
    for i,row in recs.reset_index(drop=True).iterrows():
        print(f'{i+1}. {row["title"]} — {row["genres"]}')
    print("\nDone.")

if __name__ == '__main__':
    main()
PY

cat > CODSOFT_recommender/run.sh <<'SH'
#!/usr/bin/env bash
set -e
if [ ! -f "venv/bin/python3" ]; then
  python3 -m venv venv
  ./venv/bin/python3 -m pip install --upgrade pip
  ./venv/bin/pip install pandas scikit-learn
fi
./venv/bin/python3 app/recommender.py "$@"
