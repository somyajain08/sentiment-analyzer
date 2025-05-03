import SentimentAnalyzer1 from "./TwitterAnalyzer";
import React from "react";
import './css_files/analyzer.css'; // Ensure this path is correct
import { Route, Routes, Link } from "react-router-dom";
function App() {
  return (
    <div>
        {/* <li>
          <Link to="/Twitter">Twitter Analysis</Link>
        </li> */}
        {/* <li>
          <Link to="/YouTube">YouTube Comment Analysis</Link>
        </li>
        <li>
          <Link to="/Amazon">Amazon Review Analysis</Link>
        </li> */}
        <Routes>
          <Route path="/" Component={SentimentAnalyzer1}/>
          <Route exact path="/Twitter" Component={SentimentAnalyzer1}/>
          {/* <Route path="/YouTube" Component={YTSentimentAnalyzer}/>
          <Route path="/Amazon" Component={AmazonSentimentAnalyzer}/> */}
        </Routes>
      </div>
     
    
  );
}

export default App;
