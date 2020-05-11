// Ryan Butler and Sai Manoj Nelavalli
// CSCI 4250
// Due 12-3-19
// This project will display a 3D scene of a room with various objects including
// chairs, a TV, a table, checkerpieces, a fire in a fireplace, a poster,
// lightsabers, and a carpet rug, most with textures
// By pressing a, the fire will flicker off and on
// By pressing b, the scene will reset to its original position
// By pressing c, the chekcers will be placed in their starting position or stack back up
// By pressing l, the lightsabers will turn on and off, with sound effects
// By pressing t, the TV will turn on and off, with sound effects

var program
var canvas;
var gl;

// data
var pointsArray = [];
var normalsArray = [];
var texCoordsArray = [];
var sounds = [];

// ortho
var left = -8;
var right = 8;
var ytop = 8;
var bottom = -8;
var near = -45;
var far = 45;
var zoomFactor = 1;
var translateFactorX = 0;
var translateFactorY = 0;

// eye location
var theta=0;   // up-down angle
var phi=90;     // side-left-right angle
var Radius=1.5;

var stacks
var slices = 25;

var checkerStartPoint;
var numOfCheckerPoints = 0;

var numOfCheckerPieces = 12;

var lightSaberLightStartPoint;
var numOfLightSaberLightPoints = 0;
var lightSaberHandleStartPoint;
var numOfLightSaberHandlePoints = 0;

var carpetStartPoint;
var numOfCarpetPoints = 0;

// key control
var deg=5;
var xrot=0;
var yrot=0;

// light and material
var lightPosition = vec4(-10, -2, 8, 1);

var lightAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.0, 0.0, 0.0, 1.0 );
var materialDiffuse = vec4( 1, 0.5, 0.5, 1.0);
var materialSpecular = vec4( 1, 0.8, 0.5, 1.0 );
var materialShininess = 100.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var mvMatrixStack=[];

var animateTV = 0;
var animateCheckers = 0;
var animateFire = 0;
var animateLightSaber = 1;

var texture1, texture2, texture3, texture4, texture5, texture6, texture7, texture8;

var vertices = [
                // Backrest
                vec4(-0.5,  1,-0.5, 1.0 ),  // A (0)
                vec4( 0.5,  1,-0.5, 1.0 ),  // B (1)
                vec4( 0.5,  0,-0.5, 1.0 ),  // C (2)
                vec4(-0.5,  0,-0.5, 1.0 ),  // D (3)
                vec4(-0.75, 1,  -1, 1.0 ),  // E (4)
                vec4(0.75,  1,  -1, 1.0 ),  // F (5)
                vec4(0.75,  0,  -1, 1.0 ),  // G (6)
                vec4(-0.75, 0,  -1, 1.0 ),  // H (7)
                // Right chair arm
                vec4( -0.75,0.25,   1, 1.0 ),  // A (8)
                vec4( -0.5, 0.25,   1, 1.0 ),  // B (9)
                vec4( -0.5,    0,   1, 1.0 ),  // C (10)
                vec4(-0.75,    0,   1, 1.0 ),  // D (11)
                vec4(-0.75, 0.25,  -1, 1.0 ),  // E (12)
                vec4( -0.5, 0.25,-0.5, 1.0 ),  // F (13)
                vec4( -0.5,    0, 0.5, 1.0 ),  // G (14)
                vec4(-0.75,    0,  -1, 1.0 ),  // H (15)
                // Left chair arm
                vec4( 0.5, 0.25,   1, 1.0 ),  // A (16)
                vec4(0.75, 0.25,   1, 1.0 ),  // B (17)
                vec4(0.75,    0,   1, 1.0 ),  // C (18)
                vec4( 0.5,    0,   1, 1.0 ),  // D (19)
                vec4( 0.5, 0.25,-0.5, 1.0 ),  // E (20)
                vec4(0.75, 0.25,  -1, 1.0 ),  // F (21)
                vec4(0.75,    0,  -1, 1.0 ),  // G (22)
                vec4( 0.5,    0,-0.5, 1.0 ),  // H (23)
                // Seat
                vec4(-0.75,   0,   1, 1.0 ),  // A (24)
                vec4(0.75,    0,   1, 1.0 ),  // B (25)
                vec4(0.75,   -1,   1, 1.0 ),  // C (26)
                vec4(-0.75,  -1,   1, 1.0 ),  // D (27)
                vec4(-0.75,   0,  -1, 1.0 ),  // E (28)
                vec4(0.75,    0,  -1, 1.0 ),  // F (29)
                vec4(0.75,   -1,  -1, 1.0 ),  // G (30)
                vec4(-0.75,  -1,  -1, 1.0 ),  // H (31)
                
                // TV
                vec4(-2,  2,   1, 1.0 ),  // A (32)
                vec4( 2,  2,   1, 1.0 ),  // B (33)
                vec4( 2,  0,   1, 1.0 ),  // C (34)
                vec4(-2,  0,   1, 1.0 ),  // D (35)
                vec4(-2,  2, 0.9, 1.0 ),  // E (36)
                vec4( 2,  2, 0.9, 1.0 ),  // F (37)
                vec4( 2,  0, 0.9, 1.0 ),  // G (38)
                vec4(-2,  0, 0.9, 1.0 ),  // H (39)
                
                // Fireplace - extrudent shape
                // Base vertices
                vec4( -1.5, -0.5, -0.25, 1.0 ),  // A (40)
                vec4(-0.75, -0.5, -0.25, 1.0 ),  // B (41)
                vec4(-0.75, 0.15, -0.25, 1.0 ),  // C (42)
                vec4( 0.75, 0.15, -0.25, 1.0 ),  // D (43)
                vec4( 0.75, -0.5, -0.25, 1.0 ),  // E (44)
                vec4(  1.5, -0.5, -0.25, 1.0 ),  // F (45)
                // use for extruded shapes
                vec4(  1.5, 0.15, -0.25, 1.0 ),  // F (46)
                vec4(  1.5, 0.55, -0.25, 1.0 ),  // G (47)
                vec4( -1.5, 0.55, -0.25, 1.0 ),  // H (48)
                // use for extruded shapes
                vec4( -1.5, 0.15, -0.25, 1.0 ),  // F (49)
                
                // Top vertices
                vec4( -1.5, -0.5, 0.25, 1.0 ),  // A (50)
                vec4(-0.75, -0.5, 0.25, 1.0 ),  // B (51)
                vec4(-0.75, 0.15, 0.25, 1.0 ),  // C (52)
                vec4( 0.75, 0.15, 0.25, 1.0 ),  // D (53)
                vec4( 0.75, -0.5, 0.25, 1.0 ),  // E (54)
                vec4(  1.5, -0.5, 0.25, 1.0 ),  // F (55)
                vec4(  1.5, 0.15, 0.25, 1.0 ),  // F (56)
                vec4(  1.5, 0.55, 0.25, 1.0 ),  // G (57)
                vec4( -1.5, 0.55, 0.25, 1.0 ),  // H (58)
                vec4( -1.5, 0.15, 0.25, 1.0 ),  // F (59)
                
                // Walls
                vec4(-0.5, -0.5,  0.5, 1.0 ),  // A (60)
                vec4(-0.5,  0.5,  0.5, 1.0 ),  // A (61)
                vec4( 0.5,  0.5,  0.5, 1.0 ),  // A (62)
                vec4( 0.5, -0.5,  0.5, 1.0 ),  // A (63)
                vec4(-0.5, -0.5, -0.5, 1.0 ),  // A (64)
                vec4(-0.5,  0.5, -0.5, 1.0 ),  // A (65)
                vec4( 0.5,  0.5, -0.5, 1.0 ),  // A (66)
                vec4( 0.5, -0.5, -0.5, 1.0 ),  // A (67)
                
                // Fire
                vec4(-1, -1, -0.5, 1.0 ),  // A (68)
                vec4( 0,  1, -0.5, 1.0 ),  // B (69)
                vec4( 1, -1, -0.5, 1.0 ),  // C (70)
                vec4(-1, -1,  0.5, 1.0 ),  // D (71)
                vec4( 0,  1,  0.5, 1.0 ),  // E (72)
                vec4( 1, -1,  0.5, 1.0 ),  // F (73)
                
                ];

