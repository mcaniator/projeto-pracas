import { useHelperCard } from "@/components/context/helperCardContext";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { isValidUrl } from "@/lib/utils/url";
import { IconCheck, IconExternalLink } from "@tabler/icons-react";
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

  const openLink = () => {
    if (!url || !isValidUrl(url)) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: "Link inválido!",
      });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <CDialog
      title="Drive"
      subtitle="Pasta no drive com fotos e vídeos"
      open={open}
      onClose={onClose}
      confirmChildren={isFilling ? <IconCheck /> : undefined}
      cancelChildren={url && isValidUrl(url) ? <IconExternalLink /> : undefined}
      onCancel={openLink}
      onConfirm={() => {
        if (url && !isValidUrl(url)) {
          setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: "Link inválido!",
          });
          return;
        }
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
