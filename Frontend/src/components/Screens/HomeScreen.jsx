import { Header, Footer, RoomActions } from "../HomeScreen"
import GameFeatures from '../HomeScreen/GameFeatures';

function HomeScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <RoomActions />
      <GameFeatures />
      <Footer />
    </div>
  )
}

export default HomeScreen