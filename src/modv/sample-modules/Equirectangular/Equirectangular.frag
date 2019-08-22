const float M_PI = 3.14159;
const bool drawSphere = true;

const float radius = 0.3;

float angVelocity = -0.3,
	  phi = 0.0,
      psi = 0.0,
      theta = 0.0;


vec3 sphericalToWorld(vec2 sphCoord, float r)
{
    return vec3(
    	r * sin(sphCoord.y) * cos(sphCoord.x),
        r * sin(sphCoord.y) * sin(sphCoord.x),
        r * cos(sphCoord.y)
    );
}

vec2 worldToSpherical(vec3 flatCoord, float r)
{
    return vec2(
        atan(flatCoord.x, flatCoord.y),
        acos(flatCoord.z / r)
    );   
}
 
mat3 makeRotationMatrix(vec3 a)
{
    return mat3(
    	cos(a.x) * cos(a.z) - sin(a.x) * cos(a.y) * sin(a.z),
        -cos(a.x) * sin(a.z) - sin(a.x) * cos(a.y) * cos(a.z),
        sin(a.x) * sin(a.y),
        sin(a.x) * cos(a.z) + cos(a.x) * cos(a.y) * sin(a.z),
        -sin(a.x) * sin(a.z) + cos(a.x) * cos(a.y) * cos(a.z),
        -cos(a.x) * sin(a.y),
        sin(a.y) * sin(a.z),
        sin(a.y) * cos(a.z),
        cos(a.y)
    );
}

vec3 screenToWorld(vec2 myPos, vec2 sphereCenter, float r)
{
    vec3 myVec;
    myVec.y = myPos.x - sphereCenter.x;
    myVec.z = -(myPos.y - sphereCenter.y);
    myVec.x = sqrt(r * r - myVec.z * myVec.z - myVec.y * myVec.y);
    return myVec;
}

void mainImage(out vec4 fragColor, vec2 fragCoord)
{
    vec2 mouse = iMouse.xy;
        
  	phi = iMouse.x * 2.0 * M_PI / iResolution.x;
    psi = iMouse.y * M_PI / iResolution.y;
    theta = iTime * angVelocity;
    
    vec2 sphCenter = .5*vec2(iResolution.x/iResolution.y, 1.);
    vec2 p = fragCoord.xy / iResolution.xy;
 
    vec3 worldSphCoord = sphericalToWorld(p * vec2(2.0 * M_PI, M_PI), 1.0);
    
    p.x *= iResolution.x / iResolution.y;
    
    if (drawSphere && length(p - sphCenter) < radius)
        worldSphCoord = screenToWorld(p, sphCenter, radius);
    
    mat3 rotationMatrix = makeRotationMatrix(vec3(phi, psi, theta));
    vec3 rotatedWorldSphCoord = normalize(rotationMatrix * worldSphCoord);

    vec2 rotatedSphericalCoord = worldToSpherical(rotatedWorldSphCoord, 1.0);

    fragColor = texture(iChannel0, rotatedSphericalCoord / vec2(2.*M_PI, M_PI), 0.0);
}