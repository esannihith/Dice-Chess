import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faDice, faChess, faCrown } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'

function HowToPlay() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-900 text-amber-100">
      {/* Header */}
      <header className="bg-gray-800 px-5 py-4 flex items-center border-b-2 border-amber-700">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-amber-700 hover:text-amber-600 transition-colors mr-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faDice} className="text-amber-700" />
          <h1 className="text-xl font-bold">How to Play Dice Chess</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-amber-700/30">
            <h2 className="text-3xl font-bold text-amber-400 mb-4 flex items-center gap-3">
              <FontAwesomeIcon icon={faChess} />
              Welcome to Dice Chess
            </h2>
            <p className="text-lg leading-relaxed">
              Dice Chess combines the strategic depth of traditional chess with the excitement of chance. 
              Each turn, you roll a die to determine which type of piece you can move, adding a thrilling 
              element of unpredictability to every game.
            </p>
          </div>
        </section>

        {/* Basic Rules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-amber-400 mb-6">Basic Game Rules</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-amber-300 mb-3">1. Game Start & Opening</h3>
              <ul className="space-y-2 text-sm">
                <li>• White starts by rolling the die</li>
                <li>• If you roll <strong>Pawn</strong> or <strong>Knight</strong>, you can make a legal opening move</li>
                <li>• If you roll <strong>Bishop, Rook, Queen, or King</strong>, you forfeit your turn (no legal moves available)</li>
                <li>• There's a 45% chance the first player forfeits their turn!</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faCrown} className="text-amber-400" />
                2. Check Rules
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• When in check, you have two options:</li>
                <li>• <strong>Safe Option:</strong> Move your King without rolling</li>
                <li>• <strong>Risk Option:</strong> Roll the die - if the piece can resolve check, you must use it</li>
                <li>• If the rolled piece can't help, you forfeit your turn!</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center gap-2">
                3. Castling
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• You must roll <strong>King</strong> to be eligible to castle</li>
                <li>• All standard castling conditions must be met</li>
                <li>• Rolling <strong>Rook</strong> does NOT allow castling</li>
                <li>• Castling is considered a King move</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-amber-300 mb-3">4. Pawn Promotion</h3>
              <ul className="space-y-2 text-sm">
                <li>• When your pawn reaches the back rank, roll the die</li>
                <li>• Promote to the piece type rolled (Queen, Rook, Bishop, or Knight)</li>
                <li>• If you roll <strong>King</strong> or <strong>Pawn</strong>, re-roll until valid</li>
                <li>• No choice in promotion - the die decides!</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Special Moves */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-amber-400 mb-6">Special Moves</h2>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-amber-300 mb-4">En Passant</h3>
            <p className="mb-3">This special pawn capture requires both opportunity and luck:</p>
            <ul className="space-y-2 text-sm pl-4">
              <li>• Your opponent must have just moved their pawn two squares, landing beside your pawn</li>
              <li>• On your immediately following turn, you must roll <strong>Pawn</strong></li>
              <li>• If both conditions are met, you may perform en passant</li>
              <li>• Roll any other piece and the opportunity is lost forever</li>
            </ul>
          </div>
        </section>

        {/* Game End Conditions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-amber-400 mb-6">Game End Conditions</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-amber-300 mb-3">Checkmate</h3>
              <p className="text-sm">
                Occurs when a player is in check and no legal King move or possible die roll can resolve the situation.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-amber-300 mb-3">Stalemate</h3>
              <p className="text-sm">
                The game is a draw if the player is not in check but has no legal moves available for any pieces (regardless of die roll).
              </p>
            </div>
          </div>
        </section>

        {/* Strategy Tips */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 rounded-lg p-6 border border-amber-600/50">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Strategy Tips</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <ul className="space-y-2 text-sm">
                <li>• <strong>Piece Development:</strong> Early piece development is more crucial since you can't always move the piece you want</li>
                <li>• <strong>King Safety:</strong> Prioritize King safety even more than in regular chess</li>
                <li>• <strong>Flexible Positioning:</strong> Position pieces where they have multiple good move options</li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Risk Management:</strong> Sometimes the safe King move is better than rolling the die</li>
                <li>• <strong>Opportunity Recognition:</strong> Be ready to capitalize when you roll the perfect piece</li>
                <li>• <strong>Adaptability:</strong> Traditional opening theory doesn't fully apply - stay flexible!</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Ready to Play */}
        <section className="text-center">
          <div className="bg-gray-800 rounded-lg p-8 border border-amber-700/50">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Ready to Play?</h2>
            <p className="text-lg mb-6">
              Now that you know the rules, it's time to experience the thrill of Dice Chess!
            </p>
            <button 
              onClick={handleBack}
              className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 text-lg"
            >
              Start Playing
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HowToPlay
