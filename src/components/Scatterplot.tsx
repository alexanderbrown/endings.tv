import * as d3 from 'd3';
import { AxisLeft } from './AxisLeft';
import { AxisBottom } from './AxisBottom';
import { useEffect, useState } from 'react';
import { InteractionData, Tooltip } from './Tootltip';

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };
const POINT_COLOR = "#66c2a5"
const SELECTED_POINT_COLOR = "#fc8d62"

export type DataPoint = { x: number; y: number; z: number, label: string }

type ScatterplotProps = {
  width: number;
  height: number;
  xlims: [number, number];
  ylims: [number, number];
  data: DataPoint[]
  selected: DataPoint | null
  setSelected: (d: DataPoint | null) => void
};

export const Scatterplot = ({ width, height, xlims, ylims, data, selected, setSelected}: ScatterplotProps) => {

  const NEAREST_NEIGHBOUR_DISTANCE = 0.005

  const [hovered, setHovered] = useState<InteractionData | null>(null);

  // Layout. The div size is set by the given props.
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Scales
  const yScale = d3.scaleLinear().domain(ylims).range([boundsHeight, 0]);
  const xScale = d3.scaleLinear().domain(xlims).range([0, boundsWidth]);


  // Build the shapes
  const [allShapes, setAllShapes] = useState<JSX.Element[]>([]);
  useEffect(() => {
    console.log('data changed')
    let visible_points: Array<DataPoint> = []
    const data_copy = [...data]
    data_copy.sort((a, b) => b.z - a.z)
    data_copy.forEach((point) => {
      // Push to visible_points if there are no existing points within NEAREST_NEIGHBOUR_DISTANCE
      const x_range = xlims[1] - xlims[0]
      const y_range = ylims[1] - ylims[0]
      if (visible_points.every((p) => Math.abs(p.x - point.x)/x_range + Math.abs(p.y - point.y)/y_range > NEAREST_NEIGHBOUR_DISTANCE)) {
        visible_points.push(point)
      }
    })
    setAllShapes(visible_points.map((d, i) => {
      return (
        <circle
          key={i}
          r={3}
          cx={xScale(d.x)}
          cy={yScale(d.y)}
          opacity={1}
          stroke={POINT_COLOR}
          fill={POINT_COLOR}
          fillOpacity={0.2}
          strokeWidth={1}
          onMouseEnter={() =>
            setHovered({
              xPos: xScale(d.x),
              yPos: yScale(d.y),
              name: d.label,
            })
          }
          onMouseLeave={() => setHovered(null)}
          onClick={() => setSelected(d)}
        />
      );
    }))
  }, [data, xlims, ylims, setSelected, xScale, yScale])
  
  const selectedShape = selected ? (
    <circle
      r={5}
      cx={xScale(selected.x)}
      cy={yScale(selected.y)}
      opacity={1}
      stroke={SELECTED_POINT_COLOR}
      fill={SELECTED_POINT_COLOR}
      fillOpacity={1}
      strokeWidth={1}
      onMouseEnter={() =>
        setHovered({
          xPos: xScale(selected.x),
          yPos: yScale(selected.y),
          name: selected.label,
        })}
      onMouseLeave={() => setHovered(null)}
      onClick={() => setSelected(null)}
    />
  ) : null;
  return (
    <div className='relative bg-slate-50 w-max border border-slate-700 rounded' >
      {/* <h1>{visible_points.length} visible of {data.length}</h1> */}
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          {/* Y axis */}
          <AxisLeft yScale={yScale} pixelsPerTick={80} width={boundsWidth} lineColor='#b5bdb6' textColor='#98a39a' />

          {/* X axis, use an additional translation to appear at the bottom */}
          <g transform={`translate(0, ${boundsHeight})`}>
            <AxisBottom xScale={xScale} pixelsPerTick={80} height={boundsHeight} lineColor="#b5bdb6"textColor="#98a39a"/>
          </g>

          {/* Circles */}
          {allShapes}
          {selectedShape}
        </g>
      </svg>
      {/* Tooltip */}
      <div
        style={{
          width: boundsWidth,
          height: boundsHeight,
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          marginLeft: MARGIN.left,
          marginTop: MARGIN.top,
        }}
      >
        <Tooltip interactionData={hovered} />
      </div>
    </div>
  );
};
