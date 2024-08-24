import Link from 'next/link';

export default function Header() {
  return (
    <>
      <header className="m-4">
        <nav className="flex flex-wrap justify-around">
          <Link href={'/'} className="font-bold">
            Home
          </Link>
          <Link href={'/signin'} className="font-bold">
            Sign in
          </Link>
          <Link
            href={'/signup'}
            className="bg-rose-400 pt-2 pr-4 pb-2 pl-4 rounded-full font-bold"
          >
            Register
          </Link>
        </nav>
      </header>
    </>
  );
}
