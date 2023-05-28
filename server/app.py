from flask import Flask, jsonify, request, session
from flask_pymongo import PyMongo
from flask_cors import CORS
from passlib.hash import sha256_crypt
from functools import wraps
import datetime
import jwt
import json
from bson import json_util
from bson.objectid import ObjectId

app = Flask(__name__)
app.secret_key = "mano42302@"
app.permanent_session_lifetime = datetime.timedelta(minutes=45)
app.config["MONGO_URI"] = "mongodb://localhost:27017/chat_app"
CORS(app)

mongo = PyMongo(app)


def validate_jwt(token):
    try:
        data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
        session["username"] = data["username"]
        session["role"] = data["role"]
    except Exception as err:
        print("Token error", err)
        return False
    return True


def is_logged_in(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if "Authorization" in request.headers and validate_jwt(
            request.headers["Authorization"]
        ):
            return f(*args, **kwargs)
        else:
            return jsonify({"msg": "Unauthorized, Please login", "err": True})

    return wrap


def is_admin(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        try:
            validate_jwt(request.headers["Authorization"])
            if "Authorization" in request.headers and session["role"] == "admin":
                return f(*args, **kwargs)
            else:
                return jsonify(
                    {"msg": "Unauthorized, Please login as admin", "err": True}
                )
        except:
            return jsonify({"msg": "Unauthorized, Please login as admin", "err": True})

    return wrap


@app.route("/", methods=["GET"])
@is_logged_in
def test():
    return jsonify({"manoj": "kumar"})


@app.route("/api/manage_user", methods=["POST", "PUT", "DELETE"])
@is_admin
def manage_user():
    collection = mongo.db.users
    if request.method == "DELETE":
        print("in side delete")
        id = request.args.get("id")
        print(id)
        result = collection.delete_one({"_id": ObjectId(id)})
        return jsonify({"msg": "User deleted successfully"})

    username = request.json["username"]
    result = collection.find_one({"username": username})

    if result and request.method == "POST":
        return jsonify({"msg": f"User with {username=} Already exsits.", "err": True})

    name = request.json["name"]
    role = request.json["role"]
    data = {"name": name, "role": role}
    if request.method == "POST":
        password = sha256_crypt.encrypt(str(request.json["password"]))
        data["password"] = password

    collection.update_one(
        {"username": username},
        {"$set": data},
        upsert=True,
    )
    return jsonify({"msg": "User updated successfully"})


@app.route("/api/get_users", methods=["GET"])
@is_logged_in
def get_users():
    collection = mongo.db.users
    users = collection.find({}, {"password": 0})
    return json.loads(json_util.dumps(users))


@app.route("/api/login", methods=["POST"])
def login():
    print("request", request.method)
    if request.method == "POST":
        collection = mongo.db.users
        username = request.json["username"]
        password_candidate = request.json["password"]
        result = collection.find_one({"username": username})
        if result:
            password = result["password"]
            role = result["role"]
            if sha256_crypt.verify(password_candidate, password):
                session["username"] = username
                session["role"] = role
                token = jwt.encode(
                    {
                        "username": result["username"],
                        "role": result["role"],
                        "name": result["name"],
                        "exp": datetime.datetime.utcnow()
                        + datetime.timedelta(minutes=45),
                    },
                    app.secret_key,
                    algorithm="HS256",
                )
                print("session", session)
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
    
    if request.method == "DELETE":
        group_name = request.args['group_name']
        collection.delete_one({"group_name": group_name})
        message_collection.delete_one({"group_name": group_name})
        return jsonify({"msg": f"Group deleted successfully"})
    
    group_name = request.json["group_name"]

    if request.method == "POST":
        result = collection.find_one({"group_name": group_name})
        username = [session["username"]]
        msg = "Group created successfully"
        if result:
            return jsonify({"msg": f"Group name already exsits.", "err": True})

    if request.method == "PUT":
        msg = "User added to the group successfully"
        username = request.json["username"]
    print(username, "=========", type(username))
    collection.update_one(
        {"group_name": group_name},
        {
            "$set": {"group_admin": session["username"], "users": username},
        },
        upsert=True,
    )
    return jsonify({"msg": msg})


@app.route("/api/get_groups", methods=["GET"])
@is_logged_in
def get_groups():
    collection = mongo.db.groups
    groups = collection.find({"users": session["username"]})
    return json.loads(json_util.dumps(groups))


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
            "$push": {
                "messages": {
                    "id": id,
                    "content": message,
                    "username": session["username"],
                }
            },
        },
        upsert=True,
    )
    return jsonify({"msg": id})


@app.route("/api/get_messages", methods=["GET"])
@is_logged_in
def get_messages():
    group_name = request.args.get("group_name")
    collection = mongo.db.messages
    print(group_name)
    messages = collection.find_one({"group_name": group_name})
    return json.loads(json_util.dumps(messages))


@app.route("/api/logout")
def logout():
    session.clear()
    return jsonify({"msg": "Logged out successfully."})


if __name__ == "__main__":
    print("server init")
    app.run(debug=True)
