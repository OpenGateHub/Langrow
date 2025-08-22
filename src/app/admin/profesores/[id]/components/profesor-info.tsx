import { ProfesorProfile } from "../page"

export const ProfesorInfo = (props:ProfesorProfile) => {
    const profesor = props;
    return <>
  <section className="bg-white rounded-xl shadow-md p-8 flex flex-col md:flex-row items-center md:items-start gap-8 max-w-6xl mx-auto">
                <div className="flex flex-col items-center">
                    <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center mb-2 relative">
                        {profesor?.profileImg ? (
                            <img
                                src={profesor?.profileImg}
                                alt={profesor?.name}
                            />
                        ) : (
                            <>
                                <svg
                                    className="w-16 h-16 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25V19.5z"
                                    />
                                </svg>
                                <span className="absolute bottom-2 right-2 bg-green-500 border-2 border-white rounded-full w-6 h-6 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <circle cx="10" cy="10" r="10" />
                                    </svg>
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {profesor?.name}
                    </h1>
                    <span className="text-blue-700 font-semibold text-base">
                        {profesor?.location}
                    </span>
                    <p className="text-gray-700 text-base">
                        {profesor?.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="flex items-center text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded-full">
                            <svg
                                className="w-4 h-4 mr-1 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M16 12a4 4 0 01-8 0V8a4 4 0 018 0v4z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 16v2m0 0h-2m2 0h2"
                                />
                            </svg>
                            {profesor?.isZoomEnabled
                                ? "Zoom Enabled"
                                : "No Zoom"}
                        </span>
                        <span className="flex items-center text-yellow-700 text-sm bg-yellow-100 px-3 py-1 rounded-full">
                            <svg
                                className="w-4 h-4 mr-1 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
                            </svg>
                            {profesor?.rating} ({profesor?.reviews} reviews)
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[140px]">
                    <div className="bg-blue-50 rounded-lg px-6 py-4 flex flex-col items-center shadow">
                        <span className="text-3xl font-bold text-blue-700">
                            {Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "USD",
                            }).format(Number(profesor?.price))}
                        </span>
                        <span className="text-gray-500 text-sm">por hora</span>
                    </div>
                </div>
            </section>
    
    </>
}