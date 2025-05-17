import InterviewTab from "@/components/common/InterviewTab";
import ScreenSizeGuide from "@/components/common/ScreenSizeGuide";

const InterviewLayout = ({ children }) => {
  return (
    <>
      <div className="block xl:hidden">
        <ScreenSizeGuide />
      </div>
      <div className="hidden h-full w-full flex-col items-center xl:flex">
        {children}
      </div>
    </>
  );
};

export default InterviewLayout;
