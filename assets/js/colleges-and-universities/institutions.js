/*
  --------------------------------------------------------------------------------------------------------------------
  *   declarations
  *--------------------------------------------------------------------------------------------------------------------
  */
const mapContainer = document.getElementById('collegesMap');
const publicCheck = document.getElementById('publicCheck');
const privateCheck = document.getElementById('privateCheck');
const fourYearCheck = document.getElementById('fourYearCheck');
const twoYearCheck = document.getElementById('twoYearcheck');

const sectionFourtableBtn = document.getElementById('sectionFourTableBtn');
const sectionFourmapBtn = document.getElementById('sectionFourMapBtn');
const sectionFourtreemapBtn = document.getElementById('sectionFourTreemapBtn');


// Find the nodes within the specified rectangle.
function search(quadtree, x0, y0, x3, y3) {
  let validData = [];
  quadtree.visit(function(node, x1, y1, x2, y2) {
    var p = node.data;
    if (p) {
      p.selected = (p[0] >= x0) && (p[0] < x3) && (p[1] >= y0) && (p[1] < y3);
      if (p.selected) {
        validData.push(p);
      }
    }
    return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
  });
  return validData;
}

/**
 * 
 * @param {*} parentName - name to search by
 * Secondary Table (Investment) for Click event on treemap li
 * Need to grab different data than "tableData" in last table draw
 */
function createSecondaryTreemapTableSectFour(parentName, columns) {
  d3.csv("/data-lab-data/Edu_PSC.csv", function (error, data) {

    d3.select('#sectionFourTreemapSidebarTable').remove(); // remove on click data 

    /**
     * Create Secondary Table (Investment Types Table)
     */
    let subTableDiv = d3.select('#sectionFourTreemapContainerDiv').append('div')
        .attr('id', 'sectionFourTreemapSidebarTable');
    let subTableHeaderText = subTableDiv.append('h4').html(parentName); //replace with data TR name...
    subTableHeaderText.append('hr')
      .style('width', '30%')
      .style('display', 'flex');
    subTableHeaderText.append('p').html('Investment Types').attr('class', 'investmenth4');
    let subTable = subTableDiv.append('table')
        .attr('class', 'subTableData')
        .attr('align', 'center');

    // this is all subject to change once i get some real data, woohoo
    let titles = ['Type', 'Awarded Amount  ', '  % of Total'];
    let mockData = [
      { "Type": "Grant: Student", "Awarded Amount": "$1000", "% of Total": "20%" },
      { "Type": "Grant: Student", "Awarded Amount": "$1000", "% of Total": "20%" },
      { "Type": "Grant: Student", "Awarded Amount": "$1000", "% of Total": "20%" },
      { "Type": "Grant: Student", "Awarded Amount": "$1000", "% of Total": "20%" },
      { "Type": "Grant: Student", "Awarded Amount": "$1000", "% of Total": "20%" },
    ];

    let headers = subTable.append('thead').append('tr')
        .selectAll('th')
        .data(titles).enter()
        .append('th')
        .text(function (d) {
          return d;
        });

    let rows = subTable.append('tbody')
        .selectAll('tr')
        .data(mockData).enter()
        .append('tr');

    rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return { column: column, value: row[column] };
        });
      }).enter()
      .append('td')
      .text(function (d) {
        return d.value;
      })
      .attr('data-th', function (d) {
        return d.name;
      });
  });
}

/**
 * for Section4 Tree!
 * More or less the exact same as Section2...
 */
