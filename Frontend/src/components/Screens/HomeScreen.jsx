import { Header, Footer, RoomActions } from "../HomeScreen"
import GameFeatures from '../HomeScreen/GameFeatures';

function handleJoin() {
  // Logic to handle joining a game
  console.log("Join Game clicked");
}

function handleCreate() {
  
}
function HomeScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <RoomActions onJoin={handleJoin} onCreate={handleCreate} />
      <GameFeatures />
      <Footer />
    </div>
  )
}

export default HomeScreen