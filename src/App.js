import React ,{ Component,useState, useCallback } from 'react';
import HomePage from './components/homepage';
import Blog from './components/blog';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
function App(){
  const[
    selectedChart,
    setSelectedChart,
  ] = useState("");
  const [data,setSelectedData] = useState([])
  const handleRadioChange = (
    value
  ) => {setSelectedChart(value);};
 




  return(
   
<div>
  <div>
    <BrowserRouter>
    <NavLink to="/">Home</NavLink>
    <div style = {{margin:"10px"}}>
    <NavLink to ="/blog">blog</NavLink>
    </div>
    <Routes>
      <Route exact path="/" element={<HomePage></HomePage>}></Route>
    <Route exact path="/blog" element={<Blog></Blog>}></Route>
    
    </Routes>
    </BrowserRouter>
  </div>
  {/**<input type='radio'
  id="option1"
  value=""
  checked={selectedChart===""} onChange={()=>handleRadioChange("")}></input>
  
  **/} 
  
</div>
  )
}


export default App;
