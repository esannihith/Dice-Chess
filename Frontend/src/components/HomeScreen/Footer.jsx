
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDice } from '@fortawesome/free-solid-svg-icons'

function Footer() {
  return (
    <footer className="bg-gray-800 text-amber-100 py-5 text-center flex flex-col items-center gap-2 border-t-2 border-amber-700">
      <h4 className="m-0 flex items-center gap-2 text-lg font-bold">
        <FontAwesomeIcon icon={faDice} className="text-amber-700" />
        Dice Chess
      </h4>
      <span className="text-sm opacity-80">© 2025 Dice Chess. All rights reserved.</span>
    </footer>
  )
}

export default Footer