import {SetStateAction, useEffect, useState } from "react";
import Select, { createFilter } from "react-select"
import { DataPoint, Scatterplot } from "@/components/Scatterplot";
import dt from "@/data/data.json"


type Data = Record<string, {
  averageRating: number
  finalEpisodeRating: number
  numEpisodes: number
  totalVotes: number
}>

type ScatterData = Array<DataPoint & {importance: number}>

export default function Home() {

  const [min_x, setMin_x] = useState(1)
  const [max_x, setMax_x] = useState(10)
  const [min_y, setMin_y] = useState(1)
  const [max_y, setMax_y] = useState(10)

  const MIN_IMPORTANCE = 50

  const [selected, setSelected] = useState<DataPoint | null>(null);
  const [data, setData] = useState<ScatterData>([]);
  useEffect(() => {
    const rawData = dt as Data
    const processedData = Object.keys(rawData).map((key) => {
      return {
        x: rawData[key].averageRating,
        y: jitter(rawData[key].finalEpisodeRating, 0.08),
        z: rawData[key].totalVotes,
        importance: rawData[key].totalVotes / rawData[key].numEpisodes,
        label: key
      }
    })
    console.log('loading raw')
    setData(processedData)
  }, [])

  const importantData = data.filter(d => d.importance >= MIN_IMPORTANCE)

  const displayData = importantData
  .filter(d => d.x >= min_x && d.x <= max_x)
  .filter(d => d.y >= min_y && d.y <= max_y)
  .sort((a,b) => a.label.localeCompare(b.label))

  const centiles = getCentiles({selectedData: selected, allData: displayData, similarity: 0.25})

  return (
    <main>
      <div className="flex justify-center my-4">
        <h1 className="text-2xl">Does it End Well?</h1>
      </div>
      <div className="flex m-8 space-x-2">
        <div className="border border-slate-700 bg-slate-50 rounded p-2">
          <div className="flex flex-col space-y-1">
            <h3>X Axis</h3>
            <AxisInput value={min_x} changeHandler={setMin_x} label='Min' />
            <AxisInput value={max_x} changeHandler={setMax_x} label='Max' />
          </div>
          <div className="flex flex-col space-y-1">
            <h3>Y Axis</h3>
            <AxisInput value={min_y} changeHandler={setMin_y} label='Min' />
            <AxisInput value={max_y} changeHandler={setMax_y} label='Max' />
          </div>
          <div className="flex flex-col mt-8 pl-2 pr-6">
            <p>Total Shows: {data.length}</p>
            <p>Shows with {`>${MIN_IMPORTANCE}`} votes per episode: {importantData.length}</p>
            <p>Shows displayed: {displayData.length}</p>
          </div>
        </div>
        <Scatterplot 
          data={displayData} width={700} height={700} 
          xlims={[min_x, max_x]} ylims={[min_y, max_y]} 
          selected={selected} setSelected={setSelected}
        />
        <div className="flex flex-col p-2 flex-grow border border-slate-700 rounded">
          {selected && (<>
          <h1 className="text-xl text-center my-4">{selected.label}</h1>
          <p>Average Rating: {selected.x.toFixed(2)}</p>
          <p className="ml-4">{centiles.average_rating_centile_display} centile</p>
          <p>Final Episode Rating: {selected.y.toFixed(2)}</p>
          <p className="ml-4">{centiles.final_episode_centile_display} centile across all shows</p> 
          <p className="ml-4">{centiles.final_episode_centile_similar_display} centile among shows with similar average rating</p>
          <p>Total Votes: {selected?.z}</p>

          <p className="mt-6">{getTagLine(centiles)}</p>
          </>)}

        </div>
        
      </div>
      <div className="mx-8">
        <Select options={displayData} getOptionLabel={(d) => d.label} getOptionValue={(d) => d.label}
                  value={selected} 
                  onChange={(d) => setSelected(d as DataPoint)}
                  isSearchable={true}
                  filterOption={createFilter({ ignoreAccents: false })}
          />
      </div>
      {/* A Footer with my details */}
      <footer className="flex justify-center my-8">
        <p className="text-sm text-center">
          Made by Alex Brown, mostly out of boredom. Say hi: <a href="https://twitter.com/alexpybrown">@alexpybrown</a> 
        </p>
      </footer>
    </main>
  )
}

function jitter(num: number, max: number) {
  return num + (Math.random() - 0.5) * max
}

function AxisInput({value, changeHandler, label}: {value: number, changeHandler: (value: SetStateAction<number>) => void, label: string}) {
  return (
    <div>
    <label className="text-sm mx-2 w-6 inline-block">{label}</label>
    <input type="number" 
           placeholder="Enter a number" 
           min={1} max={10} step={.5} 
           value={value} 
           onChange={(e) => changeHandler(Number(e.target.value))}
           className="border border-slate-700 rounded"
    />
    </div>
  )
}

