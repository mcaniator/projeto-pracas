import ProtocolsClient from "@/app/admin/protocols/protocolsClient";
import { Suspense } from "react";

const ProtocolsPage = () => {
  return (
    <Suspense fallback={null}>
      <ProtocolsClient />
    </Suspense>
  );
};

export default ProtocolsPage;
