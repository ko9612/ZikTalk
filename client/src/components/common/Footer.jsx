import React from "react";

const Footer = () => {
  const teamMembers = ["KHN", "KSJ", "LSH", "HJW"];
  return (
    <footer>
      <div className="flex items-center justify-around gap-40 bg-white px-6 py-4 text-sm">
        <span className="text-zik-text/50">
          Copyright © 2025 ZikTalk | All Rights Reserved
        </span>

        <div className="flex items-center space-x-4">
          {teamMembers.map((name) => (
            <div className="flex items-center space-x-2">
              <div className="bg-zik-border h-5 w-5 rounded-full"></div>
              <span className="text-zik-text font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
