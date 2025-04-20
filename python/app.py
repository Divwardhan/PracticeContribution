from flask import Flask , request , jsonify
from cv_script import detect_faces_realtime
from flask_cors import CORS
import threading
import time


app = Flask(__name__)
CORS(app)

@app.route("/detect-faces" , methods=["POST"])
def capture_faces():
    data = request.get_json()
    id =data.get("visitorId")
    image_path = detect_faces_realtime(id)

    if image_path:
        return jsonify({"status": "success", "image_path": image_path}), 200
    else:
        return jsonify({"status": "error", "message": "No face detected"}), 500

if __name__ == '__main__':
    app.run(debug = True)
