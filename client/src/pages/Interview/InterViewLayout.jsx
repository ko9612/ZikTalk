import InterviewTab from "@/components/common/InterviewTab";

const InterviewLayout = ({ children }) => {
  return (
    <div className="flex h-full flex-col items-center">
      <InterviewTab />
      <div className="flex h-full w-full max-w-[1200px] px-6 xl:px-0">
        {children}
      </div>
    </div>
  );
};

export default InterviewLayout;