function sectionFourTreeMap() {
  d3.csv('../data-lab-data/EDU_v2_base_data.csv', (data) => {


    let schools = data.map(d => d.Recipient);
    let filteredSchools = schools.filter(function(item, index){
      return schools.indexOf(item) >= index;
    });


    // Going to do Sidebar Data first.
    // Just a simple list
    let sidebarList = d3.select('#sectionFourTreemapSidebar')
        .append('ul').attr('class', 'sectionFourSidebarList');

    sidebarList.append('input')
      .attr('class', 'search')
      .attr('class', 'searchPadding')
      .attr('placeholder', 'Search...');

    sidebarList.selectAll('li')
      .data(filteredSchools)
      .enter()
      .append('li')
      .attr('class', 'sidebarListElement') // use for on click maybe?
      .on('click', function(d) {
        createSecondaryTreemapTableSectFour(d, ['Type', 'Awarded Amount', '% of Total']);
	//        console.log(d);
      })
      .html(String);

    ///////////////////////
    // start Treemappin' // 
    ///////////////////////
    let width = 1000,
        height = 600;

    let color = d3.scaleOrdinal()
        .range(d3.schemeCategory10
               .map(function(c) { c = d3.rgb(c); c.opacity = 0.6; return c; }));

    let format = d3.format(",d");

    let treeMappy = d3.treemap()
        .size([width, height])
        .round(true)
        .padding(1);


    let bigTotal = data.map(i => i.Total_Federal_Investment).reduce((a,b) => a + b);
    data.forEach(function(i) { i.parent = "rootNode"; }); // add parent property to each child of root node for stratify

    let rootNode = {
      name: 'rootNode',
      Total_Federal_Investment: bigTotal,
      parent: "",
    };

    data.unshift(rootNode); // add root node to beginning of array
    //    console.log(data);

    let stratify = d3.stratify()
        .id(function(d) {
          return d.name;
        })
        .parentId(function(d) { return d.parent; });

    let root = stratify(data)
        .sum(function(d) { return d.Total_Federal_Investment; })
        .sort(function(a, b) { return b.height - a.height || b.Total_Federal_Investment - a.Total_Federal_Investment; });

    let treeMapContainer = d3.select('#sectionFourTreemap') // section 4! 
        .append('svg')
        .style('width', width)
        .style('height', height);
    //        .style('position', 'relative');

    treeMappy(root); // stratify and get the root ready

    let leaf = treeMapContainer
        .selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    leaf.append('text')
      .attr('x', function(d) {return d.x0; })
      .attr('y', function(d) {return d.y0; });
    //      .text(d => {
    //        return d.id + "\n" + format(d.value);
    //      });

    leaf.append("rect")
      .attr("id", d => d.id)
      .attr("fill", function(d) { var a = d.ancestors(); return color(a[a.length - 2].id); })
      .attr("fill-opacity", 0.6)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0);


  }); 
}; // end function


