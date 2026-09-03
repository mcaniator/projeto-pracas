import CDialog from "@/components/ui/dialog/cDialog";
import { IconExternalLink } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";

const ConfirmDisabledOfflineSavingDialog = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const router = useRouter();
  return (
    <CDialog
      title="Acesso offline desativado"
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      cancelProps={{
        loadingOnClick: true,
      }}
      onCancel={() => {
        router.push("/admin/capacitor/capacitorDataSync");
      }}
      cancelChildren={
        <>
          <IconExternalLink />
          Baixar dados
        </>
      }
      confirmChildren={<>Continuar</>}
      cancelVariant="outlined"
    >
      <div className="flex flex-col gap-1">
        <p>
          Seu dispositivo não possui todos os dados necessários para acessar
          essa avaliação offline.
        </p>
        <p>
          Caso perca a conexão durante a avaliação, e saia da tela, você não
          conseguirá acessá-la novamente enquanto não recuperar a conexão.
        </p>
        <p>
          <strong>Suas respostas serão mantidas</strong>. Certifique-se de
          salvar suas respostas antes de sair.
        </p>
        <p>
          Você pode baixar agora os dados necessários no seu aplicativo para
          acessar a avaliação offline, caso deseje.
        </p>
      </div>
    </CDialog>
  );
};

export default ConfirmDisabledOfflineSavingDialog;
