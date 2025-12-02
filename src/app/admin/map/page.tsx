import { Suspense } from "react";

import LoadingIcon from "../../../components/LoadingIcon";
import Map from "./map";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <LoadingIcon size={32} />
        </div>
      }
    >
      <Map />
    </Suspense>
  );
};

export default Page;
