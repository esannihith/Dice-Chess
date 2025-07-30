import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: "fa-solid fa-dice-d20",
    feature: "Dice Movement", 
    description: "Roll dice to determine which pieces you can move each turn",
  },
  {
    icon: "fa-solid fa-chess",
    feature: "Classic Chess",
    description: "All traditional chess rules apply with exciting dice mechanics",
  },
  {
    icon: "fa-solid fa-users",
    feature: "Multiplayer",
    description: "Play with friends online using unique game IDs",
  },
];

function GameFeatures() {
  return (
    <div className="w-full bg-gray-800 py-8 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index} 
            icon={feature.icon} 
            title={feature.feature} 
            description={feature.description} 
          />
        ))}
      </div>
    </div> 
  )
}

export default GameFeatures