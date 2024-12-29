import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
        Welcome to the Blog
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
        A modern platform for sharing thoughts, ideas, and useful tools.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          href="/blog"
          className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Read Blog
        </Link>
        <Link
          href="/tools"
          className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
        >
          Explore Tools <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
