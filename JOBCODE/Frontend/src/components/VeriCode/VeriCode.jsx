import {React, useState, useEffect, useCallback} from 'react'
import { useNavigate } from 'react-router-dom';
import VCimg from '../../assets/vericode.png'

const VeriCode = () => {
    const userEmail = localStorage.getItem('userEmail');
    const [VeriCode, setVeriCode] = useState("");
    const [code, setCode] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [NoOfCodesGenerated, setNoOfCodesGenerated] = useState(0);
    const navigate = useNavigate();
    
    // code generation
    const generate_code = async(e) => {
        e.preventDefault(); // prevent page reload on button click
        try{
            if (NoOfCodesGenerated >=2){
                alert("You have reached the maximum limit of code generations. Please try again later.");
                return;
            }
            else{
                const response  = await fetch('http://127.0.0.1:8000/forgot-password/' , 
            {method: 'POST', headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email : userEmail })
            } )
            if (!response.ok){
                throw new Error('Failed to generate code');
            }
            const data = await response.json();
            if (data.success){
                alert(data.message); // code sent
                setVeriCode(data.OttpCode); // setting veri code in state
                setNoOfCodesGenerated(NoOfCodesGenerated + 1);
            } else{
                alert(data.message); // failed to send code
            } }
        }catch(error){
            alert("Error: " + error.message);
        }
    };
    
    // verifying verification code
    const handleSubmit = async(e) =>{
        e.preventDefault(); // prevent page reload on button click
        if (code !== VeriCode){
            alert("Incorrect Verification Code. Please try again.");
            setAttempts(attempts + 1);
            if (attempts + 1 >= 3){
                alert("Maximum attempts reached. Please generate a new code.");
                setVeriCode(""); // reset veri code
                setAttempts(0); // reset attempts
            }
        }
        else{
        navigate("/");
        }
    }
    
  return (
    <div style={{ height: 640, width: 1260, fontfamily: 'Montserrat',
          /*m-l for not mixing with navbar, t&l for placing of DataGrid div*/
          top:'22px', padding:'10px', overflow: 'hidden',
          /*styling of DataGrid div*/
          border:'7px solid #1cb5abff', borderRadius:'19px', boxSizing:'border-box', 
          /* Glassmorphism effect */
          background: 'rgba(4, 80, 212, 0.15)',   // transparent white
          backdropFilter: 'blur(10px)',              // frosted glass blur
          WebkitBackdropFilter: 'blur(10px)',        // Safari support
          /* Shadow on all sides , r-l-b-t */
          boxShadow:'10px 0 15px rgba(62, 59, 59, 1),-10px 0 15px rgba(62, 60, 60, 1), 0 10px 15px rgba(0,0,0,0.25), 0 -10px 15px rgba(0,0,0,0.25)'    
          , flexWrap: 'wrap', display: 'flex',  justifyContent: 'center',
        }}>
        <form  
            style={{
            fontWeight: '600', fontSize:'35px',  padding: '20px', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
            gap: '15px'
        }}>
        <label htmlFor="veriCode"
        style={{
            color:"#ffffffe2"
        }} 
        >Enter Verification Code:</label> 
        <input
            type="text" // or "number" if it’s digits only
            maxLength={6}
            id="veriCode"
            value={VeriCode}
            onChange={(e) => setCode(e.target.value)}
            // Add logic here: if some condition is true, lock the input
    //   readOnly={isCodeLocked} 
      // OR: disabled={isCodeLocked}
            placeholder="Enter here "
            required
            style={{
                border: '2.5px solid #c49b09ff',
            }}
        />
        <div style={{ display: 'flex', flexDirection:'column', gap: '10px' 
            }}>
        <button onClick={generate_code}
        style={{
            border: '2.5px solid #e21313ff', borderRadius:'5px', width: '280px', 
        }}
        >Genenrate Code</button>
        <button onClick={handleSubmit}
        style={{
            border: '2.5px solid #049d3cff', borderRadius:'5px', width: '120px',
        }}
        >Verify</button>
        </div>
        </form>
        <div>
            <img src={VCimg} alt="" 
            style={{
                width: '100%', height: '90vh'
            }}
            />
        </div>
    </div>
  )
}

export default VeriCode