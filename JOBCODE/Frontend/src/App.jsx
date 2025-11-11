import { BrowserRouter, Route, Routes } from "react-router-dom"
import LogSign from '../src/components/LogSign/LogSign.jsx'
import HomePg from '../src/components/HomePg/HomePg.jsx'

function App() {

  return (
    <>
    <Routes>
      <Route path= "/" element={< HomePg/>} />
      <Route path= "/login-signup" element={<LogSign/>}/>
      
    </Routes>
    </>  
  )
}

export default App
