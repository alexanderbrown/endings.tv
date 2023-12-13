import { useMemo } from "react";
import { ScaleLinear } from "d3";

type AxisBottomProps = {
  xScale: ScaleLinear<number, number>;
  pixelsPerTick: number;
  height: number;
  lineColor: string;
  textColor: string;
};

// tick length
const TICK_LENGTH = 10;

export const AxisBottom = ({
  xScale,
  pixelsPerTick,
  height,
  lineColor,
  textColor,
}: AxisBottomProps) => {
  const range = xScale.range();

  const ticks = useMemo(() => {
    const width = range[1] - range[0];
    const numberOfTicksTarget = Math.floor(width / pixelsPerTick);

    return xScale.ticks(numberOfTicksTarget).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
  }, [xScale]);

  return (
    <>
      {/* Ticks and labels */}
      {ticks.map(({ value, xOffset }) => (
        <g
          key={value}
          transform={`translate(${xOffset}, 0)`}
          shapeRendering={"crispEdges"}
        >
          <line
            y1={TICK_LENGTH}
            y2={-height - TICK_LENGTH}
            stroke={lineColor}
            strokeWidth={1}
          />
          <text
            key={value}
            style={{
              fontSize: "13px",
              textAnchor: "middle",
              transform: "translateY(26px)",
              fill: textColor,
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </>
  );
};
