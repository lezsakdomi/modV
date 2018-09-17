webpackJsonp([25],{827:function(t,n){t.exports='\n/*{\n\t"CREDIT": "by VIDVOX",\n\t"CATEGORIES": [\n\t\t"Glitch"\n\t],\n\t"INPUTS": [\n\t\t{\n\t\t\t"NAME": "inputImage",\n\t\t\t"TYPE": "image"\n\t\t},\n\t\t{\n\t\t\t"NAME": "noiseLevel",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.0,\n\t\t\t"MAX": 1.0,\n\t\t\t"DEFAULT": 0.5\n\t\t},\n\t\t{\n\t\t\t"NAME": "distortion1",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.0,\n\t\t\t"MAX": 5.0,\n\t\t\t"DEFAULT": 1.0\n\t\t},\n\t\t{\n\t\t\t"NAME": "distortion2",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.0,\n\t\t\t"MAX": 5.0,\n\t\t\t"DEFAULT": 5.0\n\t\t},\n\t\t{\n\t\t\t"NAME": "speed",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.0,\n\t\t\t"MAX": 1.0,\n\t\t\t"DEFAULT": 0.3\n\t\t},\n\t\t{\n\t\t\t"NAME": "scroll",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.0,\n\t\t\t"MAX": 1.0,\n\t\t\t"DEFAULT": 0.0\n\t\t},\n\t\t{\n\t\t\t"NAME": "scanLineThickness",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 1.0,\n\t\t\t"MAX": 50.0,\n\t\t\t"DEFAULT": 25.0\n\t\t},\n\t\t{\n\t\t\t"NAME": "scanLineIntensity",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.0,\n\t\t\t"MAX": 1.0,\n\t\t\t"DEFAULT": 0.5\n\t\t},\n\t\t{\n\t\t\t"NAME": "scanLineOffset",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.0,\n\t\t\t"MAX": 1.0,\n\t\t\t"DEFAULT": 0.0\n\t\t}\n\t]\n}*/\n\n//\tAdapted from http://www.airtightinteractive.com/demos/js/badtvshader/js/BadTVShader.js\n//\tAlso uses adopted Ashima WebGl Noise: https://github.com/ashima/webgl-noise\n\n/*\n * The MIT License\n *\n * Copyright (c) 2014 Felix Turner\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the "Software"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n *\n*/\n\n\n// Start Ashima 2D Simplex Noise\n\nconst vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);\n\nvec3 mod289(vec3 x) {\n\treturn x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n\treturn x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n\treturn mod289(((x*34.0)+1.0)*x);\n}\n\nfloat snoise(vec2 v)\t{\n\tvec2 i  = floor(v + dot(v, C.yy) );\n\tvec2 x0 = v -   i + dot(i, C.xx);\n\n\tvec2 i1;\n\ti1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n\tvec4 x12 = x0.xyxy + C.xxzz;\n\tx12.xy -= i1;\n\n\ti = mod289(i); // Avoid truncation effects in permutation\n\tvec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))+ i.x + vec3(0.0, i1.x, 1.0 ));\n\n\tvec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n\tm = m*m ;\n\tm = m*m ;\n\n\tvec3 x = 2.0 * fract(p * C.www) - 1.0;\n\tvec3 h = abs(x) - 0.5;\n\tvec3 ox = floor(x + 0.5);\n\tvec3 a0 = x - ox;\n\n\tm *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n\tvec3 g;\n\tg.x  = a0.x  * x0.x  + h.x  * x0.y;\n\tg.yz = a0.yz * x12.xz + h.yz * x12.yw;\n\treturn 130.0 * dot(m, g);\n}\n\n// End Ashima 2D Simplex Noise\n\nconst float tau = 6.28318530718;\n\n//\tuse this pattern for scan lines\n\nvec2 pattern(vec2 pt) {\n\tfloat s = 0.0;\n\tfloat c = 1.0;\n\tvec2 tex = pt * RENDERSIZE;\n\tvec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * (1.0/scanLineThickness);\n\tfloat d = point.y;\n\n\treturn vec2(sin(d + scanLineOffset * tau + cos(pt.x * tau)), cos(d + scanLineOffset * tau + sin(pt.y * tau)));\n}\n\nfloat rand(vec2 co){\n    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n\tvec2 p = isf_FragNormCoord;\n\tfloat ty = TIME*speed;\n\tfloat yt = p.y - ty;\n\n\t//smooth distortion\n\tfloat offset = snoise(vec2(yt*3.0,0.0))*0.2;\n\t// boost distortion\n\toffset = pow( offset*distortion1,3.0)/max(distortion1,0.001);\n\t//add fine grain distortion\n\toffset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;\n\t//combine distortion on X with roll on Y\n\tvec2 adjusted = vec2(fract(p.x + offset),fract(p.y-scroll) );\n\tvec4 result = IMG_NORM_PIXEL(inputImage, adjusted);\n\tvec2 pat = pattern(adjusted);\n\tvec3 shift = scanLineIntensity * vec3(0.3 * pat.x, 0.59 * pat.y, 0.11) / 2.0;\n\tresult.rgb = (1.0 + scanLineIntensity / 2.0) * result.rgb + shift + (rand(adjusted * TIME) - 0.5) * noiseLevel;\n\tgl_FragColor = result;\n\n}\n'}});