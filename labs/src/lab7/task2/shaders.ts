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
    varying highp vec2 vTextureCoord;
    precision mediump float;

    float star(vec2 p, float radius, float rotation, float fatness) {
        p.x = abs(p.x);
        float k0 = fatness * cos(1.25663706); 
        float k1 = fatness * sin(1.25663706);
        vec2 leg0 = vec2(k0, -fatness); 
        vec2 leg1 = vec2(k1, fatness*0.2);

        float c = cos(rotation);
        float s = sin(rotation);
        p = mat2(c, -s, s, c) * p;
    
        p /= radius;

        p.y -= 0.2; 
        vec2 e = vec2(
            dot(p, vec2(leg0.x, leg0.y)) - leg0.y*leg0.y,
            dot(p, vec2(leg1.x, leg1.y)) - leg1.y*leg1.y
        );
        e.x = abs(e.x);

        float d = max(e.x, -e.y*0.70710678 + e.x*0.70710678);
        return step(0.0, -d);
    }


    float circle(vec2 p, float r) {
        return step(length(p), r);
    }

    float sickle(vec2 p, vec2 center, float r_outer, float r_inner_offset_factor, float thickness_factor) {
        vec2 p_rotated = mat2(cos(0.785398), -sin(0.785398), sin(0.785398), cos(0.785398)) * (p - center); 

        float outer_circ = circle(p_rotated, r_outer);
        vec2 inner_center_offset = vec2(r_outer * r_inner_offset_factor, -r_outer * r_inner_offset_factor);
        float inner_circ = circle(p_rotated - inner_center_offset, r_outer * thickness_factor);
        float s = outer_circ * (1.0 - inner_circ);

        if (p_rotated.y > -r_outer * 0.1 && p_rotated.x < r_outer * 0.2) s = 0.0; 
        if (p_rotated.y < -r_outer * 0.5) s = 0.0; 
        if (p_rotated.x > r_outer * 0.9) s = 0.0; 

        return s;
    }

    float hammer(vec2 p, vec2 center, float head_width, float head_height, float handle_width, float handle_height_extension) {
        vec2 p_rotated = mat2(cos(-0.785398), -sin(-0.785398), sin(-0.785398), cos(-0.785398)) * (p - center); 

        vec2 head_center_rel = vec2(0.0, head_height * 0.5 + handle_width * 0.2);
        float h_head = step(abs(p_rotated.x - head_center_rel.x), head_width * 0.5) * 
                       step(abs(p_rotated.y - head_center_rel.y), head_height * 0.5);

        vec2 handle_center_rel = vec2(0.0, -handle_height_extension * 0.3);
        float h_handle = step(abs(p_rotated.x - handle_center_rel.x), handle_width * 0.5) * 
                         step(abs(p_rotated.y - handle_center_rel.y), (head_height + handle_height_extension) * 0.5);
        
        return max(h_head, h_handle);
    }


    void main(void) {
        vec2 uv = vTextureCoord;
        uv.y = 1.0 - uv.y;

        vec3 redColor = vec3(0.80, 0.0, 0.0);    
        vec3 goldColor = vec3(1.0, 0.843, 0.0); 

        vec3 finalColor = redColor;

        float cantonHeight = 0.5;
        float cantonWidth = 0.333;
        
        vec2 symbol_uv = uv;
        symbol_uv.x /= cantonWidth; 
        symbol_uv.y = (symbol_uv.y - (1.0 - cantonHeight)) / cantonHeight; 

        if (uv.x < cantonWidth && uv.y > (1.0 - cantonHeight)) {
            // We are in the canton area
            // Normalize coordinates within the canton for easier symbol placement
            vec2 canton_uv = vec2(uv.x / cantonWidth, (uv.y - (1.0 - cantonHeight)) / cantonHeight);

            vec2 starCenter = vec2(0.5, 0.75); 
            float starRadius = 0.12;
            float starRotation = 0.0; 
            float starFatness = 0.4; 

            float s = star(canton_uv - starCenter, starRadius, starRotation, starFatness);

            vec2 hs_center = vec2(0.5, 0.35); 
            float sickleRadiusOuter = 0.20;
            float sickleInnerOffset = 0.5;
            float sickleThickness = 0.75;
            float hammerHeadW = 0.2;
            float hammerHeadH = 0.07;
            float hammerHandleW = 0.05;
            float hammerHandleExt = 0.15;

            float sickleShape = sickle(canton_uv, hs_center, sickleRadiusOuter, sickleInnerOffset, sickleThickness);
            float hammerShape = hammer(canton_uv, hs_center, hammerHeadW, hammerHeadH, hammerHandleW, hammerHandleExt);

            if (s > 0.0 || sickleShape > 0.0 || hammerShape > 0.0) {
                finalColor = goldColor;
            }
        }

        gl_FragColor = vec4(finalColor, 1.0);
    }
`; 