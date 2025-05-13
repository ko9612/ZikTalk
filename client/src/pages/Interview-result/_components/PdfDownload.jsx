import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal/Modal";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { useState } from "react";

// 페이지 나눌 때 잘림 현상 해결해야 됨
const PdfDownload = ({ rootElementId, fileName }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const downloadPdfDocument = async () => {
    const input = document.getElementById(rootElementId);
    if (!input) {
      alert("선택된 요소를 찾을 수 없습니다.");
      return;
    }

    const clonedInput = input.cloneNode(true);

    // transition 요소 펼침
    const expandedElements = clonedInput.querySelectorAll(".transition-all");
    expandedElements.forEach((element) => {
      element.classList.remove("max-h-0", "py-0", "opacity-0");
      element.classList.add("max-h-[1000px]", "py-3", "opacity-100", "sm:py-4");
    });

    // 제거할 요소: id가 dlePdf로 시작하는 모든 요소 삭제
    const delTargets = clonedInput.querySelectorAll("[id^='delPdf']");
    delTargets.forEach((element) => {
      if (element && element.parentNode)
        element.parentNode.removeChild(element);
    });

    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.position = "absolute";
    hiddenDiv.style.top = "-9999px";
    hiddenDiv.style.left = "-9999px";
    hiddenDiv.appendChild(clonedInput);
    document.body.appendChild(hiddenDiv);

    try {
      // 캔버스 렌더링: 캔버스 크기 자동 설정
      const canvas = await html2canvas(clonedInput, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      // PDF 생성: A4 크기
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;

      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft >= 0) {
        position -= pageHeight - margin * 2;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      // PDF 저장
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("다운로드 중 오류 발생:", error);
      alert("다운로드 실패");
    } finally {
      setIsOpenModal(!isOpenModal);
      document.body.removeChild(hiddenDiv);
    }
  };

  return (
    <>
      <Button className={"mt-7 w-[300px]"} onClick={downloadPdfDocument}>
        PDF 저장
      </Button>
      {isOpenModal && (
        <Modal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)}>
          <div className="flex flex-col items-center justify-center gap-4 pr-7 pl-7">
            <i className="border-zik-main/50 flex h-14 w-14 items-center justify-center rounded-full border-2">
              <svg
                width="50"
                height="50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
              >
                <polyline
                  className="stroke-draw-check"
                  stroke="oklch(0.63 0.2032 281.04)"
                  points="14,27 22,34 36,16"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </i>
            <div className="text-zik-text text-lg sm:text-xl">
              PDF 다운로드가 완료되었습니다.
            </div>
            <Button
              shape="bar"
              className={"w-full"}
              onClick={() => setIsOpenModal(false)}
            >
              닫기
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PdfDownload;
