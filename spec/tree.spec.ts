import {TreeNode} from '../src/tree'

describe(`TreeNode`, () => {

  describe(`getValue()`, () => {
    it(`should get set the set value`, () => {
      const node = new TreeNode(1)
      expect(node.getValue()).toBe(1)
    })
  })

  describe(`getChildren()`, () => {
    it(`should get children set from the constructor`, () => {
      const node = new TreeNode(1, [
        new TreeNode(2),
        new TreeNode(3),
      ])
      expect(node.getChildren().map(n => n.getValue())).toEqual([2, 3])
    })
    it(`should get children set from addChild()`, () => {
      const children = [new TreeNode(2), new TreeNode(3)]
      const node = new TreeNode(1)
      node.addChildren(children)
      expect(node.getChildren().map(n => n.getValue())).toEqual([2, 3])
    })
  })

  describe(`getParent()`, () => {
    it(`should return undefined when a node has no parent`, () => {
      const node = new TreeNode(1)
      expect(node.getParent()).toBeUndefined()
    })
    it(`should return the parent when it exists`, () => {
      const child = new TreeNode(2)
      const node = new TreeNode(1, [child])
      expect(child.getParent()).toBe(node)
    })
  })

  describe(`getParentOrThrow()`, () => {
    it(`should throw if the node has no parent`, () => {
      const node = new TreeNode(1)
      expect(() => node.getParentOrThrow()).toThrow()
    })
    it(`should return the parent when it exists`, () => {
      const child = new TreeNode(2)
      const node = new TreeNode(1, [child])
      expect(child.getParent()).toBe(node)
    })
  })

  describe(`hasChildren()`, () => {
    it(`should return true when the node has children`, () => {
      const node = new TreeNode(1, [new TreeNode(2), new TreeNode(3)])
      expect(node.hasChildren()).toBe(true)
    })
    it(`should return false when the node has no children`, () => {
      const node = new TreeNode(1)
      expect(node.hasChildren()).toBe(false)
    })
  })

  describe(`addChildren()`, () => {
    it(`should update children`, () => {
      const node = new TreeNode(1)
      expect(node.getChildren()).toEqual([])
      node.addChildren([new TreeNode(2)])
      expect(node.getChildren().map(n => n.getValue())).toEqual([2])
    })
    it(`should update parent relationship`, () => {
      const [one, two] = [new TreeNode(1), new TreeNode(2)]
      expect(two.getParent()).toBeUndefined()
      one.addChildren([two])
      expect(two.getParent()).toBe(one)
    })
  })

  describe(`removeChildAt()`, () => {
    it(`should remove a leaf`, () => {
      const tree = new TreeNode(1, [new TreeNode(2), new TreeNode(3)])
      const removed = tree.removeChildAt(0)
      const expected = new TreeNode(1, [new TreeNode(3)])
      expect(tree).toEqual(expected)
      expect(removed.getValue()).toBe(2)
      expect(removed.getParent()).toBeUndefined()
    })
    it(`should remove a subtree`, () => {
      const tree = new TreeNode(1, [
        new TreeNode(2),
        new TreeNode(3, [
          new TreeNode(4),
        ]),
        new TreeNode(5),
      ])
      const removed = tree.removeChildAt(1)
      const expected = new TreeNode(1, [
        new TreeNode(2),
        new TreeNode(5),
      ])
      expect(tree).toEqual(expected)
      expect(removed.getValue()).toBe(3)
      expect(removed.getChildren().map(n => n.getValue())).toEqual([4])
      expect(removed.getParent()).toBeUndefined()
    })
  })

  describe(`removeChild`, () => {
    it(`should remove a leaf`, () => {
      const node = new TreeNode(10)
      const tree = new TreeNode(1, [new TreeNode(2), node])
      tree.removeChild(node)
      const expected = new TreeNode(1, [new TreeNode(2)])
      expect(tree).toEqual(expected)
      expect(node.getParent()).toBeUndefined()
    })
  })

  describe(`replaceChild()`, () => {
    it(`should replace a child with a different child`, () => {

    })
  })

  describe(`replaceChildren()`, () => {
    it(`should work`, () => {
      const tree = new TreeNode(1, [
        new TreeNode(2, [
          new TreeNode(3),
        ]),
        new TreeNode(4),
        new TreeNode(5),
        new TreeNode(6),
      ])
      const newChild = new TreeNode(100)
      const expected = new TreeNode(1, [
        newChild,
        new TreeNode(5),
        new TreeNode(6),
      ])
      tree.replaceChildren(0, 2, [newChild])
      expect(tree).toEqual(expected)
      expect(newChild.getParent()).toBe(tree)
    })
  })

  describe(`detachFromTree()`, () => {

  })

  describe(`removeAndFlatten()`, () => {
    it(`should remove a leaf correctly`, () => {
      const [a, b, c, d, e, f, g] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(letter => new TreeNode(letter))
      a.addChildren([b, c.addChildren([d, e.addChildren([f, g])])])
      b.removeAndFlatten()
      expect(a.getChildren().map(n => n.getValue())).toEqual(['c'])
      expect(b.getParent()).toBeUndefined() // b is detached
      expect(c.getParent()).toBe(a) // c still has the parent a
    })
    it(`should remove a node with a single node correctly`, () => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map(letter => new TreeNode(letter))
      a.addChildren([b, c.addChildren([d])])
      c.removeAndFlatten()
      expect(a.getChildren().map(n => n.getValue())).toEqual(['b', 'd']) // a now has children b and d
      expect(c.getParent()).toBeUndefined() // c is detached
      expect(d.getParent()).toBe(a)
    })
    it(`should remove a node with multiple child nodes`, () => {
      const [a, b, c, d, e, f, g] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(letter => new TreeNode(letter))
      a.addChildren([
        b,
        c.addChildren([
          e, f, g,
        ]),
        d,
      ])
      c.removeAndFlatten()
      expect(a.getChildren().map(child => child.getValue())).toEqual(['b', 'e', 'f', 'g', 'd'])
      expect(e.getParent()).toBe(a)
      expect(f.getParent()).toBe(a)
      expect(g.getParent()).toBe(a)
    })
  })

  describe(`preOrder`, () => {
    const preOrder = <T>(node: TreeNode<T>): T[] => {
      const arr: TreeNode<any>[] = []
      node.preOrder(n => arr.push(n))
      return arr.map(n => n.getValue())
    }

    it(`should traverse a tree with a single node`, () => {
      const node = new TreeNode(1)
      expect(preOrder(node)).toEqual([1])
    })
    it(`should traverse a tree with one node and a few children`, () => {
      const node = new TreeNode(1, [
        new TreeNode(2),
        new TreeNode(3),
        new TreeNode(4),
      ])
      expect(preOrder(node)).toEqual([1, 2, 3, 4])
    })
    it(`should traverse a linear tree`, () => {
      const node = new TreeNode(1, [
        new TreeNode(2, [
          new TreeNode(3, [
            new TreeNode(4),
          ]),
        ]),
      ])
      expect(preOrder(node)).toEqual([1, 2, 3, 4])
    })
    it(`should traverse a complex tree`, () => {
      const node = new TreeNode(1, [
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
      expect(preOrder(node)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    })
  })

  describe(`postOrder`, () => {
    const postOrder = <T>(node: TreeNode<T>): T[] => {
      const arr: TreeNode<any>[] = []
      node.postOrder(n => arr.push(n))
      return arr.map(n => n.getValue())
    }

    it(`should traverse a tree with a single node`, () => {
      const node = new TreeNode(1)
      expect(postOrder(node)).toEqual([1])
    })
    it(`should traverse a tree with one node and a few children`, () => {
      const node = new TreeNode(1, [new TreeNode(2), new TreeNode(3), new TreeNode(4)])
      expect(postOrder(node)).toEqual([2, 3, 4, 1])
    })
    it(`should traverse a linear tree`, () => {
      const node = new TreeNode(1, [new TreeNode(2, [new TreeNode(3, [new TreeNode(4)])])])
      expect(postOrder(node)).toEqual([4, 3, 2, 1])
    })
    it(`should traverse a complex tree`, () => {
      const node = new TreeNode(1, [
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
      expect(postOrder(node)).toEqual([4, 5, 3, 7, 6, 2, 9, 11, 10, 12, 8, 1])
    })
  })

  describe(`serialization and deserialization`, () => {
    const tree1 = new TreeNode(1)
    const serialized1 = {v: 1, c: []}

    const tree2 = new TreeNode(1, [
      new TreeNode(2),
      new TreeNode(3),
      new TreeNode(4),
    ])
    const serialized2 = {
      v: 1,
      c: [
        {v: 2, c: []},
        {v: 3, c: []},
        {v: 4, c: []},
      ],
    }

    const tree3 = new TreeNode(1, [
      new TreeNode(2, [
        new TreeNode(3, [
          new TreeNode(4),
        ]),
      ]),
    ])
    const serialized3 = {
      v: 1,
      c: [
        {
          v: 2,
          c: [
            {
              v: 3,
              c: [
                {
                  v: 4,
                  c: [],
                },
              ],
            },
          ],
        },
      ],
    }

    describe(`serialize`, () => {
      it(`should serialize a single node`, () => {
        expect(tree1.serialize()).toEqual(serialized1)
      })
      it(`should serialize a node with a few children`, () => {
        expect(tree2.serialize()).toEqual(serialized2)
      })
      it(`should serialize a long branch`, () => {
        expect(tree3.serialize()).toEqual(serialized3)
      })
    })

    describe(`deserialize`, () => {
      it(`should deserialize a single node`, () => {
        expect(TreeNode.deserialize(serialized1)).toEqual(tree1)
      })
      it(`should deserialize a node with a few children`, () => {
        expect(TreeNode.deserialize(serialized2)).toEqual(tree2)
      })
      it(`should deserialize a long branch`, () => {
        expect(TreeNode.deserialize(serialized3)).toEqual(tree3)
      })
    })
  })


})