//array holding all the checker profile points
/*
 C--D
 |  |
 A--------B  |
 |
 F-----------E  */
var checkerPoints = [
                     vec4( 0.0 , 0.1 , 0.0, 1.0 ),  //A (0)
                     vec4( 0.3 , 0.1 , 0.0, 1.0 ),  //B (1)
                     vec4( 0.3 , 0.12, 0.0, 1.0 ),  //C (2)
                     vec4( 0.33, 0.12, 0.0, 1.0 ),  //D (3)
                     vec4( 0.33, 0.0 , 0.0, 1.0 ),  //E (4)
                     vec4( 0.0 , 0.0 , 0.0, 1.0 ),  //F (5)
                     ];

var lightSaberLightPoints = [
                             vec4(0.0, 5.0, 0.0, 1.0),
                             // round end
                             vec4(0.05, 4.955, 0.0, 1.0),
                             vec4(0.1, 4.95, 0.0, 1.0),
                             vec4(0.15, 4.9, 0.0, 1.0),
                             vec4(0.2, 4.855, 0.0, 1.0),
                             vec4(0.25, 4.85, 0.0, 1.0),
                             // end of round end
                             vec4(0.25, 0.25, 0.0, 1.0),
                             vec4(0.0, 0.0, 0.0, 1.0),
                             ];

var lightSaberHandlePoints = [
                              vec4(0.0, 0.0, 0.0, 1.0),
                              vec4(0.25, 0.25, 0.0, 1.0),
                              vec4(0.35, 0.25, 0.0, 1.0),
                              vec4(0.35, 0.0, 0.0, 1.0),
                              vec4(0.3, 0.0, 0.0, 1.0),
                              vec4(0.3, -1.0, 0.0, 1.0),
                              vec4(0.35, -1.0, 0.0, 1.0),
                              vec4(0.35, -1.25, 0.0, 1.0),
                              vec4(0.0, -1.25, 0.0, 1.0),
                              ];

var carpetPoints = [
                    vec4(0.0, 0.1, 0.0, 1.0),
                    vec4(3.0, 0.1, 0.0, 1.0),
                    vec4(3.0, 0.0, 0.0, 1.0),
                    vec4(0.0, 0.0, 0.0, 1.0),
                    ];

var texCoord = [
                vec2(0, 0),
                vec2(0, 1),
                vec2(1, 1),
                vec2(1, 0)
                ];

function main()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // generate the points/normals
    GeneratePrimitives();
    vertices=[];
    GenerateCheckerPieces();
    GenerateLightSaber();
    GenerateCarpet();
    
    SendData();
    InitializeTextures();
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    SetupLightingMaterial();
    
    SetupUserInterface();
    
    sounds.push(new Audio("Lightsaber-On.mp3"));
    sounds.push(new Audio("Lightsaber-Off.mp3"));
    sounds.push(new Audio("vader.mp3"));
    
    // keyboard handle
    window.onkeydown = HandleKeyboard;
    
    render();
}

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

function SendData()
{
    // pass data onto GPU
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // texture buffer
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vTexCoord );
    
}