/*
  purpose : draws map and appends to given container
*/
const drawMap = (container) => {

  var width = 1200,
      height = 1000,
      centered;

  var projection = d3.geoAlbersUsa()
      .scale(1500) // was 1500
      .translate([width / 2, height / 2]);

  var path = d3.geoPath()
      .projection(projection)
      .pointRadius(1);

  // D3-tip Tooltip
  let stateToolTip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
	return "Count: " + d.value.length;
      });

  let allToolTip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
	return "School: " + d.Recipient + "<br>"
	  + d.INSTURL + "<br>" + "Students: " + d.Total;
      });


  var svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height);

  // add tooltips to map
  svg.call(stateToolTip); 
  svg.call(allToolTip);

  // what our map element is drawn on 
  let g = svg.append("g");

  /**
   * us-states holds the mapping in data.features (us.features)
   * simply for helping draw the visual
   */
  d3.json("../data-lab-data/us-states.json", function (error, us) {
    if (error) throw error;

    let map = g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(us.features)
        .enter().append("path")
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1.5")
        .on("click", clicked);

    let circles = map.append("svg:g")
        .attr("id", "circles");


    /**
     * EDU Data Section
     * Work done here..
     */
    d3.csv("../data-lab-data/EDU_v2_base_data.csv", function (error, data) {
      if (error) throw error;

      /**
       * Filter Boxes
       */
      let public = d3.select(publicCheck);
      let private = d3.select(privateCheck);
      let fouryear = d3.select(fourYearCheck);
      let twoyear = d3.select(twoYearCheck);
      let filterClearBtn = d3.select('.clearfilter');

      // Dropdown Box
      let dropDown = d3.select("#filtersDiv").append("select")
          .attr("name", "college-list")
          .attr('id', 'college-dropdown')
          .style('width', '200px');

      let options = dropDown.selectAll("option")
          .data(data)
          .enter()
          .append("option");

      options.text(function (d) { return d.Recipient; })
        .attr("value", function (d) { return d.Recipient; });


      // Clear Filter Box
      let clearfilter = d3.select('#filtersDiv').append('button')
          .attr('name', 'clearBtn')
          .attr('id', 'clearBtn')
          .text('Clear Filter')
          .on('click', function(d) {
            svg.selectAll('circle').remove(); // remove whatever is on the map currently
            // a bit heavy, as we are redrawing all the circles on the DOM again. Consider a better method for production
            // redrawing map to show all points!
            svg.selectAll("circle")
              .data(data)
              .enter()
              .append("svg:circle")
              .attr("transform", function (d) {
                let long = parseFloat(d.LONGITUDE);
                let lat = parseFloat(d.LATITUDE);
                if (isNaN(long || lat)) { long = 0, lat = 0; }
		if (long && lat == undefined) { long = 0, lat = 0; }
                return "translate(" + projection([long, lat]) + ")";
              })
              .attr('r', 4)
              .style("fill", "rgb(217,91,67)")
              .style("opacity", 0.85)
              .on('mouseover', allToolTip.show)
              .on('mouseout', allToolTip.hide);
            
          });

      let stateCheck = d3.nest()
	  .key(function(d){
	    return d.State;
	  }).rollup(function(leaves) {
	    return {
	      ...leaves, // old object plus..
	      stateTotal: d3.sum(leaves, function(d){ return d.Total_Federal_Investment; }),
	      length: leaves.length
	    };
	  }).entries(data);

      console.log(stateCheck);


      // ! This is where we draw the circles on the map (working!)
      // State Version
      svg.selectAll("circle")
        .data(stateCheck)
        .enter()
        .append("svg:circle")
        .attr("transform", function (d) {
          let long = parseFloat(d.value[0].LONGITUDE); // pick random state to put the bubble on.. look into putting into center of state itself.
          let lat = parseFloat(d.value[0].LATITUDE);
          if (isNaN(long || lat)) { long = 0, lat = 0; }
	  if (long && lat == undefined) { long = 0, lat = 0; }
          return "translate(" + projection([long, lat]) + ")";
        })
        .attr('r', 16)
	.style('fill', function(d){
	  if (d.value.stateTotal > 2067321200) { // random big number to test against. (subject to change)
	    return "Red";
	  } else {
	    return "Orange";
	  }
	})
        .style("opacity", 0.85)
	.text(function(d){
	  return d.value.length;
	})
        .on('mouseover', stateToolTip.show)
        .on('mouseout', stateToolTip.hide);

    });
  }); // end of double d3 zone 


  function clicked(d) {
    var x, y, k;

    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 4;
      centered = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }

    g.selectAll("path")
      .classed("active", centered && function (d) { return d === centered; });

    g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
  }

}; // end main wrapper 

/*
  --------------------------------------------------------------------------------------------------------------------
  *   Main Method
  *--------------------------------------------------------------------------------------------------------------------
  */

drawMap(mapContainer); // section 4 USA map
sectionFourTreeMap(); // section 4 treemap

/*
  Event Handlers
*/
$(sectionFourtableBtn).click(function() {
  console.log('clicking table button!');
  $('#sectionFourTableContainerDiv').css('display', 'flex'); // our table!
  $('#sectionFourTreemapContainerDiv').css('display', 'none'); // treemap
  $('#mapContainerDiv').css('display', 'none'); // donut 
});

$(sectionFourmapBtn).click(function() {
  console.log('clicking map button!');
  $('#mapContainerDiv').css('display', 'flex'); 
  $('#sectionFourTreemapContainerDiv').css('display', 'none'); 
});

$(sectionFourtreemapBtn).click(function() {
  console.log('clicking treemap button!');
  $('#sectionFourTreemapContainerDiv').css('display', 'flex'); // tree
  $('#tableContainerDiv').css('display', 'none'); // table 
  $('#mapContainerDiv').css('display', 'none'); // usa map
});






