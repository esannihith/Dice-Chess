import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import DiceChessImg from '../../assets/Dice-Chess.png'

function RoomActions() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center text-amber-100 relative py-16 min-h-screen"
      style={{
        backgroundImage: `url(${DiceChessImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: 'scale(1)',
        transformOrigin: 'center',
      }}
    >
      <div
        className="w-full max-w-4xl flex flex-col items-center justify-center px-6 py-8"
        style={{
          backdropFilter: 'blur(8px)',
          background: 'rgba(30, 30, 30, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255,255,255,0.18)',
          margin: '0 auto',
        }}
      >
        <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">DICE CHESS</h2>
        <p className="text-lg mb-8 opacity-80 drop-shadow">Where Strategy Meets Chance</p>
        <div className="flex flex-wrap justify-center gap-8 pb-8">
          {/* Create Game Card */}
          <div
            className="p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 flex flex-col justify-between"
            style={{
              background: 'rgba(40, 40, 40, 0.35)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.17)',
              minWidth: '260px',
              height: '320px',
            }}
          >
            <div>
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faPlus} className="text-amber-700 text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Create Game</h3>
              <p className="text-sm opacity-80 mb-4">Start a new dice chess match</p>
            </div>
            <button
              className="bg-amber-700 hover:bg-amber-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 w-full"
              onClick={() => {}}
            >
              Create New Game
            </button>
          </div>
          {/* Join Game Card */}
          <div
            className="p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 flex flex-col justify-between"
            style={{
              background: 'rgba(40, 40, 40, 0.35)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.17)',
              minWidth: '260px',
              height: '320px',
            }}
          >
            <div>
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faSignInAlt} className="text-amber-700 text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Join Game</h3>
              <p className="text-sm opacity-80 mb-4">Enter an existing game room</p>
              <input
                type="text"
                placeholder="Enter Game ID"
                className="w-full px-4 py-2 mb-4 rounded-md bg-gray-800 text-amber-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-700"
                style={{
                  background: 'rgba(60, 60, 60, 0.45)',
                  backdropFilter: 'blur(2px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              />
            </div>
            <button
              className="bg-amber-700 hover:bg-amber-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 w-full"
              onClick={() => {}}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomActions