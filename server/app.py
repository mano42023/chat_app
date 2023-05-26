from flask import Flask, jsonify, request, session
from flask_pymongo import PyMongo
from flask_cors import CORS
from passlib.hash import sha256_crypt
from functools import wraps
import datetime
import jwt

app = Flask(__name__)
CORS(app)
app.config["MONGO_URI"] = "mongodb://localhost:27017/chat_app"

mongo = PyMongo(app)


def is_logged_in(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if "logged_in" in session:
            return f(*args, **kwargs)
        else:
            return jsonify({"msg": "Unauthorized, Please login", "err": True})

    return wrap


def is_admin(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if session["role"] == "role":
            return f(*args, **kwargs)
        else:
            return jsonify({"msg": "Unauthorized, Please login as admin", "err": True})

    return wrap


@app.route("/", methods=["GET"])
@is_logged_in
def test():
    return jsonify({"manoj": "kumar"})


@app.route("/api/manage_user", methods=["POST", "PUT"])
@is_admin
def manage_user():
    collection = mongo.db.users
    username = request.json["username"]
    result = collection.find_one({"username": username})

    if result and request.method == "POST":
        return jsonify({"msg": f"User with {username=} Already exsits.", "err": True})

    name = request.json["name"]
    role = request.json["role"]
    password = sha256_crypt.encrypt(str(request.json["password"]))

    collection.update_one(
        {"username": username},
        {"$set": {"name": name, "password": password, "role": role}},
        upsert=True,
    )
    return jsonify({"msg": "User created successfully"})


@app.route("/api/login", methods=["POST"])
def login():
    collection = mongo.db.users
    username = request.json["username"]
    password_candidate = request.json["password"]
    result = collection.find_one({"username": username})
    if result:
        password = result["password"]
        role = result["role"]
        if sha256_crypt.verify(password_candidate, password):
            session["logged_in"] = True
            session["username"] = username
            token = jwt.encode(
                {
                    "username": result["username"],
                    "role": result["role"],
                    "name": result["name"],
                    "exp":  datetime.datetime.utcnow() + datetime.timedelta(minutes=45),
                },
                app.secret_key,
                algorithm="HS256",
            )
            session["role"] = role
            return jsonify({"msg": "Logged in successfully.", "token": token})
        else:
            return jsonify({"msg": "Invalid username or password.", "err": True})
    else:
        return jsonify({"msg": "User not found", "err": True})


@app.route("/api/manage_groups", methods=["POST", "PUT", "DELETE"])
@is_logged_in
def manage_groups():
    collection = mongo.db.groups
    message_collection = mongo.db.messages
    group_name = request.json["group_name"]

    if request.method == "DELETE":
        collection.delete_one({"group_name": group_name})
        message_collection.delete_one({"group_name": group_name})
        return jsonify({"msg": f"Group deleted successfully"})

    if request.method == "POST":
        result = collection.find_one({"group_name": group_name})
        username = session["username"]
        msg = "Group created successfully"
        if result:
            return jsonify({"msg": f"Group name already exsits.", "err": True})

    if request.method == "PUT":
        msg = "User added to the group successfully"
        username = request.json["username"]

    collection.update_one(
        {"group_name": group_name},
        {
            "$addToSet": {"users": username},
        },
        upsert=True,
    )
    return jsonify({"msg": msg})


@app.route("/api/messages", methods=["POST"])
@is_logged_in
def messages():
    collection = mongo.db.messages
    group_name = request.json["group_name"]
    message = request.json["message"]
    result = collection.find_one({"group_name": group_name})
    id = len(result.get("messages")) if result else 0
    collection.update_one(
        {"group_name": group_name},
        {
            "$set": {"group_admin": session["username"]},
            "$push": {
                "messages": {
                    "id": id,
                    "content": message["content"],
                    "username": message["username"],
                }
            },
        },
        upsert=True,
    )
    return jsonify({"msg": id})


@app.route("/api/logout")
def logout():
    session.clear()
    return jsonify({"msg": "Logged out successfully."})


if __name__ == "__main__":
    print("server init")
    app.secret_key = "mano42302@"
    app.run(debug=True)
