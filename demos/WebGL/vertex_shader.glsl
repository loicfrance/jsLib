#version 300 es

uniform mat4 u_camera;
uniform float u_depth;

in vec2 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
    gl_Position = vec4(a_position, u_depth, 1) * u_camera;
    v_color = a_color;
}
