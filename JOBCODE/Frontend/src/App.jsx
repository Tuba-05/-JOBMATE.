import { BrowserRouter, Route, Routes } from "react-router-dom"
import LogSign from '../src/components/LogSign/LogSign.jsx'
import HomePg from '../src/components/HomePg/HomePg.jsx'
import ProfileForm from '../src/components/ProfileForm/ProfileForm.jsx'
import CompanyDashboard from "./components/CompanyDashboard/CompanyDashboard.jsx"
import AddTest from "./components/AddTest/AddTest.jsx"
import TakeTest from "./components/TakeTest/TakeTest.jsx"
import JobCard from "./components/JobCard/JobCard.jsx"
import VeriCode from "./components/VeriCode/VeriCode.jsx"
import Navbar from "./components/Navbar/Navbar.jsx"

function App() {
  return (
    <>
    <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePg/>} />
      <Route path="/login-signup" element={<LogSign/>}/>
      <Route path="/cv" element={<ProfileForm/>}/>
      <Route path="/Pf" element={<ProfileForm/>}/>
      <Route path="/candidate-portal" element={<ProfileForm/>}/>
      <Route path="/company-dashboard" element={<CompanyDashboard/>}/>
      <Route path="/company-portal" element={<CompanyDashboard/>}/>
      <Route path="/add-test" element={<AddTest/>}/>
      <Route path="/take-test/:jobId" element={<TakeTest/>}/>
      <Route path="/veri-code" element={<VeriCode/>}/>
      <Route path="/JObcard" element={<JobCard/>}/>
      <Route path="/jobcard" element={<JobCard/>}/>
      <Route path="/job-card" element={<JobCard/>}/>
    </Routes>
    </BrowserRouter>
    </>  
  )
}

export default App
