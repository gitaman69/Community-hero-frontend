import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="code text-[10px] uppercase tracking-widest text-civic">Off the map</div>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">404</h1>
      <p className="mt-1 max-w-sm text-sm text-ink/60">
        This route isn’t on our wayfinding chart. Let’s get you back to the neighborhood.
      </p>
      <Link to="/" className="btn-civic mt-5">
        Back to the map
      </Link>
    </div>
  );
}
