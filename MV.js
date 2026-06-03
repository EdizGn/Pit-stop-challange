"use strict";

function vec2(x, y) { return [x || 0, y || 0]; }
function vec3(x, y, z) { return [x || 0, y || 0, z || 0]; }
function vec4(x, y, z, w) {
    return [x !== undefined ? x : 0, y !== undefined ? y : 0, z !== undefined ? z : 0, w !== undefined ? w : 1];
}

function mat3() {
    return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
}

function mat4() {
    return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
}

function flatten(v) {
    if (typeof v[0] === 'number') return new Float32Array(v);
    var n = v.length;
    var out = [];
    for (var i = 0; i < n; ++i)
        for (var j = 0; j < n; ++j) out.push(v[j][i]);
    return new Float32Array(out);
}

function mult(A, B) {
    var R = mat4();
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            R[i][j] = 0;
            for (var k = 0; k < 4; k++) R[i][j] += A[i][k] * B[k][j];
        }
    }
    return R;
}

function translate(x, y, z) {
    if (Array.isArray(x) && x.length == 3) { z = x[2]; y = x[1]; x = x[0]; }
    var result = mat4();
    result[0][3] = x; result[1][3] = y; result[2][3] = z;
    return result;
}

function scale(x, y, z) {
    if (Array.isArray(x) && x.length == 3) { z = x[2]; y = x[1]; x = x[0]; }
    var result = mat4();
    result[0][0] = x; result[1][1] = y; result[2][2] = z;
    return result;
}

function rotate(angle, axis) {
    var v = normalize(axis);
    var x = v[0], y = v[1], z = v[2];
    var c = Math.cos(angle * Math.PI / 180.0);
    var s = Math.sin(angle * Math.PI / 180.0);
    var omc = 1.0 - c;
    var result = mat4();
    result[0][0] = x * x * omc + c;
    result[0][1] = x * y * omc - z * s;
    result[0][2] = x * z * omc + y * s;
    result[1][0] = x * y * omc + z * s;
    result[1][1] = y * y * omc + c;
    result[1][2] = y * z * omc - x * s;
    result[2][0] = x * z * omc - y * s;
    result[2][1] = y * z * omc + x * s;
    result[2][2] = z * z * omc + c;
    return result;
}

function dot(u, v) {
    var sum = 0.0;
    for (var i = 0; i < u.length; i++) sum += u[i] * v[i];
    return sum;
}

function cross(u, v) {
    return [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    ];
}

function length(u) {
    return Math.sqrt(dot(u, u));
}

function normalize(u) {
    var len = length(u);
    if (!isFinite(len)) throw "normalize: vector has zero length";
    var result = [];
    for (var i = 0; i < u.length; i++) result.push(u[i] / len);
    return result;
}

function subtract(u, v) {
    var result = [];
    for (var i = 0; i < u.length; i++) result.push(u[i] - v[i]);
    return result;
}

function lookAt(eye, at, up) {
    var v = normalize(subtract(at, eye));
    var n = normalize(cross(v, up));
    var u = normalize(cross(n, v));
    v = [-v[0], -v[1], -v[2]];
    var result = mat4();
    result[0][0] = n[0]; result[0][1] = n[1]; result[0][2] = n[2];
    result[1][0] = u[0]; result[1][1] = u[1]; result[1][2] = u[2];
    result[2][0] = v[0]; result[2][1] = v[1]; result[2][2] = v[2];
    result[0][3] = -dot(n, eye);
    result[1][3] = -dot(u, eye);
    result[2][3] = -dot(v, eye);
    return result;
}

function perspective(fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy * Math.PI / 180.0 / 2);
    var d = far - near;
    var result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;
    return result;
}

function normalMatrix(m, flag) {
    var a00 = m[0][0], a01 = m[0][1], a02 = m[0][2],
        a10 = m[1][0], a11 = m[1][1], a12 = m[1][2],
        a20 = m[2][0], a21 = m[2][1], a22 = m[2][2],
        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,
        det = a00 * b01 + a01 * b11 + a02 * b21;
    if (!det) throw "normalMatrix: matrix not invertible";
    det = 1.0 / det;
    return [
        [(a22 * a11 - a12 * a21) * det, (-a22 * a01 + a02 * a21) * det, (a12 * a01 - a02 * a11) * det],
        [(-a22 * a10 + a12 * a20) * det, (a22 * a00 - a02 * a20) * det, (-a12 * a00 + a02 * a10) * det],
        [(a21 * a10 - a11 * a20) * det, (-a21 * a00 + a01 * a20) * det, (a11 * a00 - a01 * a10) * det]
    ];
}