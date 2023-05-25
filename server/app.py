from flask import Flask, jsonify, request, session                                                  
from flask_pymongo import PyMongo
from passlib.hash import sha256_crypt
from functools import wraps

app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://localhost:27017/chat_app'
mongo = PyMongo(app)


def is_logged_in(f):
	@wraps(f)
	def wrap(*args, **kwargs):
		if 'logged_in' in session:
			return f(*args, **kwargs)
		else:
			return jsonify({"msg":"Unauthorized, Please login", "err":True})
	return wrap


@app.route('/', methods = ['GET'])
@is_logged_in
def retrieveAll():
    return jsonify({'manoj':'kumar'})


@app.route('/api/register', methods=['POST'])
def register():
    collection = mongo.db.users
    name = request.json['name']
    email = request.json['email']
    username = request.json['username']
    password = sha256_crypt.encrypt(str(request.json['password']))

    collection.update_one(
        { "email":email },
        {
            "$set": {
                "name":name,
                "username":username,
                "password":password
            }
        }, upsert=True)
    return jsonify({"msg":"User created successfully"})


@app.route('/api/login', methods = ['POST'])
def login():
    print('called')
    collection = mongo.db.users
    username = request.json['username']
    password_candidate = request.json['password']
    result = collection.find_one({'username': username})
    if result:
        password = result['password']
        if sha256_crypt.verify(password_candidate, password):
            session['logged_in'] = True
            session['username'] = username
            return jsonify({'msg': 'Logged in successfully.'})
        else:
            return jsonify({'msg': 'Invalid username or password.', 'err':True})
    else:
        return jsonify({'msg': 'User not found', 'err':True})


@app.route('/api/logout')
def logout():
	session.clear()
	return jsonify({"msg":"Logged out successfully."})


if __name__ =='__main__':
    print('server init')
    app.secret_key='mano42302@'
    app.run(debug =True)