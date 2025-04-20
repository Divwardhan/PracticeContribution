import cv2
import easyocr

def extract_license_plate_text(image_path):
    img = cv2.imread(image_path)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    bfilter = cv2.bilateralFilter(gray, 11, 17, 17)

    edged = cv2.Canny(bfilter, 30, 200)

    contours, _ = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]

    location = None
    for contour in contours:
        approx = cv2.approxPolyDP(contour, 10, True)
        if len(approx) == 4:
            location = approx
            break

    if location is None:
        return "License plate not found."

    x, y, w, h = cv2.boundingRect(location)
    roi = gray[y:y+h, x:x+w]

    reader = easyocr.Reader(['en'], gpu=False)
    result = reader.readtext(roi)

    if result:
        return result[0][1]  
    else:
        return "Text not detected."

plate_text = extract_license_plate_text("./raw_captures_faces/1.jpg")
print("License Plate Text:", plate_text)