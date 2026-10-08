from flask import Flask, request, render_template, jsonify
import os
import re
from datetime import datetime

from PyPDF2 import PdfReader
from docx import Document


app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================================================
# STORE LAST UPLOADED DOCUMENT
# =========================================================

latest_document_text = ""
latest_analysis = {}
latest_filename = ""


# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# EXTRACT TEXT FROM FILE
# =========================================================

def extract_text(file_path, filename):

    extension = os.path.splitext(filename)[1].lower()

    # -------------------------
    # TXT
    # -------------------------
    if extension == ".txt":

        with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
            return file.read()


    # -------------------------
    # PDF
    # -------------------------
    elif extension == ".pdf":

        text = ""

        reader = PdfReader(file_path)

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text


    # -------------------------
    # DOCX
    # -------------------------
    elif extension == ".docx":

        document = Document(file_path)

        text = ""

        for paragraph in document.paragraphs:

            if paragraph.text.strip():
                text += paragraph.text + "\n"

        return text


    return ""


# =========================================================
# ANALYZE DOCUMENT
# =========================================================

def analyze_document(text):

    lower_text = text.lower()


    # =====================================================
    # DEADLINE DETECTION
    # =====================================================

    deadline = "No deadline detected."

    deadline_patterns = [

        r"deadline\s*[:\-]?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})",

        r"deadline\s*[:\-]?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})",

        r"last date\s*[:\-]?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})",

        r"due date\s*[:\-]?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})"
    ]


    for pattern in deadline_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            deadline = match.group(1)

            break


    # =====================================================
    # REQUIREMENTS DETECTION
    # =====================================================

    requirement_keywords = {

        "Student Name": [
            "student name",
            "name of student"
        ],

        "College ID": [
            "college id",
            "college id number",
            "student id"
        ],

        "Team Name": [
            "team name"
        ],

        "Project Abstract": [
            "project abstract",
            "abstract"
        ],

        "Aadhaar": [
            "aadhaar",
            "aadhar"
        ],

        "Application Form": [
            "application form"
        ],

        "Mark Sheet": [
            "mark sheet",
            "marksheet"
        ],

        "Resume": [
            "resume",
            "cv"
        ],

        "Certificate": [
            "certificate"
        ]
    }


    requirements = []


    for name, keywords in requirement_keywords.items():

        for keyword in keywords:

            if keyword in lower_text:

                requirements.append(name)

                break


    # Remove duplicates
    requirements = list(dict.fromkeys(requirements))


    # =====================================================
    # IMPORTANT INFORMATION
    # =====================================================

    important_keywords = [

        "venue",
        "location",
        "registration",
        "instruction",
        "important",
        "contact",
        "department",
        "event",
        "submission"
    ]


    important = []


    for keyword in important_keywords:

        if keyword in lower_text:

            important.append(keyword.title())


    important = list(dict.fromkeys(important))


    # =====================================================
    # PRIORITY
    # =====================================================

    if deadline != "No deadline detected.":

        priority = "HIGH"

    elif len(requirements) > 0:

        priority = "MEDIUM"

    else:

        priority = "NORMAL"


    # =====================================================
    # MISSING INFORMATION
    # =====================================================

    missing = []


    if "contact" not in lower_text:

        missing.append("Contact information")


    if "venue" not in lower_text and "location" not in lower_text:

        missing.append("Venue / Location")


    # =====================================================
    # NEXT ACTION
    # =====================================================

    if deadline != "No deadline detected." and requirements:

        next_action = (
            f"Prepare the required information and "
            f"submit before {deadline}."
        )

    elif deadline != "No deadline detected.":

        next_action = (
            f"Review the deadline and complete the "
            f"required submission before {deadline}."
        )

    elif requirements:

        next_action = (
            "Collect the required information and "
            "complete the submission."
        )

    else:

        next_action = (
            "Review the uploaded information and "
            "identify the required next step."
        )


    # =====================================================
    # FINAL ANALYSIS
    # =====================================================

    return {

        "deadline": deadline,

        "requirements": requirements,

        "important": important,

        "priority": priority,

        "missing": missing,

        "next_action": next_action
    }


# =========================================================
# UPLOAD DOCUMENT
# =========================================================

@app.route("/upload", methods=["POST"])
def upload_file():

    global latest_document_text
    global latest_analysis
    global latest_filename


    # -----------------------------------------------------
    # CHECK FILE
    # -----------------------------------------------------

    if "file" not in request.files:

        return jsonify({
            "status": "error",
            "message": "No file uploaded."
        }), 400


    file = request.files["file"]


    if file.filename == "":

        return jsonify({
            "status": "error",
            "message": "No file selected."
        }), 400


    filename = file.filename

    extension = os.path.splitext(filename)[1].lower()


    # -----------------------------------------------------
    # CHECK FILE TYPE
    # -----------------------------------------------------

    allowed_extensions = [
        ".pdf",
        ".docx",
        ".txt"
    ]


    if extension not in allowed_extensions:

        return jsonify({
            "status": "error",
            "message": "Only PDF, DOCX and TXT files are supported."
        }), 400


    # -----------------------------------------------------
    # SAVE FILE
    # -----------------------------------------------------

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )


    file.save(file_path)


    # -----------------------------------------------------
    # EXTRACT TEXT
    # -----------------------------------------------------

    try:

        extracted_text = extract_text(
            file_path,
            filename
        )

    except Exception as error:

        return jsonify({
            "status": "error",
            "message": f"Could not read the document: {error}"
        }), 500


    # -----------------------------------------------------
    # CHECK EXTRACTED TEXT
    # -----------------------------------------------------

    if not extracted_text.strip():

        return jsonify({
            "status": "error",
            "message": (
                "The document was uploaded, "
                "but no readable text was found."
            )
        }), 400


    # -----------------------------------------------------
    # ANALYZE
    # -----------------------------------------------------

    analysis = analyze_document(
        extracted_text
    )


    # -----------------------------------------------------
    # STORE FOR COPILOT
    # -----------------------------------------------------

    latest_document_text = extracted_text

    latest_analysis = analysis

    latest_filename = filename


    # -----------------------------------------------------
    # SEND RESULT
    # -----------------------------------------------------

    return jsonify({

        "status": "success",

        "filename": filename,

        "analysis": analysis
    })


