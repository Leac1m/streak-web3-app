import { Link, NavLink } from "react-router";

export default function NavBar() {
  const linkBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800";
  const active = " bg-gray-100 dark:bg-gray-800";

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:bg-gray-950/80 dark:border-gray-800">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-semibold text-lg">
          TON Streak
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => linkBase + (isActive ? active : "")}
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => linkBase + (isActive ? active : "")}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => linkBase + (isActive ? active : "")}
          >
            Profile
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => linkBase + (isActive ? active : "")}
          >
            Login
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
