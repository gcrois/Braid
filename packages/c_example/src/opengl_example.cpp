#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#include <emscripten/html5.h>
#include <GLES3/gl3.h>
#define VERSION "#version 300 es\n"
#else
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#define VERSION "#version 330 core\n"
#endif

#include <cstdio>
#include <cstdlib>
#include <cmath>
#include <iostream>

// ----------------------------------------------------------------------
// Vertex & Fragment Shaders (ES3 style)
// ----------------------------------------------------------------------

static const char* VSHADER_SRC = VERSION R"(
precision highp float;

in vec2 a_position;
out vec2 v_coord;

void main()
{
    v_coord = a_position;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
)";

static const char* FSHADER_SRC = VERSION R"(
precision highp float;

in  vec2 v_coord;
out vec4 fragColor;

uniform vec2  u_center;
uniform float u_zoom;
uniform float u_aspect;

// Convert HSV -> RGB for coloring
vec3 hsv2rgb(vec3 c)
{
    // A common snippet for HSV → RGB
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.x + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main()
{
    const int   MAX_ITER = 256;
    const float ESCAPE   = 4.0;

    // Map screen coords -> (x,y) in the complex plane
    vec2 c = u_center + (v_coord * vec2(u_aspect, 1.0)) / u_zoom;

    vec2 z = vec2(0.0);
    int iter = 0;

    // We do 4 iterations at a time (just a small optimization)
    for (iter = 0; iter < MAX_ITER; iter += 4)
    {
        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
        if (dot(z,z) > ESCAPE) break;

        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
        if (dot(z,z) > ESCAPE) break;

        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
        if (dot(z,z) > ESCAPE) break;

        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
        if (dot(z,z) > ESCAPE) break;
    }

    // "Smooth" color
    float smooth_iter = float(iter);
    if (dot(z,z) > 1e-8)
    {
        // Smooth the boundary
        smooth_iter -= log2(log2(dot(z,z))) - 1.0;
    }

    // Hue cycles by iteration count
    float hue = 0.95 + 10.0 * smooth_iter / float(MAX_ITER);

    // Convert HSV to RGB
    vec3 rgb = hsv2rgb(vec3(hue, 0.8, 1.0));
    fragColor = vec4(rgb, 1.0);
}
)";

// ----------------------------------------------------------------------
// Helper: Compile a shader, print errors
// ----------------------------------------------------------------------
static GLuint compileShader(GLenum type, const char* src)
{
    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, &src, nullptr);
    glCompileShader(shader);

    GLint compiled = 0;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &compiled);
    if (!compiled) {
        GLint infoLen = 0;
        glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &infoLen);
        if (infoLen > 1) {
            char* infoLog = (char*)malloc(infoLen);
            glGetShaderInfoLog(shader, infoLen, nullptr, infoLog);
            std::cerr << "Error compiling shader:\n" << infoLog << std::endl;
            free(infoLog);
        }
        glDeleteShader(shader);
        shader = 0;
    }
    return shader;
}

// ----------------------------------------------------------------------
// Globals for program, buffers, and uniform locations
// ----------------------------------------------------------------------
static GLuint gProgram      = 0;
static GLuint gVBO          = 0;
static GLuint gVAO          = 0;
static GLint  gCenterLoc    = -1;
static GLint  gZoomLoc      = -1;
static GLint  gAspectLoc    = -1;

static float  gCenterX      = -0.0f;
static float  gCenterY      = -1.0f;
static float  gZoom         = 1.0f;
static float  gZoomSpeed    = 1.001f;
static float  gPanSpeedX    = 0.0f;
static float  gPanSpeedY    = 0.0f;
static float  gAspect       = 1.0f;

// Full-screen triangle in clip-space
static const float FULLSCREEN_TRIANGLE[6] = {
    -1.0f, -1.0f,
     3.0f, -1.0f,
    -1.0f,  3.0f
};

