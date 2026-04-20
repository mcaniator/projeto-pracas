import { useHelperCard } from "@/components/context/helperCardContext";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const DriveFolderUrlDialog = ({
  open,
  driveFolderUrl,
  isFilling,
  onClose,
  onConfirm,
}: {
  open: boolean;
  driveFolderUrl: string | null;
  isFilling: boolean;
  onClose: () => void;
  onConfirm: (url: string | null) => void;
}) => {
  const [url, setUrl] = useState<string | null>(driveFolderUrl);
  const { setHelperCard } = useHelperCard();
  useEffect(() => {
    setUrl(driveFolderUrl);
  }, [open, driveFolderUrl]);

  const copyLink = async () => {
    if (!url) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: "Link vazio!",
      });
      return;
    }
    await navigator.clipboard.writeText(url);
    setHelperCard({
      show: true,
      helperCardType: "CONFIRM",
      content: "Link copiado!",
    });
  };
  return (
    <CDialog
      title="Drive"
      subtitle="Pasta no drive com fotos e vídeos"
      open={open}
      onClose={onClose}
      confirmChildren={isFilling ? <IconCheck /> : undefined}
      cancelChildren={url ? <IconCopy /> : undefined}
      onCancel={() => {
        void copyLink();
      }}
      onConfirm={() => {
        onConfirm(url);
        onClose();
      }}
    >
      <CTextField
        label="Link"
        clearable
        value={url}
        readOnly={!isFilling}
        onChange={(e) => {
          if (e.target.value === "") {
            setUrl(null);
          } else {
            setUrl(e.target.value);
          }
        }}
      />
    </CDialog>
  );
};

export default DriveFolderUrlDialog;
