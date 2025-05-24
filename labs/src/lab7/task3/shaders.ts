export const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
`;

export const fragmentShaderSource = `
    precision highp float;

    varying highp vec2 vTextureCoord;

    uniform sampler2D uTexture1; // Initial image/pattern
    uniform sampler2D uTexture2; // Final image/pattern
    uniform float uTime;         // Time for animation
    uniform vec2 uResolution;   // Canvas resolution
    uniform vec2 uRippleOrigin; // Normalized ripple origin (0.0 to 1.0)

    // Placeholder for actual texture sampling. We'll start with procedural colors.
    vec4 getTex1(vec2 uv) {
        // Simple checkerboard for image 1
        float checkSize = 10.0;
        float f = mod(floor(checkSize * uv.x) + floor(checkSize * uv.y), 2.0);
        return vec4(f * 0.8, f * 0.5, f * 0.2, 1.0); // Pattern 1: Orange/Brownish checkerboard
    }

    vec4 getTex2(vec2 uv) {
        // Simple stripes for image 2
        float stripeSize = 20.0;
        float f = mod(floor(stripeSize * uv.y), 2.0);
        return vec4(f * 0.2, f * 0.5, f * 0.8, 1.0); // Pattern 2: Blue/Cyan stripes
    }

    void main(void) {
        vec2 uv = vTextureCoord;
        vec2 centeredUV = uv - uRippleOrigin;
        // Correct for aspect ratio if ripple should be circular on screen
        centeredUV.x *= uResolution.x / uResolution.y;

        float dist = length(centeredUV);

        float waveSpeed = 0.8;
        float waveWidth = 0.2; // Width of the ripple transition zone
        float waveFrequency = 20.0; // Number of crests in the ripple
        float maxDist = length(vec2(1.0, 1.0) * (uResolution.x / uResolution.y + 1.0)); // A bit beyond screen extent

        // Current position of the main ripple front
        float currentRipplePos = uTime * waveSpeed;

        vec2 distortedUV = uv;
        float brightnessFactor = 1.0;
        float mixFactor = 0.0;

        if (dist < currentRipplePos + waveWidth && dist > currentRipplePos - waveWidth) {
            // Inside the ripple transition zone
            float waveProfile = (dist - (currentRipplePos - waveWidth)) / (2.0 * waveWidth);
            waveProfile = clamp(waveProfile, 0.0, 1.0);

            // Smoothstep for a nicer transition
            mixFactor = smoothstep(0.0, 1.0, waveProfile);

            // Distortion effect based on distance from ripple center and wave shape
            float distortionStrength = 0.05 * sin(dist * waveFrequency - uTime * waveSpeed * waveFrequency);
            distortionStrength *= (1.0 - mixFactor); // Stronger at the beginning of the wave

            // Apply distortion perpendicular to the direction from origin
            if (dist > 0.001) { // Avoid division by zero
                vec2 normalDir = normalize(centeredUV);
                distortedUV += normalDir * distortionStrength;
            }

            // Brightness pulsation within the wave
            brightnessFactor = 1.0 + 0.3 * sin(dist * waveFrequency * 0.5 - uTime * waveSpeed * waveFrequency * 0.5) * (1.0 - mixFactor);
            brightnessFactor = mix(1.0, brightnessFactor, smoothstep(0.0, 1.0, 0.5 - abs(waveProfile - 0.5)/0.5) );

        } else if (dist <= currentRipplePos - waveWidth) {
            // Area already passed by the ripple - show image2
            mixFactor = 1.0;
        } else {
            // Area not yet reached by the ripple - show image1
            mixFactor = 0.0;
        }
        
        // Clamp distorted UVs to avoid sampling outside texture edges
        distortedUV = clamp(distortedUV, 0.0, 1.0);

        vec4 color1 = getTex1(distortedUV);
        vec4 color2 = getTex2(uv); // Show final image undistorted in its final place

        vec4 finalColor = mix(color1, color2, mixFactor);
        finalColor.rgb *= brightnessFactor;

        gl_FragColor = finalColor;
    }
`; 