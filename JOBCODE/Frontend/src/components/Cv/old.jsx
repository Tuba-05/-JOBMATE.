import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './Cv.css';

function Cv() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState({ started: false, pc: 0 });
    const [msg1, setMsg1] = useState(null);
    const [msg2, setMsg2] = useState([]);
    const [icon, setIcon] = useState(null);
    const [showButton, setShowButton] = useState(false);
    
    const sentence = "Jobs now just a click away -->";

    const resumeupload = () => {
        navigate("/Pf"); // Pass "jobseeker" mode
      };

    function HandleUpload() {
        if (!file) {
            setMsg2([]);
            setMsg1("No files selected");
            setIcon(<i className="bi bi-exclamation-lg warning-icon" style={{ color: "yellow" }}></i>);
            setShowButton(false);  // Hide button if no file is selected
            return;
        }
    
        const fd = new FormData();
        
        setIcon(null);
        setMsg2([]);
        setMsg1("Uploading...");
        setProgress(prevState => ({ ...prevState, started: true, pc: 0 }));
        setShowButton(false);  
    
        fd.append("resume", file); 
        
        axios.post('http://127.0.0.1:8000/upload-resume/', fd, {
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(prevState => ({ ...prevState, pc: percentCompleted }));
            },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(res => {
            setTimeout(() => {
                setShowButton(false);  // Ensure the button is hidden on completion
                setMsg2([]);
            });
    
            setMsg1("Upload Successful");
            setIcon(<i className="bi bi-check success-icon" style={{ color: "green" }}></i>);
            setProgress(prevState => ({ ...prevState, started: false, pc: 0 }));
            
            setTimeout(() => {
                setMsg1(null);
                const letters = sentence.split('');
                setMsg2(letters);
                setTimeout(() => {
                    setShowButton(true);  // Show button after message is displayed
                }, 2000);
            }, 3000);
        })
        .catch(err => {
            setMsg1("Upload failed");
            setIcon(<i className="bi bi-x error-icon" style={{ color: "red" }}></i>);
            setProgress(prevState => ({ ...prevState, started: false, pc: 0 }));
            console.error(err);
        });
    }

    return (
        <div className="cv-body">
            <div className="cv-container">
                <div className="cv-heading">
                    <h1 className="heading-text">Upload your Resume / CV</h1>
                </div>
                
                <div className="cv-input-section">
                    <input onChange={(e) => setFile(e.target.files[0])} type="file" className="file-input"/>
                    <button onClick={HandleUpload} className="upload-btn">Upload</button>
                </div>
                
                <div className="cv-progress-section">    
                    {progress.started && <progress max="100" value={progress.pc} className="progress-bar"></progress>}
                    {msg1 && (
                        <span className="msg1">
                            {msg1} {icon}
                        </span>
                    )}
                </div>

                <div className="cv-message-section">
                    {msg2.length > 0 && (
                        <span className="msg2">
                            {msg2.map((letter, index) => (
                                <span key={index} className="animated-letter" style={{ animationDelay: `${index * 0.1}s` }}>
                                    {letter === " " ? "\u00A0" : letter}
                                </span>
                            ))}
                        </span>
                    )}
                    {showButton && (
                            <button className="jobs-btn" onClick={resumeupload}>See Your Resume First!</button>
                        )}
                    
                </div>
            </div>
        </div>
    );
}

export default Cv;
