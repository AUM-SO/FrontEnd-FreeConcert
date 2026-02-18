"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ticket, User, LogOut } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "./ui/navigation-menu";
import { useAuth } from "@/contexts/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();

  const menulist: { title: string; href: string; description: string }[] = [
    {
      title: "Browse Concerts",
      href: "/concerts",
      description: "ค้นหาคอนเสิร์ตฟรีทั้งหมดที่กำลังจะมาถึงใกล้คุณ",
    },
    {
      title: "My Tickets",
      href: "/my-tickets",
      description: "ดูบัตรคอนเสิร์ตของคุณและการลงทะเบียนทั้งหมด",
    },
    {
      title: "Artists",
      href: "/artists",
      description: "ค้นพบศิลปินและวงดนตรีที่คุณชื่นชอบ",
    },
    {
      title: "Venues",
      href: "/venues",
      description: "สถานที่จัดคอนเสิร์ตและงานดนตรีต่างๆ",
    },
    {
      title: "Categories",
      href: "/categories",
      description: "เลือกดูตามประเภทเพลงที่คุณชอบ",
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 w-full backdrop-blur-md z-10">
      <div className="container mx-auto mt-4  backdrop-blur-md z-50 px-4 py-2 rounded-lg shadow-sm px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center align-center gap-1 font-bold text-xl"
        >
          {/* <Music className="h-6 w-6 text-primary" /> */}
          <Ticket className="h-5 w-5 mr-1 transform-[rotate(79deg)]" />
          <span>FreeConcert</span>
        </Link>

        {/* Navigation Links */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/home" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {menulist.map((item) => (
                    <li key={item.title}>
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink>
                          <div className="text-sm font-medium leading-none mb-1">
                            {item.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  Contact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                <User className="h-4 w-4 inline mr-1" />
                {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup" className="flex items-center">
                  <Ticket className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
