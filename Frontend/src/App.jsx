import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {GameScreen, HomeScreen, HowToPlay} from './components/Screens';


function App() {
  const [player, setPlayer] = React.useState([{
    name: 'Player 1',
    color: 'white'
  }]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/game" element={<GameScreen />} />
      </Routes>
    </Router>
  );
}

export default App;