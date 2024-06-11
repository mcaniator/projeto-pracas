"use client";

const MainTallyDataTableComplementary = ({
  tallyMap,
}: {
  tallyMap: Map<string, string | number>;
}) => {
  return (
    <div className="flex flex-col gap-1 overflow-auto rounded">
      <div className="flex flex-row gap-1">
        <table>
          <thead>
            <tr>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                Pets
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid white",
                  padding: "0.5rem",
                  textAlign: "center",
                }}
              >
                {tallyMap.get("Pets")}
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                Grupos com 2 ou mais pessoas
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid white",
                  padding: "0.5rem",
                  textAlign: "center",
                }}
              >
                {tallyMap.get("Groups")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="max-w-96">
        <thead>
          <tr>
            <th
              colSpan={2}
              style={{ border: "1px solid white", padding: "0.5rem" }}
            >
              Atividades itinerantes
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid white", padding: "0.5rem" }}>
              Total
            </td>
            <td
              style={{
                border: "1px solid white",
                padding: "0.5rem",
                textAlign: "center",
              }}
            >
              {tallyMap.get("commercialActivities")}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid white", padding: "0.5rem" }}>
              Tipos
            </td>
            <td style={{ border: "1px solid white", padding: "0.5rem" }}>
              {tallyMap.get("commercialActivitiesDescription")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export { MainTallyDataTableComplementary };
