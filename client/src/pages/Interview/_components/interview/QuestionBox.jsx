import LoadingIcon from "@/components/common/LoadingIcon";
import { useLoadingStateStore } from "@/store/store";

const QuestionBox = ({ curNum, totalNum, qes, type }) => {
  const isLoading = useLoadingStateStore((state) => state.isLoading);
  return (
    <div className="flex items-start gap-5">
      <div className="bg-zik-main flex aspect-square w-12 items-center justify-center rounded-full text-2xl leading-none text-white">
        {curNum}
      </div>
      <div className="w-full">
        <div className="flex items-center gap-6">
          <div className="text-zik-border flex gap-1 text-xl font-semibold">
            <span className="text-zik-main">{curNum}</span>
            <span>/</span>
            <span>{totalNum}</span>
          </div>
          <span className="bg-zik-main flex h-8 w-14 items-center justify-center rounded-xl font-semibold text-white">
            {type}
          </span>
        </div>
        <div className="border-zik-main/50 mt-2 flex h-28 items-center rounded-3xl rounded-tl-none border-3 px-10">
          {isLoading ? <LoadingIcon /> : qes}
        </div>
      </div>
    </div>
  );
};

export default QuestionBox;