// ----------------------------------------------------------------------
// Create the program, VBO, VAO, etc.
// ----------------------------------------------------------------------
static void initGL()
{
    // 1. Compile vertex + fragment shaders
    GLuint vs = compileShader(GL_VERTEX_SHADER,   VSHADER_SRC);
    GLuint fs = compileShader(GL_FRAGMENT_SHADER, FSHADER_SRC);

    // 2. Create and link the program
    gProgram = glCreateProgram();
    glAttachShader(gProgram, vs);
    glAttachShader(gProgram, fs);
    glLinkProgram(gProgram);

    // Check for linking errors
    GLint linked = 0;
    glGetProgramiv(gProgram, GL_LINK_STATUS, &linked);
    if (!linked) {
        GLint infoLen = 0;
        glGetProgramiv(gProgram, GL_INFO_LOG_LENGTH, &infoLen);
        if (infoLen > 1) {
            char* infoLog = (char*)malloc(infoLen);
            glGetProgramInfoLog(gProgram, infoLen, nullptr, infoLog);
            std::cerr << "Error linking program:\n" << infoLog << std::endl;
            free(infoLog);
        }
        glDeleteProgram(gProgram);
        gProgram = 0;
    }

    // 3. Look up uniform locations
    gCenterLoc = glGetUniformLocation(gProgram, "u_center");
    gZoomLoc   = glGetUniformLocation(gProgram, "u_zoom");
    gAspectLoc = glGetUniformLocation(gProgram, "u_aspect");

    // 4. Create a VBO for the full-screen triangle
    glGenBuffers(1, &gVBO);
    glBindBuffer(GL_ARRAY_BUFFER, gVBO);
    glBufferData(
        GL_ARRAY_BUFFER,
        sizeof(FULLSCREEN_TRIANGLE),
        FULLSCREEN_TRIANGLE,
        GL_STATIC_DRAW
    );

    // 5. Create + bind a VAO to store VBO state
    glGenVertexArrays(1, &gVAO);
    glBindVertexArray(gVAO);

    // 6. Use our shader program and set up the vertex attribute(s)
    glUseProgram(gProgram);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(
        0,           // attribute location = 0
        2,           // number of components (x,y)
        GL_FLOAT,    // data type
        GL_FALSE,    // normalized?
        0,           // stride
        (void*)0     // offset in the VBO
    );

    // 7. Unbind VAO & VBO (optional but often good practice)
    glBindVertexArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);

    // 8. Set clear color
    glClearColor(0.f, 0.f, 0.f, 1.f);
}

// ----------------------------------------------------------------------
// Draw one frame
// ----------------------------------------------------------------------
static void drawFrame()
{
    // 1. Update zoom & center
    gZoom    *= gZoomSpeed;
    gCenterX += gPanSpeedX;
    gCenterY += gPanSpeedY;

    // 2. Clear the screen
    glClear(GL_COLOR_BUFFER_BIT);

    // 3. Use our program, set uniforms
    glUseProgram(gProgram);
    glUniform2f(gCenterLoc, gCenterX, gCenterY);
    glUniform1f(gZoomLoc,   gZoom);
    glUniform1f(gAspectLoc, gAspect);

    // 4. Bind the VAO that holds our vertex state
    glBindVertexArray(gVAO);

    // 5. Draw
    glDrawArrays(GL_TRIANGLES, 0, 3);

    // 6. Unbind VAO
    glBindVertexArray(0);
}

#ifdef __EMSCRIPTEN__
// ----------------------------------------------------------------------
// Emscripten main (WebGL2)
// ----------------------------------------------------------------------
int main()
{
    // For ES3, we need a WebGL2 context in Emscripten:
    EmscriptenWebGLContextAttributes attrs;
    emscripten_webgl_init_context_attributes(&attrs);
    attrs.alpha  = false; // optional

    EMSCRIPTEN_WEBGL_CONTEXT_HANDLE ctx
        = emscripten_webgl_create_context("#canvas", &attrs);
    if (!ctx) {
        std::cerr << "Failed to create WebGL2 context.\n";
        return 1;
    }
    emscripten_webgl_make_context_current(ctx);

    // Initialize GL
    initGL();

    // calculate initial aspect
    int width, height;
    emscripten_get_canvas_element_size("#canvas", &width, &height);

    // Call drawFrame() forever
    emscripten_set_main_loop(drawFrame, 0, 1);
    return 0;
}

#else
// ----------------------------------------------------------------------
// Desktop main
// ----------------------------------------------------------------------
int main()
{
    // 1) Initialize GLFW
    if (!glfwInit()) {
        std::cerr << "Failed to init GLFW.\n";
        return 1;
    }

    // For an ES3–like context, you can do:
    glfwWindowHint(GLFW_CLIENT_API, GLFW_OPENGL_API);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    GLFWwindow* window = glfwCreateWindow(800, 600, "Mandelbrot", nullptr, nullptr);
    if (!window) {
        std::cerr << "Failed to create window.\n";
        glfwTerminate();
        return 1;
    }
    glfwMakeContextCurrent(window);

    // 2) GLEW (if needed)
    glewExperimental = GL_TRUE;
    if (glewInit() != GLEW_OK) {
        std::cerr << "Failed to initialize GLEW.\n";
        return 1;
    }

    initGL();

    // Calculate initial aspect
    int width, height;
    glfwGetFramebufferSize(window, &width, &height);
    gAspect = (float)width / (float)height;

    // 3) Main loop
    while (!glfwWindowShouldClose(window)) {
        glfwPollEvents();

        // In case of window resize
        glfwGetFramebufferSize(window, &width, &height);
        glViewport(0, 0, width, height);
        gAspect = (float)width / (float)height;

        drawFrame();

        glfwSwapBuffers(window);
    }

    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}
#endif