function InitializeTextures()
{
    texture1 = gl.createTexture();
    texture1.image = new Image();
    gl.activeTexture(gl.TEXTURE0);
    texture1.image.src='stone.jpg';
    texture1.image.onload = function() { loadTexture(texture1, gl.TEXTURE0); }
    
    texture2 = gl.createTexture();
    texture2.image = new Image();
    gl.activeTexture(gl.TEXTURE1);
    texture2.image.src='checker-board.png';
    texture2.image.onload = function() { loadTexture(texture2, gl.TEXTURE1); }
    
    texture3 = gl.createTexture();
    texture3.image = new Image();
    gl.activeTexture(gl.TEXTURE2);
    texture3.image.src='death-star.jpg';
    texture3.image.onload = function() { loadTexture(texture3, gl.TEXTURE2); }
    
    texture4 = gl.createTexture();
    texture4.image = new Image();
    gl.activeTexture(gl.TEXTURE3);
    texture4.image.src='hardwood.jpg';
    texture4.image.onload = function() { loadTexture(texture4, gl.TEXTURE3); }
    
    texture5 = gl.createTexture();
    texture5.image = new Image();
    gl.activeTexture(gl.TEXTURE4);
    texture5.image.src='wallpaper.jpg';
    texture5.image.onload = function() { loadTexture(texture5, gl.TEXTURE4); }
    
    texture6 = gl.createTexture();
    texture6.image = new Image();
    gl.activeTexture(gl.TEXTURE5);
    texture6.image.src='TV-On.jpeg';
    texture6.image.onload = function() { loadTexture(texture6, gl.TEXTURE5); }
    
    texture7 = gl.createTexture();
    texture7.image = new Image();
    gl.activeTexture(gl.TEXTURE6);
    texture7.image.src='carpet.jpg';
    texture7.image.onload = function() { loadTexture(texture7, gl.TEXTURE6); }
    
    texture8 = gl.createTexture();
    texture8.image = new Image();
    gl.activeTexture(gl.TEXTURE7);
    texture8.image.src='fire.jpg';
    texture8.image.onload = function() { loadTexture(texture8, gl.TEXTURE7); }
}

function loadTexture(texture, whichTexture)
{
    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    // Enable texture unit 1
    gl.activeTexture(whichTexture);
    
    // bind the texture object to the target
    gl.bindTexture( gl.TEXTURE_2D, texture);
    
    // set the texture image
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image );
    
    // v1 (combination needed for images that are not powers of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // v2
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    
    // set the texture parameters
    //gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}

function SetupLightingMaterial()
{
    // set up lighting and material
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    // send lighting and material coefficient products to GPU
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialShininess );
}

function SetupUserInterface()
{
    // support user interface
    document.getElementById("phiPlus").onclick=function(){phi += deg;};
    document.getElementById("phiMinus").onclick=function(){phi-= deg;};
    document.getElementById("thetaPlus").onclick=function(){theta+= deg;};
    document.getElementById("thetaMinus").onclick=function(){theta-= deg;};
    document.getElementById("zoomIn").onclick=function(){zoomFactor *= 0.95;};
    document.getElementById("zoomOut").onclick=function(){zoomFactor *= 1.05;};
    document.getElementById("left").onclick=function(){translateFactorX -= 0.2;};
    document.getElementById("right").onclick=function(){translateFactorX += 0.2;};
    document.getElementById("up").onclick=function(){translateFactorY += 0.2;};
    document.getElementById("down").onclick=function(){translateFactorY -= 0.2;};
}

function HandleKeyboard(event)
{
    switch (event.keyCode)
    {
        // left arrow key
        case 37:
            yrot += deg;
            break;
        // right arrow key
        case 39:
            yrot -= deg;
            break;
        // up arrow key
        case 38:
            xrot += deg;
            break;
        // down arrow key
        case 40:
            xrot -= deg;
            break;
        // Animate
        // 'a' key
        case 65:
            if (animateFire == 1)
            {
                animateFire = 0;
                materialAmbient = vec4( 1.0, 0.5, 0.5, 0.0 );

            }
            else
            {
                animateFire = 1;
                materialAmbient = vec4( 0.0, 0.0, 0.0, 1.0 );

            }
            break;
        // Reset scene
        // 'b' key
        case 66:
            animateTV=0;
            animateCheckers=0;
            animateFire=0;
            animateLightSaber=1;
            zoomFactor=1;
            translateFactorX=0;
            translateFactorY=0;
            theta=0;
            phi=90;
            yrot=0;
            xrot=0;
            break;
        // Checkers
        // 'c' key
        case 67:
            if (animateCheckers == 1)
            {
                animateCheckers = 0;
            }
            else
            {
                animateCheckers = 1;
            }
            break;
        // Lightsabers
        // 'l' key
        case 76:
            if (animateLightSaber == 1)
            {
                animateLightSaber = 0;
                // lightsaber turn off
                sounds[0].play();
            }
            else
            {
                animateLightSaber = 1;
                // lightsaber turn on
                sounds[1].play();
            }
            break;
        // TV on and off
        // 't' key
        case 84:
            if (animateTV == 0)
            {
                animateTV = 1;
                sounds[2].play();
            }
            else
                animateTV = 0;
            break;
    }
}

// quad uses first index to set color for face
function quad(a, b, c, d)
{
    var indices = [a, b, c, d];
    var normal = Newell(indices);
    //console.log(normal);
    
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);
    
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[1]);
    
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);
    
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);
    
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);
    
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[3]);
    
}

function tri(a, b, c)
{
    var indices=[a, b, c];
    var normal = Newell(indices);
    
    // triangle abc
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[1]);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);
}

function Newell(indices)
{
    var L=indices.length;
    var x=0, y=0, z=0;
    var index, nextIndex;
    
    for (var i=0; i<L; i++)
    {
        index=indices[i];
        nextIndex = indices[(i+1)%L];
        
        // nx = summation of (yi-yni)(zi+zni)
        x +=    (vertices[index][1] - vertices[nextIndex][1])*
        (vertices[index][2] + vertices[nextIndex][2]);
        // ny = summation of (zi-zni)(xi+xni)
        y +=    (vertices[index][2] - vertices[nextIndex][2])*
        (vertices[index][0] + vertices[nextIndex][0]);
        // nz = summation of (xi-xni)(yi+yni)
        z +=    (vertices[index][0] - vertices[nextIndex][0])*
        (vertices[index][1] + vertices[nextIndex][1]);
    }
    return (normalize(vec3(x, y, z)));
}

