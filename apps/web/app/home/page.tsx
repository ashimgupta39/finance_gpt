"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/components/sidebar";

const HomePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userData, setUserData] = useState<{
    name: string;
    pic: string;
    token: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get("token")
    ? decodeURIComponent(searchParams.get("token")!)
    : null;
    const name = searchParams.get("name")
    ? decodeURIComponent(searchParams.get("name")!)
    : null;
    const pic = searchParams.get("pic")
    ? decodeURIComponent(searchParams.get("pic")!)
    : null;
    const email = searchParams.get("email")
    ? decodeURIComponent(searchParams.get("email")!)
    : null;

    if (token && name && pic && email) {
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("pic", pic);
      localStorage.setItem("email", email);

      setUserData({ token, name, pic, email });
    } else {
      // If no data in query, try to load from localStorage
      const storedToken = localStorage.getItem("token");
      const storedName = localStorage.getItem("name");
      const storedPic = localStorage.getItem("pic");
      const storedEmail = localStorage.getItem("email");

      if (storedToken && storedName && storedPic && storedEmail) {
        setUserData({ token: storedToken, name: storedName, pic: storedPic, email: storedEmail });
      } else {
        router.push("/login");
      }
    }
  }, [searchParams, router]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Loading Finance GPT...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="relative flex items-center justify-center p-4 top-5">
            <h1 className="text-2xl font-bold">Finance GPT</h1>

            {/* User info (absolutely positioned to not affect centering) */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Image
                src={userData.pic}
                width={40}
                height={40}
                className="rounded-full border"
                alt="Profile"
                />
                <span className="font-medium">{userData.name}</span>
            </div>
            </header>

        {/* Main area (can add chat box later here) */}
        <div className="flex-1 flex items-center justify-center">
        <p className="text-lg text-gray-600">
            Select a chat from the sidebar to continue.
        </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
