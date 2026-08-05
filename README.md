# 🩺 OncoCare: Breast Cancer CAD System

OncoCare is an intelligent Computer-Aided Diagnosis (CAD) web application designed to assist medical professionals in analyzing breast ultrasound images. Powered by Deep Learning and Explainable AI (Grad-CAM), this system provides rapid classifications (Normal, Benign, Malignant) and visual heatmaps to highlight tissue anomalies.

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

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/OncoCare-CAD-System.git](https://github.com/YOUR_USERNAME/OncoCare-CAD-System.git)
cd OncoCare-CAD-System
