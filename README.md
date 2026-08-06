# 🩺 OncoCare: Breast Cancer CAD System

OncoCare is an intelligent Computer-Aided Diagnosis (CAD) web application designed to assist medical professionals in analyzing breast ultrasound images. Powered by Deep Learning (DenseNet121 model) and Explainable AI (Grad-CAM), this system provides rapid classifications (Normal, Benign, Malignant) and visual heatmaps to highlight tissue anomalies. 

## 📊 Dataset
This project uses the **Breast Ultrasound Images (BUSI)** dataset. 
* **Source / Original Link:** [Kaggle - Breast Ultrasound Images Dataset](https://www.kaggle.com/datasets/aryashah2k/breast-ultrasound-images-dataset)
* **Classes:** Normal, Benign, Malignant
* **Preprocessing:** Images were resized to 224x224 pixels, normalized, and augmented with contrast adjustments.

While the live web application uses DenseNet121 model because of its light size, I have also trained and experimented with other deep learning models for this dataset, which are EfficientNet-B7 and ResNet50 and their overlay. You can explore the alternative models in my Hugging Face repository here: https://huggingface.co/Ken2707/PLACEHOLDER/tree/main

Click this video link to watch the web application demo: PLACEHOLDER

Web application screenshots: PLACEHOLDER

## Key Features
* **AI-Powered Diagnostics:** Rapid classification using a trained Deep Learning model.
* **Explainable AI (Grad-CAM):** Generates transparent visual heatmaps showing exactly which areas of the ultrasound triggered the AI's decision.
* **Seamless Workflow:** Drag-and-drop image upload, clipboard paste support, and one-click quick sample testing.
* **Session History:** Keeps track of previous scans during the active session.

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Axios
* **Backend:** Python, FastAPI, TensorFlow/PyTorch, OpenCV
* **Database (Local/Session):** SQLite

---

## How to Run Locally

### 1. Clone the Repository
git clone [https://github.com/YOUR_USERNAME/Breast-Cancer-Detect.git](https://github.com/YOUR_USERNAME/OncoCare-CAD-System.git)

cd Breast-Cancer-Detect

### 2. Backend Setup (FastAPI)
Open a terminal and navigate to the backend folder: 

cd backend
# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Mac/Linux
# Install dependencies
pip install -r requirements.txt
# Run the server
uvicorn main:app --reload

The backend API will be available at http://localhost:8000

### 3. Open a new terminal and navigate to the frontend folder:
cd frontend
# Install Node modules
npm install
# Start the development server
npm run dev
The web app will be available at http://localhost:5173

Disclaimer: This application serves as an initial decision-support system and does not replace professional medical diagnosis.
