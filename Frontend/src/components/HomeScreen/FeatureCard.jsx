import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD20, faChess, faUsers } from '@fortawesome/free-solid-svg-icons';

// Map string icons to actual FontAwesome icons
const iconMap = {
  "fa-solid fa-dice-d20": faDiceD20,
  "fa-solid fa-chess": faChess,
  "fa-solid fa-users": faUsers,
};

function FeatureCard({icon, title, description}) {
  return (
    <div className="text-center p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
      <div className="mb-4">
        <FontAwesomeIcon 
          icon={iconMap[icon]} 
          className="text-amber-700 text-4xl"
        />
      </div>
      <h3 className="text-xl font-bold text-amber-100 mb-3">{title}</h3>
      <p className="text-amber-100 opacity-80 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default FeatureCard