import { IconX } from "@tabler/icons-react";

import { Button } from "../button";

const PermissionDeniedPopup = ({
  setPermissionDenied,
}: {
  setPermissionDenied: (show: boolean) => void;
}) => {
  return (
    <div className="z-60 fixed bottom-1 left-1 right-0 flex w-fit max-w-72 items-center justify-center rounded-md bg-red-600 p-1 text-center text-white">
      {"Permissão negada"}
      <Button
        variant={"ghost"}
        onPress={() => {
          setPermissionDenied(false);
        }}
      >
        <IconX />
      </Button>
    </div>
  );
};

export default PermissionDeniedPopup;
