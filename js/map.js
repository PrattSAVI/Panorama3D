var url = "./data/BB_4236.geojson";

const margin = ({ top: 10, right: 0, bottom: 0, left: 10 });
const mapWidth = 640 - margin.left - margin.right;
const mapHeight = 640 - margin.top - margin.bottom;

var svg = d3.select(".map").append("svg")
    .attr('width', mapWidth + margin.left + margin.right)
    .attr('height', mapHeight + margin.top + margin.bottom);


d3.json(url).then(function(nycGeo) {

    var projection = d3.geoAlbers()
        .fitSize([mapWidth, mapHeight], nycGeo)

    var path = d3.geoPath()
        .projection(projection);

    var g1 = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);;
    var g2 = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);;


    var maps = nycGeo.features.filter(d => {
        return d.properties.map === 1
    })

    var markers = nycGeo.features.filter(d => {
        return d.properties.map === 0
    })

    console.log(markers);
    console.log(maps);

    // Geo Boundaries
    g1.selectAll("path")
        .data(maps)
        .join("path")
        .attr("d", path)
        .attr("fill", 'grey')
        .attr("stroke", "black");

    // Markers
    g2.selectAll("path")
        .data(markers)
        .join("path")
        .attr("d", path)
        .attr("fill", 'rgba(0,0,0,0)')
        .attr("stroke", "red")
        .attr("id", "flushing");

    document.querySelector("#flushing").addEventListener("mouseenter", function(e) {

        var popup = document.querySelector('.popup');
        popup.classList.add('visible');

        console.log(popup)

        popup.style.left = e.pageX - 60 + "px";
        popup.style.top = e.pageY - 60 + "px";

    });

    document.querySelector("#flushing").addEventListener("mouseleave", function(e) {

        var popup = document.querySelector('.popup');
        popup.classList.remove('visible');


    });

});