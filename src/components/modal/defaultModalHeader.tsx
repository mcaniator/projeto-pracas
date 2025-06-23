import { Button } from "@components/button";
import { IconX } from "@tabler/icons-react";

const DefaultModalHeader = ({
  title,
  subtitle,
  close,
}: {
  title?: string;
  subtitle?: string;
  close: () => void;
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <h4 className="truncate text-wrap text-2xl font-semibold sm:text-4xl">
          {title}
        </h4>
        <Button
          className="ml-auto text-black"
          variant={"ghost"}
          size={"icon"}
          onPress={() => {
            close();
          }}
        >
          <IconX />
        </Button>
      </div>

      <h5 className="text-xl font-semibold sm:text-2xl">{subtitle}</h5>
    </div>
  );
};

export default DefaultModalHeader;
