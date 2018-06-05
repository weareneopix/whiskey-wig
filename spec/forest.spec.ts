import {Forest} from '../src/forest'
import {TreeNode, TreeNodeSerialized} from '../src/tree'

describe(`Forest`, () => {

  describe(`getRoots()`, () => {
    it(`should get roots passed from constructor`, () => {
      const forest = new Forest([new TreeNode(1)])
      expect(forest.getRoots().map(n => n.getValue())).toEqual([1])
    })
    it(`should get roots appended after creation`, () => {
      const forest = new Forest()
      forest.appendRoots([new TreeNode(1)])
      expect(forest.getRoots().map(n => n.getValue())).toEqual([1])
    })
  })

  describe(`preOrder`, () => {
    it(`should work for a complex forest`, () => {
      const forest = new Forest([
        new TreeNode(2, [
          new TreeNode(3, [
            new TreeNode(4),
            new TreeNode(5),
          ]),
          new TreeNode(6, [
            new TreeNode(7),
          ]),
        ]),
        new TreeNode(8, [
          new TreeNode(9),
          new TreeNode(10, [
            new TreeNode(11),
          ]),
          new TreeNode(12),
        ]),
      ])
      const arr: number[] = []
      forest.preOrder(node => arr.push(node.getValue()))
      expect(arr).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    })
  })

  describe(`postOrder`, () => {
    it(`should work for a complex forest`, () => {
      const forest = new Forest([
        new TreeNode(2, [
          new TreeNode(3, [
            new TreeNode(4),
            new TreeNode(5),
          ]),
          new TreeNode(6, [
            new TreeNode(7),
          ]),
        ]),
        new TreeNode(8, [
          new TreeNode(9),
          new TreeNode(10, [
            new TreeNode(11),
          ]),
          new TreeNode(12),
        ]),
      ])
      const arr: number[] = []
      forest.postOrder(node => arr.push(node.getValue()))
      expect(arr).toEqual([4, 5, 3, 7, 6, 2, 9, 11, 10, 12, 8])
    })
  })

  describe(`getLeaves()`, () => {
    it(`should get the node for a forest with a single node`, () => {
      const forest = new Forest([new TreeNode(1)])
      expect(forest.getLeaves().map(n => n.getValue())).toEqual([1])
    })
    it(`should get children of a single root`, () => {
      const forest = new Forest([
        new TreeNode(1, [
          new TreeNode(2),
          new TreeNode(3),
        ]),
      ])
      expect(forest.getLeaves().map(n => n.getValue())).toEqual([2, 3])
    })
    it(`should get only the deepest node in a linear forest`, () => {
      const forest = new Forest([
        new TreeNode(1, [
          new TreeNode(2, [
            new TreeNode(3, [
              new TreeNode(4),
            ]),
          ]),
        ]),
      ])
      expect(forest.getLeaves().map(n => n.getValue())).toEqual([4])
    })
    it(`should get leaves for a complex forest`, () => {
      const forest = new Forest([
        new TreeNode('A', [
          new TreeNode('B', [
            new TreeNode('D', [
              new TreeNode('H'),
            ]),
            new TreeNode('E'),
          ]),
          new TreeNode('C', [
            new TreeNode('F', [
              new TreeNode('I'),
              new TreeNode('J'),
            ]),
            new TreeNode('G', [
              new TreeNode('K'),
            ]),
          ]),
        ]),
      ])
      expect(forest.getLeaves().map(n => n.getValue())).toEqual(['H', 'E', 'I', 'J', 'K'])
    })
  })

  describe(`serialization and deserialization`, () => {
    const forest = new Forest<number, TreeNode<number>>([
      new TreeNode(1, [
        new TreeNode(2),
        new TreeNode(3, [
          new TreeNode(4),
          new TreeNode(5),
        ]),
        new TreeNode(6),
        new TreeNode(7, [
          new TreeNode(8),
        ]),
      ]),
      new TreeNode(9, [
        new TreeNode(10),
      ]),
      new TreeNode(11),
      new TreeNode(12),
    ])
    const serialized: TreeNodeSerialized<number, number>[] = [
      {
        v: 1,
        c: [
          {
            v: 2,
            c: [],
          },
          {
            v: 3,
            c: [
              {
                v: 4,
                c: [],
              },
              {
                v: 5,
                c: [],
              },
            ],
          },
          {
            v: 6,
            c: [],
          },
          {
            v: 7,
            c: [
              {
                v: 8,
                c: [],
              },
            ],
          },
        ],
      },
      {
        v: 9,
        c: [
          {
            v: 10,
            c: [],
          },
        ],
      },
      {
        v: 11,
        c: [],
      },
      {
        v: 12,
        c: [],
      },
    ]

    describe(`serialize`, () => {
      it(`should serialize a forest`, () => {
        expect(forest.serialize()).toEqual(serialized)
      })
    })
    describe(`deserialize`, () => {
      it(`should deserialize a forest`, () => {
        expect(Forest.deserialize<number, TreeNode<number>>(serialized, TreeNode.deserialize)).toEqual(forest)
      })
    })
  })



})
