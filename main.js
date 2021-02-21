let store = {}
let config ={}

function init() {
    loadData().then(showData);
}

function loadData() {
    return Promise.all([
        d3.json("data/germany.geo.json")

    ]).then(datasets => {
        store.geoJSON = datasets[0]
        return store;
    })
}

function initConfig(){
    let width = 600;
    let height = 900;
    let center = [10.451526, 51.165691 - 0.8] // Origirnal coordinates of Germany's center according to https://www.geodatos.net/en/coordinates/germany
    let mapBaseColor = "#eeeeee"
    let mapHighlightColor = "#222222"
    let mapBackgroundColor = "#ffffff"
    let mapStrokeColor = "#ffffff"
    let highlightDistricts = ["Hamburg", "Hessen"]
    let mapTitle = "54°30′56″ N 13°38′40″ O"
    let mapSubtitle = "11.11.2020"
    let fontFamily = "courier new"
    let container = d3.select("#Map")
    container
        .attr("width", width)
        .attr("height", height)
    config = {width, height, container, center, mapBaseColor, mapHighlightColor, mapBackgroundColor, mapStrokeColor, highlightDistricts, mapTitle, mapSubtitle, fontFamily}
}

function getMapProjection() {
    let {width, height, center} = config;
    let projection = d3.geoMercator()
    projection.scale(3000)
        .translate([width / 2, height / 2 + 20])
        .center(center)  // centers map at given coordinates
                
    store.mapProjection = projection;
    return projection;
}

function getDistrictColor(d, store){
    let {mapBaseColor, mapHighlightColor, highlightDistricts} = config
    if(highlightDistricts.includes(d.properties.GEN) || 
        highlightDistricts.includes(d.properties.name)) {
        return mapHighlightColor
    } else {
        return mapBaseColor
    }        
}

function drawHighlightedMap(projection, store){
    let {container, mapBaseColor, mapHighlightColor, mapStrokeColor} = config
    let path = d3.geoPath()
        .projection(projection)
            
    container.selectAll("path").data(store.geoJSON.features)
        .enter().append("path")
        .attr("d", d => path(d))
        .attr("stroke", mapStrokeColor)
        .attr("stroke-width", 2)
        .attr("fill", d => getDistrictColor(d, store))
        .on('mouseover', function(d, i) {
            d3.select(this).style('fill-opacity', 0.8);
        })
        .on('mouseout', function(d, i) {
            d3.select(this).style('fill-opacity', 1);
        })
        .on('click', function(d, i) {
            if(config.highlightDistricts.includes(d.properties.name)){
                config.highlightDistricts = config.highlightDistricts.filter(function(item) {
                    return item !== d.properties.name
                })
            } else {
                console.log(d.properties)
                config.highlightDistricts.push(d.properties.name)
            }
            d3.select(this).style('fill', getDistrictColor(d, store));
        });

}

function drawText() {
    let {container, width, height, mapHighlightColor, mapTitle, mapSubtitle, fontFamily} = config

    container.append("text")
        .attr("id", "mapTitle")
        .attr("y", height* 0.905)
        .attr("x", width/2)
        .attr("font-family", fontFamily)
        .attr("text-anchor", "middle")
        .attr("font-size", "22px")
        .attr("font-weight", "600")
        .attr("fill", mapHighlightColor)
        .text(mapTitle);

    let subtitleYFactor = 0.925
    container.append("text")
        .attr("y", height* subtitleYFactor)
        .attr("x", width/2)
        .attr("font-family", fontFamily)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .attr("fill", mapHighlightColor)
        .text(mapSubtitle);

    // Create line between titles
    // container.append("line") 
    //     .style("stroke", "#333")  
    //     .style("stroke-width", "1.5px")
    //     .attr("x1", width * 0.25)     
    //     .attr("y1", height* 0.915)     
    //     .attr("x2", width * 0.75)     
    //     .attr("y2", height* 0.915);    
    
    // Add line before and after subtitle
    container.append("line") 
        .style("stroke", "#333")  
        .style("stroke-width", "0.6px")
        .attr("x1", width * 0.24)     
        .attr("y1", height* (subtitleYFactor -0.004))     
        .attr("x2", width * 0.41)     
        .attr("y2", height* (subtitleYFactor -0.004))    
        
    container.append("line") 
        .style("stroke", "#333")  
        .style("stroke-width", "0.6px")
        .attr("x1", width * 0.59)     
        .attr("y1", height* (subtitleYFactor -0.004))     
        .attr("x2", width * 0.76)     
        .attr("y2", height* (subtitleYFactor -0.004))    

}

function drawMap() {
    let projection = getMapProjection();
    drawHighlightedMap(projection, store)
    drawText()
}

function updateMap() {
    let {container, mapStrokeColor} = config
    container.selectAll("path")
        .attr("fill", d => getDistrictColor(d, store))
        .attr("stroke", mapStrokeColor)
}

function updateText() {
    let {container, width, height, mapHighlightColor, mapTitle, mapSubtitle, fontFamily} = config
    container.selectAll("#mapTitle")
        .text(mapTitle);
}

function initInputElements(store) {
    let {mapBaseColor, mapHighlightColor, mapBackgroundColor, mapStrokeColor, mapTitle} = config
    // Adds color picker event listener for primary and secondary fill color 
    d3.select("#mapBaseColor")
        .attr("value", mapBaseColor)
        .on('input', function(){
            config.mapBaseColor = this.value
            updateMap()
        })

    d3.select("#mapHighlightColor")
        .attr("value", mapHighlightColor)
        .on('change', function(){
            config.mapHighlightColor = this.value
        })

    // Adds color picker event listener for background color
    d3.select("#mapBackgroundColor")
        .attr("value", mapBackgroundColor)
        .on('input', function(){
            config.mapBackgroundColor = this.value
            d3.select("svg")
                .style("background-color", config.mapBackgroundColor)
        })

    // Adds color picker event listener for line color
    d3.select("#mapStrokeColor")
        .attr("value", mapStrokeColor)
        .on('input', function(){
            config.mapStrokeColor = this.value
            updateMap()
        })

    
    // TODO: Adds input field event listener for font color

    
    // Adds input field event listener for title
    d3.select("#mapTitle")
        .attr("value", mapTitle)
        .on('change', function(){
            config.mapTitle = this.value
            updateText()
        })

    // Adds input field event listener for subtitle
    d3.select("#mapSubtitle")
        .attr("value", mapSubtitle)
        .on('change', function(){
            config.mapSubtitle = this.value
            updateText()
        })
    
    // Adds button event listener for the save button
    d3.select("#download")
        .on('click', function(){
            // Gets the d3js SVG element and saves using the saveSvgAsPng.js library
            saveSvgAsPng(document.getElementsByTagName("svg")[0], "plot.png", {backgroundColor: config.mapBackgroundColor});
        })

}

function showData() {
    initConfig()
    initInputElements()
    drawMap()
}

window.addEventListener("load", init)