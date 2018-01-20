var canvas, wid, ctx, imageData, rgba, rSlide, gSlide, bSlide;
var savedColors;
var nY =127;
var curR, curG, curB = 0;
window.addEventListener('load', init, false);

/*
function testConversion(){
    var img = new Image();
    img.src = 'https://mdn.mozillademos.org/files/5397/rhino.jpg';
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    img.style.display = 'none';
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var pos = 0; pos < data.length; pos += 4) {

       var curYCBCR = rgb2ycbcr(data[pos],data[pos + 1],data[pos + 2]);
      
      
      var curRGB = ycbcr2rgb(curYCBCR[0],curYCBCR[1],curYCBCR[2]);
      data[pos]     = curRGB[0] ; // red
      data[pos + 1] = curRGB[1]; // green
      data[pos + 2] = curRGB[2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);
}
*/
function init(){
    savedColors = new Array(10);
    canvas = document.getElementById('canvas');
    rSlide = document.getElementById('rSlider');
    gSlide = document.getElementById('gSlider');
    bSlide = document.getElementById('bSlider');
    wid = canvas.width;
    canvas.height=wid;
    ctx = canvas.getContext('2d');
    imageData = ctx.createImageData(wid, wid);
    draw();
    generatePresetFields(savedColors.length,2);
    
   if((localStorage.getItem("colorTemplate")!=undefined)&&(localStorage.getItem("colorTemplate")!=null)){
        var arrayToParse = localStorage.getItem("colorTemplate");
        savedColors=JSON.parse(arrayToParse).slice(0,10);
        applyColorsToPallet();
    }
     addColorPick();
    document.getElementById('saveAsPreset').addEventListener('click',storeRGBValue);
    canvas.addEventListener('mousedown', pick); document.getElementById('yRange').addEventListener('change',updateWindow);
}

function updateWindow(){
    nY = parseInt (document.getElementById('yRange').value);
    draw();
}

function generatePresetFields(presetCount, rowCount){
    var presetsPerRow = Math.ceil(presetCount/rowCount);
    var lastRow = false;
    for (var j = 0;j < rowCount;j++){
        if (j==rowCount-1){
            presetsPerRow=presetCount-(j*presetsPerRow)
            lastRow=true;
        }
        var newRowContainer = document.createElement("div"); document.getElementById('presetContainerConatiner').appendChild(newRowContainer);
        for(i=0;i<presetsPerRow;i++){
             var newNode = document.createElement("div");
            var curNodeCount = (j*Math.ceil(presetCount/rowCount)+i);
             newNode.id= "slot"+curNodeCount;
            newRowContainer.appendChild(newNode);
            newNode.setAttribute("style", "width: 50px; height: 50px; border-style: groove;");
        }
    }
}

function addColorPick(){
    console.log("Started addColorPick");
    for(var i=0; i<savedColors.length ;i++){
        (function (i){
        var curNode = document.getElementById('slot'+i);
        curNode.addEventListener("click", function(){
            var localCount=i;
            rgba = savedColors[localCount];
            //TODO - Hier RGB Werte Einzeln aus dem String fischen
            
            color.style.background = rgba;
            color.textContent = rgba;
        });
        })(i);
    }
}


function storeRGBValue(){
    if((rgba!=undefined)&&(rgba!=savedColors[0])){
        for(i=1;i<savedColors.length;i++){
               savedColors[savedColors.length-i] = savedColors[savedColors.length-i-1];
        }
        savedColors[0]=rgba;
        localStorage.setItem("colorTemplate", JSON.stringify(savedColors));
        applyColorsToPallet();
    }
    else if(rgba==undefined){
        alert("There is no color to be stored,\n please select a color.")
    }
}

function applyColorsToPallet(){
    for(var i=0; i<savedColors.length;i++){
         document.getElementById('slot'+i).style.background =savedColors[i];
    }
}

function draw() {
  //first draw is correct second if ny!=0 not
  
  var data = imageData.data;
    var y,x,nCb,nCr,curRGB;
    for (var pos = 0; pos < data.length; pos += 4) {
        y=Math.floor((pos/4)/wid);
        x=Math.floor((pos/4)-y*wid);
        
      nCb=128*x/(wid/2)-128;
      nCr=128*-y/(wid/2)+128;
      curRGB = ycbcr2rgb(nY,nCb,nCr);
      data[pos]     = curRGB[0] ; // red
      data[pos + 1] = curRGB[1]; // green
      data[pos + 2] = curRGB[2]; // blue
      data[pos + 3] = 255; // transperency
    }
    ctx.putImageData(imageData, 0, 0);
}

 function pick(event) {
        var color = document.getElementById('color');
        var x = event.offsetX;
        var y = event.offsetY;
        var pixel = ctx.getImageData(x, y, 1, 1);
        var data = pixel.data;
        rgba = 'rgb(' + data[0] + ', ' + data[1] +
                    ', ' + data[2] + ')';
        var sCol =Math.floor((data[0] + data[1] + data[2])/3);
     
     if(sCol>128){
         sCol="black";
     }
     else{
         sCol="white";
     }
    curR = data[0];
    curG = data[1];
    curB = data[2];
    color.style.background =  rgba;
    color.style.color =  sCol; 
    color.textContent = rgba;
}

//Conversion Correct

function rgb2ycbcr(_r,_g,_b){
    var y,cb,cr;
    y= 0.299*_r+0.587*_g+0.114*_b;
    cb=  -0.168736 * _r - 0.331264 * _g + 0.5 * _b;
    cr= 0.5 * _r - 0.418688 * _g - 0.081312 * _b;
    var colorsYCbCr = [y,cb,cr];
    return colorsYCbCr;
}

function ycbcr2rgb(_y,_cb,_cr){
    var r,g,b;
    r= Math.round(_y+1.402*_cr);
    g= Math.round(_y-0.3441*_cb-0.7141*_cr);
    b= Math.round(_y+1.772*_cb);
    var colorsRGB = [r,g,b];
    return correctOverflow(colorsRGB);
}

function correctOverflow(inputArray){
    var outputArray = inputArray;
    for (var i = 0; i < inputArray.length; i++) {
     if (outputArray[i]<0){
         outputArray[i] = 0;
     }
     else if (outputArray[i]>255){
         outputArray[i] = 255;
     }
    }
    return outputArray;
}