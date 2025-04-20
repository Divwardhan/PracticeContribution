import cv2
import time
import os
def detect_faces_realtime(id):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Cannot access the camera.")
        return None

    os.makedirs("raw_captures_faces", exist_ok=True)

    face_detected_time = None
    saved = False
    image_path = None
    start_time = time.time()  # Start timer

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        if len(faces) > 0:
            if face_detected_time is None:
                face_detected_time = time.time()
            elif not saved and (time.time() - face_detected_time >= 3):
                for (x, y, w, h) in faces:
                    face_img = frame[y:y + h, x:x + w]
                    image_path = f"raw_captures_faces/{id}.jpg"
                    cv2.imwrite(image_path, face_img)
                    print(f"Saved: {image_path}")
                    saved = True
                    break
                break
        else:
            face_detected_time = None
            saved = False

        # Real timeout check (e.g., 10 seconds total runtime)
        if time.time() - start_time > 10:
            print("No face detected within time limit.")
            break

    cap.release()
    return image_path
