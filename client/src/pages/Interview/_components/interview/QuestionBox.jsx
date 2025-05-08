import LoadingIcon from "@/components/common/LoadingIcon";
import { useLoadingStateStore } from "@/store/store";

const QuestionBox = ({ curNum, totalNum, question }) => {
  const isLoading = useLoadingStateStore((state) => state.isLoading);
  return (
    <div className="flex items-start gap-5">
      <div className="bg-zik-main flex aspect-square w-12 items-center justify-center rounded-full text-2xl text-white">
        {curNum}
      </div>
      <div className="w-full">
        <div className="text-zik-border flex gap-1 text-xl font-semibold">
          <span className="text-zik-main">{curNum}</span>
          <span>/</span>
          <span>{totalNum}</span>
        </div>
        <div className="border-zik-main/50 mt-2 flex h-28 items-center rounded-3xl rounded-tl-none border-3 px-10">
          {isLoading ? <LoadingIcon /> : question}
        </div>
      </div>
    </div>
  );
};

export default QuestionBox;
