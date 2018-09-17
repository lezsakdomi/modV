webpackJsonp([19],{833:function(t,n){t.exports='/*{\n\t"CREDIT": "by sheltron3030",\n\t"DESCRIPTION": "",\n\t"CATEGORIES": [\n\t\t"XXX"\n\t],\n\t"INPUTS": [\n\t\t{\n\t\t\t"NAME": "noise",\n\t\t\t"TYPE": "image"\n\t\t},\n\t\t{\n\t\t\t"NAME" : "termThres",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" :5,\n\t\t\t"MIN" : 0,\n\t\t\t"MAX" : 10\n\t\t},\n\t\t{\n\t\t\t"NAME" : "step_p",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" :0.5,\n\t\t\t"MIN" : 0,\n\t\t\t"MAX" : 1\n\t\t},\n\t\t{\n\t\t\t"NAME" : "rot_z",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" :0.5,\n\t\t\t"MIN" : 0,\n\t\t\t"MAX" : 6.28\n\t\t},\n\t\t{\n\t\t\t"NAME" : "squiggle",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" : 0.5,\n\t\t\t"MIN" : -1,\n\t\t\t"MAX" : 1\n\t\t},\n\t\t{\n\t\t\t"NAME" : "repeat",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" : 0.5,\n\t\t\t"MIN" : -1,\n\t\t\t"MAX" : 5\n\t\t},\n\t\t{\n\t\t\t"NAME" : "speed",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" : 0.5,\n\t\t\t"MIN" : -1,\n\t\t\t"MAX" : 2\n\t\t},\n\t\t{\n\t\t\t"NAME" : "hex_1",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" : 0.5,\n\t\t\t"MIN" : 0,\n\t\t\t"MAX" : 1\n\t\t},\n\t\t{\n\t\t\t"NAME" : "hex_2",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" : 0.5,\n\t\t\t"MIN" : 0,\n\t\t\t"MAX" : 1\n\t\t},\n\t\t{\n\t\t\t"NAME" : "hex_depth",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" : 0.5,\n\t\t\t"MIN" : 0,\n\t\t\t"MAX" : 1\n\t\t},\n\t\t{\n\t\t\t"NAME" : "offset_cam",\n\t\t\t"TYPE" : "float",\n\t\t\t"DEFAULT" : 0,\n\t\t\t"MIN" : -1,\n\t\t\t"MAX" : 1\n\t\t}\n\t],\n\t"PERSISTENT_BUFFERS": [\n\t\t"buffer"\n\t],\n\t"PASSES": [\n\t\t{\n\t\t\t"TARGET" : "buffer"\n\t\t},\n\t\t{ }\n\t]\n}*/\n\n#define MAX_ITER 40\n\nvec3 filter() {\n\tvec2 delta = 1. / RENDERSIZE;\n\t\n\tvec3 val = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy).xyz;\n\n\n\tvec3 l = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy + vec2(0., delta.y)).xyz;\n\tvec3 r = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy - vec2(0., delta.y)).xyz;\n\tvec3 u = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy + vec2(delta.x, 0.)).xyz;\n\tvec3 d = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy - vec2(delta.x, 0.)).xyz;\n\n\tvec3 n = IMG_NORM_PIXEL(noise, fract(vv_FragNormCoord.xy * 2. + TIME )).xyz - 0.5;\n\t\n\tvec3 bloom = max(val, max(max(l, r), max( u, d))) * 1.5;\n\t// bloom = bloom  + l + r + u + d;\n\t// bloom /= 5.; // orlando;\n\treturn bloom + n/9.;\n\n}\n\n\t\t\tmat3 rotationMatrix(vec3 axis, float angle) {\n\t\t\t    float s = sin(angle);\n\t\t\t    float c = cos(angle);\n\t\t\t    float oc = 1.0 - c;\n\t\t\t    \n\t\t\t    return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,\n\t\t\t                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,\n\t\t\t                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);\n\t\t\t}\n\n\t\t\tvec3 opRep( vec3 p, vec3 c )\n\t\t\t{\n\t\t\t    vec3 q = mod(p, c) - 0.5 * c;\n\t\t\t    \n\t\t\t    return q;\n\t\t\t}\n\n\t\t\tfloat sdCappedCylinder( vec3 p, vec2 h )\n\t\t\t{\n\t\t\t  vec2 d = abs(vec2(length(p.xz),p.y)) - h;\n\t\t\t  return min(max(d.x,d.y),0.0) + length(max(d,0.0));\n\t\t\t}\n\t\t\t\n\t\t\tfloat opS( float d1, float d2 )\n\t\t\t{\n\t\t\t    return max(-d1,d2);\n\t\t\t}\n\n\t\t\tfloat hex(vec3 p, vec2 h) {\n\t\t\t\tvec3 q = abs(p);\n\t\t\t\treturn max(q.z-h.y, max((q.x*0.866025+q.y*0.5),q.y) - h.x);\n\t\t\t}\n\t\t\tfloat sdTriPrism( vec3 p, vec2 h )\n\t\t\t{\n\t\t\t    vec3 q = abs(p);\n\t\t\t    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);\n\t\t\t}\n\t\t\tvec2 polar(vec2 c) {\n\t\t\t\treturn vec2(atan(c.y, c.x), length(c));\n\t\t\t}\n\t\t\tvec2 cart(vec2 p) {\n\t\t\t\treturn p.y * vec2(cos(p.x), sin(p.x));\n\t\t\t}\n\n\n\nvec2 DE(vec3 pos) {\n\n\tpos = pos * rotationMatrix(normalize(vec3(0., 0., 1.)), rot_z + TIME/10. + squiggle * sin(pos.z) );\n\t\n\t// pos -= vec3(0., sin(TIME), cos(TIME));\n\tpos = opRep(pos, vec3(repeat));\n\t\n\n\tpos.xy = polar(pos.xy);\n\tpos.x += 5.;\n\t pos.xy = cart(pos.xy);\n\n\tfloat a = hex(pos, vec2(hex_1 * repeat,  hex_depth/2.));\n\tfloat b = hex(pos, vec2(hex_2 * hex_1 * repeat, hex_depth));\n\n\t// float b = sdTriPrism(pos - vec3(-1., 0., 0.), vec2(0.6, 1.));\n\tfloat c = sdTriPrism(pos - vec3(0., 0., 0.), vec2(0.6, 1.));\n\n\tfloat d =  max(a,-b);\n\n\treturn vec2(pos.z, d);\n}\n\nvec3 gradient(vec3 p, float t) {\n\t\t\tvec2 e = vec2(0., t);\n\n\t\t\treturn normalize( \n\t\t\t\tvec3(\n\t\t\t\t\tDE(p+e.yxx).y - DE(p-e.yxx).y,\n\t\t\t\t\tDE(p+e.xyx).y - DE(p-e.xyx).y,\n\t\t\t\t\tDE(p+e.xxy).y - DE(p-e.xxy).y\n\t\t\t\t)\n\t\t\t);\n\t\t}\n\nvec3 palette( in float t)\n{\n\tvec3 a = vec3(1.4, 0.5, 0.5);\n\tvec3 b = vec3(0.8, 0.3, 0.3);\n\tvec3 c = vec3(1.31, 1.3, 0.1);\n\tvec3 d = vec3(0.50, 0.20, 1.6);\n\t\n    return a + b*cos( 6.28318*(c*t+d) );\n}\n\nvec3 raycast() {\n\t\n\tvec3 camera = vec3( 0., 0., TIME * speed );\n\tvec2 screenPos = -1.0 + 2.0 * gl_FragCoord.xy /RENDERSIZE;\n\tscreenPos.x *= RENDERSIZE.x / RENDERSIZE.y;\n\tvec2 n = IMG_NORM_PIXEL(noise, fract(vv_FragNormCoord.xy + TIME * 10.)).xy - 0.5;\n\t\n\t// screenPos += n/100.;\n\tvec3 ray = normalize(vec3( screenPos, 1.0));\n\tfloat thresh = exp(-termThres);\n\n\t\n\t// raycasting parameter\t\n\tfloat t  = 0.;\n\tvec3 point;\n\tint iter = 0;\n \tbool hit = false;\n \tvec2 dist;\n\t// ray stepping \n\tfor(int i = 0; i < MAX_ITER; i++) {\n\t\tpoint = camera + ray * t;\n\t\t dist = DE(point);\n\n\t\tthresh = exp(-termThres) * exp(t/4.);\n\t\n\t\tif (abs(dist.y) < thresh ) {\n\t\t\thit = true;\n\t\t\tbreak;\n\t\t}\n\t\t\n\t\t\t        \n\t\tt += dist.y * step_p ;\n\t\titer ++;\n\n\t}\n\t\t\t    \n\tfloat shade = dot(gradient(point, 0.01 ), -ray);\n\tfloat ao = 1. -  float(iter) / float(MAX_ITER);\n\t\n\tvec3 color = vec3(0.);\n\t\n\tif ( hit )\n\t\tcolor = palette(point.z/5.) * sqrt(ao);\n\treturn color;\n\n\n}\n\nvoid main() {\n\n\n\t\tif (PASSINDEX == 0) {\n\t\t\tgl_FragColor = vec4(raycast(), 1.0);\n\t\t\t\n\t\t} else if (PASSINDEX == 1) {\n\t\t\tgl_FragColor = vec4(filter(), 1.0);\n\t\t}\n\n\t\n}'}});