# =========================================================
# ASK COPILOT
# =========================================================

@app.route("/copilot", methods=["POST"])
def copilot():

    global latest_document_text
    global latest_analysis
    global latest_filename


    # -----------------------------------------------------
    # GET QUESTION
    # -----------------------------------------------------

    data = request.get_json()

    if not data:

        return jsonify({
            "status": "error",
            "message": "No question received."
        }), 400


    question = data.get(
        "question",
        ""
    ).strip()


    if not question:

        return jsonify({
            "status": "error",
            "message": "Please enter a question."
        }), 400


    # -----------------------------------------------------
    # CHECK DOCUMENT
    # -----------------------------------------------------

    if not latest_document_text:

        return jsonify({

            "status": "error",

            "message": (
                "Please upload a document first. "
                "Then ask Copilot."
            )
        })


    question_lower = question.lower()


    # =====================================================
    # DEADLINE QUESTION
    # =====================================================

    if (
        "deadline" in question_lower
        or "due" in question_lower
        or "last date" in question_lower
        or "when" in question_lower
    ):

        answer = (
            f"The detected deadline in "
            f"{latest_filename} is: "
            f"{latest_analysis.get('deadline', 'Not detected.')}"
        )


    # =====================================================
    # REQUIREMENT QUESTION
    # =====================================================

    elif (
        "requirement" in question_lower
        or "required" in question_lower
        or "need" in question_lower
    ):

        requirements = latest_analysis.get(
            "requirements",
            []
        )


        if requirements:

            answer = (
                "The required information detected "
                "in the document is:\n\n"
                + "\n".join(
                    f"• {item}"
                    for item in requirements
                )
            )

        else:

            answer = (
                "No specific requirements were "
                "detected in the document."
            )


    # =====================================================
    # PRIORITY QUESTION
    # =====================================================

    elif (
        "priority" in question_lower
        or "important" in question_lower
        or "urgent" in question_lower
    ):

        priority = latest_analysis.get(
            "priority",
            "NORMAL"
        )

        answer = (
            f"The current document priority "
            f"is {priority}."
        )


    # =====================================================
    # NEXT ACTION QUESTION
    # =====================================================

    elif (
        "next action" in question_lower
        or "what should i do" in question_lower
        or "what do i do" in question_lower
        or "action" in question_lower
    ):

        answer = (
            "Recommended next action:\n\n"
            + latest_analysis.get(
                "next_action",
                "Review the document."
            )
        )


    # =====================================================
    # VENUE QUESTION
    # =====================================================

    elif (
        "venue" in question_lower
        or "location" in question_lower
        or "where" in question_lower
    ):

        match = re.search(
            r"(?:venue|location)\s*[:\-]\s*(.+)",
            latest_document_text,
            re.IGNORECASE
        )


        if match:

            answer = (
                f"The detected venue/location is: "
                f"{match.group(1).splitlines()[0]}"
            )

        else:

            answer = (
                "I could not detect a specific "
                "venue or location."
            )


    # =====================================================
    # CONTACT QUESTION
    # =====================================================

    elif "contact" in question_lower:

        match = re.search(
            r"contact\s*[:\-]\s*(.+)",
            latest_document_text,
            re.IGNORECASE
        )


        if match:

            answer = (
                "The detected contact information is: "
                + match.group(1).splitlines()[0]
            )

        else:

            answer = (
                "No contact information was detected."
            )


    # =====================================================
    # GENERAL QUESTION
    # =====================================================

    else:

        deadline = latest_analysis.get(
            "deadline",
            "Not detected"
        )

        requirements = latest_analysis.get(
            "requirements",
            []
        )

        priority = latest_analysis.get(
            "priority",
            "NORMAL"
        )

        next_action = latest_analysis.get(
            "next_action",
            "Review the document."
        )


        answer = (
            f"Based on {latest_filename}:\n\n"
            f"• Deadline: {deadline}\n"
            f"• Priority: {priority}\n"
            f"• Requirements: "
            f"{', '.join(requirements) if requirements else 'None detected'}\n"
            f"• Next Action: {next_action}"
        )


    # -----------------------------------------------------
    # SEND ANSWER
    # -----------------------------------------------------

    return jsonify({

        "status": "success",

        "answer": answer
    })


# =========================================================
# RUN FLASK
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )