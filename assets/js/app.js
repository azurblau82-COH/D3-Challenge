// @TODO: YOUR CODE HERE!
console.log("Hello")

var svgWidth = 760;
var svgHeight = 700;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis] * 0.8),
      d3.max(data, d => d[chosenXAxis] * 1.1)
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis] * 0.8 ),
        d3.max(data, d => d[chosenYAxis] * 1.1)
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(500)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr('cy', d => newYScale(d[chosenYAxis]))
    

  return circlesGroup;
}

function renderText(circleText, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circleText.transition()
    .duration(500)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]) + 5)
    

  return circleText;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var labelX;
  var labelY;

  if (chosenXAxis === "poverty") {
    labelX = "In Poverty (%):";
  }
  if (chosenXAxis === 'age') {
    labelX = "Age (Median):";  
  } 
  else {
    labelX = "Household Income (Median):";
  };
  
  if (chosenYAxis === "healthcare") {
    labelY = "Lacks Healthcare (%):";
  }
  if (chosenYAxis === 'smokes') {
    labelY = "Smokes (%):";  
  } 
  else {
    labelY = "Obese (%):";
  };
  

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-20, 20])
    .html(function(d) {
      return (`State: ${d.abbr}</br>
              ${labelX} ${d[chosenXAxis]} </br>
              ${labelY} ${d[chosenYAxis]}`);
    });

  // Step 2: Create the tooltip in chartGroup.
  chartGroup.call(toolTip);

  // Step 3: Create "mouseover" event listener to display tooltip
  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
  })
  // Step 4: Create "mouseout" event listener to hide tooltip
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });


  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(data, err) {
  //if (err) throw err;
console.log(data);
  // parse data
  data.forEach(function(d) {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.healthcare = +d.healthcare;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .classed("stateCircle", true);
    
  var textgroup = chartGroup.append('g')
  
  var circleText = textgroup.selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .attr('x', d => xLinearScale(d[chosenXAxis]))
    .attr('y', d => yLinearScale(d[chosenYAxis]) + 5)
    .classed('stateText', true)
    .text(d=>d.abbr);

  // Create group for 3 x-axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
    
  var incomeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");
    
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", "rotate(-90)");
  // append y axis
  var healthcareLabel = labelsGroupY.append("text")
    //.attr("transform", "rotate(-90)")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsGroupY.append("text")
    //.attr("transform", "rotate(-90)")
    .attr("y", 40 - margin.left)
    .attr("x",  - (height / 2))
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");

  var obeseLabel = labelsGroupY.append("text")
    //.attr("transform", "rotate(-90)")
    .attr("y", 60 - margin.left)
    .attr("x",  - (height / 2))
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)");

  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);



  // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var valueX = d3.select(this).attr("value");
      
      if (valueX !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = valueX;
        
        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x, y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        if (chosenXAxis === "age"){
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        if (chosenXAxis === "income"){
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
      // x axis labels event listener
  labelsGroupY.selectAll("text")
  .on("click", function() {
    
    // get value of Y selection
    var valueY = d3.select(this).attr("value");
    
    if (valueY !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = valueY;
      
      console.log(chosenYAxis)

      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = yScale(data, chosenYAxis);

      // updates x axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
      circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
        
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }

      if (chosenYAxis === "smokes"){
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }

      if (chosenYAxis === "obesity"){
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  })
    
}).catch(function(error) {
  console.log(error);
});
