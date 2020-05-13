function startGame() {

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height)

    okSpeed();
    
    // Add listeners 
    document.body.onkeydown = captureThrustCommand;
    document.body.onkeyup = captureReleaseThrustCommand;
    navigator.connection.onchange = speedWatch;
    MeasureConnectionSpeed(); // iniital check

    // Adjust view 
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let el = document.getElementById("sc")   
    el.style.left='0px';
    el.style.top='0px';    
    setCmd(0);

}

function exitGame() {
    // remove listeners 
    document.body.onkeydown = null;
    document.body.onkeyup = null;

}

function readCmd() {
    return parseInt(document.body.getAttribute("key"))
}

function setCmd(cmd) {
    document.body.setAttribute("key", cmd);
    // sendCmd(cmd);
}

function captureThrustCommand(e){				
    var key_code=e.which||e.keyCode;
    var command = 0;
    if (37 <= key_code && key_code <= 40) {
        switch(key_code){
            case 37: //left arrow key
                command = 2;
                break;
            case 38: //Up arrow key
                command = 1;
                break;
            case 39: //right arrow key
                command = 4;
                break;
            case 40: //down arrow key
                command = 3;
                break;						
        }
        
        setCmd(command);
    }
}

function captureReleaseThrustCommand(e) {
    var key_code=e.which||e.keyCode;
    if (37 <= key_code && key_code <= 40) {
        setCmd(0);
    }
}

function ellipse(context, cx, cy, rx, ry){
    context.save(); // save state
    context.beginPath();

    context.translate(cx-rx, cy-ry);
    context.scale(rx, ry);
    context.arc(1, 1, 1, 0, 2 * Math.PI, false);

    context.restore(); // restore to original state
    context.lineWidth = 5;
    context.strokeStyle = "white";
    context.setLineDash([1, 15]);
    context.stroke();
};

function update_screen(game_data) {

    var sc_el = document.getElementById("sc");
    var thrusts = Array.from(document.getElementsByClassName("thrusts"));
    var planets = document.getElementsByClassName("planet");
    var cxt = document.getElementById("canvas").getContext("2d");
    game_data = $.parseJSON(game_data);

    // SC
    sc_el.style.left = game_data.sc.pos[0] - game_data.sc.size[0]/2;
    sc_el.style.top = game_data.scene.size[1] - game_data.sc.pos[1] - game_data.sc.size[1]/2;
    sc_el.style.width = game_data.sc.size[0];
    sc_el.style.height = game_data.sc.size[1];

    // SC Img
    thrusts.forEach(element => {
        if(element.id!=game_data.sc.thrust.dir){
            element.style.display="none";
        }
        else{
            element.style.display="block";
            element.style.transform = "rotate(" + String(-1*game_data.sc.rot) + "rad)";
        }
    });

    var sc_img = document.getElementById(game_data.sc.thrust.dir);
    sc_img.style.transform = "rotate(" + String(-1*game_data.sc.rot) + "rad)";

    // Planets
    for (let i=1; i<=game_data.n_planets; i++) {

        var p_game_data = game_data["p" + String(i)];
        var p = planets[i-1];
        p.style.left = p_game_data.pos[0] - p_game_data.radius;
        p.style.top = game_data.scene.size[1] - p_game_data.pos[1] - p_game_data.radius;
        p.style.width = p_game_data.radius * 2;
        p.style.height = p_game_data.radius * 2;
        p.style.transform = "rotate(" + String(d) + "deg)";
        d += 0.1;

        // Orbits
        ellipse(cxt, p_game_data.orbit.center[0], game_data.scene.size[1] -p_game_data.orbit.center[1], p_game_data.orbit.a, p_game_data.orbit.b);        
        // cxt.save(); // save state
        // cxt.fillRect(p_game_data.pos[0], game_data.scene.size[1] -p_game_data.pos[1], 1, 1);
        // cxt.lineWidth = 25;
        // cxt.strokeStyle = "#37ff08";
        // cxt.setLineDash([0,0]);
        // cxt.restore();
        // cxt.stroke();

        // Hide planet if out of screen
        if((0<=  p_game_data.pos[0] - p_game_data.radius) && ( p_game_data.pos[0] - p_game_data.radius <= game_data.scene.size[0]) && (0 <= p_game_data.pos[1] - p_game_data.radius) && (p_game_data.pos[1] - p_game_data.radius <= game_data.scene.size[1])){
            p.style.display = "block";
        }
        else{
            p.style.display = "none";
        }    

    }

    // Win region
    var points = game_data.scene.win_region;
    cxt.beginPath();
    cxt.moveTo(points[0][0], game_data.scene.size[1] - points[0][1]);
    cxt.lineTo(points[1][0], game_data.scene.size[1] - points[1][1]);
    cxt.lineWidth = 25;
    cxt.strokeStyle = "#37ff08";
    cxt.setLineDash([0,0]);
    cxt.stroke();

    // Hud
    document.getElementById("speed").textContent = game_data.sc.speed;
    document.getElementById("gas_level").textContent = game_data.sc.gas_level;
    document.getElementById("speed-req").textContent = game_data.scene.win_vel;
    document.getElementById("attempts").textContent = game_data.scene.attempts;
    if(game_data.message.length > 1){document.getElementById("msg").textContent = game_data.message;}

    // Glow
    var max_dist = (game_data.scene.size[0]**2+game_data.scene.size[1]**2)**0.5;
    var pixel_dist = Math.pow(2.71828,4*(max_dist-game_data.sc.closest_dist_to_planet)/max_dist)-30;
    document.getElementsByClassName("view")[0].style.boxShadow = "0px 0px 57px " +  pixel_dist.toString() + "px rgba(255,166,0,1)";

    // Win
    // if(game_data.won) {
    //     overlayOn("rgba(0,255,0,0.8)", "Congrats!");
    // }
    // if(game_data.fail) {
    //     overlayOn("rgba(255,0,0,0.8)", ":(");
    // }
}