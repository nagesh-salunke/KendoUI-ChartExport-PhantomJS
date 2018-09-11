KendoUI-ChartExport-PhantomJS
=============================

Server side export utility for KendoUI charts using Phantom Js  
You will need phantomjs to run the demo.

PhantomJs available at : http://phantomjs.org/download.html  


<b>Using as the export server</b>

   <b> 1. starting up the Export server</b>

    phantomjs kendoUI-convert.js -host 127.0.0.1 -port 2002

   <b> 2. using via curl</b>

    curl -H "Content-Type: application/json" -X POST -d '{"infile":"{xAxis: {categories: [\"Jan\", \"Feb\", \"Mar\"]},series: [{data: [29.9, 71.5, 106.4]}]}"}' 127.0.0.1:2002
  
    
<b>Using as command line export</b>

     phantomjs kendoUI-convert.js -infile "{xAxis: {categories: [\"Jan\", \"Feb\", \"Mar\"]},series:[{data: [29.9, 71.5, 106.4]}]}"
    
    
  
