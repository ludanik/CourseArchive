import os
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
from flask import send_from_directory
from flask_cors import CORS
import sqlite3

UPLOAD_FOLDER = '/home/ian/repos/CourseArchive/server/files'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)

con = sqlite3.connect("files.db")
con.execute('''
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY,
        filename TEXT NOT NULL,
        name TEXT NOT NULL,
        course_code TEXT UNIQUE NOT NULL,
        professor TEXT NOT NULL,    
        session TEXT NOT NULL,
        year INTEGER NOT NULL
    )
''')
con.commit()
con.close()

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/files', methods=['GET'])
def get_file_list():
    # Fetch all files
    con = sqlite3.connect("files.db")
    res = con.execute("SELECT id,filename,name,course_code,professor,session,year FROM files")
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
            flash('No selected file')
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
                print("woops")
            finally:
                con.close()

            return { "uploadSuccess": True }
        
    return { "uploadSuccess": False }

@app.route('/uploads/<id>', methods=['GET'])
def access_upload(id):
    # Select filename using ID in request
    id = int(id)    
    con = sqlite3.connect("files.db")
    res = con.execute("SELECT filename FROM files WHERE id=?", (id,))
    res = res.fetchone()

    if res != None:
        name = str(res[0])
        
    con.close()

    return send_from_directory(app.config["UPLOAD_FOLDER"], name) if res != None else None
    
@app.route('/delete/<id>', methods=['GET'])
def delete_file(id):
    id = int(id)
    con = sqlite3.connect("files.db")
    with con:
        con.execute("DELETE FROM files WHERE id=?", (id,))
    con.commit()
    res = con.execute("SELECT filename FROM files WHERE id=?", (id,))
    con.close()

    return { "deleteSuccess": True } if res == None else { "deleteSuccess":False }