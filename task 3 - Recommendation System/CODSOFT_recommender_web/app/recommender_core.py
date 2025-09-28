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