function GeneratePrimitives()
{
    // Backrest
    quad(0, 3, 2, 1);
    quad(4, 7, 6, 5);
    quad(1, 2, 6, 5);
    quad(4, 7, 3, 0);
    quad(4, 0, 1, 5);
    quad(7, 3, 2, 6);
    // Right arm chair
    quad(8, 11, 10, 9);
    quad(12, 15, 14, 13);
    quad(9, 10, 14, 13);
    quad(12, 15, 11, 8);
    quad(12, 8, 9, 13);
    quad(15, 11, 10, 14);
    // Left arm chair
    quad(16, 19, 18, 17);
    quad(20, 23, 22, 21);
    quad(17, 18, 22, 21);
    quad(20, 23, 19, 16);
    quad(20, 16, 17, 21);
    quad(23, 19, 18, 22);
    // Seat
    quad(24, 27, 26, 25);
    quad(28, 31, 30, 29);
    quad(25, 26, 30, 29);
    quad(28, 31, 27, 24);
    quad(28, 24, 25, 29);
    quad(31, 27, 26, 30);
    
    // TV
    quad(32, 35, 34, 33);
    quad(36, 39, 38, 37);
    quad(32, 34, 38, 37);
    quad(36, 39, 35, 32);
    quad(36, 32, 33, 37);
    quad(39, 35, 32, 38);
    
    // Fireplace
    // left side
    quad(49, 40, 41, 42);
    quad(52, 51, 50, 59);
    quad(59, 50, 40, 49);
    quad(42, 41, 51, 52);
    quad(59, 49, 42, 52);
    quad(50, 51, 41, 40);
    // right side
    quad(43, 44, 45, 46);
    quad(56, 55, 54, 53);
    quad(53, 54, 44, 43);
    quad(46, 45, 55, 56);
    quad(53, 43, 46, 56);
    quad(54, 55, 45, 44);
    // top
    quad(48, 49, 46, 47);
    quad(58, 57, 56, 59);
    quad(58, 59, 49, 48);
    quad(47, 46, 56, 57);
    quad(58, 48, 47, 57);
    quad(59, 56, 46, 49);
    
    // Walls
    quad(60, 63, 62, 61);
    quad(64, 67, 66, 65);
    quad(61, 62, 66, 65);
    quad(64, 67, 63, 60);
    quad(64, 60, 61, 65);
    quad(67, 63, 62, 66);
    
    // Fire
    tri(68, 70, 69);
    tri(71, 73, 72);
    // makes a better looking fire shape
    tri(71, 68, 72);
    tri(70, 73, 69);
    //quad(73, 70, 69, 72)
    //quad(68, 71, 72, 69)
    quad(68, 71, 73, 70);
    
    // Table
    quad(60, 63, 62, 61);
    quad(64, 67, 66, 65);
    quad(61, 62, 66, 65);
    quad(64, 67, 63, 60);
    quad(64, 60, 61, 65);
    quad(67, 63, 62, 66);
    
}

/**************
 Checker pieces
 ***************/
//Generate the points of the checker piece by taking a profile of a checker piece and then creating multiple slices
//and forming a face using 4 adjacent points
/*
 C--D
 |  |
 A--------B  |
 |
 F-----------E                    */
function GenerateCheckerPieces()
{
    indices = [];
    // checkerPoints.length = 6
    // number of points in each slice of a checker piece
    var pointsPerSlice = checkerPoints.length;
    
    // setup initial points for the profile
    for(var i = 0; i < pointsPerSlice; i++)
    {
        vertices.push(checkerPoints[i]);
    }
    
    // variable used for the radius of the circle formed by the point rotating about the origin
    var radius;
    //angle between each slice
    var theata = 2 * Math.PI / slices;
    
    // points for the other slices
    for(var i = 0; i < slices; i++)
    {
        angle = (i + 1) * theata;
        for(var j = 0; j < pointsPerSlice; j++)
        {
            radius = vertices[j][0];
            vertices.push(vec4(radius * Math.cos(angle), vertices[j][1], -radius * Math.sin(angle), 1));
        }
    }
    
    // 6 profilePoints + 6 poinstPerSlice * 25 slices = 156 points
    
    // generate quads for checker piece
    checkerStartPoint = pointsArray.length;
    for(var i = 0; i < slices; i++)
    {
        for(var j = 0; j < pointsPerSlice - 1; j++)
        {
            quad(i * pointsPerSlice + j, i * pointsPerSlice + j + 1, (i + 1) * pointsPerSlice + j + 1, (i + 1) * pointsPerSlice + j);
            numOfCheckerPoints += 6;
        }
    }
}

function GenerateLightSaber()
{
    GenerateLightSaberLight();
    GenerateLightSaberHandle();
}

function GenerateLightSaberLight()
{
    vertices = [];
    var pointsPerSlice = lightSaberLightPoints.length;
    
    for(var i = 0; i < pointsPerSlice; i++)
    {
        vertices.push(lightSaberLightPoints[i]);
    }
    
    // variable used for the radius of the circle formed by the point rotating about the origin
    var radius;
    //angle between each slice
    var theata = 2 * Math.PI / slices;
    var vertex;
    
    // points for the other slices
    for(var i = 0; i < slices; i++)
    {
        angle = (i + 1) * theata;
        for(var j = 0; j < pointsPerSlice; j++)
        {
            radius = vertices[j][0];
            vertex = vec4(radius * Math.cos(angle), vertices[j][1], -radius * Math.sin(angle), 1)
            vertices.push(vertex);
        }
    }
    
    // generate quads for light saber light
    lightSaberLightStartPoint = pointsArray.length;
    for(var i = 0; i < slices; i++)
    {
        for(var j = 0; j < pointsPerSlice - 1; j++)
        {
            quad(i * pointsPerSlice + j, i * pointsPerSlice + j + 1, (i + 1) * pointsPerSlice + j + 1, (i + 1) * pointsPerSlice + j);
            numOfLightSaberLightPoints += 6;
        }
    }
}

