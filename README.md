# 🩺 OncoCare: Breast Cancer CAD System

OncoCare is an intelligent Computer-Aided Diagnosis (CAD) web application designed to assist medical professionals in analyzing breast ultrasound images. Powered by Deep Learning (DenseNet121 model) and Explainable AI (Grad-CAM), this system provides rapid classifications (Normal, Benign, Malignant) and visual heatmaps to highlight tissue anomalies. 

## 🔗 Quick Links & Resources
Live Web Application: https://breast-cancer-detect-q59t.vercel.app

GitHub Repository: https://github.com/KenNicholas/Breast-Cancer-Detect

Backend Model & API Space: [Hugging Face Space](https://huggingface.co/spaces/Ken2707/Breast_cancer_detect/tree/main)

Alternative Model Checkpoints: [Hugging Face Model Repository](https://huggingface.co/Ken2707/Breast-Cancer-Detect/tree/main)

Video Demonstration: https://drive.google.com/file/d/10hlWgCHXefhtkTiyTS8pHPUtuwz6Z_Xp/view?usp=sharing

## 📊 Dataset
This project uses the **Breast Ultrasound Images (BUSI)** dataset. 
* **Source / Original Link:** [Kaggle - Breast Ultrasound Images Dataset](https://www.kaggle.com/datasets/aryashah2k/breast-ultrasound-images-dataset)
* **Classes:** Normal, Benign, Malignant
* **Preprocessing:** Images were resized to 224x224 pixels, normalized, and augmented with contrast adjustments.

While the live web application uses DenseNet121 model because of its light size, I have also trained and experimented with other deep learning models for this dataset, which are EfficientNet-B7 and ResNet50 and their overlay. You can explore the alternative models in my Hugging Face repository here: https://huggingface.co/Ken2707/URL_detect_models/tree/main

Web application screenshots:

<img width="300" height="200" alt="Screenshot 2026-08-07 162249" src="https://github.com/user-attachments/assets/f52168c2-7902-4436-8007-30b90aece714" />
<img width="300" height="200" alt="Screenshot 2026-08-07 162410" src="https://github.com/user-attachments/assets/0d83b5f7-faf4-438a-8360-c5a155abffb1" />
<img width="300" height="200" alt="Screenshot 2026-08-07 162437" src="https://github.com/user-attachments/assets/1da4fc2e-cff2-4647-8624-2f78d1fff94f" />
<img width="300" height="200" alt="Screenshot 2026-08-07 162504" src="https://github.com/user-attachments/assets/fbfda6f3-bad9-45bb-abc7-bc171b76f29e" />
<img width="300" height="200" alt="Screenshot 2026-08-07 162524" src="https://github.com/user-attachments/assets/61350424-3b13-4ae4-8090-7420196f23ff" />
<img width="300" height="200" alt="Screenshot 2026-08-07 162539" src="https://github.com/user-attachments/assets/0164c81b-45fd-4574-87d6-8cb6eb45cbf4" />


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
### On windows
venv\Scripts\activate  
### On Mac/Linux
source venv/bin/activate 
# Install dependencies
pip install -r requirements.txt
# Run the server
uvicorn app:app --reload

The backend API will be available at http://localhost:8000

### 3. Open a new terminal and navigate to the frontend folder:
cd frontend
# Install Node modules
npm install
# Start the development server
npm run dev

The web app will be available at http://localhost:5173

Disclaimer: This application serves as an initial decision-support system and does not replace professional medical diagnosis.
