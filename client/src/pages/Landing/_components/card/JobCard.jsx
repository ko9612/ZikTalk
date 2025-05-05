import React from "react";

const JobCard = ({ image, title, question }) => {
  return (
    <li className="flex h-[150px] w-[230px] shrink-0 items-center gap-4 rounded-xl bg-white p-4 font-medium shadow-md lg:h-[150px] lg:w-[250px]">
      <div className="bg-zik-border/30 h-20 w-20 shrink-0 overflow-hidden rounded-full p-2 lg:p-4">
        <img
          src={image}
          alt={`${title} 일러스트`}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <p className="text-zik-main text-sm font-bold lg:text-base">{title}</p>
        <p className="mt-1 text-[12px] break-all lg:text-sm">{question}</p>
      </div>
    </li>
  );
};

export default JobCard;
