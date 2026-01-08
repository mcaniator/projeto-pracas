import CButton from "@/components/ui/cButton";

const CounterButtonGroup = ({
  label,
  onIncrement,
  onDecrement,
  count,
}: {
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
  count: number;
}) => {
  return (
    <div className="flex flex-col items-center">
      <h6 className="text-xl font-semibold">{label}</h6>
      <div className="flex flex-col gap-1">
        <CButton
          sx={{ fontSize: "20px" }}
          onClick={onIncrement}
        >{`+ ${count}`}</CButton>
        <CButton
          onClick={onDecrement}
          sx={{
            py: 0,
            width: "100%",
            fontSize: "20px",
            height: "24px",
          }}
        >
          -
        </CButton>
      </div>
    </div>
  );
};

export default CounterButtonGroup;
