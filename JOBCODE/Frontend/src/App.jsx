import { BrowserRouter, Route, Routes } from "react-router-dom"
import LogSign from '../src/components/LogSign/LogSign.jsx'
import HomePg from '../src/components/HomePg/HomePg.jsx'
import Cv from '../src/components/Cv/Cv.jsx'
import ProfileForm from '../src/components/ProfileForm/ProfileForm.jsx'
import CompanyDashboard from "./components/CompanyDashboard/CompanyDashboard.jsx"
import AddTest from "./components/AddTest/AddTest.jsx"
import JobCard from "./components/JobCard/JobCard.jsx"
import VeriCode from "./components/VeriCode/VeriCode.jsx"

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path= "/" element={< HomePg/>} />
      <Route path= "/login-signup" element={<LogSign/>}/>
      <Route path="/cv" element={<Cv/>}/>
      <Route path='Pf' element={<ProfileForm/>}/>
      <Route path= "/company-dashboard" element={<CompanyDashboard/>}/>
      <Route path= "/add-test" element={<AddTest/>}/>
      <Route path="/veri-code" element={<VeriCode/>}/>
      {/* <Route path='/' element={<JobCard/>}/> */}
    </Routes>
    </BrowserRouter>
    </>  
  )
}

export default App
