CODSOFT – Task: Movie Recommendation System (Web App)
=======================================================

This project is part of the CODSOFT Artificial Intelligence Internship.
It is a content-based movie recommender system built with Python, Flask, Pandas, and Scikit-learn,
featuring a clean and modern web interface.

Features:
- Recommends similar movies based on title and genres.
- Uses TF-IDF Vectorization and Cosine Similarity.
- Built with MovieLens (ml-latest-small) dataset (~9k movies).
- Modern web UI with animated background and floating shapes.
- Responsive design (works on desktop & mobile).
- Popular movie suggestions shown on homepage.

Project Structure:
- app/: recommender_core.py, webapp.py
- data/: movies.csv dataset
- static/: style.css, popular_stub.json
- templates/: index.html
- venv/: Python virtual environment
- setup_and_run.sh: setup and execution script

Installation & Setup:
1. Clone/download the repository.
2. Open terminal inside project folder.
3. Run:
   cd CODSOFT_recommender_web
   bash setup_and_run.sh
4. Open http://127.0.0.1:5000 in browser.

Usage:
- Type a movie title (partial allowed).
- Choose number of results (5, 8, 12).
- Click Recommend.

Example (Input: Inception, top 8):
1. Interstellar (2014) — Adventure|Drama|Sci-Fi
2. The Matrix (1999) — Action|Sci-Fi
3. The Terminator (1984) — Action|Sci-Fi
4. The Dark Knight (2008) — Action|Crime|Drama
5. Pulp Fiction (1994) — Crime|Drama
6. Toy Story (1995) — Animation|Adventure|Comedy
7. La La Land (2016) — Romance|Drama|Music
8. The Shawshank Redemption (1994) — Drama

Tech Stack:
- Python 3
- Flask
- Pandas
- Scikit-learn
- HTML, CSS, JS

License:
© 2025 Vishal Baibhav Panda
This project is created for educational purposes as part of the CODSOFT AI Internship.
Unauthorized use, modification, or distribution is not allowed.
