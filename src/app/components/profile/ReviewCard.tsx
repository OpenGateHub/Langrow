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
      <div className="flex items-center flex-col sm:flex-row">
        <img
          src={profilePicture || "/placeholder.png"}
          alt={reviewerName}
          className="w-10 h-10 rounded-full mb-2 sm:mb-0"
        />
        <div className="sm:ml-4">
          <h3 className="text-sm font-bold text-secondary">{reviewerName}</h3>
          <div className="flex text-yellow-400 justify-center sm:justify-start">
            {Array.from({ length: stars }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-gray-700 text-sm text-center sm:text-left">{reviewText}</p>
    </div>
  );
};

export default ReviewCard;