/**
 *
 * Author : Nagesh Salunke
 * License: https://github.com/salunkenagesh14/KendoUI-ChartExport-PhantomJS/blob/master/LICENSE
 * (c) 20013-2014
 * version: 1.0
 * 
 * JavaScript for using kendo ui export on server side
 * Supported formats
 * 1. start as a web server		
 * 2. Export using  command line arguments
 */

(function() {
    "use strict";

    var config={},
	    mapCLArguments,
        render,
        startServer,
        args,
        system = require( "system" ),
        fs = require( "fs" ),
        serverMode = true;


    /**
     * @desc mapping command line arguments
    */
    mapCLArguments = function() {
        var map = {},
            i,
            key;

        for ( i = 0; i < system.args.length; i += 1 ) {
            if ( system.args[i].charAt( 0 ) === "-" ) {
                key = system.args[i].substr( 1, i.length );
                map[key] = system.args[i + 1];
            }
        }
        return map;
    };

    /**
     * @desc render chart server side
     * Default export format is .png
     * @TODO add parameterized export format
    */
    render = function( params, exitCallback ) {
	
        var page = require( "webpage" ).create(),
            renderSVG,
            exit,
            input = params.infile,
            n = new Date().getUTCMilliseconds(),
            output = config.tmpDir+"/KendoExportedchart_"+n+Math.floor((Math.random() * 1000) + 1)+".png",
            createChart;

        page.onConsoleMessage = function( msg ) {
            console.log( msg );
        };

        page.open( "export.html", function( status ) {
            // load chart in page
            page.evaluate( createChart ,input);

			//create png of the page
            page.evaluate( function() {
                var body = document.body;
                body.style.backgroundColor = '#fff';
            } );
            page.render( output );
            exit("Successfully Created "+output+" at server");
        });


	/**
	* @desc appends chart in SVG format to document using KendoUI
	*/
        createChart = function( input ) {
            $( "<div id=\"chart\"> </div>" ).appendTo( document.body );
			try{
				$( "#chart" ).kendoChart(input);
			}catch( e ){
				console.log("ERROR : Exception while creating chart from KendoUI");
			}
        };

		/**
		* @desc page close and return callback
		*/
        exit = function( resultMessage ) {
            if ( serverMode ) {
                page.close();
            }
            exitCallback( resultMessage );
        };

    };


    /**
     * @desc starts an export server given host and port
    */
    startServer = function( host, port ) {
        var server = require( "webserver" ).create();

        server.listen( host + ":" + port, function( request, response ) {

			var jsonStr = request.post,
                params,
                msg;
                
				try {
                    params = JSON.parse( jsonStr );
                    if ( params.status ) {
                        // for server health validation
                        response.statusCode = 200;
                        response.write( "OK" );
                        response.close();
                    }
                    else {
                        render( params, function( result ) {
                            response.statusCode = 200;
                            response.write( result );
                            response.close();
                        } );
                    }
                }
                catch ( e ) {
                    msg = "Failed rendering: \n" + e;
                    response.statusCode = 500;
                    response.setHeader( "Content-Type", "text/plain" );
                    response.setHeader( "Content-Length", msg.length );
                    response.write( msg );
                    response.close();
                }
            }); 

        // switch to serverMode
        serverMode = true;
        console.log( "OK, PhantomJS is ready for exporting kendoUI charts." );
    };
    
    
    
    //execution starts here
    args = mapCLArguments();

    // set tmpDir, for output temporary files.
    if ( args.tmpdir === undefined ) {
        config.tmpDir = fs.workingDirectory + "/tmp";
    }
    else {
        config.tmpDir = args.tmpdir;
    }

    // exists tmpDir and is it writable?
    if ( !fs.exists( config.tmpDir ) ) {
        try {
            fs.makeDirectory( config.tmpDir );
        }
        catch ( e ) {
            console.log( "ERROR: Cannot create temp directory for " + config.tmpDir );
        }
    }


	//start server if started in server mode
    if ( args.host !== undefined && args.port !== undefined ) {
        startServer( args.host, args.port );
    }
    else {
        // command line export
        render( args, function( msg ) {
            console.log( msg );
            phantom.exit();
        } );
    }
	

}());
