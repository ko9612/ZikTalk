import InterviewTab from "@/components/common/InterviewTab";
import ScreenSizeGuide from "@/components/common/ScreenSizeGuide";

const InterviewLayout = ({ children }) => {
  return (
    <>
      <div className="block xl:hidden">
        <ScreenSizeGuide />
      </div>
      <div className="hidden h-full w-full flex-col items-center xl:flex">
        <InterviewTab />
        <div className="mx-auto flex h-full w-full max-w-[1200px] px-6 xl:px-0">
          {children}
        </div>
      </div>
    </>
  );
};

export default InterviewLayout;
