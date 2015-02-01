/* 
 * by Alison Benjamin 
 * http://benj.info
 */

var height,
	width, 
	mapData,
	map,  		
	projection, 
	path, 
	transsib, 
	transmongolian,
	transmanchurian,
	common,
	drawRailwaySegment,
	drawDots, 
	label,
	cityLabel, 
	scale,
	portrait; 
	
var getViewportDimensions = function(){	
		
	
	// portrait
	if(window.innerHeight > window.innerWidth){
    	width = document.getElementById("map").offsetWidth * 0.90;	
		height = window.innerHeight * 0.45;
		scale = width/1.3;
		portrait = true;
			
	}
	
	// landscape
	if(window.innerHeight < window.innerWidth){
    	width = document.getElementById("map").offsetWidth * 0.90;	
		height = window.innerHeight * 0.75; 
		scale = width/1.7;
		portrait = false;
	}
	
};


var pathLine = d3.svg.line()
	.x(function(d) { 
		return projection([d.Lat, d.Long])[0]; 
	})
	.y(function(d) { 
		return projection([d.Lat, d.Long])[1]; 
	});
	
	
/* 
 * load data
 */

queue()
    .defer(d3.json, "data/europeAsiaSimple.json") // Russia-Mongolia-China GeoJSON
    .defer(d3.csv, "data/transsiberian.csv") // to Vladisvostok 
	.defer(d3.csv, "data/transiberianTransmongolian.csv") // to Beijing, via Mongolia
	.defer(d3.csv, "data/transmanchurian.csv") // to Beijing, overland China
	.defer(d3.csv, "data/common.csv") // lines in common
	.defer(d3.csv, "data/labels.csv") //labels
    .await(function(error, map, transsibLine, transmongolianLine, transManchurianLine, inCommon, label) { 
    	if(error){
    		console.log(error);
    	}
    	else{
    		mapData = map;
			transsib = transsibLine;
			transmongolian = transmongolianLine;
			transmanchurian = transManchurianLine;
			common = inCommon;
			cityLabel = label;
    		drawSVGMap();
    		
    	}
    	
    });

/* draw map wpathBeginning
 * cities as dots, 
 * and paths connecting the dots
 */

