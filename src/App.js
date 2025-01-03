import React ,{ Component,useState, useCallback } from 'react';
import Plot from './components/charts/plot';
import HomePage from './components/homepage';
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
  {/**<input type='radio'
  id="option1"
  value=""
  checked={selectedChart===""} onChange={()=>handleRadioChange("")}></input>
  
  **/}<div> <HomePage></HomePage></div>
  
</div>
  )
}


export default App;
