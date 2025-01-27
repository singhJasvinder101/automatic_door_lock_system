import serial
import time
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import pickle
import datetime
import shutil
import numpy as np
import cv2
import face_recognition
import logging
import starlette

logging.basicConfig(level=logging.DEBUG)

ATTENDANCE_LOG_DIR = './logs'
DB_PATH = './db'
for dir_ in [ATTENDANCE_LOG_DIR, DB_PATH]:
    if not os.path.exists(dir_):
        os.mkdir(dir_)


arduino_port = 'COM3'
baud_rate = 9600
try:
    arduino = serial.Serial(arduino_port, baud_rate, timeout=1)
    print(f"Connected to Arduino on {arduino_port}")
except serial.SerialException as e:
    arduino = None
    logging.error(f"Failed to connect to Arduino on {arduino_port}: {e}")

def lock_door():
    try:
        if arduino:
            command = 'l'  # Command for locking the door
            arduino.write(command.encode())
            print(f"Sent command to lock door: {command}")
        else:
            logging.warning("Arduino connection not available. Cannot lock door.")
    except Exception as e:
        logging.error(f"Error in locking door: {e}")

def unlock_door():
    try:
        if arduino:
            command = 'u'  # Command for unlocking the door
            arduino.write(command.encode())
            print(f"Sent command to unlock door: {command}")
        else:
            logging.warning("Arduino connection not available. Cannot unlock door.")
    except Exception as e:
        logging.error(f"Error in unlocking door: {e}")

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
    temp_file = None
    try:
        temp_file = f"{uuid.uuid4()}.png"
        contents = await file.read()
        with open(temp_file, "wb") as f:
            f.write(contents)

        img = cv2.imread(temp_file)
        if img is None:
            raise ValueError("Failed to load image")

        user_name, match_status = recognize(img)

        if match_status:
            unlock_door()
            epoch_time = time.time()
            date = time.strftime('%Y%m%d', time.localtime(epoch_time))
            with open(os.path.join(ATTENDANCE_LOG_DIR, f'{date}.csv'), 'a') as f:
                f.write(f'{user_name},{datetime.datetime.now()},IN\n')
        else:
            lock_door()

        return {'user': user_name, 'match_status': match_status}

    except Exception as e:
        logging.error(f"Error in login: {e}")
        return {'error': str(e)}, 500

    finally:
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)

@app.post("/logout")
async def logout(file: UploadFile = File(...)):
    lock_door()
    temp_file = None
    try:
        temp_file = f"{uuid.uuid4()}.png"
        contents = await file.read()
        with open(temp_file, "wb") as f:
            f.write(contents)

        img = cv2.imread(temp_file)
        if img is None:
            raise ValueError("Failed to load image")

        user_name, match_status = recognize(img)

        if match_status:
            epoch_time = time.time()
            date = time.strftime('%Y%m%d', time.localtime(epoch_time))
            with open(os.path.join(ATTENDANCE_LOG_DIR, f'{date}.csv'), 'a') as f:
                f.write(f'{user_name},{datetime.datetime.now()},OUT\n')

        return {'user': user_name, 'match_status': match_status}

    except Exception as e:
        logging.error(f"Error in logout: {e}")
        return {'error': str(e)}, 500

    finally:
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)


@app.post("/register_new_user")
async def register_new_user(file: UploadFile = File(...), text: str = Form(...)):
    temp_file = None
    try:
        temp_file = f"{uuid.uuid4()}.png"
        contents = await file.read()
        with open(temp_file, "wb") as f:
            f.write(contents)

        img = cv2.imread(temp_file)
        if img is None:
            raise ValueError("Failed to load image")

        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        embeddings = face_recognition.face_encodings(rgb_img)
        if not embeddings:
            raise ValueError("No face detected in the image")

        with open(os.path.join(DB_PATH, f'{text}.pickle'), 'wb') as file_:
            pickle.dump(embeddings, file_)

        return {'registration_status': 200}
    except Exception as e:
        logging.error(f"Error in registering new user: {e}")
        return {'error': str(e)}, 500

    finally:
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)

@app.get("/get_attendance_logs")
async def get_attendance_logs():
    filename = 'out.zip'
    shutil.make_archive(filename[:-4], 'zip', ATTENDANCE_LOG_DIR)
    return starlette.responses.FileResponse(filename, media_type='application/zip', filename=filename)

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