function GenerateLightSaberHandle()
{
    vertices = [];
    var pointsPerSlice = lightSaberHandlePoints.length;
    
    for(var i = 0; i < pointsPerSlice; i++)
    {
        vertices.push(lightSaberHandlePoints[i]);
    }
    
    // variable used for the radius of the circle formed by the point rotating about the origin
    var radius;
    //angle between each slice
    var theata = 2 * Math.PI / slices;
    
    // points for the other slices
    for(var i = 0; i < slices; i++)
    {
        angle = (i + 1) * theata;
        for(var j = 0; j < pointsPerSlice; j++)
        {
            radius = vertices[j][0];
            vertices.push(vec4(radius * Math.cos(angle), vertices[j][1], -radius * Math.sin(angle), 1));
        }
    }
    
    // generate quads for light saber light
    lightSaberHandleStartPoint = pointsArray.length;
    for(var i = 0; i < slices; i++)
    {
        for(var j = 0; j < pointsPerSlice - 1; j++)
        {
            quad(i * pointsPerSlice + j, i * pointsPerSlice + j + 1, (i + 1) * pointsPerSlice + j + 1, (i + 1) * pointsPerSlice + j);
            numOfLightSaberHandlePoints += 6;
        }
    }
}

function GenerateCarpet()
{
    vertices = [];
    var pointsPerSlice = carpetPoints.length;
    
    for(var i = 0; i < pointsPerSlice; i++)
    {
        vertices.push(carpetPoints[i]);
    }
    
    // variable used for the radius of the circle formed by the point rotating about the origin
    var radius;
    //angle between each slice
    var theata = 2 * Math.PI / slices;
    
    // points for the other slices
    for(var i = 0; i < slices; i++)
    {
        angle = (i + 1) * theata;
        for(var j = 0; j < pointsPerSlice; j++)
        {
            radius = vertices[j][0];
            vertices.push(vec4(radius * Math.cos(angle), vertices[j][1], -radius * Math.sin(angle), 1));
        }
    }
    
    // generate quads for light saber light
    carpetStartPoint = pointsArray.length;
    for(var i = 0; i < slices; i++)
    {
        for(var j = 0; j < pointsPerSlice - 1; j++)
        {
            quad(i * pointsPerSlice + j, i * pointsPerSlice + j + 1, (i + 1) * pointsPerSlice + j + 1, (i + 1) * pointsPerSlice + j);
            numOfCarpetPoints += 6;
        }
    }
}

var at = vec3(0, -1, 0);
var up = vec3(0, 1, 0);

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var eyex=Radius*Math.cos(theta*Math.PI/180.0)*Math.cos(phi*Math.PI/180.0);
    var eyey= Radius*Math.sin(theta*Math.PI/180.0);
    var eyez=Radius*Math.cos(theta*Math.PI/180.0)*Math.sin(phi*Math.PI/180.0);
    
    eye=vec3(eyex, eyey, eyez);
    
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left*zoomFactor-translateFactorX,
                             right*zoomFactor-translateFactorX,
                             bottom*zoomFactor-translateFactorY,
                             ytop*zoomFactor-translateFactorY, near, far);
    
    var r1 = rotate(xrot, 1, 0, 0);
    var r2 = rotate(yrot, 0, 1, 0);
    modelViewMatrix = mult(mult(modelViewMatrix, r1), r2);
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    // Stop using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 1);
    
    DrawChair();
    
    if (animateTV == 1)
    {
        // Start using texture
        gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 2);
        // Start using gl.TEXTURE0
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 5);
        DrawTV();
        // Stop using texture
        gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 1);
    }
    else
        DrawTV();
    
    // Start using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 2);
    // Start using gl.TEXTURE0
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    DrawFireplace();
    // Stop using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 1);
    
    // Start using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 2);
    // Start using gl.TEXTURE0
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 3);
    DrawFloor(0.2);
    // Stop using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 1);
    
    // Start using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 2);
    // Start using gl.TEXTURE0
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 4);
    // wall #2: in yz-plane
    mvMatrixStack.push(modelViewMatrix);
    t=translate(11, 0, 2);
    modelViewMatrix=mult(modelViewMatrix, t);
    
    r=rotate(-90.0, 0.0, 0.0, 1.0);
    modelViewMatrix=mult(modelViewMatrix, r);
    r=rotate(-90.0, 0.0, 1.0, 0.0);
    modelViewMatrix=mult(modelViewMatrix, r);
     
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    DrawWall(0.02);
    modelViewMatrix=mvMatrixStack.pop();
    
    // wall #3: in xy-plane
    mvMatrixStack.push(modelViewMatrix);
    t=translate(0, 0, -11);
    modelViewMatrix=mult(modelViewMatrix, t);
    
    r=rotate(-90, 1.0, 0.0, 0.0);
    modelViewMatrix=mult(modelViewMatrix, r);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    DrawWall(0.02);
    modelViewMatrix=mvMatrixStack.pop();
    // Stop using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 1);
    
    if (animateFire == 0)
    {
        // Start using texture
        gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 2);
        // Start using gl.TEXTURE0
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 7);
        DrawFire();
        // Stop using texture
        gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 1);
    }
    
    DrawTable();
    
    DrawRedCheckerPieces();
    DrawBlueCheckerPieces();
    
    DrawPoster();
    
    modelViewMatrix=mvMatrixStack.pop();
    
    // Start using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 2);
    // Start using gl.TEXTURE0
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 6);
    DrawCarpet();
    // Stop using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 1);
    
    DrawLightSabers();
    
    requestAnimFrame(render);
}

