import {getRangesOfSequentialItems, mergeSequentialNodes} from '../src/utils'
import {Forest} from '../src/forest'
import {TreeNode} from '../src/tree'

describe(`getRangesOfSequentialItems`, () => {
  const isZero = (n: number) => n == 0
  it(`should work when all items belong to the group`, () => {
    expect(getRangesOfSequentialItems([0, 0, 0, 0], isZero)).toEqual([{from: 0, to: 4}])
  })
  it(`should work when no items belong to the group`, () => {
    expect(getRangesOfSequentialItems([1, 1, 1, 1], isZero)).toEqual([])
  })
  it(`should work when there is a single group in the middle`, () => {
    expect(getRangesOfSequentialItems([1, 1, 0, 0, 0, 1, 1], isZero)).toEqual([{from: 2, to: 5}])
  })
  it(`should work when a range is at the start`, () => {
    expect(getRangesOfSequentialItems([0, 0, 1, 1], isZero)).toEqual([{from: 0, to: 2}])
  })
  it(`should work when a range is at the end`, () => {
    expect(getRangesOfSequentialItems([1, 1, 0, 0], isZero)).toEqual([{from: 2, to: 4}])
  })
  it(`should work when there are two groups`, () => {
    expect(getRangesOfSequentialItems([1, 0, 0, 0, 1, 1, 1, 0, 0], isZero))
      .toEqual([{from: 1, to: 4}, {from: 7, to: 9}])
  })
  it(`should work when a group is of length 1`, () => {
    expect(getRangesOfSequentialItems([1, 0, 1, 0, 1], isZero)).toEqual([{from: 1, to: 2}, {from: 3, to: 4}])
  })
})

describe(`mergeSequentialNodes`, () => {
  const isEven = (n: TreeNode<number>): n is TreeNode<number> => n.getValue() % 2 == 0
  const sum2 = (a: number, b: number) => a + b
  const sum = (...ns: TreeNode<number>[]) => ns.map(n => n.getValue()).reduce(sum2)
  it(`should merge nodes at start`, () => {
    const forest = new Forest<number, TreeNode<number>>([new TreeNode(2), new TreeNode(4), new TreeNode(3)])
    const expectedForest = new Forest<number, TreeNode<number>>([new TreeNode(6), new TreeNode(3)])
    mergeSequentialNodes(forest, isEven, sum)
    expect(forest).toEqual(expectedForest)
  })
})

