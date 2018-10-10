/*
 * Example plugin template
 */

jsPsych.plugins["circles"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "circles",
    description: '',
    parameters: {
      canvas_size:{
        type: jsPsych.plugins.parameterType.HTML_STRING,
        array: true,
        pretty_name: 'Canvas size',
        default: ['800','700'],
        description: 'Size of canvas'
      },
      n_rows:{
        type:jsPsych.plugins.parameterType.INT,
        default:3
      },
      n_cols:{
        type:jsPsych.plugins.parameterType.INT,
        default:3
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'stimulus',
        default: 'hola',
        description: 'The HTML string to be displayed'
      },
      level:{
        type: jsPsych.plugins.parameterType.FLOAT
      },
      points_to_pass:{
        type: jsPsych.plugins.parameterType.INT,
        default: 10,
        description: 'Number of points necesary to pass level'
      },
      points:{
        type: jsPsych.plugins.parameterType.INT,
        default: 0,
        description: 'Accumulated points'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

  var canvas_size=trial.canvas_size;
  var n_rows=trial.n_rows;
  var n_cols=trial.n_cols;
  var level=trial.level;
  var points=trial.points;
  var points_to_pass=trial.points_to_pass;


  var trial_data={
    won:[],
    rt:[],
    level: []
  };

  trial_data.level=trial.level;
  display_element.innerHTML="<p id='text'></p><canvas width="+canvas_size[0]+ "px height="+canvas_size[1]+"px id='myCanvas' style=' margin-left:0px auto;  cursor:crosshair; ' ;></canvas>";
  var canvas = document.getElementById('myCanvas'),
      canvas_rect = canvas.getBoundingClientRect(),
      ctx = canvas.getContext("2d");


  ctx.clearRect(0,0,canvas.width,canvas.height);


  var score_section={width:(canvas.width-canvas.height), height: Math.round(canvas.height)};  // left side of the canvas is assigned to display score
  var cell={width: (canvas.width-score_section.width)/n_cols, height: canvas.height/n_rows}; // grid cell where each circle is displayed
  var n_cells=n_rows*n_cols;


  var max_size=Math.min(100,Math.floor(Math.min(cell.width,cell.height)*0.9*0.5)); // size is radius of the circles
  var size_pattern=[96,92,88,80,75,70,60,50];
  for (var i=0;i<size_pattern.length;i++){
    size_pattern[i]=Math.round(size_pattern[i]/100*max_size);
  };


  var scale=1-level;

  var sizes=[max_size];
  for (var i=0;i<size_pattern.length;i++){
    sizes.push( Math.floor(Math.max(1,Math.min(1.5*scale*size_pattern[i] ))))
  }
  sizes = jsPsych.randomization.repeat(sizes, 1);

  var min_dist=Math.max(cell);


  draw_circles();
  draw_score(points);
  var start_time=Date.now();
  canvas.addEventListener("click",getPosition);

  function draw_score(points){
    var pointsize=score_section.height*0.62/points_to_pass*0.25;
    var delta_y=score_section.height*0.62/points_to_pass;
    for(var i=0;i<Math.min(points,points_to_pass);i++){
      x=score_section.width*0.33;
      y=score_section.height-(i+1)*delta_y;
      ctx.beginPath(); //Start path
      ctx.fillStyle = "red"; //  color
      ctx.arc(x, y, pointsize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
      ctx.fill(); // Close the path and fill.
      ctx.closePath();
    }
    for(var i=Math.min(points,points_to_pass);i<points_to_pass;i++){
      x=score_section.width*0.33;
      y=score_section.height-(i+1)*delta_y;
      ctx.beginPath(); //Start path
      ctx.fillStyle = "grey"; //  color
      ctx.arc(x, y, pointsize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
      ctx.fill(); // Close the path and fill.
      ctx.closePath();
    }
    return
  }

  function draw_circles(){
    var k=-1;
    for (var i=0; i<n_rows;i++){
      for (var j=0; j<n_cols;j++){
        k+=1;
        var x= cell.width*0.5+i*cell.width+score_section.width;
        var y= cell.height*0.5+j*cell.height;
        var noise_x= 0.4*(cell.width-2*sizes[k]);
        var noise_y=0.4*(cell.height-2*sizes[k]);
        x=x+Math.random()*noise_x-0.5*noise_x;
        y=y+Math.random()*noise_y-0.5*noise_y;
        ctx.beginPath(); //Start path
        ctx.fillStyle = "black"; //  color
        ctx.arc(x, y, sizes[k], 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
        ctx.fill(); // Close the path and fill.
        ctx.closePath();
        if(sizes[k]==max_size){
           target_coord=[x,y];
        }
      }
    }
  };

  function getPosition(event){
       var rect = canvas.getBoundingClientRect();
       x_click = event.clientX - canvas_rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
       y_click = event.clientY - canvas_rect.top; // y == the location of the click in the document - the location (relative to the top) of the canvas in the document
       // This method will handle the coordinates and will draw them in the canvas.
       if( ((x_click-target_coord[0])**2+(y_click-target_coord[1])**2)<= max_size**2) {
         trial_data.won=true;
       }else{
         trial_data.won=false;
       };
       end_trial();
  };



  // store response
  var response = {
    rt: null,
    key: null
  };


  // function to end trial when it is time
  var end_trial = function() {
    // kill any remaining setTimeout handlers
    trial_data.rt=Date.now()-start_time;
    jsPsych.pluginAPI.clearAllTimeouts();
    // kill keyboard listeners
    if (typeof keyboardListener !== 'undefined') {
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
    }
    // clear the display
    display_element.innerHTML = '';

    //disable all socket calls
    //jsPsych.node.socket.off();

    // move on to the next trial
    jsPsych.finishTrial(trial_data);
  };


  // function to handle responses by the subject
  var after_response = function(info) {

    // after a valid response, the stimulus will have the CSS class 'responded'
    // which can be used to provide visual feedback that a response was recorded

    // only record the first response
    if (response.key == null) {
      response = info;
    }

    if (trial.response_ends_trial) {
      end_trial();
    }
  };



  // start the response listener
  if (trial.choices != jsPsych.NO_KEYS) {
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'date',
      persist: false,
      allow_held_key: false
    });
  }



  };

  return plugin;
})();