function DrawChair()
{
    if (animateFire == 0)
    {
        materialAmbient = vec4( 0.15, 0.15, 0.15, 1.0 );
        materialDiffuse = vec4( 0.2, 0.2, 0.2, 1.0);
        materialSpecular = vec4( 1, 1, 1, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0.05, 0.05, 0.05, 1.0 );
        materialDiffuse = vec4( 0.1, 0.1, 0.1, 1.0);
        materialSpecular = vec4( .1, .1, .1, 1.0 );
    }
    
    materialShiness=100;
    SetupLightingMaterial();
    
    mvMatrixStack.push(modelViewMatrix);
    
    var t, r;
    t = translate(-1, -2.9, -1);
    modelViewMatrix = mult(modelViewMatrix, t);
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, 144);
    
    r = rotate(180, 0, 1, 0);
    t = translate(0, 0, 5.5);
    modelViewMatrix = mult(modelViewMatrix, mult(t, r));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, 144);
    
    modelViewMatrix = mvMatrixStack.pop();
}

function DrawTV()
{
    if (animateFire == 0 || animateLightSaber == 0)
    {
        materialAmbient = vec4( 0.1, 0.1, 0.1, 1.0 );
        materialDiffuse = vec4( 0.1, 0.1, 0.1, 1.0);
        materialSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0, 0, 0, 1.0 );
        materialDiffuse = vec4( 0, 0, 0, 1.0);
        materialSpecular = vec4( 0.1, 0.1, 0.1, 1.0 );
    }
    
    materialShiness=80;
    SetupLightingMaterial();
    
    mvMatrixStack.push(modelViewMatrix);
    
    var t, r, s;
    
    t = translate(4.5, -2, -1.5);
    r = rotate(90, 0, 1, 0);
    s = scale4(1.6, 1.5, 1);
    
    modelViewMatrix = mult(modelViewMatrix, rotate(180, 1, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, mult(t, r));
    modelViewMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 144, 36);
    
    modelViewMatrix = mvMatrixStack.pop();
}

function DrawFireplace()
{
    /*
    // Can't use lighting with textures
    if (animateFire == 0)
    {
        materialAmbient = vec4( 0.25, 0.25, 0.25, 1.0 );
        materialDiffuse = vec4( 0.25, 0.25, 0.25, 1.0);
        materialSpecular = vec4( 1, 1, 1, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0.15, 0.15, 0.15, 1.0 );
        materialDiffuse = vec4( 0.15, 0.15, 0.15, 1.0);
        materialSpecular = vec4( 0.1, 0.1, 0.1, 1.0 );
    }
    
    materialShiness=50;
    SetupLightingMaterial();
    */
    mvMatrixStack.push(modelViewMatrix);
    
    var t, r, s;
    
    t = translate(5, -2.8, 1.5);
    r = rotate(-90, 0, 1, 0);
    s = scale4(1.5, 2.25, 2);
    
    modelViewMatrix = mult(modelViewMatrix, mult(t, r));
    modelViewMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 180, 108);
    
    modelViewMatrix = mvMatrixStack.pop();
}

function DrawFloor(thickness)
{
    /*
    if (animateFire == 0)
    {
        materialAmbient = vec4( 0.45, 0.25, 0.05, 1.0 );
        materialDiffuse = vec4( 0.45, 0.25, 0.05, 1.0);
        materialSpecular = vec4( 1, 1, 1, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0.35, 0.12, 0, 1.0 );
        materialDiffuse = vec4( 0.35, 0.12, 0, 1.0);
        materialSpecular = vec4( 0.1, 0.1, 0.1, 1.0 );
    }
    
    materialShiness=100;
    SetupLightingMaterial();
    */
    var s, t, r;
    
    // draw thin wall with top = xz-plane, corner at origin
    mvMatrixStack.push(modelViewMatrix);
    
    t=translate(-1, -4, 1);
    s=scale4(13.0, thickness, 13.0);
    modelViewMatrix=mult(mult(modelViewMatrix, t), s);
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    DrawSolidCube(1);
    
    modelViewMatrix=mvMatrixStack.pop();
}

function DrawWall(thickness)
{
    /*
    if (animateFire == 0)
    {
        materialAmbient = vec4( 0.2, 0.8, 0.65, 1.0 );
        materialDiffuse = vec4( 0.2, 0.8, 0.65, 1.0);
        materialSpecular = vec4( 1, 1, 1, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0, 0.6, 0.45, 1.0 );
        materialDiffuse = vec4( 0, 0.6, 0.45, 1.0);
        materialSpecular = vec4( 0.1, 0.1, 0.1, 1.0 );
    }
    
    materialShiness=100;
    SetupLightingMaterial();
    */
    var s, t, r;
    
    // draw thin wall with top = xz-plane, corner at origin
    mvMatrixStack.push(modelViewMatrix);
    
    t=translate(-1, -5.5, 1);
    s=scale4(13.0, thickness, 10.0);
    modelViewMatrix=mult(mult(modelViewMatrix, t), s);
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    DrawSolidCube(1);
    
    modelViewMatrix=mvMatrixStack.pop();
}

function DrawSolidCube(length)
{
    mvMatrixStack.push(modelViewMatrix);
    s=scale4(length, length, length );      // scale to the given radius
    modelViewMatrix = mult(modelViewMatrix, s);
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 288, 36);
    
    modelViewMatrix=mvMatrixStack.pop();
}

function DrawFire()
{
    materialAmbient = vec4( 1, 1, 0.15, 1.0 );
    materialDiffuse = vec4( 1, 1, 1, 1.0);
    materialSpecular = vec4( 1, 1, 1, 1.0 );
    materialShiness=100;
    SetupLightingMaterial();
    
    mvMatrixStack.push(modelViewMatrix);

    var t, r, s;
    t = translate(5, -3.3, 1.5);
    r = rotate(0, 0, 1, 0);
    s = scale4(0.45, 0.5, 1.2);
    
    modelViewMatrix = mult(modelViewMatrix, mult(r, t));
    modelViewMatrix = mult(modelViewMatrix, s);
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 324, 18);
    
    modelViewMatrix=mvMatrixStack.pop();
}