function getCentiles({selectedData, allData, similarity}: {selectedData: DataPoint | null, allData: ScatterData, similarity: number}) {

  if (!selectedData) return {
    average_rating_centile: null,
    final_episode_centile: null,
    final_episode_centile_similar: null,
    average_rating_centile_display: null,
    final_episode_centile_display: null,
    final_episode_centile_similar_display: null
  }

  const selectedAverageRatingPercentile = allData.filter(d => d.x <= selectedData?.x).length / allData.length * 100
  
  let selectedAverageRatingPercentileDisplay = selectedAverageRatingPercentile.toFixed(0)
  if (selectedAverageRatingPercentileDisplay?.endsWith('1')) selectedAverageRatingPercentileDisplay += 'st'
  else if (selectedAverageRatingPercentileDisplay?.endsWith('2')) selectedAverageRatingPercentileDisplay += 'nd'
  else if (selectedAverageRatingPercentileDisplay?.endsWith('3')) selectedAverageRatingPercentileDisplay += 'rd'
  else selectedAverageRatingPercentileDisplay += 'th'

  const selectedFinalEpisodePercentile = allData.filter(d => d.y <= selectedData?.y).length / allData.length * 100
  let selectedFinalEpisodePercentileDisplay = selectedFinalEpisodePercentile.toFixed(0)
  if (selectedFinalEpisodePercentileDisplay?.endsWith('1')) selectedFinalEpisodePercentileDisplay += 'st'
  else if (selectedFinalEpisodePercentileDisplay?.endsWith('2')) selectedFinalEpisodePercentileDisplay += 'nd'
  else if (selectedFinalEpisodePercentileDisplay?.endsWith('3')) selectedFinalEpisodePercentileDisplay += 'rd'
  else selectedFinalEpisodePercentileDisplay += 'th'
  
  const showsWithSimilarAverageRating = allData.filter(d => Math.abs(d.x - selectedData?.x) < similarity)
  const selectedFinalEpisodePercentileSimilar = showsWithSimilarAverageRating.filter(d => d.y <= selectedData?.y).length / showsWithSimilarAverageRating.length * 100
  let selectedFinalEpisodePercentileSimilarDisplay = selectedFinalEpisodePercentileSimilar.toFixed(0)
  if (selectedFinalEpisodePercentileSimilarDisplay?.endsWith('1')) selectedFinalEpisodePercentileSimilarDisplay += 'st'
  else if (selectedFinalEpisodePercentileSimilarDisplay?.endsWith('2')) selectedFinalEpisodePercentileSimilarDisplay += 'nd'
  else if (selectedFinalEpisodePercentileSimilarDisplay?.endsWith('3')) selectedFinalEpisodePercentileSimilarDisplay += 'rd'
  else selectedFinalEpisodePercentileSimilarDisplay += 'th'

  return {
    average_rating_centile: selectedAverageRatingPercentile,
    final_episode_centile: selectedFinalEpisodePercentile,
    final_episode_centile_similar: selectedFinalEpisodePercentileSimilar,
    average_rating_centile_display: selectedAverageRatingPercentileDisplay,
    final_episode_centile_display: selectedFinalEpisodePercentileDisplay,
    final_episode_centile_similar_display: selectedFinalEpisodePercentileSimilarDisplay
  }

}

function getTagLine(centiles: ReturnType<typeof getCentiles>) {
  if (!centiles.average_rating_centile) return null
  let output = ''
  if (centiles.average_rating_centile < 20) output += 'Starts very badly'
  else if (centiles.average_rating_centile < 40) output += 'Starts badly'
  else if (centiles.average_rating_centile < 60) output += 'Starts ok'
  else if (centiles.average_rating_centile < 80) output += 'Starts well'
  else if (centiles.average_rating_centile < 90) output += 'Starts very well'
  else output += 'Starts amazingly well'

  output += ' and '

  if (centiles.final_episode_centile < 20) output += 'ends very badly'
  else if (centiles.final_episode_centile < 40) output += 'ends badly'
  else if (centiles.final_episode_centile < 60) output += 'ends ok'
  else if (centiles.final_episode_centile < 80) output += 'ends well'
  else if (centiles.final_episode_centile < 90) output += 'ends very well'
  else output += 'ends amazingly well'

  output += ','

  if (centiles.final_episode_centile_similar  > 90) output += ' way better than expected.'
  else if (centiles.final_episode_centile_similar  > 80) output += ' much better than expected.'
  else if (centiles.final_episode_centile_similar  > 70) output += ' better than expected.'
  else if (centiles.final_episode_centile_similar  > 60) output += ' a bit better than expected.'
  else if (centiles.final_episode_centile_similar  > 50) output += ' about as expected.'
  else if (centiles.final_episode_centile_similar  > 40) output += ' a bit worse than expected.'
  else if (centiles.final_episode_centile_similar  > 30) output += ' worse than expected.'
  else if (centiles.final_episode_centile_similar  > 20) output += ' much worse than expected.'
  else output += ' way worse than expected. Prepare to be disappointed.'
  

  return output


}