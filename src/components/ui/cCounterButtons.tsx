import CButton from "@/components/ui/cButton";

const CCounterButtons = ({
  count,
  readOnly = false,
  color,
  onIncrement,
  onDecrement,
}: {
  count: number;
  readOnly?: boolean;
  color?: string;
  onIncrement: () => void;
  onDecrement: () => void;
}) => {
  const colorSx =
    color ?
      {
        backgroundColor: color,
        "&:hover": {
          backgroundColor: color,
        },
      }
    : {};

  return (
    <div className="flex w-20 flex-col gap-1">
      <CButton
        disabled={readOnly}
        sx={{
          width: "100%",
          fontSize: "20px",
          ...colorSx,
        }}
        onClick={onIncrement}
      >
        {`+ ${count}`}
      </CButton>
      <CButton
        disabled={readOnly || count === 0}
        sx={{
          py: 0,
          width: "100%",
          fontSize: "20px",
          height: "24px",
          ...colorSx,
        }}
        onClick={onDecrement}
      >
        -
      </CButton>
    </div>
  );
};

export default CCounterButtons;
