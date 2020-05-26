import os
import json
from app import app
from flask import render_template, session, request
from .game import *
from .db import reset_db
# from flask_socketio import emit

# Load sprites 
images_path = os.path.abspath("app/static/images/ship2")
imgs = []
for i in os.listdir(images_path):
    path = os.path.join(images_path, i)
    imgs.append({
        "src" : "static/images/ship2/"+i,
        "name" : i.replace(".png", "")
    })

@app.route('/')
@app.route('/index')
def index():    
    session.pop("loaded", None)
    # reset_db()
    return render_template('index.html', planets = [1,2,3], images=imgs, logo="draft1_min.png")

@app.route('/get/<cmd>/<prev_game_status>')
def get(cmd, prev_game_status):
    if "loaded" in session:
        status = step(str(session["id"]), json.loads(prev_game_status), int(cmd))
        # status = step(str(session["id"]), session["prev_game_status"], int(cmd))
        # session["prev_game_status"] = status
        return json.dumps(status)
    else:
        return json.dumps(False)

@app.route('/load/<id>/<screen_x>/<screen_y>')
def load(id, screen_x, screen_y):
    session["loaded"] = True
    session["id"] = id
    status = load_game(id, int(screen_x), int(screen_y))
    # session["prev_game_status"] = status
    return json.dumps(status)

# @app.route('/post', methods = ['POST'])
# def post():
#     if "loaded" in session:
#         _id = request.form["id"]
#         cmd = int(request.form["cmd"])
#         prev_game_status = json.loads(request.form["game"])    
#         prev_game_status.update({"init_orbits": session["init_orbits"]})
#         prev_game_status.update({"sc_start_pos": session["sc_start_pos"]})
#         status = step(prev_game_status, cmd)
#         return json.dumps(status)
#     else:
#         return json.dumps(False)


# @socketio.on('my event')
# def test_message(message):
#     emit('my response', {'data': message['data']})
    
# @socketio.on('connect')
# def test_connect():
#     emit('my response', {'data': 'Connected'})