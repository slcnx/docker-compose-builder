import { Graph, Shape } from '@antv/x6';
import { PORTS_CONFIG, IMAGE_SHAPES } from '../constants';

export const registerCustomNodes = () => {
  // 注册自定义矩形节点
  Graph.registerNode(
    'custom-rect',
    {
      inherit: 'rect',
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: { ...PORTS_CONFIG },
    },
    true,
  );

  // 注册自定义多边形节点
  Graph.registerNode(
    'custom-polygon',
    {
      inherit: 'polygon',
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: {
        ...PORTS_CONFIG,
        items: [{ group: 'top' }, { group: 'bottom' }],
      },
    },
    true,
  );

  // 注册自定义圆形节点
  Graph.registerNode(
    'custom-circle',
    {
      inherit: 'circle',
      width: 45,
      height: 45,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
          textWrap: {
            width: -8,
            height: -8,
            ellipsis: true,
          },
        },
      },
      ports: { ...PORTS_CONFIG },
    },
    true,
  );

  // 注册自定义图片节点
  Graph.registerNode(
    'custom-image',
    {
      inherit: 'rect',
      width: 52,
      height: 52,
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'image' },
        { tagName: 'text', selector: 'label' },
      ],
      attrs: {
        body: {
          stroke: '#5F95FF',
          fill: '#5F95FF',
        },
        image: {
          width: 26,
          height: 26,
          refX: 13,
          refY: 16,
        },
        label: {
          refX: 3,
          refY: 2,
          textAnchor: 'left',
          textVerticalAnchor: 'top',
          fontSize: 12,
          fill: '#fff',
          textWrap: {
            width: -6,
            height: -6,
            ellipsis: true,
          },
        },
      },
      ports: { ...PORTS_CONFIG },
    },
    true,
  );
};

export const createBasicFlowNodes = (graph: Graph) => {
  return [
    graph.createNode({
      shape: 'custom-rect',
      label: '开始',
      attrs: {
        body: {
          rx: 20,
          ry: 26,
        },
      },
    }),
    graph.createNode({
      shape: 'custom-rect',
      label: '过程',
    }),
    graph.createNode({
      shape: 'custom-rect',
      attrs: {
        body: {
          rx: 6,
          ry: 6,
        },
      },
      label: '可选过程',
    }),
    graph.createNode({
      shape: 'custom-polygon',
      attrs: {
        body: {
          refPoints: '0,10 10,0 20,10 10,20',
        },
      },
      label: '决策',
    }),
    graph.createNode({
      shape: 'custom-polygon',
      attrs: {
        body: {
          refPoints: '10,0 40,0 30,20 0,20',
        },
      },
      label: '数据',
    }),
    graph.createNode({
      shape: 'custom-circle',
      label: '连接',
    }),
  ];
};

export const createImageNodes = (graph: Graph) => {
  return IMAGE_SHAPES.map((item) =>
    graph.createNode({
      shape: 'custom-image',
      label: item.label,
      attrs: {
        image: {
          'xlink:href': item.image,
        },
      },
    }),
  );
};


export const createDefaultEdge = () => {
  return new Shape.Edge({
    attrs: {
      line: {
        stroke: '#A2B1C3',
        strokeWidth: 2,
        targetMarker: {
          name: 'block',
          width: 12,
          height: 8,
        },
      },
    },
    zIndex: 0,
  });
};