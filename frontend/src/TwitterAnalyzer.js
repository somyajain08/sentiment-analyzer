import React, { useState, useEffect } from 'react';
// We'll use fetch instead of axios
// CSS is imported in the main component

const TwitterAnalyzer = () => {
  const [userInput, setUserInput] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(1);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  // Demo sentiments for auto mode
  const demoSentiments = [
    {
      sentiment: 'Positive',
      confidence: 0.92,
      vader_score: { pos: 0.82, neu: 0.15, neg: 0.03, compound: 0.79 }
    },
    {
      sentiment: 'Neutral',
      confidence: 0.78,
      vader_score: { pos: 0.22, neu: 0.70, neg: 0.08, compound: 0.14 }
    },
    {
      sentiment: 'Negative',
      confidence: 0.85,
      vader_score: { pos: 0.05, neu: 0.25, neg: 0.70, compound: -0.65 }
    }
  ];
  
  // Background image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundImage(prev => (prev === 3 ? 1 : prev + 1));
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Auto-analyze as user types (with debounce)
  useEffect(() => {
    if (autoAnalyze && userInput.trim().length > 3) {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const timeout = setTimeout(() => {
        analyzeSentiment();
      }, 800);
      
      setTypingTimeout(timeout);
    }
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [userInput, autoAnalyze]);
  
  // Demo mode auto updates
  useEffect(() => {
    let demoInterval;
    if (demoMode) {
      let index = 0;
      demoInterval = setInterval(() => {
        setSentiment(demoSentiments[index]);
        index = (index + 1) % demoSentiments.length;
      }, 3000);
    }
    
    return () => {
      if (demoInterval) clearInterval(demoInterval);
    };
  }, [demoMode]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const analyzeSentiment = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    try {
      // For demo, we can use a randomized demo sentiment
      if (demoMode) {
        const randomIndex = Math.floor(Math.random() * demoSentiments.length);
        setTimeout(() => {
          setSentiment(demoSentiments[randomIndex]);
          setIsLoading(false);
        }, 800);
        return;
      }
      
      const response = await fetch('http://127.0.0.1:5000/predictTweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userInput }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setSentiment(data);
    } catch (error) {
      console.error('Error: ', error);
      // For demo purposes, fallback to a random sentiment if backend fails
      const randomIndex = Math.floor(Math.random() * demoSentiments.length);
      setSentiment(demoSentiments[randomIndex]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="analyzer-container">
      <div className="analyzer-card">
        <h2 className="analyzer-heading">Twitter Sentiment Analysis</h2>
        
        <div className="analyzer-content">
          <div className="input-section">
            <h3>Enter Tweet</h3>
            <textarea
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type your tweet here to analyze sentiment..."
            />
            <div className="button-group">
              <button 
                className={`analyze-btn ${isLoading ? 'loading' : ''}`} 
                onClick={analyzeSentiment}
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
              
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={autoAnalyze}
                    onChange={() => setAutoAnalyze(!autoAnalyze)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">Auto-analyze</span>
              </div>
              
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={demoMode}
                    onChange={() => setDemoMode(!demoMode)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">Demo Mode</span>
              </div>
            </div>
          </div>
          
          <div className="result-section">
            {sentiment && (
              <>
                <div className={`sentiment-badge ${sentiment.sentiment.toLowerCase()}`}>
                  {sentiment.sentiment}
                </div>
                {sentiment.vader_score && (
                  <div className="score-details">
                    <h4>Sentiment Scores:</h4>
                    <div className="score-item">
                      <span>Positive:</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill positive" 
                          style={{ width: `${sentiment.vader_score.pos * 100}%` }}
                        ></div>
                      </div>
                      <span className="score-value">{(sentiment.vader_score.pos * 100).toFixed(1)}%</span>
                    </div>
                    <div className="score-item">
                      <span>Neutral:</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill neutral" 
                          style={{ width: `${sentiment.vader_score.neu * 100}%` }}
                        ></div>
                      </div>
                      <span className="score-value">{(sentiment.vader_score.neu * 100).toFixed(1)}%</span>
                    </div>
                    <div className="score-item">
                      <span>Negative:</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill negative" 
                          style={{ width: `${sentiment.vader_score.neg * 100}%` }}
                        ></div>
                      </div>
                      <span className="score-value">{(sentiment.vader_score.neg * 100).toFixed(1)}%</span>
                    </div>
                    <div className="score-item">
                      <span>Compound:</span>
                      <div className="score-bar compound">
                        <div 
                          className="score-fill compound" 
                          style={{ 
                            width: `${Math.abs(sentiment.vader_score.compound) * 100}%`, 
                            marginLeft: sentiment.vader_score.compound < 0 ? '0' : '50%',
                            marginRight: sentiment.vader_score.compound >= 0 ? '0' : '50%'
                          }}
                        ></div>
                      </div>
                      <span className="score-value">{sentiment.vader_score.compound.toFixed(3)}</span>
                    </div>
                  </div>
                )}
              </>
            )}
            {!sentiment && <p className="no-result">Analysis results will appear here</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwitterAnalyzer;