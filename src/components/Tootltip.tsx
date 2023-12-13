// Information needed to build the tooltip
export type InteractionData = {
  xPos: number;
  yPos: number;
  name: string;
};

type TooltipProps = {
  interactionData: InteractionData | null;
};

export const Tooltip = ({ interactionData }: TooltipProps) => {
  if (!interactionData) {
    return null;
  }

  return (
    <div
      className='absolute bg-black opacity-80 rounded-sm text-white text-xs px-2 py-1 -translate-y-1/2 translate-x-2'
      style={{
        left: interactionData.xPos,
        top: interactionData.yPos,
      }}
    >
      {interactionData.name}
    </div>
  );
};
