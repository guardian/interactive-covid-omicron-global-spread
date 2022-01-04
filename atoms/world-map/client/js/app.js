import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geoProjection from 'd3-geo-projection'
import worldMap from 'assets/ne_10m_admin_0_countries_crimea_ukraine_simple.json'
import { numberWithCommas } from 'shared/js/util'

const d3 = Object.assign({}, d3B, topojson, geoProjection);

const atomEl = d3.select('.omicron-interactive-wrapper').node()

const header = d3.select('.omicron-header')
const footer = d3.select('.omicron-footer')

const isMobile = window.matchMedia('(max-width: 600px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height =  width * 3 / 5;

let projection = d3.geoRobinson();

let path = d3.geoPath()
.projection(projection);

let extent = {
        type: "LineString",

         coordinates: [
            [-180, -60],
            [180, -60],
            [180, 90],
            [-180, 90],
        ]
}

projection
.fitExtent([[0, 0], [width, height]], extent);

const filtered = topojson.feature(worldMap, worldMap.objects['world-map-crimea-ukr']).features.filter(f => f.properties.ADMIN != 'Antarctica')

const map = d3.select('.omicron-map-container')
.append('svg')
.attr('id', 'omicron-map')
.attr('width', width)
.attr('height', height);

const geo = map.append('g')

const baseMap = geo
.selectAll('path')
.data(filtered)
.enter()
.append('path')
.attr('class', d => 'country ' + d.properties.ISO_A3)
.attr('d', path)

const mesh = geo.append("path")
.datum(topojson.mesh(worldMap, worldMap.objects['world-map-crimea-ukr'], (a, b) => a !== b ))
.attr("d", path)
.attr("class", "border")

const colors = ['#dadada','#FBE5AB', '#F5BE2C', '#ED6300', '#CC0A11', '#8B156C'];
const buckets = ['No data',1,10,100,1000,10000]

let colorScale = d3.scaleThreshold()
.range(colors)
.domain([1,10,100,1000,10000]);

colors.forEach((d,i) => {

	d3.select('.omicron-key-bar')
	.append('div')
	.attr('class', 'omicron-key-color-box')
	.style('background', d)

	d3.select('.omicron-key-footer')
	.append('div')
	.attr('id', 'omicron-key-text-' + i)
	.attr('class', 'omicron-key-text-box')
	.html(numberWithCommas(buckets[i]))
})



d3.json('https://interactive.guim.co.uk/docsdata/1R97UAH9-C9zscL6qimP_GwpuDZaHSAHpGa5MG6g8JRA.json')
.then(rawdata => {


	const data = rawdata.sheets['master data'];
	const furniture = rawdata.sheets['note'];

	data.forEach(d => {

		let value = +d['#GR/484A (B.1.1.529) in past 4 weeks'];

		console.log(colorScale(value))

	})

	data.forEach(d => {

		let geoMatch = filtered.find(f => f.properties.ISO_A3 === d.ISO_A3);

		geoMatch.properties['Total #GR/484A (B.1.1.529)'] = +d['Total #GR/484A (B.1.1.529)'];
		geoMatch.properties['#GR/484A (B.1.1.529) in past 4 weeks'] = +d['#GR/484A (B.1.1.529) in past 4 weeks'];
		geoMatch.properties['%GR/484A (B.1.1.529) in past 4 weeks'] = +d['%GR/484A (B.1.1.529) in past 4 weeks'];
		geoMatch.properties['Last updated'] = d['Last updated'];

		map.selectAll('.' + d.ISO_A3)
		.style('fill', colorScale(+d['Total #GR/484A (B.1.1.529)']))

	})

	console.log(furniture[0])
	header.html(furniture[0].Headline)
	footer.html(furniture[0].Source)

	if(window.resize)window.resize()


})