var drawSVGMap = function(){


	getViewportDimensions();
	
	map = d3.select("#map")
		.append("svg")
		.attr({
			"width": width,
			"height": height,
			"id": "svg"
		});


	projection = d3.geo.albers()
		.rotate([-90, 0])
 		.center([-5, 67])
   		.parallels([52, 64])
   		.scale(scale)
   		.translate([width/2.2, height/3]); 
   


	path = d3.geo.path()
		.projection(projection);
	
	map
		.append("g")
		.classed("russia-mongolia-china",true)
		.selectAll("path.map")
		.data(mapData.features)
		.enter()
		.append("path")
		.classed("map", true)
		.attr({
			"d": path,
			"class": function(d){
				return d.properties.sovereignt;
			}
		});
		
	
	
	// label each country 
	map
		.selectAll(".mapName")
		.data(mapData.features)
		.enter()
		.append("text")
		.attr({
				"transform": function(d) {
					return "translate(" + path.centroid(d) + ")"; 
				},
				
				"class": "mapLabel"
		})
		.text(function(d){
			return d.properties.name;
		});
		 

	
	
	/* abstract function to generate 
	 * a segment of the railway 
	 */
	
	drawRailwaySegment = function(segment){
		
		map
			.append("g")
			.classed("rail",true)
			.append("path")
			.classed("line", true)
			.classed(segment[0].Segment, true)
			.attr({
				"d" :  pathLine(segment)
			});		
			
	};
	
	drawRailwaySegment(transmanchurian);
	drawRailwaySegment(transmongolian);
	drawRailwaySegment(transsib);
	drawRailwaySegment(common);


	function highlight(){
		var path = "." + this.id; 
		this.style.backgroundColor = "#eee";
		this.style.transition =  "background-color 0.5s ease";
		this.style.color = "#333";
		
		d3.select(path)	
			.classed("highlight",true);
		
		d3.select(".Common")	
			.classed("highlight",true);
	}
	
	function unhighlight(){
		var path = "." + this.id; 
		this.style.backgroundColor = "#fff";
		this.style.color = "#808080";
		
		d3.select(path)
			.classed("highlight",false);
	
		d3.select(".Common")	
			.classed("highlight",false);
	}
	
	drawLabels = function(cityName){
		
		d3	.select("svg")
			.selectAll("g.label")
			.data(cityName)
			.enter()
			.append("g")
			.classed("label", true)
			.attr({
				"transform": function(d){
					return "translate(" + projection([d.Lat,d.Long]) + ")";
				}
			})
			.append("text")
			.attr("transform", function(d){
				if(portrait){
					return "translate(-15,-5)";
				}
				else {
					return "translate(-20,-8)";
				}
			})
			.text(function(d){
				return d.City;
			});
			
			
			
	}(cityLabel);
	
	/* abstract function to generate 
	* dots (representing cities) 
	* on a segment of the railway 
	*/
	
   drawDots = function(name){
   
   		// dot for each city
		map
			.append("g")
			.classed("cities",true)
			.selectAll("circle")
			.data(name)
			.enter()
			.append("g")
			.classed("dot", true)
			.attr({
				"transform": function(d){
					return "translate(" + projection([d.Lat,d.Long]) + ")";
				}
			})
			.append("circle")
			.attr({
				"r": function(d){
					if(portrait){
						return 1.5;
					}
					else{
						return 2;
					}
				}, 
				"class": function(d){
					return d.Segment;
				},
				"fill": "#5b5b5b"
			});
			
    };
    
    drawDots(cityLabel);
   

	var table = function(data){
				
		//create the table element
		var body = document.getElementById("table");
		var table = document.createElement("table");
		table.classList.add("table", "table-striped");
			
		// set table headings
		var thead = document.createElement("thead");
		var tr = document.createElement("tr");
		thead.appendChild(tr);
		table.appendChild(thead);
		body.appendChild(table);
	
		// table headings
		for(var key in data[0]){
			if(data[0].hasOwnProperty(key)){
				if(	(key === "Route") || (key === "Distance (km)") ){
					var td = document.createElement("td");
					td.innerHTML = key;
					tr.appendChild(td);	
				}
			}		
		}
	
		// body
		var tbody = document.createElement("tbody");
		table.appendChild(tbody);
		
		// table body content
		for(var key in data){
	
			if(data.hasOwnProperty(key)){
				
				if((data[key].Route !== "") ||(data[key]["Distance (km)"] !== "") ){
				var trBody = document.createElement("tr");
				trBody.id = data[key].Route;
				trBody.tabIndex = 0;
				trBody.addEventListener("mouseover", highlight);
				trBody.addEventListener("mouseout", unhighlight);
				trBody.addEventListener("focus", highlight);
				trBody.addEventListener("blur", unhighlight);
	
				// City name
				var tdBody1 = document.createElement("td");
				tdBody1.innerHTML = data[key].Route;
				trBody.appendChild(tdBody1);
				
				// Hour
				var tdBody2 = document.createElement("td");
				tdBody2.innerHTML = data[key]["Distance (km)"];
				trBody.appendChild(tdBody2);
				
				tbody.appendChild(trBody);
				
				}
				
			}
		}
		
	};

	table(cityLabel);

};



d3.select(window).on('resize', resize);

function resize(map){

	getViewportDimensions();

	// update SVG size
	map = d3.select("#map svg")
		.attr({
			"width": width,
			"height": height
		});
	
	// update projection 
	projection = d3.geo.albers()
		.rotate([-90, 0])
 		.center([-5, 67])
   		.parallels([52, 64])
   		.scale(scale)
   		.translate([width/2.2, height/3]); 
   
   

	path = d3.geo.path()
		.projection(projection);
   	
   	
   	// update map 
 	d3.selectAll(".russia-mongolia-china path")
 		.attr("d", path);
 	


	// update transsibierian
	map
		.select(".Trans-Siberian")
		.attr("d", pathLine(transsib));
	
	// update transmongolian
	map
		.select(".Trans-Mongolian")
		.attr("d", pathLine(transmongolian));
		
	// update transmanchurian
	map
		.select(".Trans-Manchurian")
		.attr("d", pathLine(transmanchurian));
					
	// update common
	map
		.select(".Common")
		.attr("d", pathLine(common));
					
	// update dot position
	d3.selectAll("g.dot")
		.attr({
			"transform": function(d){
				return "translate(" + projection([d.Lat,d.Long]) + ")";
			}
		});
	
	// update circle size	
	d3.selectAll("g.dot circle")
		.attr({
			"r": function(d){
				if(portrait){
					return 1.5;
				}
				else{
					return 2;
				}
			}
		});
	
		
	d3.selectAll(".mapLabel")
		.attr({
			"transform": function(d) {
				return "translate(" + path.centroid(d) + ")"; 
			}
		});
	
	d3.selectAll("g.label")
 		.attr({
			"transform": function(d) {
					return "translate(" + projection([d.Lat,d.Long]) + ")";
			}
		});
	
	d3.selectAll("g.label text")
		.attr("transform", function(d){
			if(portrait){
				return "translate(-15,-5)";
			}
			else {
				return "translate(-20,-8)";
			}
		});  
}

