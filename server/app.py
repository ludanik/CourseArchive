import os
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
from flask import send_from_directory
from flask_cors import CORS
import sqlite3
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
import functools

UPLOAD_FOLDER = '/home/ian/repos/CourseArchive/server/files'
ALLOWED_EXTENSIONS = {'pdf'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'teehee'
CORS(app)

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

@app.before_request
def load_logged_in_user():
    """If a user id is stored in the session, load the user object from
    the database into ``g.user``."""
    user_id = session.get("user_id")

    if user_id is None:
        g.user = None
    else:
        con = sqlite3.connect("files.db")
        g.user = con.execute("SELECT * FROM user WHERE id = ?", (user_id,)).fetchone()
        con.close()

@app.route("/register", methods=("GET", "POST"))
def register():
    """Register a new user.

    Validates that the username is not already taken. Hashes the
    password for security.
    """
    if request.method == "POST":
        username = request.form['username']
        password = request.form['password']
        error = None

        if not username:
            error = "Username is required."
        elif not password:
            error = "Password is required."

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
                error = f"User {username} is already registered."
            else:
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
        username = request.form['username']
        password = request.form['password']

        con = sqlite3.connect("files.db")
        error = None
        user = con.execute(
            "SELECT * FROM user WHERE username = ?", (username,)
        ).fetchone()

        if user is None:
            error = "Incorrect username."
        elif not check_password_hash(user[2], password):
            error = "Incorrect password."

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
    if g.user is None:
        return {
            "error":"log in lil bro"
        }

    con = sqlite3.connect("files.db")
    res = con.execute("SELECT id,filename,name,course_code,professor,year FROM files")
    res = res.fetchall()
    print(res)
    total = []
    if res != None:
        for l in res:
            json = {
                "id": str(l[0]),
                "name": l[2],
                "course_code": l[3],
                "professor": l[4],
                "session": l[5],
                "year": l[6]
            }
            total.append(json)
    con.close()

    return total if res != None else None

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if g.user is None:
        return {
            "error":"log in lil bro"
        }

    if request.method == 'POST':
        print(request.form, flush=True)
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
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
                "name":request.form["title"], 
                "filename":filename,
                "course_code":request.form["code"], 
                "professor":request.form["prof"], 
                "session":request.form["session"], 
                "year":request.form["year"]
            } 

            data["id"] = abs ( hash(data["name"] + data["filename"] + data["course_code"]) )

            print(f"id: {data["id"]}")

            try:
                con = sqlite3.connect("files.db")
                with con:
                    con.execute("INSERT INTO files VALUES(:id, :filename, :name, :course_code, :professor, :session, :year)", data)
            except sqlite3.IntegrityError:
                raise sqlite3.IntegrityError
            finally:
                con.close()

            return { "uploadSuccess": True }
        
    return { "uploadSuccess": False }

def update():
    if g.user is None:
        return {
            "error":"log in lil bro"
        }

@app.route('/uploads/<id>', methods=['GET'])
def access_upload(id):
    if g.user is None:
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
    if g.user is None:
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