const ReviewCard = ({
  reviewerName,
  reviewText,
  stars,
  profilePicture,
}: {
  reviewerName: string;
  reviewText: string;
  stars: number;
  profilePicture: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <img
          src={profilePicture || "/placeholder.png"}
          alt={reviewerName}
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-4">
          <h3 className="text-sm font-bold text-secondary">{reviewerName}</h3>
          <div className="flex text-yellow-400">
            {Array.from({ length: stars }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-gray-700 text-sm">{reviewText}</p>
    </div>
  );
};

export default ReviewCard;