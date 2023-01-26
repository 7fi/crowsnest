import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import RegattaData from '../components/scores/RegattaData'
import { scrapeTeamListToDb, getTeamList } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { collection, getDocs, getFirestore } from 'firebase/firestore'

// async function updateGraph() {
//   let prev = 0
//   let xTicks = []
//   let nameLabels = []
//   datasets = []
//   let maxVals = []
//   Object.keys(regattas).forEach((regatta) => {
//     let data = {}
//     let races = []
//     let names = Object.keys(inputNames)
//     console.log(regattaData)
//     if (regattaData != undefined && regattaData.length > 0) {
//       names.forEach((p) => {
//         try {
//           let fleet = fleetSelect.value
//           if (fleet == 'All' && inputNames[p].fleet != 'All') fleet = inputNames[p].fleet
//           let div = divSelect.value
//           if (div == 'All' && inputNames[p].div != 'All') div = inputNames[p].div
//           let pos = posSelect.value
//           if (pos == 'All' && inputNames[p].pos != 'All') pos = inputNames[p].pos
//           console.log('FLTDIVPOS', fleet, div, pos)
//           data[p] = getData(Type, p, fleet, div, pos, undefined, regatta)
//           console.log(data[p])
//           races.push(...Object.keys(data[p]))
//           maxVals.push(Math.max(Object.values(data[p])))
//         } catch (error) {
//           console.error(error)
//         }
//       })
//       races = races.sort(compareRace)
//       xTicks.push(...races)
//       xTicks = [...new Set(xTicks)]
//       console.log('XTICKS', xTicks)
//       names.forEach((p) => {
//         console.log(p, data[p])
//         if (Object.keys(data[p]).length > 0) {
//           let found = false
//           datasets.forEach((dataset) => {
//             if (dataset.label == p) {
//               dataset.data = {
//                 ...dataset.data,
//                 ...data[p],
//               }
//               found = true
//             }
//           })
//           if (!found) {
//             datasets.push({
//               label: p,
//               data: data[p],
//               backgroundColor: inputNames[p].color + '55',
//               borderColor: inputNames[p].color,
//               borderWidth: 5,
//               pointRadius: 5,
//               fill: false,
//               pointHitRadius: 10,
//             })
//           }
//         }
//       })
//       console.log(`Input names: ${names}`)
//       /*trendlineLinear: {
//           colorMin: colors[colorNum],
//           lineStyle: 'dotted',
//           width: 2,
//         }, */
//     }
//   })

//   console.log('datasets:', datasets, 'labels:', xTicks)
//   //Graph ppl
//   config = {
//     type: chartType,
//     data: {
//       labels: [...xTicks],
//       datasets: datasets,
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: {
//           position: 'top',
//         },
//         title: {
//           display: true,
//           text: titles[Type],
//         },
//       },
//       scales: {
//         x: {
//           ticks: {
//             autoSkip: false,
//           },
//         },
//       },
//     },
//   }

//   if (Type == 'Ratio') {
//     config.options.scales.y = {
//       max: 100,
//       min: 0,
//       ticks: {
//         stepSize: 5,
//       },
//     }
//   }
//   if (verticalLabels) {
//     config.options.scales.x = {
//       ticks: {
//         maxRotation: 90,
//         minRotation: 90,
//         autoSkip: false,
//       },
//     }
//   }
//   /*scales: {
//                 x: {
//                     ticks: {
//                         callback: function (val, index) {
//                             console.log('val index', val, index)
//                             return xTicks[index]
//                         },
//                     },
//                 },
//             },
//             animations: {
//                 tension: {
//                     duration: 1000,
//                     easing: 'linear',
//                     from: 0.7,
//                     to: 0,
//                     loop: true,
//                 },
//             }, */z
//   // console.log('config', config)
//   config.type = 'line'
//   chart.destroy()
//   chart = new Chart(ctx, config)
//   config.type = 'scatter'
//   chart.destroy()
//   chart = new Chart(ctx, config)

//   loadingEl.style.display = 'none'
// }

export default function Scores() {
  const db = getFirestore()
  const seasons = ['f22']

  ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)
  const [teams, setTeams] = useState([])
  const [regattas, setRegattas] = useState([{ seasons: seasons, teams: teams, regatta: '' }])

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
      },
    },
  }

  const data = {
    datasets: [
      {
        label: 'Fake Scores',
        data: [
          { x: 1, y: 5 },
          { x: 2, y: 10 },
          { x: 3, y: 3 },
        ],
        backgroundColor: 'rgba(255, 0, 0, 1)',
      },
    ],
  }

  useEffect(() => {
    // scrapeTeamListToDb('NWISA', seasons)

    getTeamList().then((docs) => {
      // docs.forEach((doc) => console.log(doc.data()))
      let tempDocs = []
      docs.forEach((doc) => {
        tempDocs.push(doc.id)
      })
      setTeams(tempDocs)
      console.log(teams)
    })
  }, [])

  function removeRegatta(regatta) {
    console.log(regatta)
  }

  function updateRegatta(regatta) {
    console.log(regatta)
  }

  regattas.map((e, i) => {
    console.log('hi', e.teams)
  })

  return (
    <main>
      <div className="regattasHolder">
        {regattas.map((e, i) => (
          <RegattaData key={i} seasons={e.seasons} teams={teams} removeRegatta={removeRegatta} updateRegatta={updateRegatta} />
        ))}
        <button
          onClick={() => {
            // console.log(regattas)
            setRegattas((cur) => [...cur, { seasons: seasons, teams: teams, regatta: '' }])
            // console.log(regattas)
          }}>
          +
        </button>
      </div>
      {/* <RegattaData /> */}
      <Scatter options={options} data={data} />
    </main>
  )
}
