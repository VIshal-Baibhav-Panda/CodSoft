# backend/app.py
"""
Flask REST backend for Rule-based chatbot with per-user session contexts.

Features added:
- per-session contexts (in-memory dict `contexts`) keyed by session_id (UUID)
- /api/chat accepts "session_id" in JSON body or X-Session-Id header; if missing, server issues one
- response includes session_id so client can persist it
- /api/reload_rules to reload rules.json without restart
- /api/get_rules to fetch current rules
- /api/add_intent to append a new intent safely to rules.json (demo helper)
- conversation transcript saved to chat_transcript.log
"""
from flask import Flask, request, jsonify, render_template
import json, re, random, datetime, difflib, os, uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RULES_FILE = os.path.join(BASE_DIR, "rules.json")
LOG_FILE = os.path.join(BASE_DIR, "chat_transcript.log")

def load_rules(path=RULES_FILE):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_transcript(line):
    ts = datetime.datetime.now().isoformat()
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{ts} {line}\n")

class RuleBot:
    def __init__(self, rules_path=RULES_FILE):
        self.rules_path = rules_path
        self.reload()
        # context will be set per-session before calling respond()
        self.context = {"user_name": None, "last_intent": None}

    def reload(self):
        self.rules = load_rules(self.rules_path)
        self.intents = self.rules.get("intents", [])
        self.settings = self.rules.get("settings", {})
        self.fuzzy_threshold = float(self.settings.get("fuzzy_threshold", 0.6))

    def normalize(self, t):
        t = t.lower().strip()
        t = re.sub(r"[^\w\s']", " ", t)
        t = re.sub(r"\s+", " ", t)
        return t

    def match_intent(self, text):
        ntext = self.normalize(text)
        # 1) regex-focused patterns
        for intent in self.intents:
            for patt in intent.get("patterns", []):
                if any(ch in patt for ch in "()[]\\.*+?"):
                    try:
                        m = re.search(patt, text, flags=re.I)
                        if m:
                            return intent, m
                    except re.error:
                        continue
        # 2) substring/keyword match
        tokens = ntext.split()
        for intent in self.intents:
            for patt in intent.get("patterns", []):
                npatt = self.normalize(patt)
                if not npatt:
                    continue
                if npatt in ntext:
                    return intent, None
                pw = npatt.split()
                if all(w in tokens for w in pw):
                    return intent, None
        # 3) fuzzy fallback
        allp = []
        p2i = {}
        for intent in self.intents:
            for patt in intent.get("patterns", []):
                npatt = self.normalize(patt)
                if npatt:
                    allp.append(npatt)
                    p2i[npatt] = intent
        if allp:
            matches = difflib.get_close_matches(ntext, allp, n=1, cutoff=self.fuzzy_threshold)
            if matches:
                return p2i[matches[0]], None
        return None, None

    def respond(self, user_input):
        txt = user_input.strip()
        if txt.lower() in ("help", "commands"):
            return {"reply": "Commands: 'quit' to exit. Try: 'hi', 'my name is ...', 'i need project help'.", "intent":"help", "context": self.context}
        intent, m = self.match_intent(txt)
        if intent is None:
            fallback = next((it for it in self.intents if it.get("name")=="fallback"), None)
            reply = random.choice(fallback.get("responses")) if fallback else "Sorry, I didn't understand. Try rephrasing."
            self.context["last_intent"] = "fallback"
            save_transcript(f"You: {txt}")
            save_transcript(f"Bot: {reply}")
            return {"reply": reply, "intent": "fallback", "context": self.context}
        self.context["last_intent"] = intent.get("name")
        # set_name special handling
        if intent.get("name") == "set_name":
            name = None
            if m and m.groups():
                name = m.groups()[0].strip()
            else:
                mm = re.search(r"my name is\s+([\w\s]+)", txt, flags=re.I)
                if mm:
                    name = mm.group(1).strip()
                else:
                    mm2 = re.search(r"i am\s+([\w\s]+)", txt, flags=re.I)
                    if mm2:
                        name = mm2.group(1).strip()
            if name:
                name = " ".join(name.split()[:2]).title()
                self.context["user_name"] = name
                reply = random.choice(intent.get("responses", [])).format(name=name)
                save_transcript(f"You: {txt}")
                save_transcript(f"Bot: {reply}")
                return {"reply": reply, "intent": "set_name", "context": self.context}
            else:
                reply = "I didn't catch your name — what should I call you?"
                save_transcript(f"You: {txt}")
                save_transcript(f"Bot: {reply}")
                return {"reply": reply, "intent": "set_name.ask", "context": self.context}
        # ask user name
        if "what is my name" in txt.lower() or "do you remember my name" in txt.lower():
            if self.context.get("user_name"):
                reply = f"Yes — you're {self.context['user_name']}."
            else:
                reply = "I don't know your name yet. You can say 'my name is ...'."
            save_transcript(f"You: {txt}")
            save_transcript(f"Bot: {reply}")
            return {"reply": reply, "intent": "ask_user_name", "context": self.context}
        # default
        resp_template = random.choice(intent.get("responses", ["Okay."]))
        reply = resp_template.format(name=self.context.get("user_name") or "")
        save_transcript(f"You: {txt}")
        save_transcript(f"Bot: {reply}")
        return {"reply": reply, "intent": intent.get("name"), "context": self.context}

