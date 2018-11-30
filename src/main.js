import createREGL from 'regl'
import mat4 from 'gl-mat4'
import image from './particle.png'

var path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

path.setAttribute('d', 'M0.471999559,0.711303419 L0.290331797,0.884084796 C0.259321572,0.913564352 0.210538576,0.878132193 0.229005817,0.839525314 L0.337187283,0.61335476 C0.34605441,0.594830089 0.338835612,0.572606415 0.320775108,0.562828503 L0.100302045,0.443436302 C0.0626872662,0.423069897 0.0813104086,0.365712319 0.123729789,0.371353119 L0.37226512,0.404347545 C0.392606183,0.40705303 0.411499501,0.393344158 0.415237242,0.373167245 L0.460590404,0.126559423 C0.468342961,0.0844801922 0.528620148,0.0844801922 0.53640105,0.126559423 L0.581754213,0.373167245 C0.585491954,0.393344158 0.604385271,0.40705303 0.624726335,0.404347545 L0.873389222,0.371353119 C0.915808602,0.365683974 0.934431744,0.423069897 0.896816965,0.443450475 L0.676343903,0.562828503 C0.658283398,0.572606415 0.6510646,0.594830089 0.659931727,0.61335476 L0.768113193,0.839525314 C0.786537915,0.87811802 0.737783265,0.913564352 0.706787213,0.884084796 L0.525119451,0.711303419 C0.510240993,0.69715034 0.486878017,0.69715034 0.471999559,0.711303419 Z')


export default function (container, options) {
  options = options || {}

  var zoom = options.zoom || 1
  var pan = options.pan || [0, 0]

  var instances = 12
  var offsets = []

  for (var i = 0; i < instances; i++) {
    var count = Math.floor((i + 1) * 20)
    var scale = (i + 1) / instances

    for (var k = 0; k < count; k++) {
      var length = path.getTotalLength()
      var distance = (k / count) * length
      var sample = path.getPointAtLength(distance)
      var x = (sample.x - 0.5) * scale
      var y = (sample.y - 0.5) * scale
      offsets.push([x, y])
    }
  }

  var regl = createREGL({
    container: container,
    extensions: ['angle_instanced_arrays']
  })

  var drawStarfish = regl({
    vert: `
      precision mediump float;
      attribute vec2 position;
      attribute vec2 offset;
      varying vec2 uv;
      uniform float time;
      uniform mat4 model, view, projection;

      const float size = 0.008;

      void main () {
        uv = position * 0.5 + 0.5;

        vec2 displace = vec2(0.0);

        displace.x += sin((offset.x + offset.y) * 20.0 + time * 2.0) / 2.0;
        displace.y += sin(offset.y * 20.0 + time);
        displace.y += (sin((offset.y - offset.x) * 50.0 + time * 10.0) / 10.0) * sin(time / 10.0) * 2.0;

        displace *= 0.04;

        gl_Position = projection * view * model * vec4(position * size - offset * 2.0 + displace, 0.0, 1.0);
      }
    `,

    frag: `
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D texture;

      void main () {
        vec4 sample = texture2D(texture, uv);
        gl_FragColor = sample;
      }
    `,

    attributes: {
      position: [
        [-1, -1],
        [-1, 1],
        [1, 1],
        [1, -1]
      ],

      offset: {
        buffer: regl.buffer({
          data: offsets,
          type: 'float',
          usage: 'static'
        }),
        divisor: 2
      }
    },

    uniforms: {
      time: regl.context('time'),
      texture: regl.texture({
        data: image,
        flipY: true
      }),

      model: mat4.translate([], mat4.identity([]), [-pan[0], -pan[1], 0]),

      view: mat4.lookAt([],
        [0, 0, 2 / zoom],
        [0, 0, 0],
        [0, 1, 0]
      ),

      projection: function (context) {
        return mat4.perspective([],
          Math.PI / 4,
          context.viewportWidth / context.viewportHeight,
          0.01,
          1000
        )
      }
    },

    elements: [
      [0, 1, 2],
      [2, 3, 0]
    ],

    instances: offsets.length,

    sample: {
      enable: true,
      alpha: true,
      coverage: {
        value: 1,
        invert: false
      }
    }
  })

  regl.frame(() => {
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1
    })

    drawStarfish()
  })
}
