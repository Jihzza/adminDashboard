import { Link } from "react-router-dom";

export default function VentureTile({ venture }) {
    return (
        <Link
            to={`/v/${venture.key}`}
            className="group flex flex-col items-center justify-center text-center"
        >
            <div className="rounded-2xl border-2 border-white shadow-white shadow-[0_0_5px_rgba(255,255,255,0.3)] p-4 grid place-items-center">
                <img
                    src={venture.logo}
                    alt={venture.name}
                    className="w-12 h-12 object-contain rounded-xl shadow-sm"
                />
            </div>
            <span className="mt-3 text-sm font-medium text-white/90">{venture.name}</span>
        </Link>
    );
}
