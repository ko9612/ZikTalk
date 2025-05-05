import React from "react";
import github from "@/assets/images/github.svg";

const Footer = () => {
  // const teamMembers = ["KHN", "KSJ", "LSH", "HJW"];
  const teamMembers = [
    { name: "KHN", link: "https://github.com/ko9612" },
    { name: "KSJ", link: "https://github.com/ksj686" },
    { name: "LSH", link: "https://github.com/lsohyuniil" },
    { name: "HJW", link: "https://github.com/hanjay3757" },
  ];
  return (
    <footer>
      <div className="flex items-center justify-around gap-40 px-6 py-4 text-sm">
        <span className="text-zik-text/50">
          Copyright © 2025 ZikTalk | All Rights Reserved
        </span>

        <div className="flex items-center gap-4 space-x-4">
          {teamMembers.map((member) => (
            <a
              key={member.name}
              href={member.link}
              target="_blank"
              className="flex items-center space-x-2 transition-opacity hover:opacity-80"
            >
              <div className="bg-zik-border/40 flex h-[36px] w-[36px] items-center justify-center rounded-lg">
                <img src={github} className="block"></img>
              </div>
              <span className="text-zik-text font-medium">{member.name}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
