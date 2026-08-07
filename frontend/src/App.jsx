import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.DEV 
  ? "http://localhost:8000" 
  : "https://ken2707-breast-cancer-detect.hf.space";

function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [isLoginMode, setIsLoginMode] = useState(true);
    
  // Initialize User
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("oncocare_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Initialize active user from local storage
  const [scanHistory, setScanHistory] = useState(() => {
    const savedUser = localStorage.getItem("oncocare_user");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    const historyKey = parsedUser ? `scan_history_${parsedUser.email}` : "scan_history_guest";
    
    const savedHistory = localStorage.getItem(historyKey);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // keep scan history in local storage whenever it change
  useEffect(() => {
    const historyKey = user ? `scan_history_${user.email}` : "scan_history_guest";
    localStorage.setItem(historyKey, JSON.stringify(scanHistory));
  }, [scanHistory, user]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
      
    const inputEmail = e.target.email.value;

    if (isLoginMode) {
      // login
      const savedData = localStorage.getItem("registered_user");
      if (savedData) {
        const registeredUser = JSON.parse(savedData);
        if (registeredUser.email === inputEmail) {
          setUser(registeredUser);
          localStorage.setItem("oncocare_user", JSON.stringify(registeredUser));
          
          // user's history
          const userHistory = localStorage.getItem(`scan_history_${registeredUser.email}`);
          setScanHistory(userHistory ? JSON.parse(userHistory) : []);
          
          setActiveTab('analysis');
        } else {
          alert("Invalid email. Please try again or Sign Up.");
        }
      } else {
        alert("No account found. Please Sign Up first.");
      }
    } else {
      // sign up
      const inputName = e.target.name.value;
      const inputRole = e.target.role.value;
        
      const currentDate = new Date();
      const joinedDate = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

      const newUser = {
        name: inputName,
        email: inputEmail,
        role: inputRole,
        joined: joinedDate
      };

      localStorage.setItem("registered_user", JSON.stringify(newUser));
      setUser(newUser);
      localStorage.setItem("oncocare_user", JSON.stringify(newUser));
      
      // if new user -> new history
      const userHistory = localStorage.getItem(`scan_history_${newUser.email}`);
      setScanHistory(userHistory ? JSON.parse(userHistory) : []);
      
      setActiveTab('analysis');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("oncocare_user"); 
    
    // change history to guest history
    const guestHistory = localStorage.getItem("scan_history_guest");
    setScanHistory(guestHistory ? JSON.parse(guestHistory) : []);
    
    setActiveTab('auth');
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    } else {
      setError("Please upload a valid image file (.jpg, .png, .jpeg)");
    }
  };

  const loadSample = async (sampleName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/samples/${sampleName}`);
      if (!response.ok) throw new Error("Sample not found");
      const blob = await response.blob();
      const file = new File([blob], sampleName, { type: blob.type });
      handleFile(file);
    } catch (err) {
      console.error(err);
      setError(`Failed to load sample: ${sampleName}.`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = useCallback((e) => {
    if (activeTab !== 'analysis') return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        handleFile(file);
        break;
      }
    }
  }, [activeTab]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await axios.post(`${BASE_URL}/api/scan`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "success") {
        setResult(response.data.result);
        
        const newRecord = {
          id: Date.now(),
          image: previewUrl,
          prediction: response.data.result.prediction,
          confidence: response.data.result.confidence,
          date: new Date().toLocaleString(),
        };
        setScanHistory(prev => [newRecord, ...prev]);

      } else {
        setError("Failed to process server analysis.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection error to FastAPI backend. Ensure the server is active.");
    } finally {
      setLoading(false);
    }
  };

  const isNormal = result && result.prediction.toLowerCase() === "normal";
  const confidencePercent = result ? result.confidence * 100 : 0;

  const renderAuth = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-teal-400 mb-2">Welcome to OncoCare</h2>
        <p className="text-slate-400 mb-6 text-sm">
          {isLoginMode ? "Sign in to continue your session." : "Create an account to securely save your history."}
        </p>
        
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {!isLoginMode && (
            <input name="name" type="text" placeholder="Full Name (e.g. Dr. Ken)" required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 transition animate-fade-in" />
          )}
          
          <input name="email" type="email" placeholder="Email Address" required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 transition" />
          
          {!isLoginMode && (
            <div className="relative animate-fade-in">
              <select name="role" required defaultValue="" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-teal-500 transition appearance-none cursor-pointer">
                <option value="" disabled hidden>Select Your Role</option>
                <option value="Radiologist">Radiologist</option>
                <option value="Oncologist">Oncologist</option>
                <option value="General Practitioner">General Practitioner</option>
                <option value="Medical Student">Medical Student</option>
                <option value="Guest Researcher">Guest Researcher</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                ▼
              </div>
            </div>
          )}

          <input name="password" type="password" placeholder="Password" required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 transition" />
          
          <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition shadow-lg mt-4">
            {isLoginMode ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-slate-400 text-sm">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-teal-400 hover:text-teal-300 font-semibold transition">
            {isLoginMode ? "Sign Up here" : "Login here"}
          </button>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="px-3 text-slate-500 text-sm">OR</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <button onClick={() => setActiveTab('analysis')} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition shadow-md">
          Continue as Guest
        </button>
      </div>
    </div>
  );

  {/* history */}
  const renderHistory = () => (
    <div className="w-full max-w-6xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Analysis History</h2>
          {!user && (
            <p className="text-amber-400 text-sm mt-1 bg-amber-900/30 px-3 py-1 rounded-lg inline-block border border-amber-800/50">
              ⚠️ Guest Mode: History is stored locally and will be lost when you close this browser.
            </p>
          )}
        </div>
        <p className="text-slate-400 text-sm">Total Scans: {scanHistory.length}</p>
      </div>

      {scanHistory.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-16 text-center">
          <p className="text-slate-400 text-lg">No scans performed yet.</p>
          <button onClick={() => setActiveTab('analysis')} className="mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition">
            Start a New Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scanHistory.map((item) => (
            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg flex flex-col">
              <img src={item.image} alt="Scan" className="h-48 w-full object-cover rounded-xl border border-slate-700 mb-4" />
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  item.prediction === 'Malignant' ? 'bg-red-900 text-red-300' : 
                  item.prediction === 'Benign' ? 'bg-amber-900 text-amber-300' : 'bg-teal-900 text-teal-300'
                }`}>
                  {item.prediction.toUpperCase()}
                </span>
                <span className="text-slate-400 text-xs">{item.date}</span>
              </div>
              <p className="text-slate-300 text-sm">Confidence: {(item.confidence * 100).toFixed(2)}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  {/* account */}
  const renderAccount = () => (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-slate-200 mb-6 border-b border-slate-700 pb-4">Account Overview</h2>
        {user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-teal-900 rounded-full flex items-center justify-center border-4 border-teal-500 text-teal-300 text-4xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                <p className="text-slate-400">{user.email}</p>
                <p className="text-teal-400 text-sm mt-1">{user.role}</p>
              </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-sm">Member Since</p>
              <p className="text-slate-200 font-medium">{user.joined}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-sm">Total Scans Conducted</p>
              <p className="text-slate-200 font-medium">{scanHistory.length} Scans</p>
            </div>
            <button onClick={handleLogout} className="w-full mt-6 py-3 border border-red-500/50 text-red-400 hover:bg-red-950/30 rounded-xl transition font-semibold">
              Logout
            </button>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-400 mb-6">You are currently using Guest Mode.</p>
            <button onClick={() => setActiveTab('auth')} className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition">
              Create Account / Login
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalysis = () => (
    <div className="w-full max-w-6xl animate-fade-in">
      <header className="w-full text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-teal-400">
          🩺 OncoCare: Breast Cancer CAD System
        </h2>
        <p className="text-slate-400 text-sm md:text-base mt-2">
          Breast Ultrasound Image Analysis Powered by Deep Learning & Explainable AI (Grad-CAM)
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-slate-200 text-center">Upload Ultrasound Image</h2>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => { if (!previewUrl) document.getElementById('fileInput').click(); }}
              className={`border-2 border-dashed rounded-2xl p-4 text-center transition duration-200 flex flex-col items-center justify-center min-h-[310px] relative ${
                previewUrl ? 'border-slate-700 bg-slate-900/80 cursor-default' : 'border-slate-600 hover:border-teal-400 bg-slate-900/50 cursor-pointer'
              }`}
            >
              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                  <img src={previewUrl} alt="Preview" className="max-h-[270px] w-full object-contain rounded-xl border border-slate-700 shadow-lg" />
                  <button onClick={(e) => { e.stopPropagation(); handleClear(); }} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl transition-all flex items-center justify-center w-10 h-10 text-lg font-bold z-20 cursor-pointer">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <p className="text-base font-medium text-slate-300 mt-2">Drag & drop your ultrasound image here</p>
                  <p className="text-sm text-slate-500 mt-1">or click to browse from device</p>
                  <p className="text-xs text-slate-500 mt-3 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">💡 Tip: You can also paste an image (Ctrl+V)</p>
                </div>
              )}
              <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button onClick={handleSubmit} disabled={!selectedImage || loading} className={`w-full py-3 px-6 rounded-2xl font-bold text-base text-white transition duration-200 shadow-lg ${!selectedImage || loading ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-teal-600 hover:bg-teal-500 active:scale-[0.99]'}`}>
              {loading ? "Analyzing with AI..." : "Run Scan Analysis"}
            </button>
            <button onClick={handleClear} disabled={!selectedImage && !result && !error && !loading} className={`w-full py-2.5 px-6 rounded-2xl font-semibold text-sm transition duration-200 shadow-md ${!selectedImage && !result && !error && !loading ? 'bg-slate-800 text-slate-600 border border-slate-700/50 cursor-not-allowed opacity-50' : 'text-red-400 bg-red-950/30 hover:bg-red-900/40 border border-red-800/50 cursor-pointer'}`}>
              Clear Image
            </button>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-slate-200 text-center">Diagnostics & Visualization</h2>
            <div className="bg-slate-900/50 border border-slate-700/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
              {result ? (
                <div className="w-full space-y-4 text-left">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400">AI Diagnosis</p>
                        <p className={`text-xl font-bold ${result.prediction === 'Malignant' ? 'text-red-400' : result.prediction === 'Benign' ? 'text-amber-400' : 'text-teal-400'}`}>
                          {result.prediction}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Confidence Score</p>
                        <p className="text-xl font-mono font-bold text-slate-200">{confidencePercent.toFixed(2)}%</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
                        <div className={`h-full transition-all duration-500 ${result.prediction === 'Malignant' ? 'bg-red-500' : result.prediction === 'Benign' ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(Math.max(confidencePercent, 0), 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0%</span><span>50%</span><span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">Grad-CAM Visualization:</p>
                    {isNormal ? (
                      <div className="w-full h-52 bg-black rounded-xl border border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                        <span>[ Normal Scan: Grad-CAM Not Triggered ]</span>
                        <span className="text-[10px] mt-1 text-slate-600">No significant tissue anomalies detected</span>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center bg-black/40 p-3 rounded-xl border border-slate-700 h-52">
                        <img src={result.gradcam_image} alt="Grad-CAM Heatmap" className="max-h-full max-w-full object-contain rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 space-y-2 py-12">
                  <p className="text-base text-slate-400">No analysis data yet.</p>
                  <p className="text-sm text-slate-500">Upload an image on the left and click the analysis button.</p>
                </div>
              )}
            </div>
          </div>
          
          {error && <div className="mt-3 p-3 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-sm">{error}</div>}
          <div className="mt-4 text-xs text-slate-500 text-center">*This result serves as an initial decision-support system and does not replace professional medical diagnosis.</div>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl w-full">
        <p className="text-sm font-semibold text-slate-300 mb-3 text-center">⚡ Quick Sample Photos (Click to Test):</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => loadSample('normal.png')} disabled={loading} className="flex items-center gap-3 p-3 bg-slate-900/80 hover:bg-teal-950/40 border border-slate-700 hover:border-teal-500 rounded-xl transition group text-left">
            <img src="/samples/normal.png" alt="Normal Sample" className="w-14 h-14 object-cover rounded-lg border border-slate-700 flex-shrink-0" onError={(e)=>{e.target.src="https://via.placeholder.com/60?text=Normal"}} />
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-900 text-teal-300 mb-1">NORMAL</span>
              <p className="text-xs font-medium text-slate-200 group-hover:text-teal-400 transition">Sample Normal Scan</p>
            </div>
          </button>
          <button onClick={() => loadSample('benign.png')} disabled={loading} className="flex items-center gap-3 p-3 bg-slate-900/80 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500 rounded-xl transition group text-left">
            <img src="/samples/benign.png" alt="Benign Sample" className="w-14 h-14 object-cover rounded-lg border border-slate-700 flex-shrink-0" onError={(e)=>{e.target.src="https://via.placeholder.com/60?text=Benign"}} />
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900 text-amber-300 mb-1">BENIGN</span>
              <p className="text-xs font-medium text-slate-200 group-hover:text-amber-400 transition">Sample Benign Tumor</p>
            </div>
          </button>
          <button onClick={() => loadSample('malignant.png')} disabled={loading} className="flex items-center gap-3 p-3 bg-slate-900/80 hover:bg-red-950/40 border border-slate-700 hover:border-red-500 rounded-xl transition group text-left">
            <img src="/samples/malignant.png" alt="Malignant Sample" className="w-14 h-14 object-cover rounded-lg border border-slate-700 flex-shrink-0" onError={(e)=>{e.target.src="https://via.placeholder.com/60?text=Malignant"}} />
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-900 text-red-300 mb-1">MALIGNANT</span>
              <p className="text-xs font-medium text-slate-200 group-hover:text-red-400 transition">Sample Malignant Tumor</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center">
      <nav className="w-full bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('analysis')}>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Onco<span className="text-teal-400">Care</span>
              </h1>
            </div>
            <div className="hidden md:flex space-x-2">
              <button onClick={() => setActiveTab('analysis')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'analysis' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                New Scan Analysis
              </button>
              <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'history' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                Scan History
              </button>
              <button onClick={() => setActiveTab('account')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'account' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                Account
              </button>
            </div>
            <div className="flex items-center">
              {user ? (
                <div onClick={() => setActiveTab('account')} className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.role}</p>
                  </div>
                  <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center text-white font-bold border border-teal-500">
                    {user.name.charAt(0)}
                  </div>
                </div>
              ) : (
                <button onClick={() => setActiveTab('auth')} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-lg transition">
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full flex-grow flex flex-col items-center py-6 px-4 md:px-10">
        {activeTab === 'auth' && renderAuth()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'account' && renderAccount()}
        {activeTab === 'analysis' && renderAnalysis()}
      </main>
    </div>
  );
}

export default App;