function DrawPoster()
{
    if (animateFire == 0)
    {
        materialAmbient = vec4( 0.1, 0.1, 0.1, 1.0 );
        materialDiffuse = vec4( 0.1, 0.1, 0.1, 1.0);
        materialSpecular = vec4( 0.2, 0.2, 0.2, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0, 0, 0, 1.0 );
        materialDiffuse = vec4( 0, 0, 0, 1.0);
        materialSpecular = vec4( 0, 0, 0, 1.0 );
    }
    
    materialShiness=80;
    SetupLightingMaterial();
    
    mvMatrixStack.push(modelViewMatrix);
    
    
    t=translate(-1, 3, -4.5);
    modelViewMatrix=mult(modelViewMatrix, t);
    
    modelViewMatrix = mult(modelViewMatrix, rotate(180, 1, 0, 0));

    
    s=scale4(1.2, 2.3, 1);
    modelViewMatrix=mult(modelViewMatrix, s);
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    
    gl.drawArrays( gl.TRIANGLES, 144, 6);
    // Start using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 2);
    // Start using gl.TEXTURE0
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 2);
    gl.drawArrays( gl.TRIANGLES, 150, 6);
    // Stop using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 1);
    gl.drawArrays( gl.TRIANGLES, 156, 24);
}

function DrawTable()
{
    if (animateFire == 0)
    {
        materialAmbient = vec4( 0.6, 0.6, 0.6, 1.0 );
        materialDiffuse = vec4( 0.6, 0.6, 0.6, 1.0 );
        materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0.3, 0.3, 0.3, 1.0 );
        materialDiffuse = vec4( 0.3, 0.3, 0.3, 1.0);
        materialSpecular = vec4( 0.1, 0.1, 0.1, 1.0 );
    }
    
    materialShininess = 50.0;
    SetupLightingMaterial();
    
    // store the matrix in modelViewMatrix in the stack
    mvMatrixStack.push(modelViewMatrix);
    
    // tabletop
    modelViewMatrix = mult(modelViewMatrix, scale4(2, 0.5, 2));
    t=translate(-0.5, -4.5, 1);
    modelViewMatrix = mult(modelViewMatrix, t);
    // draw the table top
    drawTableTop();
    
    modelViewMatrix = mvMatrixStack.pop();
    
    mvMatrixStack.push(modelViewMatrix);
    // table legs
    // first leg
    modelViewMatrix = mult(modelViewMatrix, translate(-0.25, -3, 2.75));
    modelViewMatrix = mult(modelViewMatrix, rotate(-90, 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, scale4(1.8, 0.25, 0.25));
    // draw first leg
    drawTablePart();
    
    // second leg
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, -6.0));
    // draw second leg
    drawTablePart();
    
    // third leg
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, -6.0, 0.0));
    // draw third leg
    drawTablePart();
    
    // fourth leg
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 6.0));
    // draw fourth leg
    drawTablePart();
    
    modelViewMatrix = mvMatrixStack.pop();
}

//draw top of the table with texture
function drawTableTop()
{
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 288, 12 );
    // Start using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 2);
    // Start using gl.TEXTURE0
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 1);
    gl.drawArrays( gl.TRIANGLES, 300, 6 );
    // Stop using texture
    gl.uniform1i(gl.getUniformLocation(program, "textureFlag"), 1);
    gl.drawArrays( gl.TRIANGLES, 306, 18 );
}

//draw each part of a table
function drawTablePart()
{
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 288, 36 );
}

/******************
 Red checker pieces
 *******************/
function DrawRedCheckerPieces()
{
    if (animateFire == 0)
    {
        materialAmbient = vec4( 1.0, 0.0, 0.0, 1.0 );
        materialDiffuse = vec4( 1.0, 0.0, 0.0, 1.0);
        materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0.7, 0.0, 0.0, 1.0 );
        materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
        materialSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
    }
    
    materialShininess = 50.0;
    SetupLightingMaterial();
    
    if(animateCheckers == 0)
    {
        mvMatrixStack.push(modelViewMatrix);
        
        modelViewMatrix = mult(modelViewMatrix, translate(-0.75, -2, 2.5));
        modelViewMatrix = mult(modelViewMatrix, scale4(0.3, 0.3, 0.3));
        
        // draw the required number of checker pieces
        for(var i = 0; i < numOfCheckerPieces; i++)
        {
            mvMatrixStack.push(modelViewMatrix);
            modelViewMatrix = mult(modelViewMatrix, translate(0, i * 0.14, 0));
            DrawRedCheckerPiece();
            modelViewMatrix = mvMatrixStack.pop();
        }
        
        modelViewMatrix = mvMatrixStack.pop();
    }
    else
    {
        mvMatrixStack.push(modelViewMatrix);
        
        modelViewMatrix = mult(modelViewMatrix, translate(-1.85, -2, 2.85));
        modelViewMatrix = mult(modelViewMatrix, scale4(0.3, 0.3, 0.3));
        
        for(var i = 0; i < 3; i++)
        {
            for(var j = 0; j < 4; j++)
            {
                mvMatrixStack.push(modelViewMatrix);
                //modelViewMatrix = mult(modelViewMatrix, translate(-1.8 + (i % 2) * 0.2 + j * 0.4, -2, 2.8 - i * 0.2));
                modelViewMatrix = mult(modelViewMatrix, translate(j * 1.6, 0, 0));
                DrawRedCheckerPiece();
                
                modelViewMatrix = mvMatrixStack.pop();
            }
            modelViewMatrix = mult(modelViewMatrix, translate(0, 0, -0.8));
            if(i % 2 == 0)
            {
                modelViewMatrix = mult(modelViewMatrix, translate(0.8, 0, 0));
            }
            else if(i > 0)
            {
                modelViewMatrix = mult(modelViewMatrix, translate(-0.8, 0, 0));
            }
            //modelViewMatrix = mult(modelViewMatrix, translate(-1.8 + (i % 2) * 0.2 + j * 0.4, -2, 2.8 - i * 0.2));
        }
        
        modelViewMatrix = mvMatrixStack.pop();
    }
}

