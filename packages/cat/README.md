基于 [WebGL Specifications](https://www.zhoyq.com/attaches/FAAD61EAB3377ED8376ECDC2A15BF452.idl) 最全面的API释疑。

## 类型以及对象定义

这部分内容主要定义一部分类型和数据结构。

```glsl
typedef unsigned long  GLenum;
typedef boolean        GLboolean;
typedef unsigned long  GLbitfield;

typedef byte           GLbyte;
typedef short          GLshort;
typedef long           GLint;
typedef long           GLsizei;
typedef long long      GLintptr;
typedef long long      GLsizeiptr;

// 这个类型应该是 无符号整型 8位
// 但是Web IDL中并不存在这种类型
// 所以用 octet 代替 占位
typedef octet          GLubyte;
typedef unsigned short GLushort;
typedef unsigned long  GLuint;
typedef unrestricted float GLfloat;
typedef unrestricted float GLclampf;

// 由 WebGLContextAttributes 引用
enum WebGLPowerPreference { "default", "low-power", "high-performance" };

// 获取上下文时支持的参数
// getContext('webgl', <WebGLContextAttributes>)
dictionary WebGLContextAttributes {
    boolean alpha = true;
    boolean depth = true;
    boolean stencil = false;
    boolean antialias = true;
    boolean premultipliedAlpha = true;
    boolean preserveDrawingBuffer = false;
    WebGLPowerPreference powerPreference = "default";
    boolean failIfMajorPerformanceCaveat = false;
};

// [Exposed=(Window,Worker)] 代表可以同时在主线程和后台线程使用本对象

[Exposed=(Window,Worker)]
interface WebGLObject {};

[Exposed=(Window,Worker)]
interface WebGLBuffer : WebGLObject {};

[Exposed=(Window,Worker)]
interface WebGLFramebuffer : WebGLObject {};

[Exposed=(Window,Worker)]
interface WebGLProgram : WebGLObject {};

[Exposed=(Window,Worker)]
interface WebGLRenderbuffer : WebGLObject {};

[Exposed=(Window,Worker)]
interface WebGLShader : WebGLObject {};

[Exposed=(Window,Worker)]
interface WebGLTexture : WebGLObject {};

[Exposed=(Window,Worker)]
interface WebGLUniformLocation {};

[Exposed=(Window,Worker)]
interface WebGLActiveInfo {
    readonly attribute GLint size;
    readonly attribute GLenum type;
    readonly attribute DOMString name;
};

[Exposed=(Window,Worker)]
interface WebGLShaderPrecisionFormat {
    readonly attribute GLint rangeMin;
    readonly attribute GLint rangeMax;
    readonly attribute GLint precision;
};

typedef (ImageBitmap or
         ImageData or
         HTMLImageElement or
         HTMLCanvasElement or
         HTMLVideoElement or
         OffscreenCanvas) TexImageSource;

typedef ([AllowShared] Float32Array or sequence<GLfloat>) Float32List;
typedef ([AllowShared] Int32Array or sequence<GLint>) Int32List;

interface mixin WebGLRenderingContextBase {
    // 内容整理到 'WebGLRenderingContext 对象'
}

interface mixin WebGLRenderingContextOverloads {
    // 内容整理到 'WebGLRenderingContext 对象'
}

[Exposed=(Window,Worker)]
interface WebGLRenderingContext {
    // 内容整理到 'WebGLRenderingContext 对象'
};
WebGLRenderingContext includes WebGLRenderingContextBase;
WebGLRenderingContext includes WebGLRenderingContextOverloads;

[Exposed=(Window,Worker),
 Constructor(DOMString type,
 optional WebGLContextEventInit eventInit)]
interface WebGLContextEvent : Event {
    readonly attribute DOMString statusMessage;
};

// EventInit is defined in the DOM4 specification.
dictionary WebGLContextEventInit : EventInit {
    DOMString statusMessage = "";
};
```

## WebGLRenderingContext 对象

### 属性数据

```
[Exposed=Window] readonly attribute (HTMLCanvasElement or OffscreenCanvas) canvas;
// 可以在 Web Work 上使用 canvas api
// 需要调用 canvas.transferControlToOffscreen() 将渲染权转移给后台线程
[Exposed=Worker] readonly attribute OffscreenCanvas canvas;
readonly attribute GLsizei drawingBufferWidth;
readonly attribute GLsizei drawingBufferHeight;
```

### 缓冲区相关方法

清理渲染缓冲区。

```JavaScript
// 缓冲区类型
// 为 gl.clear 的参数
const GLenum DEPTH_BUFFER_BIT               = 0x00000100;
const GLenum STENCIL_BUFFER_BIT             = 0x00000400;
const GLenum COLOR_BUFFER_BIT               = 0x00004000;

// 清理指定缓存内容, 可以通过或运算符一次清理多个缓冲区
// @param mask 颜色缓冲区（COLOR_BUFFER_BIT） | 深度缓冲区（DEPTH_BUFFER_BIT） | 模板缓冲区（STENCIL_BUFFER_BIT）
void clear(GLbitfield mask);

// 将指定缓冲区设置为指定的值（参数范围都是 0.0 - 1.0）
// clearColor 指定的值 默认 0.0, 0.0, 0.0, 0.0
// clearDepth 指定的值 默认 1.0
// clearStencil 指定的值 默认 0
void clearColor(GLclampf red, GLclampf green, GLclampf blue, GLclampf alpha);
void clearDepth(GLclampf depth);
void clearStencil(GLint s);
```

### 绘制相关方法

绘制缓存中的顶点数据。

```JavaScript
// 绘制的类型
// 为 gl.drawArrays、gl.drawElements 第一个参数
const GLenum POINTS                         = 0x0000;
const GLenum LINES                          = 0x0001;
const GLenum LINE_LOOP                      = 0x0002;
const GLenum LINE_STRIP                     = 0x0003;
const GLenum TRIANGLES                      = 0x0004;
const GLenum TRIANGLE_STRIP                 = 0x0005;
const GLenum TRIANGLE_FAN                   = 0x0006;

// 执行绘制， 按照mode参数指定的方式绘制图形
// @param model 绘制模式。
// @param first 指定从哪个定点开始绘制
// @param count 指定绘制需要用到多少个顶点
void drawArrays(GLenum mode, GLint first, GLsizei count);

// 执行绘制，按照mode参数制定的方式，根据绑定到 ELEMENT_ARRAY_BUFFER 的缓冲区中的顶点索引绘制图形
// @param model 绘制模式。
// @param count 指定绘制顶点的个数
// @param type 指定索引值数据类型。包括：UNSIGNED_BYTE、UNSIGNED_SHORT、UNSIGNED_INT
// @param offset 指定索引数组中绘制的偏移位置，以字节为单位
void drawElements(GLenum mode, GLsizei count, GLenum type, GLintptr offset);
```

### 着色器 attribute 相关

```JavaScript
// 获取由 name 参数指定的 attribute 变量存储地址
// @param program 指定包含顶点或者片元着色器的程序对象
// @param name 获取其存储的 attribute 变量名称，最大长度256字节
[WebGLHandlesContextLoss] GLint getAttribLocation(WebGLProgram program, DOMString name);

// 绑定顶点索引到属性变量
// 使用缓冲区数据的时候需要用到的方法
// @param index 指定要绑定的通用顶点的索引 这个值直接赋值给 vertexAttribPointer 的 index 参数
// @param name 指定变量名
// 这里的 index 和 getAttribLocation 返回值是一样的
void bindAttribLocation(WebGLProgram program, GLuint index, DOMString name);

// 将数据传给由index参数指定的attribute变量
void vertexAttrib1f(GLuint index, GLfloat x);
void vertexAttrib2f(GLuint index, GLfloat x, GLfloat y);
void vertexAttrib3f(GLuint index, GLfloat x, GLfloat y, GLfloat z);
void vertexAttrib4f(GLuint index, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
// 接收参数为 Float32Array 数组
void vertexAttrib1fv(GLuint index, Float32List values);
void vertexAttrib2fv(GLuint index, Float32List values);
void vertexAttrib3fv(GLuint index, Float32List values);
void vertexAttrib4fv(GLuint index, Float32List values);
```

### 着色器 uniform 相关

```JavaScript
// 获取指定名称的 uniform 变量存储位置
// @param program 制定的包含顶点或者片元着色器的程序对象
// @param name 指定想要获取其存储位置的uniform变量名称 最大长度256字节
WebGLUniformLocation? getUniformLocation(WebGLProgram program, DOMString name);

// 将数据传给location指定的uniform变量
void uniform1f(WebGLUniformLocation? location, GLfloat x);
void uniform2f(WebGLUniformLocation? location, GLfloat x, GLfloat y);
void uniform3f(WebGLUniformLocation? location, GLfloat x, GLfloat y, GLfloat z);
void uniform4f(WebGLUniformLocation? location, GLfloat x, GLfloat y, GLfloat z, GLfloat w);

void uniform1i(WebGLUniformLocation? location, GLint x);
void uniform2i(WebGLUniformLocation? location, GLint x, GLint y);
void uniform3i(WebGLUniformLocation? location, GLint x, GLint y, GLint z);
void uniform4i(WebGLUniformLocation? location, GLint x, GLint y, GLint z, GLint w);

void uniform1fv(WebGLUniformLocation? location, Float32List v);
void uniform2fv(WebGLUniformLocation? location, Float32List v);
void uniform3fv(WebGLUniformLocation? location, Float32List v);
void uniform4fv(WebGLUniformLocation? location, Float32List v);

void uniform1iv(WebGLUniformLocation? location, Int32List v);
void uniform2iv(WebGLUniformLocation? location, Int32List v);
void uniform3iv(WebGLUniformLocation? location, Int32List v);
void uniform4iv(WebGLUniformLocation? location, Int32List v);

// @param 是否对矩阵进行转置 默认 false 在webgl中必须是false
void uniformMatrix2fv(WebGLUniformLocation? location, GLboolean transpose, Float32List value);
void uniformMatrix3fv(WebGLUniformLocation? location, GLboolean transpose, Float32List value);
void uniformMatrix4fv(WebGLUniformLocation? location, GLboolean transpose, Float32List value);
```

### 缓存对象

使用缓存的五个步骤

1. createBuffer
2. bindBuffer
3. bufferData
4. vertexAttribPointer
5. enableVertexAttribArray

```JavaScript
// 缓存对象
// bindBuffer 第一个参数
const GLenum ARRAY_BUFFER                   = 0x8892;
const GLenum ELEMENT_ARRAY_BUFFER           = 0x8893;
// const GLenum ARRAY_BUFFER_BINDING           = 0x8894;
// const GLenum ELEMENT_ARRAY_BUFFER_BINDING   = 0x8895;

// 绘制模式
// 下文中的usage参数值
const GLenum STREAM_DRAW                    = 0x88E0;
const GLenum STATIC_DRAW                    = 0x88E4;
const GLenum DYNAMIC_DRAW                   = 0x88E8;

// 数据类型
// vertexAttribPointer 中参数type的取值
const GLenum BYTE                           = 0x1400;
const GLenum UNSIGNED_BYTE                  = 0x1401;
const GLenum SHORT                          = 0x1402;
const GLenum UNSIGNED_SHORT                 = 0x1403;
const GLenum INT                            = 0x1404;
const GLenum UNSIGNED_INT                   = 0x1405;
const GLenum FLOAT                          = 0x1406;

// 创建缓冲区对象
WebGLBuffer? createBuffer();

// 允许使用buffer表示的缓冲区对象并将其绑定到target表示的目标上
// @param target 
//        ARRAY_BUFFER 表示缓冲区对象中包含顶点数据
//        ELEMENT_ARRAY_BUFFER 表示缓冲去对象中包含了顶点的索引值
void bindBuffer(GLenum target, WebGLBuffer? buffer);

// 开辟存储空间，向绑定在target上的缓冲区对象写入数据data
// @param target 同上
// @param data 类型化数组 比如：Float32Array...
// @param usage 优化效率 可以是以下值：
//        STATIC_DRAW 只会向缓冲区写入一次数据 需要绘制很多次
//        STREAM_DRAW 只会向缓冲区写入一次数据 需要绘制若干次
//        DYNAMIC_DRAW 会向缓冲区对象中多次写入数据 并绘制很多次
void bufferData(GLenum target, [AllowShared] BufferSource? data, GLenum usage);
void bufferData(GLenum target, GLsizeiptr size, GLenum usage);
void bufferSubData(GLenum target, GLintptr offset, [AllowShared] BufferSource data);

// 将绑定到ARRAY_BUFFER的缓冲区对象分配给index指定的attribute变量
// @param index 指向attribute变量
// @param size 指定缓冲区中每个顶点分量的个数
// @param type 数据格式 见上面的枚举
// @param normalized 是否将浮点型数据归一化到[0, 1]或者[-1, 1]区间
// @param stride 指定相邻两个顶点之间的字节数 默认是0
// @param offset 指定缓冲区对象中的偏移量 单位字节 可以利用这个偏移量赋值多个attribute
void vertexAttribPointer(GLuint index, GLint size, GLenum type, GLboolean normalized, GLsizei stride, GLintptr offset);

// 开启index对应的attribute对象
// 开启后不能通过 vertexAttrib[1234]f 传值
void enableVertexAttribArray(GLuint index);

// 关闭index对应的attribute对象
void disableVertexAttribArray(GLuint index);

// 删除参数buffer表示的缓冲区对象
// @param buffer 缓冲区对象 由createBuffer创建
void deleteBuffer(WebGLBuffer? buffer);
```

### 着色器 texture 相关

```JavaScript
// pixelStorei 中参数pname取值

// 对图像进行Y轴反转，默认false
const GLenum UNPACK_FLIP_Y_WEBGL            = 0x9240; 
// 将图像RGB颜色值每一个分量乘以A 默认false
const GLenum UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241; 

// activeTexture 方法使用的枚举常量
const GLenum TEXTURE0                       = 0x84C0;
const GLenum TEXTURE1                       = 0x84C1;
const GLenum TEXTURE2                       = 0x84C2;
const GLenum TEXTURE3                       = 0x84C3;
const GLenum TEXTURE4                       = 0x84C4;
const GLenum TEXTURE5                       = 0x84C5;
const GLenum TEXTURE6                       = 0x84C6;
const GLenum TEXTURE7                       = 0x84C7;
const GLenum TEXTURE8                       = 0x84C8;
const GLenum TEXTURE9                       = 0x84C9;
const GLenum TEXTURE10                      = 0x84CA;
const GLenum TEXTURE11                      = 0x84CB;
const GLenum TEXTURE12                      = 0x84CC;
const GLenum TEXTURE13                      = 0x84CD;
const GLenum TEXTURE14                      = 0x84CE;
const GLenum TEXTURE15                      = 0x84CF;
const GLenum TEXTURE16                      = 0x84D0;
const GLenum TEXTURE17                      = 0x84D1;
const GLenum TEXTURE18                      = 0x84D2;
const GLenum TEXTURE19                      = 0x84D3;
const GLenum TEXTURE20                      = 0x84D4;
const GLenum TEXTURE21                      = 0x84D5;
const GLenum TEXTURE22                      = 0x84D6;
const GLenum TEXTURE23                      = 0x84D7;
const GLenum TEXTURE24                      = 0x84D8;
const GLenum TEXTURE25                      = 0x84D9;
const GLenum TEXTURE26                      = 0x84DA;
const GLenum TEXTURE27                      = 0x84DB;
const GLenum TEXTURE28                      = 0x84DC;
const GLenum TEXTURE29                      = 0x84DD;
const GLenum TEXTURE30                      = 0x84DE;
const GLenum TEXTURE31                      = 0x84DF;

// bindTexture texParameterf texParameteri texImage2D 的 target 参数
const GLenum TEXTURE_2D                     = 0x0DE1;
const GLenum TEXTURE_CUBE_MAP               = 0x8513;

// texParameterf pname 参数
// texParameteri pname 参数
const GLenum TEXTURE_MAG_FILTER             = 0x2800;
const GLenum TEXTURE_MIN_FILTER             = 0x2801;
const GLenum TEXTURE_WRAP_S                 = 0x2802;
const GLenum TEXTURE_WRAP_T                 = 0x2803;

// texParameterf param 参数 当 pname = TEXTURE_MAG_FILTER | TEXTURE_MIN_FILTER
// texParameteri param 参数 当 pname = TEXTURE_MAG_FILTER | TEXTURE_MIN_FILTER
// 以下是非金字塔纹理常量
// 使用原纹理上距离映射后像素（新像素）中心最近的那个像素的颜色值，作为新像素的值（使用曼哈顿距离）
// 曼哈顿距离又称直角距离、棋盘距离。如(x1, y1) (x2, y2)的曼哈顿距离是 |x1 - x2| + |y1 - y2|
const GLenum NEAREST                        = 0x2600;
// 使用距离新像素中心最近的四个像素的颜色值得加权平均，作为新像素的值（与 NEAREST对比，该方法图像质量更好，但是会有比较大的开销）
const GLenum LINEAR                         = 0x2601;
// 以下是金字塔纹理常量
const GLenum NEAREST_MIPMAP_NEAREST         = 0x2700;
const GLenum LINEAR_MIPMAP_NEAREST          = 0x2701;
const GLenum NEAREST_MIPMAP_LINEAR          = 0x2702;
const GLenum LINEAR_MIPMAP_LINEAR           = 0x2703;

// texParameterf param 参数 当 pname = TEXTURE_WRAP_S | TEXTURE_WRAP_T
// texParameteri param 参数 当 pname = TEXTURE_WRAP_S | TEXTURE_WRAP_T

// 平铺式的重复纹理
const GLenum REPEAT                         = 0x2901; 
// 镜像对称式的重复纹理
const GLenum CLAMP_TO_EDGE                  = 0x812F; 
// 使用纹理图像的边缘值
const GLenum MIRRORED_REPEAT                = 0x8370; 

// texImage2D 的 internalformat 参数
const GLenum ALPHA                          = 0x1906;
const GLenum RGB                            = 0x1907;
const GLenum RGBA                           = 0x1908;
const GLenum LUMINANCE                      = 0x1909;
const GLenum LUMINANCE_ALPHA                = 0x190A;

// texImage2D 的 type 参数
// 前文已定义
const GLenum UNSIGNED_BYTE; 
// RGBA
const GLenum UNSIGNED_SHORT_4_4_4_4         = 0x8033; 
// RGBA
const GLenum UNSIGNED_SHORT_5_5_5_1         = 0x8034; 
// RGB
const GLenum UNSIGNED_SHORT_5_6_5           = 0x8363; 

// 创建纹理对象以存储纹理图像
WebGLTexture? createTexture();

// 使用texture删除纹理对象
void deleteTexture(WebGLTexture? texture);

// 使用 pname 和 param 指定的方式加载得到的图像
// @param pname 见上面的枚举
// @param param 指定 非0为true、0为false 必须是整数
void pixelStorei(GLenum pname, GLint param);

// 激活纹理单元 参数是常量 gl.TEXTURE<I> 见上面枚举
void activeTexture(GLenum texture);

// 开启 texture 指定的纹理对象，并将其绑定到 target 上。 
// 如果已经通过 gl.activeTexture 激活了某个纹理单元，则纹理对象也会绑定到这个纹理单元上
// @param target 绑定类型 TEXTURE_CUBE_MAP（立方体纹理） | TEXTURE_2D （平面纹理）
// @param texture 绑定的纹理单元
void bindTexture(GLenum target, WebGLTexture? texture);

// 配置纹理，将param值赋给绑定到目标的纹理对象的pname参数上
// @param target 同上
// @param pname 见上面枚举 纹理参数
// @param param 见上面枚举 纹理参数的值
void texParameterf(GLenum target, GLenum pname, GLfloat param);
void texParameteri(GLenum target, GLenum pname, GLint param);

// 将 source 指定的图像分配给绑定到目标上的纹理对象
// @param target 同上
// @param level 传入0 （该参数是为金字塔纹理准备的）
// @param internalformat 图像的内部格式 见上枚举
// @param format 纹理数据的格式 必须使用与 internalformat 相同的值
// @param type 纹理数据的类型
// @param source 包含纹理图像的Image对象
// May throw DOMException
void texImage2D(GLenum target, GLint level, GLint internalformat, GLenum format, GLenum type, TexImageSource source);
void texImage2D(GLenum target, GLint level, GLint internalformat, GLsizei width, GLsizei height, GLint border, GLenum format, GLenum type, [AllowShared] ArrayBufferView? pixels);

// 最后指定纹理单元编号
// gl.uniform1i(sampler, 0);
```

### 启用功能

```JavaScript
// enable disable 的 cap 参数
const GLenum CULL_FACE                      = 0x0B44;
// 混合
const GLenum BLEND                          = 0x0BE2;
const GLenum DITHER                         = 0x0BD0;
const GLenum STENCIL_TEST                   = 0x0B90;
// 隐藏面消除
const GLenum DEPTH_TEST                     = 0x0B71;
const GLenum SCISSOR_TEST                   = 0x0C11;
// 多边形位移 （解决深度冲突问题）
const GLenum POLYGON_OFFSET_FILL            = 0x8037;
const GLenum SAMPLE_ALPHA_TO_COVERAGE       = 0x809E;
const GLenum SAMPLE_COVERAGE                = 0x80A0;

// 启用功能
void enable(GLenum cap);

// 关闭功能
void disable(GLenum cap);

// 解决深度冲突
// gl.enable(POLYGON_OFFSET_FILL);
// 指定加到每个顶点绘制后Z值上的偏移量，偏移量按照公式 m * factor + r * units 计算，其中m代表顶点所在表面
// 相对于观察者的实现角度，而r表示硬件能够区分两个Z值之差的最小值
void polygonOffset(GLfloat factor, GLfloat units);

// 虽然上面的方法可以使用，但是在渲染器中用起来还是很麻烦的。
// 解决深度冲突有更好的方式，就是缩小远近裁剪面的距离
```

### 着色器相关

```JavaScript
// createShader 的 type 参数
const GLenum FRAGMENT_SHADER                  = 0x8B30;
const GLenum VERTEX_SHADER                    = 0x8B31;

// getShaderParameter 的 pname 参数
const GLenum SHADER_TYPE                      = 0x8B4F;
const GLenum DELETE_STATUS                    = 0x8B80;
const GLenum COMPILE_STATUS                   = 0x8B81;

// 创建由type指定的着色器对象
// @param type 见上枚举
WebGLShader? createShader(GLenum type);

// 删除 shader 指定的着色器对象
void deleteShader(WebGLShader? shader);

// 将 source 指定的字符串形式的代码传入shader指定的着色器 如果之前已经向shader传入了代码 旧的代码就会被替换掉
void shaderSource(WebGLShader shader, DOMString source);

// 编译 shader 指定的着色器中的源代码
void compileShader(WebGLShader shader);

// 获取 shader 指定的着色器中 pname 指定的参数信息
// @param pname 见上枚举
any getShaderParameter(WebGLShader shader, GLenum pname);

// 如果 getShaderParameter(shader, COMPILE_STATUS) 返回false 
// 则可以通过 此函数获取 指定shader 的信息日志
DOMString? getShaderInfoLog(WebGLShader shader);
```

### 着色器程序相关

```JavaScript
// getProgramParameter 的 pname 参数
// 着色器相关 章节已定义
const GLenum DELETE_STATUS; 
const GLenum LINK_STATUS                      = 0x8B82;
const GLenum VALIDATE_STATUS                  = 0x8B83;
const GLenum ATTACHED_SHADERS                 = 0x8B85;
const GLenum ACTIVE_UNIFORMS                  = 0x8B86;
const GLenum ACTIVE_ATTRIBUTES                = 0x8B89;

// 创建着色器程序对象
WebGLProgram? createProgram();

// 删除着色器程序对象
void deleteProgram(WebGLProgram? program);

// 将 shader 指定的着色器对象分配给 program 指定的程序对象
void attachShader(WebGLProgram program, WebGLShader shader);

// 取消 shader 指定的着色器对 program 对象的分配
void detachShader(WebGLProgram program, WebGLShader shader);

// 连接 program 指定的程序对象中的着色器
// 目的：
// 1. 保证顶点着色器 和 片元着色器的varying变量同名同类型，且一一对应
// 2. 保证顶点着色器对每个varying变量赋了值
// 3. 保证顶点着色器 和 片元着色器中的同名 uniform 变量也是同类型的 无需一一对应
// 4. 保证着色器中的attribute、uniform、varying变量的个数没有超过着色器上限
void linkProgram(WebGLProgram program);

// 获取 program 指定的程序对象中 pname 指定的参数信息
// @param pname 见上枚举
any getProgramParameter(WebGLProgram program, GLenum pname);

// 如果通过 getProgramParameter(LINK_STATUS) 获得返回值 为 false
// 可以通过 此函数获取 program 指定的程序对象的信息日志
DOMString? getProgramInfoLog(WebGLProgram program);

// 验证 WebGLProgram 
void validateProgram(WebGLProgram program);

// 告知 WEBGL 系统绘制时使用的 program 对象
void useProgram(WebGLProgram? program);
```

**获取着色器程序相关代码**

```JavaScript
const program = gl.createProgram();
gl.attacheShader(program, vertexShader);
gl.attacheShader(program, fragmentShader);
gl.linkProgram(program);
if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
  var info = gl.getProgramInfoLog(program);
  throw new Error('Could not compile WebGL program. \n\n ' + info);
}
```

### 扩展

通过扩展基本上能使 `WebGL1` 拥有 `WebGL2` 的能力。

1. 获取扩展以及扩展支持信息

```
// 获取扩展
object? getExtension(DOMString name);
// 获取扩展支持信息
sequence<DOMString>? getSupportedExtensions();
```

1. 使用扩展字符串获取扩展对象

| 扩展名                             | 说明                                                         |
| :--------------------------------- | :----------------------------------------------------------- |
| ANGLE_instanced_arrays             | 允许绘制多次同样的一个或者多个对象 条件：分享顶点数据、原始计数和类型 |
| EXT_blend_minmax                   | 通过添加两个新的混合方程来扩展混合能力                       |
| EXT_color_buffer_float             | 添加渲染各种浮点格式的能力                                   |
| EXT_color_buffer_half_float        | 添加渲染各种16位浮点格式的能力                               |
| EXT_disjoint_timer_query           | 提供一种测量一组GL命令的持续时间的方法， 不会影响渲染管道的稳定性 |
| EXT_frag_depth                     | 能够在片段着色器中设置片段深度值                             |
| EXT_sRGB                           | 为 FrameBuffer 提供sRGB支持                                  |
| EXT_shader_texture_lod             | 为着色器提供LOD能力                                          |
| EXT_texture_filter_anisotropic     | 提高斜角观察质量                                             |
| OES_element_index_uint             | 使 drawElements 支持 UNSIGNED_INT 类型                       |
| OES_standard_derivatives           | 为着色器提供 `dFdx/dFdy/fwidth` 函数                         |
| OES_texture_float                  | 为材质添加 FLOAT 类型                                        |
| OES_texture_float_linear           | 允许材质的线性过滤                                           |
| OES_texture_half_float             | 为材质添加 16 位支持                                         |
| OES_texture_half_float_linear      | 允许16 位材质精度的线性过滤                                  |
| OES_vertex_array_object            | 提供压缩顶点数组的方法，指向不同顶点数据缓存                 |
| WEBGL_color_buffer_float           | 允许输出32位颜色缓冲                                         |
| WEBGL_compressed_texture_astc      | exposes Adaptive Scalable Texture Compression (ASTC) compressed texture formats to WebGL. |
| WEBGL_compressed_texture_atc       | exposes 3 ATC compressed texture formats.                    |
| WEBGL_compressed_texture_etc       | exposes 10 ETC/EAC compressed texture formats                |
| WEBGL_compressed_texture_etc1      | exposes the ETC1 compressed texture format.                  |
| WEBGL_compressed_texture_pvrtc     | exposes four PVRTC compressed texture formats.               |
| WEBGL_compressed_texture_s3tc      | exposes four S3TC compressed texture formats.                |
| WEBGL_compressed_texture_s3tc_srgb | exposes four S3TC compressed texture formats for the sRGB colorspace. |
| WEBGL_debug_renderer_info          | 获取渲染信息（公司等）                                       |
| WEBGL_debug_shaders                | 获取着色器源码信息                                           |
| WEBGL_depth_texture                | 定义深度和深度模板材质                                       |
| WEBGL_draw_buffers                 | 允许着色器一次性输出多张材质，对延迟渲染大有帮助             |
| WEBGL_lose_context                 | 暴露上下文丢失和恢复函数                                     |

### 查询状态参数

```JavaScript
// 获取当前激活的材质枚举值 getParameter
const GLenum ACTIVE_TEXTURE                 = 0x84E0;
// 获取材质最大支持数量 getParameter
const GLenum MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;

const GLenum MAX_VERTEX_ATTRIBS               = 0x8869;
const GLenum MAX_VERTEX_UNIFORM_VECTORS       = 0x8DFB;
const GLenum MAX_VARYING_VECTORS              = 0x8DFC;
const GLenum MAX_VERTEX_TEXTURE_IMAGE_UNITS   = 0x8B4C;
const GLenum MAX_TEXTURE_IMAGE_UNITS          = 0x8872;
const GLenum MAX_FRAGMENT_UNIFORM_VECTORS     = 0x8DFD;

const GLenum SHADING_LANGUAGE_VERSION         = 0x8B8C;
const GLenum CURRENT_PROGRAM                  = 0x8B8D;

// 获取混合方程
const GLenum BLEND_EQUATION                 = 0x8009;
const GLenum BLEND_EQUATION_RGB             = 0x8009;   /* same as BLEND_EQUATION */
const GLenum BLEND_EQUATION_ALPHA           = 0x883D;

// 面消除查询
const GLenum CULL_FACE_MODE                 = 0x0B45;

// 通过查询参数获取值
any getParameter(GLenum pname);
any getTexParameter(GLenum target, GLenum pname);
// 查询着色器相关参数
any getShaderParameter(WebGLShader shader, GLenum pname);
// 查询着色器程序相关参数
any getProgramParameter(WebGLProgram program, GLenum pname);
```

### 其他静态变量

```glsl
/* Separate Blend Functions */
const GLenum BLEND_DST_RGB                  = 0x80C8;
const GLenum BLEND_SRC_RGB                  = 0x80C9;
const GLenum BLEND_DST_ALPHA                = 0x80CA;
const GLenum BLEND_SRC_ALPHA                = 0x80CB;
const GLenum CONSTANT_COLOR                 = 0x8001;
const GLenum ONE_MINUS_CONSTANT_COLOR       = 0x8002;
const GLenum CONSTANT_ALPHA                 = 0x8003;
const GLenum ONE_MINUS_CONSTANT_ALPHA       = 0x8004;
const GLenum BLEND_COLOR                    = 0x8005;

// buffer
const GLenum BUFFER_SIZE                    = 0x8764;
const GLenum BUFFER_USAGE                   = 0x8765;

const GLenum CURRENT_VERTEX_ATTRIB          = 0x8626;

/* ErrorCode */
const GLenum NO_ERROR                       = 0;
const GLenum INVALID_ENUM                   = 0x0500;
const GLenum INVALID_VALUE                  = 0x0501;
const GLenum INVALID_OPERATION              = 0x0502;
const GLenum OUT_OF_MEMORY                  = 0x0505;

/* FrontFaceDirection */
const GLenum CW                             = 0x0900;
const GLenum CCW                            = 0x0901;

/* GetPName */
const GLenum LINE_WIDTH                     = 0x0B21;
const GLenum ALIASED_POINT_SIZE_RANGE       = 0x846D;
const GLenum ALIASED_LINE_WIDTH_RANGE       = 0x846E;

const GLenum FRONT_FACE                     = 0x0B46;
const GLenum DEPTH_RANGE                    = 0x0B70;
const GLenum DEPTH_WRITEMASK                = 0x0B72;
const GLenum DEPTH_CLEAR_VALUE              = 0x0B73;
const GLenum DEPTH_FUNC                     = 0x0B74;
const GLenum STENCIL_CLEAR_VALUE            = 0x0B91;
const GLenum STENCIL_FUNC                   = 0x0B92;
const GLenum STENCIL_FAIL                   = 0x0B94;
const GLenum STENCIL_PASS_DEPTH_FAIL        = 0x0B95;
const GLenum STENCIL_PASS_DEPTH_PASS        = 0x0B96;
const GLenum STENCIL_REF                    = 0x0B97;
const GLenum STENCIL_VALUE_MASK             = 0x0B93;
const GLenum STENCIL_WRITEMASK              = 0x0B98;
const GLenum STENCIL_BACK_FUNC              = 0x8800;
const GLenum STENCIL_BACK_FAIL              = 0x8801;
const GLenum STENCIL_BACK_PASS_DEPTH_FAIL   = 0x8802;
const GLenum STENCIL_BACK_PASS_DEPTH_PASS   = 0x8803;
const GLenum STENCIL_BACK_REF               = 0x8CA3;
const GLenum STENCIL_BACK_VALUE_MASK        = 0x8CA4;
const GLenum STENCIL_BACK_WRITEMASK         = 0x8CA5;
const GLenum VIEWPORT                       = 0x0BA2;
const GLenum SCISSOR_BOX                    = 0x0C10;
/*      SCISSOR_TEST */
const GLenum COLOR_CLEAR_VALUE              = 0x0C22;
const GLenum COLOR_WRITEMASK                = 0x0C23;
const GLenum UNPACK_ALIGNMENT               = 0x0CF5;
const GLenum PACK_ALIGNMENT                 = 0x0D05;
const GLenum MAX_TEXTURE_SIZE               = 0x0D33;
const GLenum MAX_VIEWPORT_DIMS              = 0x0D3A;
const GLenum SUBPIXEL_BITS                  = 0x0D50;
const GLenum RED_BITS                       = 0x0D52;
const GLenum GREEN_BITS                     = 0x0D53;
const GLenum BLUE_BITS                      = 0x0D54;
const GLenum ALPHA_BITS                     = 0x0D55;
const GLenum DEPTH_BITS                     = 0x0D56;
const GLenum STENCIL_BITS                   = 0x0D57;
const GLenum POLYGON_OFFSET_UNITS           = 0x2A00;
/*      POLYGON_OFFSET_FILL */
const GLenum POLYGON_OFFSET_FACTOR          = 0x8038;
const GLenum TEXTURE_BINDING_2D             = 0x8069;
const GLenum SAMPLE_BUFFERS                 = 0x80A8;
const GLenum SAMPLES                        = 0x80A9;
const GLenum SAMPLE_COVERAGE_VALUE          = 0x80AA;
const GLenum SAMPLE_COVERAGE_INVERT         = 0x80AB;

const GLenum COMPRESSED_TEXTURE_FORMATS     = 0x86A3;

/* HintMode */
const GLenum DONT_CARE                      = 0x1100;
const GLenum FASTEST                        = 0x1101;
const GLenum NICEST                         = 0x1102;

/* HintTarget */
const GLenum GENERATE_MIPMAP_HINT            = 0x8192;

/* PixelFormat */
const GLenum DEPTH_COMPONENT                = 0x1902;

/* StencilOp */
/*      ZERO */
const GLenum KEEP                           = 0x1E00;
const GLenum REPLACE                        = 0x1E01;
const GLenum INCR                           = 0x1E02;
const GLenum DECR                           = 0x1E03;
const GLenum INVERT                         = 0x150A;
const GLenum INCR_WRAP                      = 0x8507;
const GLenum DECR_WRAP                      = 0x8508;

/* StringName */
const GLenum VENDOR                         = 0x1F00;
const GLenum RENDERER                       = 0x1F01;
const GLenum VERSION                        = 0x1F02;

const GLenum TEXTURE                        = 0x1702;

const GLenum TEXTURE_BINDING_CUBE_MAP       = 0x8514;
const GLenum TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515;
const GLenum TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516;
const GLenum TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517;
const GLenum TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518;
const GLenum TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519;
const GLenum TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851A;
const GLenum MAX_CUBE_MAP_TEXTURE_SIZE      = 0x851C;

/* Uniform Types */
const GLenum FLOAT_VEC2                     = 0x8B50;
const GLenum FLOAT_VEC3                     = 0x8B51;
const GLenum FLOAT_VEC4                     = 0x8B52;
const GLenum INT_VEC2                       = 0x8B53;
const GLenum INT_VEC3                       = 0x8B54;
const GLenum INT_VEC4                       = 0x8B55;
const GLenum BOOL                           = 0x8B56;
const GLenum BOOL_VEC2                      = 0x8B57;
const GLenum BOOL_VEC3                      = 0x8B58;
const GLenum BOOL_VEC4                      = 0x8B59;
const GLenum FLOAT_MAT2                     = 0x8B5A;
const GLenum FLOAT_MAT3                     = 0x8B5B;
const GLenum FLOAT_MAT4                     = 0x8B5C;
const GLenum SAMPLER_2D                     = 0x8B5E;
const GLenum SAMPLER_CUBE                   = 0x8B60;

/* Vertex Arrays */
const GLenum VERTEX_ATTRIB_ARRAY_ENABLED        = 0x8622;
const GLenum VERTEX_ATTRIB_ARRAY_SIZE           = 0x8623;
const GLenum VERTEX_ATTRIB_ARRAY_STRIDE         = 0x8624;
const GLenum VERTEX_ATTRIB_ARRAY_TYPE           = 0x8625;
const GLenum VERTEX_ATTRIB_ARRAY_NORMALIZED     = 0x886A;
const GLenum VERTEX_ATTRIB_ARRAY_POINTER        = 0x8645;
const GLenum VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

/* Read Format */
const GLenum IMPLEMENTATION_COLOR_READ_TYPE   = 0x8B9A;
const GLenum IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

/* Shader Precision-Specified Types */
const GLenum LOW_FLOAT                      = 0x8DF0;
const GLenum MEDIUM_FLOAT                   = 0x8DF1;
const GLenum HIGH_FLOAT                     = 0x8DF2;
const GLenum LOW_INT                        = 0x8DF3;
const GLenum MEDIUM_INT                     = 0x8DF4;
const GLenum HIGH_INT                       = 0x8DF5;

/* Framebuffer Object. */
const GLenum FRAMEBUFFER                    = 0x8D40;

const GLenum DEPTH_STENCIL                  = 0x84F9;

const GLenum RENDERBUFFER_WIDTH             = 0x8D42;
const GLenum RENDERBUFFER_HEIGHT            = 0x8D43;
const GLenum RENDERBUFFER_INTERNAL_FORMAT   = 0x8D44;
const GLenum RENDERBUFFER_RED_SIZE          = 0x8D50;
const GLenum RENDERBUFFER_GREEN_SIZE        = 0x8D51;
const GLenum RENDERBUFFER_BLUE_SIZE         = 0x8D52;
const GLenum RENDERBUFFER_ALPHA_SIZE        = 0x8D53;
const GLenum RENDERBUFFER_DEPTH_SIZE        = 0x8D54;
const GLenum RENDERBUFFER_STENCIL_SIZE      = 0x8D55;

const GLenum FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           = 0x8CD0;
const GLenum FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           = 0x8CD1;
const GLenum FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         = 0x8CD2;
const GLenum FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

const GLenum NONE                           = 0;

const GLenum FRAMEBUFFER_COMPLETE                      = 0x8CD5;
const GLenum FRAMEBUFFER_INCOMPLETE_ATTACHMENT         = 0x8CD6;
const GLenum FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
const GLenum FRAMEBUFFER_INCOMPLETE_DIMENSIONS         = 0x8CD9;
const GLenum FRAMEBUFFER_UNSUPPORTED                   = 0x8CDD;

const GLenum FRAMEBUFFER_BINDING            = 0x8CA6;
const GLenum RENDERBUFFER_BINDING           = 0x8CA7;
const GLenum MAX_RENDERBUFFER_SIZE          = 0x84E8;

const GLenum INVALID_FRAMEBUFFER_OPERATION  = 0x0506;

const GLenum CONTEXT_LOST_WEBGL                 = 0x9242;
const GLenum UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
const GLenum BROWSER_DEFAULT_WEBGL              = 0x9244;
```

### 其他方法

```glsl
// 从颜色缓冲区中读取 x y width height 参数确定的矩形块中的所有像素值 并保存在pixels指定的数组中
// @param x y 选择矩形区域左上角坐标
// @param width height 选择矩形区域的宽 长
// @param format 指定像素值的颜色格式 必须为 gl.RGB
// @param type 指定像素值得数据格式 必须是 gl.UNSIGNED_BYTE
// @param pixels 类型化数组 Unit8Array
void readPixels(GLint x, GLint y, GLsizei width, GLsizei height, GLenum format, GLenum type, [AllowShared] ArrayBufferView? pixels);

// 透明混合参数
// blendFunc 的 sfactor dfactor 参数
const GLenum ZERO                           = 0;
const GLenum ONE                            = 1;
const GLenum SRC_COLOR                      = 0x0300;
const GLenum ONE_MINUS_SRC_COLOR            = 0x0301;
const GLenum SRC_ALPHA                      = 0x0302;
const GLenum ONE_MINUS_SRC_ALPHA            = 0x0303;
const GLenum DST_ALPHA                      = 0x0304;
const GLenum ONE_MINUS_DST_ALPHA            = 0x0305;
// blendFunc 的 sfactor 参数
const GLenum DST_COLOR                      = 0x0306;
const GLenum ONE_MINUS_DST_COLOR            = 0x0307;
const GLenum SRC_ALPHA_SATURATE             = 0x0308;

// 通过参数 sfactor 和 dfactor 指定进行混合操作的函数 混合后的颜色如下计算
// 混合后颜色 = 源颜色 * sfactor + 目标颜色 * dfactor
// @param sfactor 见此方法上枚举
// @param dfactor 见此方法上枚举
void blendFunc(GLenum sfactor, GLenum dfactor);
// 同上 只是分开设置RGB 和 ALPHA
void blendFuncSeparate(GLenum srcRGB, GLenum dstRGB, GLenum srcAlpha, GLenum dstAlpha);

// 创建帧缓冲区对象
WebGLFramebuffer? createFramebuffer();
// 删除帧缓冲区对象
void deleteFramebuffer(WebGLFramebuffer? framebuffer);
// 创建渲染缓冲区对象
WebGLRenderbuffer? createRenderbuffer();
// 删除渲染缓冲区对象
void deleteRenderbuffer(WebGLRenderbuffer? renderbuffer);

 const GLenum RENDERBUFFER                   = 0x8D41;

// 将 renderbuffer 指定的渲染缓冲区对象绑定在target目标上
// 如果 renderbuffer 为 null 则将已经绑定在target目标上的渲染缓冲区对象解除绑定
// @param target 必须是 gl.RENDERBUFFER
void bindRenderbuffer(GLenum target, WebGLRenderbuffer? renderbuffer);

// 表示渲染缓冲区将替代颜色缓冲区 
const GLenum RGBA4                          = 0x8056;
const GLenum RGB5_A1                        = 0x8057;
const GLenum RGB565                         = 0x8D62;
// 表示渲染缓冲区将替代深度缓冲区
const GLenum DEPTH_COMPONENT16              = 0x81A5;
// 表示渲染缓冲区将替代模板缓冲区
const GLenum STENCIL_INDEX8                 = 0x8D48;

// 创建并初始化渲染缓冲区的数据区
// @param target 必须是 gl.RENDERBUFFER
// @param internalformat 指定渲染缓冲区中的数据格式 见方法上枚举
// @param width height 指定渲染缓冲区的宽度和高度 单位像素
void renderbufferStorage(GLenum target, GLenum internalformat, GLsizei width, GLsizei height);

// 绑定帧缓冲区
// FBO就是由颜色附件（COLOR_ATTACHMENT0)，深度附件（DEPTH_ATTACHMENT），模板附件（STENCIL_ATTACHMENT）组成的一个逻辑存储对象
// RBO是一个2D图像缓冲区，可以用于分配和存储颜色值，深度或者模板值，可以作为FBO的颜色，深度模板附件。
void bindFramebuffer(GLenum target, WebGLFramebuffer? framebuffer);

// attachment
const GLenum COLOR_ATTACHMENT0              = 0x8CE0;
const GLenum DEPTH_ATTACHMENT               = 0x8D00;
const GLenum STENCIL_ATTACHMENT             = 0x8D20;
const GLenum DEPTH_STENCIL_ATTACHMENT       = 0x821A;

// 设置纹理为 attachment 附件
void framebufferTexture2D(GLenum target, GLenum attachment, GLenum textarget, WebGLTexture? texture, GLint level);
// 设置渲染缓冲区对象为 attachment 附件
void framebufferRenderbuffer(GLenum target, GLenum attachment, GLenum renderbuffertarget, WebGLRenderbuffer? renderbuffer);
// 检查帧缓冲区
[WebGLHandlesContextLoss] GLenum checkFramebufferStatus(GLenum target);
// 设置视口宽度
void viewport(GLint x, GLint y, GLsizei width, GLsizei height);

// 锁定或者释放深度缓冲区的写入操作
// @param flag false 只读 true 可读写
void depthMask(GLboolean flag);

// 返回类似下列上下文参数
// { 
//   alpha: true, 
//   antialias: true, 
//   depth: true, 
//   failIfMajorPerformanceCaveat: false, 
//   premultipliedAlpha: true, 
//   preserveDrawingBuffer: false, 
//   stencil: false 
// }
// 可以通过下列方法设置
// canvas.getContext('webgl', { antialias: false, depth: false });
[WebGLHandlesContextLoss] WebGLContextAttributes? getContextAttributes();
// 标记上下文是否已经丢失
[WebGLHandlesContextLoss] boolean isContextLost();

// 设置源和目标混合因子 值范围 在0到1之间
void blendColor(GLclampf red, GLclampf green, GLclampf blue, GLclampf alpha);

// blendEquation 的 mode 参数
const GLenum FUNC_ADD                       = 0x8006;
const GLenum FUNC_SUBTRACT                  = 0x800A;
const GLenum FUNC_REVERSE_SUBTRACT          = 0x800B;

// 将RGB混合方程和阿尔法混合方程设置为单个方程。
// 混合方程式确定新像素如何与 WebGLFramebuffer 中的像素组合
// @ext EXT_blend_minmax
void blendEquation(GLenum mode);
// 同上 只是分开设置RGB 和 ALPHA
// @ext EXT_blend_minmax
void blendEquationSeparate(GLenum modeRGB, GLenum modeAlpha);

// 设置在绘制或渲染WebGLFramebuffer时要开启或关闭的颜色分量。
void colorMask(GLboolean red, GLboolean green, GLboolean blue, GLboolean alpha);

// 指定一个为压缩格式的2D纹理图片。
void compressedTexImage2D(GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLint border, [AllowShared] ArrayBufferView data);

// 指定一个为压缩格式的2D纹理子图片。
void compressedTexSubImage2D(GLenum target, GLint level, GLint xoffset, GLint yoffset, GLsizei width, GLsizei height, GLenum format, [AllowShared] ArrayBufferView data);

// 复制2D纹理图片。
void copyTexImage2D(GLenum target, GLint level, GLenum internalformat, GLint x, GLint y, GLsizei width, GLsizei height, GLint border);

// 复制2D纹理子图片。
void copyTexSubImage2D(GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint x, GLint y, GLsizei width, GLsizei height);

// cullFace 的 mode 参数
const GLenum FRONT                          = 0x0404;
const GLenum BACK                           = 0x0405;
const GLenum FRONT_AND_BACK                 = 0x0408;

// 设置多边形的正面或反面是否要被排除。
// gl.enable(gl.CULL_FACE);
// gl.cullFace(gl.FRONT_AND_BACK);
// gl.getParameter(gl.CULL_FACE_MODE) === gl.FRONT_AND_BACK;
void cullFace(GLenum mode);

// depthFunc 的 func 参数
const GLenum NEVER                          = 0x0200;
const GLenum LESS                           = 0x0201;
const GLenum EQUAL                          = 0x0202;
const GLenum LEQUAL                         = 0x0203;
const GLenum GREATER                        = 0x0204;
const GLenum NOTEQUAL                       = 0x0205;
const GLenum GEQUAL                         = 0x0206;
const GLenum ALWAYS                         = 0x0207;

// 设置比较输入像素深度和深度缓存值得函数
// gl.enable(gl.DEPTH_TEST);
// gl.depthFunc(gl.NEVER);
// gl.getParameter(gl.DEPTH_FUNC) === gl.NEVER;
void depthFunc(GLenum func);

// 设置从规范化设备坐标映射到窗口或视口坐标时的深度范围。
void depthRange(GLclampf zNear, GLclampf zFar);

// 阻断执行，直到之前所有的操作都完成。
void finish();

// 清空缓冲的命令，这会导致所有命令尽快执行完。
void flush();

// 设置多边形的正面使用顺时针还是逆时针绘制表示。
void frontFace(GLenum mode);

// 为 WebGLTexture 对象生成一组mip纹理映射。
void generateMipmap(GLenum target);

// 返回激活状态的attribute变量信息。
WebGLActiveInfo? getActiveAttrib(WebGLProgram program, GLuint index);
// 返回激活状态的uniform 变量信息。
WebGLActiveInfo? getActiveUniform(WebGLProgram program, GLuint index);
// 返回附加在 WebGLProgram 上的 WebGLShader 对象的列表
sequence<WebGLShader>? getAttachedShaders(WebGLProgram program);

// 返回缓冲信息。
any getBufferParameter(GLenum target, GLenum pname);

// 返回错误信息。
[WebGLHandlesContextLoss] GLenum getError();

// 返回帧缓冲区的信息。
any getFramebufferAttachmentParameter(GLenum target, GLenum attachment, GLenum pname);

// 返回渲染缓冲区的信息。
any getRenderbufferParameter(GLenum target, GLenum pname);

// 返回一个描述着色器数字类型精度的WebGLShaderPrecisionFormat 对象。
WebGLShaderPrecisionFormat? getShaderPrecisionFormat(GLenum shadertype, GLenum precisiontype);

// 以字符串形式返回 WebGLShader 的源码。
DOMString? getShaderSource(WebGLShader shader);

// 返回指定位置的uniform 变量。
any getUniform(WebGLProgram program, WebGLUniformLocation location);

// 返回指定位置的顶点attribute变量。
any getVertexAttrib(GLuint index, GLenum pname);

// 获取给定索引的顶点attribute位置。
[WebGLHandlesContextLoss] GLintptr getVertexAttribOffset(GLuint index, GLenum pname);

// 给某些行为设置建议使用的模式。具体建议需要看执行的情况。
void hint(GLenum target, GLenum mode);
// 返回给入的缓冲是否有效。
[WebGLHandlesContextLoss] GLboolean isBuffer(WebGLBuffer? buffer);
// 测试这个上下文的WebGL功能是否开启。
[WebGLHandlesContextLoss] GLboolean isEnabled(GLenum cap);
// 返回 Boolean 值，表示给入的 WebGLFrameBuffer 对象是否有效。
[WebGLHandlesContextLoss] GLboolean isFramebuffer(WebGLFramebuffer? framebuffer);
// 返回一个 Boolean 值，表示给入的 WebGLProgram 是否有效。
[WebGLHandlesContextLoss] GLboolean isProgram(WebGLProgram? program);
[WebGLHandlesContextLoss] GLboolean isRenderbuffer(WebGLRenderbuffer? renderbuffer);
[WebGLHandlesContextLoss] GLboolean isShader(WebGLShader? shader);
[WebGLHandlesContextLoss] GLboolean isTexture(WebGLTexture? texture);
// 设置线宽。无效
void lineWidth(GLfloat width);

// 为抗锯齿效果设置多重取样覆盖参数。
void sampleCoverage(GLclampf value, GLboolean invert);
// 设置裁剪框。
void scissor(GLint x, GLint y, GLsizei width, GLsizei height);

// 同时设置前面和背面的模板测试函数，及其引用值。
void stencilFunc(GLenum func, GLint ref, GLuint mask);
// 可分开设置前面或背面的模板测试函数，及其引用值。
void stencilFuncSeparate(GLenum face, GLenum func, GLint ref, GLuint mask);
// 同时启用或禁用，前面和背面的模板测试掩码。
void stencilMask(GLuint mask);
// 可分开启用或禁用，前面和背面的模板测试掩码。
void stencilMaskSeparate(GLenum face, GLuint mask);
// 同时设置，在前面和背面的模板缓冲区上执行的操作。
void stencilOp(GLenum fail, GLenum zfail, GLenum zpass);
// 可分开设置，在前面和背面的模板缓冲区上执行的操作。
void stencilOpSeparate(GLenum face, GLenum fail, GLenum zfail, GLenum zpass);

// 更新当前 WebGLTexture 的子矩形。
void texSubImage2D(GLenum target, GLint level, GLint xoffset, GLint yoffset, GLsizei width, GLsizei height, GLenum format, GLenum type, [AllowShared] ArrayBufferView? pixels);
void texSubImage2D(GLenum target, GLint level, GLint xoffset, GLint yoffset, GLenum format, GLenum type, TexImageSource source); // May throw DOMException
```