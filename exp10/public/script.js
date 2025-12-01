// Base file loaded by index.html
console.log('Exp10 script loaded (D3 v7):', d3.version);

/* ---------------------------
   Experiment 10.1 — Bar Chart
   Simple binding of data to rects
   --------------------------- */
(function barChart(){
  const data = [30, 80, 45, 60, 20, 90, 50];
  const svg = d3.select('#barChart');
  const width = +svg.attr('width');
  const height = +svg.attr('height');
  const margin = { top: 10, right: 10, bottom: 20, left: 20 };
  const w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  const x = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([0, w])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([h, 0]);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // create bars
  g.selectAll('rect')
    .data(data)
    .join('rect')
      .attr('x', (d, i) => x(i))
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => h - y(d))
      .attr('fill', 'steelblue')
      .on('mouseover', function() { d3.select(this).attr('fill', 'orange'); })
      .on('mouseout', function() { d3.select(this).attr('fill', 'steelblue'); });

  // add labels
  g.selectAll('text')
    .data(data)
    .join('text')
      .attr('x', (d, i) => x(i) + x.bandwidth()/2)
      .attr('y', d => y(d) - 4)
      .attr('text-anchor', 'middle')
      .text(d => d)
      .style('font-size','12px');
})();


/* ---------------------------
   Experiment 10.2 — Create multiple shapes and mouse events
   --------------------------- */
(function shapes(){
  const svg = d3.select('#shapes');
  const w = +svg.attr('width');
  const h = +svg.attr('height');

  const shapesG = svg.append('g').attr('transform','translate(20,20)');

  // circles data
  const circles = [
    {cx:50, cy:50, r:20, color:'purple'},
    {cx:120, cy:60, r:25, color:'teal'},
    {cx:200, cy:40, r:18, color:'orange'}
  ];

  shapesG.selectAll('circle')
    .data(circles)
    .join('circle')
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
      .attr('fill', d => d.color)
      .on('mouseover', function() { d3.select(this).attr('opacity',0.6).attr('stroke','black'); })
      .on('mouseout', function() { d3.select(this).attr('opacity',1).attr('stroke',null); });

  // rectangles
  const rects = [
    {x: 300, y:20, w:60, h:40, fill:'lightgreen'},
    {x: 380, y:40, w:80, h:30, fill:'lightcoral'}
  ];

  shapesG.selectAll('rect')
    .data(rects)
    .join('rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.w)
      .attr('height', d => d.h)
      .attr('fill', d => d.fill)
      .on('click', function(e,d) {
         alert('Rectangle clicked. width=' + d.w);
      });
})();


/* ---------------------------
   Experiment 10.3 — Select an element and change styles/text
   --------------------------- */
(function selectModify(){
  // This demonstrates selecting by id and changing content/style
  d3.select('#myDiv')
    .text('This text was modified by D3')
    .style('color','darkblue')
    .style('font-weight','600');
})();


/* ---------------------------
   Experiment 10.4 — Load CSV and build a small line or bar chart
   --------------------------- */
(function csvLoad(){
  // The CSV file must be in public/data.csv
  const csvPath = 'data.csv';
  d3.csv(csvPath).then(data => {
    // convert values to number (assumes CSV has columns: year,value OR value)
    data.forEach(d => { if(d.value) d.value = +d.value; });

    // If data has only value column, map index to x
    const values = data.map(d => +d.value);
    const svg = d3.select('#csvChart');
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const margin = { top:20, right:20, bottom:40, left:40 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(d3.range(values.length)).range([0, w]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(values)]).range([h, 0]);

    g.selectAll('rect')
      .data(values)
      .join('rect')
        .attr('x', (d,i) => x(i))
        .attr('y', d => y(d))
        .attr('width', x.bandwidth())
        .attr('height', d => h - y(d))
        .attr('fill', 'seagreen');

    // axis labels (simple)
    g.selectAll('text')
      .data(values)
      .join('text')
        .attr('x', (d,i) => x(i) + x.bandwidth()/2)
        .attr('y', d => y(d) - 6)
        .attr('text-anchor','middle')
        .text(d => d);
  }).catch(err => {
    console.warn('CSV load failed (is public/data.csv present?):', err);
  });
})();