function DrawRedCheckerPiece()
{
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, checkerStartPoint, numOfCheckerPoints );
}

/********************
 Blue checker pieces
 *********************/
function DrawBlueCheckerPieces()
{
    if (animateFire == 0)
    {
        materialAmbient = vec4( 0.0, 0.0, 1.0, 1.0 );
        materialDiffuse = vec4( 0.1, 0.1, 0.1, 1.0);
        materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0.0, 0.0, 0.7, 1.0 );
        materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
        materialSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
    }
    
    materialShininess = 50.0;
    SetupLightingMaterial();
    
    if(animateCheckers == 0)
    {
        mvMatrixStack.push(modelViewMatrix);
        
        modelViewMatrix = mult(modelViewMatrix, translate(-1.25, -2, 1.5));
        modelViewMatrix = mult(modelViewMatrix, scale4(0.3, 0.3, 0.3));
        
        // draw the required number of checker pieces
        for(var i = 0; i < numOfCheckerPieces; i++)
        {
            mvMatrixStack.push(modelViewMatrix);
            modelViewMatrix = mult(modelViewMatrix, translate(0, i * 0.14, 0));
            DrawBlueCheckerPiece();
            modelViewMatrix = mvMatrixStack.pop();
        }
        
        modelViewMatrix = mvMatrixStack.pop();
    }
    else
    {
        mvMatrixStack.push(modelViewMatrix);
        
        modelViewMatrix = mult(modelViewMatrix, translate(-1.6, -2, 1.65));
        modelViewMatrix = mult(modelViewMatrix, scale4(0.3, 0.3, 0.3));
        
        for(var i = 0; i < 3; i++)
        {
            for(var j = 0; j < 4; j++)
            {
                mvMatrixStack.push(modelViewMatrix);
                //modelViewMatrix = mult(modelViewMatrix, translate(-1.8 + (i % 2) * 0.2 + j * 0.4, -2, 2.8 - i * 0.2));
                modelViewMatrix = mult(modelViewMatrix, translate(j * 1.6, 0, 0));
                DrawBlueCheckerPiece();
                
                modelViewMatrix = mvMatrixStack.pop();
            }
            modelViewMatrix = mult(modelViewMatrix, translate(0, 0, -0.8));
            if(i % 2 == 0)
            {
                modelViewMatrix = mult(modelViewMatrix, translate(-0.8, 0, 0));
            }
            else if(i > 0)
            {
                modelViewMatrix = mult(modelViewMatrix, translate(0.8, 0, 0));
            }
            //modelViewMatrix = mult(modelViewMatrix, translate(-1.8 + (i % 2) * 0.2 + j * 0.4, -2, 2.8 - i * 0.2));
        }
        
        modelViewMatrix = mvMatrixStack.pop();
    }
}

function DrawBlueCheckerPiece()
{
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, checkerStartPoint, numOfCheckerPoints );
}

function DrawCarpet()
{
    materialAmbient = vec4( 0.0, 0.0, 0.25, 1.0 );
    materialDiffuse = vec4( 0, 0, 1, 1.0);
    materialSpecular = vec4( 1, 1, 1, 1.0 );
    materialShiness=0;
    SetupLightingMaterial();
    
    mvMatrixStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-1, -3.9, 1.75));
    modelViewMatrix = mult(modelViewMatrix, scale4(1.4, 1, 1.4));
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, carpetStartPoint, numOfCarpetPoints );
    
    modelViewMatrix = mvMatrixStack.pop();
}

/********************
 Lightsaber
 *********************/
function DrawLightSabers()
{
    mvMatrixStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(5.15, 4.25, -0.5));
    modelViewMatrix = mult(modelViewMatrix, scale4(0.75, 0.75, 1.1));
    modelViewMatrix = mult(modelViewMatrix, rotate(90, 1, 0, 0));
    DrawLightSaber(0);
    modelViewMatrix = mvMatrixStack.pop();
    
    mvMatrixStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(5.15, 3.0, 3.5));
    modelViewMatrix = mult(modelViewMatrix, scale4(0.75, 0.75, 1.1));
    modelViewMatrix = mult(modelViewMatrix, rotate(-90, 1, 0, 0));
    DrawLightSaber(1);
    modelViewMatrix = mvMatrixStack.pop();
}

function DrawLightSaber(color)
{
    if(animateLightSaber == 0)
    {
        if(color == 0)
        {
            // blue lightsaber
            materialAmbient = vec4( 0.4, 0.4, 1.0, 1.0 );
            materialDiffuse = vec4( 0.2, 0.2, 0.2, 1.0);
        }
        else
        {
            // red lightsaber
            materialAmbient = vec4( 0.8, 0, 0, 1.0 );
            materialDiffuse = vec4( 0.2, 0.2, 0.2, 1.0);
        }
        materialSpecular = vec4( 1, 1, 1, 1.0 );
        
        materialShiness=100;
        SetupLightingMaterial();
        DrawLightSaberLight();
    }
    
    if (animateFire == 0 || animateLightSaber == 0)
    {
        materialAmbient = vec4( 0.7, 0.7, 0.7, 1.0 );
        materialDiffuse = vec4( 0.2, 0.2, 0.2, 1.0);
        materialSpecular = vec4( 1, 1, 1, 1.0 );
    }
    else
    {
        materialAmbient = vec4( 0.5, 0.5, 0.5, 1.0 );
        materialDiffuse = vec4( 0.0, 0.0, 0.0, 1.0);
        materialSpecular = vec4( .1, .1, .1, 1.0 );
    }
    
    materialShiness=50;
    SetupLightingMaterial();
    DrawLightSaberHandle();
}

function DrawLightSaberLight()
{
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, lightSaberLightStartPoint, numOfLightSaberLightPoints );
}

function DrawLightSaberHandle()
{
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, lightSaberHandleStartPoint, numOfLightSaberHandlePoints );
}



