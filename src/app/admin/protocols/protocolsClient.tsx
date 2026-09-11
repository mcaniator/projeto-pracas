"use client";

import BehavioralMapProtocols from "@/app/admin/protocols/behavioralMaps/behavioralMapProtocols";
import FormsProtocol from "@/app/admin/protocols/forms/formsProtocol";
import TallyProtocols from "@/app/admin/protocols/tallys/tallyProtocols";
import CAdminHeader from "@/components/ui/cAdminHeader";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconClipboard } from "@tabler/icons-react";
import { useState } from "react";

type ProtocolType = "FORMS" | "TALLYS" | "BEHAVIORAL_MAPS";

const protocolTypeOptions: { id: ProtocolType; label: string }[] = [
  { id: "FORMS", label: "Formulários" },
  { id: "TALLYS", label: "Contagens" },
  { id: "BEHAVIORAL_MAPS", label: "Mapas comportamentais" },
];

const ProtocolsClient = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [protocolType, setProtocolType] = useState<ProtocolType>("FORMS");
  const [visitedProtocolTypes, setVisitedProtocolTypes] = useState<
    Set<ProtocolType>
  >(() => new Set(["FORMS"]));

  const selectProtocolType = (nextProtocolType: ProtocolType) => {
    setProtocolType(nextProtocolType);
    setVisitedProtocolTypes((currentTypes) => {
      if (currentTypes.has(nextProtocolType)) return currentTypes;

      return new Set(currentTypes).add(nextProtocolType);
    });
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-1 overflow-auto bg-white p-2 text-black">
      <CAdminHeader titleIcon={<IconClipboard />} title="Protocolos" />

      {isSmallScreen ?
        <FormControl fullWidth size="small">
          <InputLabel id="protocol-type-label">Tipo de protocolo</InputLabel>
          <Select
            labelId="protocol-type-label"
            value={protocolType}
            label="Tipo de protocolo"
            onChange={(event) =>
              selectProtocolType(event.target.value as ProtocolType)
            }
          >
            {protocolTypeOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      : <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={protocolType}
            onChange={(_, value: ProtocolType) => selectProtocolType(value)}
            aria-label="Tipo de protocolo"
            centered
          >
            {protocolTypeOptions.map((option) => (
              <Tab key={option.id} value={option.id} label={option.label} />
            ))}
          </Tabs>
        </Box>
      }

      {visitedProtocolTypes.has("FORMS") && (
        <div
          className={
            protocolType === "FORMS" ? "flex min-h-0 flex-1 flex-col" : "hidden"
          }
        >
          <FormsProtocol />
        </div>
      )}
      {visitedProtocolTypes.has("TALLYS") && (
        <div className={protocolType === "TALLYS" ? undefined : "hidden"}>
          <TallyProtocols />
        </div>
      )}
      {visitedProtocolTypes.has("BEHAVIORAL_MAPS") && (
        <div
          className={protocolType === "BEHAVIORAL_MAPS" ? undefined : "hidden"}
        >
          <BehavioralMapProtocols />
        </div>
      )}
    </div>
  );
};

export default ProtocolsClient;
