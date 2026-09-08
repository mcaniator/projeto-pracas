import CButton from "@/components/ui/cButton";
import { IconX } from "@tabler/icons-react";

const CDialogHeader = ({
  title,
  subtitle,
  removeCloseButton,
  close,
}: {
  title?: string;
  subtitle?: string;
  removeCloseButton?: boolean;
  close: () => void;
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <h4 className="truncate text-wrap text-lg font-semibold sm:text-4xl">
          {title}
        </h4>
        {!removeCloseButton && (
          <CButton
            className="ml-auto"
            variant={"text"}
            square
            sx={{
              color: "black",
              ":hover": { backgroundColor: "rgba(0,0,0,0.1)" },
            }}
            onClick={() => {
              close();
            }}
          >
            <IconX />
          </CButton>
        )}
      </div>

      <h5 className="text-sm font-semibold text-gray-500 sm:text-2xl">
        {subtitle}
      </h5>
    </div>
  );
};

export default CDialogHeader;
