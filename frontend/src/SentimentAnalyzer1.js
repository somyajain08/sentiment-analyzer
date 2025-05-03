import React, { useState } from 'react';
import axios from 'axios';
import './css_files/SentimentAnalyzer1.css'; // Ensure this path is correct

const SentimentAnalyzer1 = () => {
  const [UserInput, setUserInput] = useState('');
  const [Sentiment, setSentiment] = useState('');

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const analyzeSentiment = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/predictTweet', {
        text: UserInput,
      });
      setSentiment(response.data.sentiment);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  return (
    <div className="Twitter">
      <div id="box1">
        <h2 className="heading">Twitter Sentiment Analysis</h2>
        <div id="test">
          <div className="box2">
            <h3>Enter Tweet</h3>
            <textarea
              rows="10"
              value={UserInput}
              onChange={handleInputChange}
              placeholder="Type your tweet here..."
            />
            <br />
            <button className="btn" onClick={analyzeSentiment}>
              Analyze
            </button>
          </div>
          <div className="box3">
            {Sentiment && <p className="result">Predicted Sentiment: {Sentiment}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalyzer1;
