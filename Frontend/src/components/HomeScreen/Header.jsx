import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDice } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-gray-800 text-amber-100 px-5 py-4 flex justify-between items-center border-b-2 border-amber-700">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faDice} className="text-amber-700" />
        <h1 className="text-xl font-bold m-0">Dice Chess</h1>
      </div>
      <Link 
        to="/how-to-play"
        className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 no-underline"
      >
        How to play
      </Link>
    </header>
  )
}

export default Header