import Link from "next/link";
import { usePathname } from "next/navigation";

const ActiveMenuLink = ({ children, href }) => {
  const pathname = usePathname();
  const active = href === pathname;

  return (
    <Link
      href={href}
      className={`block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent  ${
        active ? "text-blue-300 font-extrabold" : "text-white"
      }`}
    >
      {children}
    </Link>
  );
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex gap-8 bg-gray-500">
      <aside className="">
        <nav>
          <ul className="grid gap-5 px-2.5 pt-5 items-center font-sans">
            <li className="">
              <ActiveMenuLink href="/dashboard/analytics">Accounts</ActiveMenuLink>
            </li>
            <li>
              <ActiveMenuLink href="/dashboard/facebook">Facebook</ActiveMenuLink>
            </li>
            <li>
              <ActiveMenuLink href="/dashboard/instagram">Instagram</ActiveMenuLink>
            </li>
            <li>
              <ActiveMenuLink href="/dashboard/tiktok">TikTok</ActiveMenuLink>
            </li>
            <li>
              <ActiveMenuLink href="/dashboard/youtube">Youtube</ActiveMenuLink>
            </li>
            <li>
              <ActiveMenuLink href="/dashboard/twitter">Twitter</ActiveMenuLink>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="bg-gray-100 flex-[8] p-4 min-h-screen pt-6">{children}</div>
    </div>
  );
};

export default DashboardLayout;
