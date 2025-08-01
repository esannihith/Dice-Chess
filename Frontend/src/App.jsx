import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {GameScreen, HomeScreen, HowToPlay, WaitingScreen} from './components/Screens';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/waiting" element={<WaitingScreen />} />
        <Route path="/game" element={<GameScreen />} />
      </Routes>
    </Router>
  );
}

export default App;