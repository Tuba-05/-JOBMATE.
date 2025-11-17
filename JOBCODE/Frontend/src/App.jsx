import { BrowserRouter, Route, Routes } from "react-router-dom"
import LogSign from '../src/components/LogSign/LogSign.jsx'
import HomePg from '../src/components/HomePg/HomePg.jsx'
import Cv from '../src/components/Cv/Cv.jsx'
import CompanyDashboard from "./components/CompanyDashboard/CompanyDashboard.jsx"

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path= "/" element={< HomePg/>} />
      <Route path= "/login-signup" element={<LogSign/>}/>
      <Route path="/cv" element={<Cv/>}/>
      <Route path= "/company-dashboard" element={<CompanyDashboard/>}/>
    </Routes>
    </BrowserRouter>
    </>  
  )
}

export default App
