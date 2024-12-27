import os
from flask import Flask, flash, request, redirect, url_for, send_from_directory, session
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
from flask_cors import CORS
import sqlite3
import re
import time

UPLOAD_FOLDER = '/home/ian/repos/CourseArchive/server/files'
ALLOWED_EXTENSIONS = {'pdf'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'teehee'
SESSION_TYPE = 'filesystem'
app.config.from_object(__name__)
CORS(app, supports_credentials=True)

con = sqlite3.connect("files.db")

con.execute('''    
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT,
        author_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        name TEXT NOT NULL,
        course_code TEXT NOT NULL,
        professor TEXT NOT NULL,
        created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        year INTEGER NOT NULL,
        FOREIGN KEY (author_id) REFERENCES user (id)
    );
''')

con.execute('''
    CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );    
    ''')

con.commit()
con.close()

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/register", methods=("GET", "POST"))
def register():
    """Register a new user.

    Validates that the username is not already taken. Hashes the
    password for security.
    """
    if request.method == "POST":
        username = request.form['email']
        password = request.form['password']

        error = None

        if not username or not password:
            return {
                "registerSuccess": False,
                "error": "bad user or pass"
            }

        if not re.match("[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?", username):
            return {
                "registerSuccess": False,
                "error": "no email format sir"
            }

        arr = username.split("@")
        if arr[1] != "my.yorku.ca":
            return {
                "registerSuccess": False,
                "error": "my.yorku.ca mandatory sir"
            }

        if error is None:
            try:
                con = sqlite3.connect("files.db")
                con.execute(
                    "INSERT INTO user (username, password) VALUES (?, ?)",
                    (username, generate_password_hash(password)),
                )
                con.commit()
            except sqlite3.IntegrityError:
                # The username was already taken, which caused the
                # commit to fail. Show a validation error.
                return {
                    "registerSuccess": False,
                    "error": "username taken"
                } 
            finally:
                con.close()

            # Success, go to the login page.
            print(f"Registered {username} {password}")
            return {
                "registerSuccess": True,
                "error": error
            }
                
        else:
            print(error)
            return {
                "registerSuccess": False,
                "error": error
            }
        
@app.route("/login", methods=("GET", "POST"))
def login():
    """Log in a registered user by adding the user id to the session."""
    if request.method == "POST":
        username = request.form['email']
        password = request.form['password']

        con = sqlite3.connect("files.db")
        error = None
        user = con.execute(
            "SELECT * FROM user WHERE username = ?", (username,)
        ).fetchone()
        print(user)
        con.close()

        if user is None or not check_password_hash(user[2], password):
            return {
                "loginSuccess": False,
                "error": "just put the fries in the bag bro"
            }

        if not re.match("[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?", username):
            return {
                "loginSuccess": False,
                "error": "just put the fries in the bag bro"
            }

        arr = username.split("@")
        if arr[1] != "my.yorku.ca":
            return {
                "loginSuccess": False,
                "error": "just put the fries in the bag bro"
            }

        if error is None:
            # store the user id in a new session and return to the index
            session.clear()
            session["user_id"] = user[0]
            print(f"Logged in {username} {password}")
            return {
                "loginSuccess": True
            }
        print(error)
        return {
            "loginSuccess": False,
            "error": error
        }

@app.route("/logout", methods=['GET'])
def logout():
    """Clear the current session, including the stored user id."""
    session.clear()
    return redirect(url_for("index"))

@app.route('/files', methods=['GET'])
def get_file_list():
    # Fetch all files
    if session["user_id"] is None:
        return {
            "error":"log in lil bro"
        }

    con = sqlite3.connect("files.db")
    res = con.execute("""SELECT 
                        f.id,
                        f.author_id,
                        u.username,
                        f.filename,
                        f.name,
                        f.course_code,
                        f.professor,
                        f.created,
                        f.year
                        FROM files f
                        JOIN user u ON f.author_id = u.id; """)

    res = res.fetchall()

    print(res)
    total = []
    if res != None:
        for l in res:
            json = {
                "id": str(l[0]),
                "author_id":l[1],
                "author_name":l[2],
                "name": l[4],
                "course_code": l[5],
                "professor": l[6],
                "year": l[8],
            }
            total.append(json)
    con.close()

    return total if res != None else None

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if session["user_id"] is None:
        return {
            "error":"log in lil bro"
        }

    if request.method == 'POST':
        print(request.form, flush=True)
        # check if the post request has the file part
        if 'file' not in request.files:
            return {
                "uploadSuccess": False 
            }
        file = request.files['file']
        #    If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            return {
                "uploadSuccess": False 
            }
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

            data = {
                "author_id":session["user_id"],
                "name":request.form["title"], 
                "filename":filename,
                "course_code":request.form["code"], 
                "professor":request.form["prof"], 
                "year":request.form["year"],
                "timestamp":int(time.time()) 
            } 

            data["id"] = abs ( hash(data["name"] + data["filename"] + data["course_code"]) )

            print(f"id: {data["id"]}")
            try:
                con = sqlite3.connect("files.db")
                with con:   
                    con.execute("INSERT INTO files VALUES(:id, :author_id, :filename, :name, :course_code, :professor, :timestamp, :year)", data)
            except sqlite3.IntegrityError:
                raise sqlite3.IntegrityError
            finally:
                con.close()

            return { "uploadSuccess": True }
        
    return { "uploadSuccess": False }

def update():
    if session["user_id"] is None:
        return {
            "error":"log in lil bro"
        }

@app.route('/uploads/<id>', methods=['GET'])
def access_upload(id):
    if session["user_id"] is None:
            return {
                "error":"log in lil bro"
            }
    
    # Select filename using ID in request
    id = int(id)    
    con = sqlite3.connect("files.db")
    res = con.execute("SELECT filename FROM files WHERE id=?", (id,))
    res = res.fetchone()

    if res != None:
        name = str(res[0])
        
    con.close()

    return send_from_directory(app.config["UPLOAD_FOLDER"], name) if res != None else None

@app.route('/delete/<id>', methods=['DELETE'])
def delete_file(id):
    if session["user_id"] is None:
        return {
            "error":"log in lil bro"
        }

    # Remove from DB
    id = int(id)
    con = sqlite3.connect("files.db")
    filename = None
    try:
        res = con.execute("SELECT filename FROM files WHERE id=?", (id,))
        res = res.fetchone()
        if res != None:
            print(res)
            filename = res[0]
            con.execute("DELETE FROM files WHERE id=?", (id,))
            con.commit()
        else:
            print(f"Could not find file with id {id}")
    except Exception as e:
        raise e
    finally:
        con.close()

    # Remove physical file
    if filename != None:
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        except:
            print(f"Could not remove file {filename}")

    return { "deleteSuccess": True } if res == None and filename != None else { "deleteSuccess": False }