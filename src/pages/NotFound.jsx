import { Link } from "react-router-dom";
import { CerebraLockup } from "../components/ui/Logo";

export default function NotFound() {
  return (
    <div className="page-container min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <CerebraLockup height={36} className="mb-10" />
      <p className="text-7xl font-display font-bold text-primary-100 mb-2">
        404
      </p>
      <h1 className="font-display text-xl font-semibold text-slate-700 mb-2">
        Page not found
      </h1>
      <p className="text-sm text-slate-400 mb-8 max-w-xs">
        This page doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="bg-primary-400 text-white px-6 py-3 rounded-2xl text-sm font-medium
        hover:bg-primary-500 transition-colors duration-200"
      >
        Back to home
      </Link>
    </div>
  );
}
