interface AchievementProps {
    icon: string; 
    title: string;
    description: string;
  }
  
  export default function AchievementCard({ icon, title, description }: AchievementProps) {
    return (
      <div className="flex flex-col items-center text-center space-y-2">
        <img src={icon} alt={title} className="w-12 h-12" />
        <h3 className="text-sm font-semibold text-secondary">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    );
  }
  