# Flask app + bot instance
app = Flask(__name__, template_folder="templates", static_folder="static")
bot = RuleBot()

# In-memory per-session contexts: session_id (str) -> context dict
# NOTE: this is in-memory and will be lost on server restart. Use Redis/DB for persistence.
contexts = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login")
def login_page():
    # renders backend/templates/login.html
    return render_template("login.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json or {}
    msg = data.get("message", "")
    if not msg:
        return jsonify({"success": False, "error": "Missing 'message' field."}), 400

    # Accept session id from JSON body or header; if missing, server will generate one
    session_id = data.get("session_id") or data.get("session") or request.headers.get("X-Session-Id")
    created_new = False
    if not session_id:
        session_id = str(uuid.uuid4())
        created_new = True

    # initialize context for this session if not present
    contexts.setdefault(session_id, {"user_name": None, "last_intent": None})

    # set bot.context to this session's context, call respond, then save updated context
    bot.context = contexts[session_id]
    result = bot.respond(msg)
    contexts[session_id] = bot.context

    resp = {
        "success": True,
        "reply": result["reply"],
        "intent": result["intent"],
        "context": result["context"],
        "session_id": session_id
    }
    # helpful flag if server created the id
    if created_new:
        resp["notice"] = "new_session_id_created"

    return jsonify(resp)

@app.route("/api/reload_rules", methods=["POST"])
def reload_rules():
    try:
        bot.reload()
        return jsonify({"success": True, "message": "Rules reloaded."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/get_rules", methods=["GET"])
def get_rules():
    return jsonify(bot.rules)

@app.route("/api/add_intent", methods=["POST"])
def add_intent():
    """
    Demo helper: add a new intent to rules.json safely.
    Expects JSON: { "intent": { "name": "...", "patterns": [...], "responses": [...] } }
    """
    payload = request.json or {}
    new_intent = payload.get("intent")
    if not isinstance(new_intent, dict) or "name" not in new_intent:
        return jsonify({"success": False, "error": "Provide 'intent' dict with at least 'name'."}), 400

    # load current rules, append, write back
    try:
        rules = load_rules(RULES_FILE)
        rules.setdefault("intents", []).append(new_intent)
        # write back
        with open(RULES_FILE, "w", encoding="utf-8") as f:
            json.dump(rules, f, indent=2, ensure_ascii=False)
        # reload into bot
        bot.reload()
        return jsonify({"success": True, "message": "Intent added and rules reloaded."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    # ensure log file exists
    open(LOG_FILE, "a").close()
    app.run(host="0.0.0.0", port=5000, debug=True)
