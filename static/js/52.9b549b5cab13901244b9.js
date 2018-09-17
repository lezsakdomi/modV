webpackJsonp([52],{802:function(t,n){t.exports='/*{\n\t"DESCRIPTION": "",\n\t"CREDIT": "by Carter Rosenberg",\n\t"ISFVSN": "2",\n\t"CATEGORIES": [\n\t\t"Film"\n\t],\n\t"INPUTS": [\n\t\t{\n\t\t\t"NAME": "inputImage",\n\t\t\t"TYPE": "image"\n\t\t},\n\t\t{\n\t\t\t"NAME": "lineSize",\n\t\t\t"LABEL": "Line Size",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 1.0,\n\t\t\t"MAX": 50.0,\n\t\t\t"DEFAULT": 4.0\n\t\t}\n\t],\n\t"PASSES": [\n\t\t{\n\t\t\t"TARGET":"lastRow",\n\t\t\t"WIDTH": "1",\n\t\t\t"HEIGHT": "1",\n\t\t\t"DESCRIPTION": "this buffer stores the last frame\'s odd / even state",\n\t\t\t"PERSISTENT": true\n\t\t},\n\t\t{\n\t\t\t"TARGET":"lastFrame",\n\t\t\t"PERSISTENT": true\n\t\t}\n\t]\n\t\n}*/\n\nvoid main()\n{\n\t//\tif this is the first pass, i\'m going to read the position from the "lastRow" image, and write a new position based on this and the hold variables\n\tif (PASSINDEX == 0)\t{\n\t\tvec4\t\tsrcPixel = IMG_PIXEL(lastRow,vec2(0.5));\n\t\t//\ti\'m only using the X and Y components, which are the X and Y offset (normalized) for the frame\n\t\tsrcPixel.x = (srcPixel.x) > 0.5 ? 0.0 : 1.0;\n\t\tgl_FragColor = srcPixel;\n\t}\n\t//\telse this isn\'t the first pass- read the position value from the buffer which stores it\n\telse\t{\n\t\tvec4\t\tlastRow = IMG_PIXEL(lastRow,vec2(0.5));\n\t\tvec2\t\tpixelCoord = isf_FragNormCoord * RENDERSIZE;\n\t\t\n\t\tif (mod(floor(pixelCoord.y),2.0 * lineSize) < lineSize + lineSize * lastRow.x)\n\t\t\tgl_FragColor = IMG_NORM_PIXEL(inputImage,isf_FragNormCoord);\n\t\telse\n\t\t\tgl_FragColor = IMG_NORM_PIXEL(lastFrame,isf_FragNormCoord);\n\t}\n}\n'}});