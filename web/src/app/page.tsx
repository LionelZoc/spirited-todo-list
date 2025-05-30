import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-xl w-full flex flex-col items-center gap-8 bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center gap-2">
          {/* You can replace this emoji with a local SVG/icon if available */}
          <span className="text-5xl mb-2">📝</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 dark:text-blue-300 text-center">
            Spirited Todo List
          </h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 text-center mt-2">
            A modern, full-stack, open-source Todo List app built with Next.js,
            FastAPI, SQLModel, and SQLite.
            <br />
            Organize your tasks, set priorities, and stay productive!
          </p>
        </div>
        <div className="w-full flex flex-col items-center gap-4 mt-4">
          <Link
            href="/todos"
            className="inline-block px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Go to Todo App
          </Link>
        </div>
        <div className="mt-6 text-xs text-gray-400 text-center">
          <span>Made with ❤️ using Next.js, FastAPI, SQLModel, and SQLite</span>
        </div>
      </div>
    </div>
  );
}
