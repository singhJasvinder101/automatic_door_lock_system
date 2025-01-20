import os
import string
import urllib
import uuid
import pickle
import datetime
import time
import shutil
import numpy as np


import cv2
from fastapi import FastAPI, File, UploadFile, Form, UploadFile, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import face_recognition
import starlette


ATTENDANCE_LOG_DIR = './logs'
DB_PATH = './db'
for dir_ in [ATTENDANCE_LOG_DIR, DB_PATH]:
    if not os.path.exists(dir_):
        os.mkdir(dir_)

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/login")
async def login(file: UploadFile = File(...)):
    try:
        file.filename = f"{uuid.uuid4()}.png"
        contents = await file.read()

        with open(file.filename, "wb") as f:
            f.write(contents)

        img = cv2.imread(file.filename)
        if img is None:
            raise ValueError("Failed to load image")

        user_name, match_status = recognize(img)

        if match_status:
            epoch_time = time.time()
            date = time.strftime('%Y%m%d', time.localtime(epoch_time))
            with open(os.path.join(ATTENDANCE_LOG_DIR, '{}.csv'.format(date)), 'a') as f:
                f.write('{},{},{}\n'.format(user_name, datetime.datetime.now(), 'IN'))

        # Clean up temporary file
        if os.path.exists(file.filename):
            os.remove(file.filename)

        return {'user': user_name, 'match_status': match_status}
    
    except Exception as e:
        logging.error(f"Error in login: {e}")
        # Clean up temporary file in case of error
        if os.path.exists(file.filename):
            os.remove(file.filename)
        return {'error': str(e)}, 500

@app.post("/logout")
async def logout(file: UploadFile = File(...)):

    file.filename = f"{uuid.uuid4()}.png"
    contents = await file.read()

    with open(file.filename, "wb") as f:
        f.write(contents)

    user_name, match_status = recognize(cv2.imread(file.filename))

    if match_status:
        epoch_time = time.time()
        date = time.strftime('%Y%m%d', time.localtime(epoch_time))
        with open(os.path.join(ATTENDANCE_LOG_DIR, '{}.csv'.format(date)), 'a') as f:
            f.write('{},{},{}\n'.format(user_name, datetime.datetime.now(), 'OUT'))
            f.close()

    return {'user': user_name, 'match_status': match_status}


import logging

logging.basicConfig(level=logging.DEBUG)

@app.post("/register_new_user")
async def register_new_user(file: UploadFile = File(...), text: str = Form(...)):
    logging.info(f"Received registration request for: {text}")
    try:
        file.filename = f"{uuid.uuid4()}.png"
        contents = await file.read()
        with open(file.filename, "wb") as f:
            f.write(contents)

        img = cv2.imread(file.filename)
        if img is None:
            raise ValueError("Failed to load image")

        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        embeddings = face_recognition.face_encodings(rgb_img)
        if not embeddings:
            raise ValueError("No face detected in the image")

        with open(os.path.join(DB_PATH, f'{text}.pickle'), 'wb') as file_:
            pickle.dump(embeddings, file_)

        os.remove(file.filename)
        return {'registration_status': 200}
    except Exception as e:
        logging.error(f"Error in registering new user: {e}")
        if os.path.exists(file.filename):
            os.remove(file.filename)
        return {'error': str(e)}, 500

@app.get("/get_attendance_logs")
async def get_attendance_logs():

    filename = 'out.zip'

    shutil.make_archive(filename[:-4], 'zip', ATTENDANCE_LOG_DIR)

    ##return File(filename, filename=filename, content_type="application/zip", as_attachment=True)
    return starlette.responses.FileResponse(filename, media_type='application/zip',filename=filename)


def recognize(img):
    try:
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        embeddings_unknown = face_recognition.face_encodings(rgb_img)
        if not embeddings_unknown:
            return 'no_face_detected', False
        
        embedding_to_check = embeddings_unknown[0]

        match = False
        j = 0

        db_dir = sorted([j for j in os.listdir(DB_PATH) if j.endswith('.pickle')])
        if not db_dir:
            return 'no_registered_users', False

        while (not match) and (j < len(db_dir)):
            path_ = os.path.join(DB_PATH, db_dir[j])

            with open(path_, 'rb') as file:
                stored_embeddings = pickle.load(file)
                
                if isinstance(stored_embeddings, list):
                    stored_embedding = stored_embeddings[0]
                else:
                    stored_embedding = stored_embeddings

                if len(stored_embedding.shape) == 1:
                    stored_embedding = np.array([stored_embedding])

                # Compare faces
                match = face_recognition.compare_faces(stored_embedding, embedding_to_check)[0]

            j += 1

        if match:
            return db_dir[j - 1][:-7], True
        else:
            return 'unknown_person', False

    except Exception as e:
        logging.error(f"Error in recognize function: {e}")
        return 'error_processing_image', False


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



# py -3.9 -m python main.py    # -m arguments require full command of pyhton
# py -3.9 .\main.py  