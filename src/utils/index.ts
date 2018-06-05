import {Forest} from '../forest'
import {TreeNode} from '../tree'

export interface Range {
  from: number
  to: number
}

export function getRangesOfSequentialItems<T>(arr: T[], isBelongToGroup: (t: T) => boolean): Range[] {
  const result: Range[] = []
  let isLastBelongToGroup: boolean = false
  let groupStart: number = -1
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (isBelongToGroup(item)) {
      if (!isLastBelongToGroup) {
        groupStart = i
      }
      isLastBelongToGroup = true
    } else {
      if (isLastBelongToGroup) {
        isLastBelongToGroup = false
        result.push({from: groupStart, to: i})
        groupStart = -1
      }
    }
  }
  if (groupStart != -1) {
    result.push({from: groupStart, to: arr.length})
  }
  return result
}

export function isRangeNotSingle(range: Range): boolean {
  return range.from < range.to - 1
}

export function mergeSequentialNodes<T, V extends T>(forest: Forest<T, TreeNode<T>>,
                                                     isBelongToGroup: (t: TreeNode<T>) => t is TreeNode<V>,
                                                     mergeNodes: (...t: TreeNode<V>[]) => V): void {
  forest.preOrder(node => {
    if (!node.hasChildren()) return
    const children = node.getChildren()
    const ranges = getRangesOfSequentialItems(children, isBelongToGroup).filter(isRangeNotSingle)
    for (let rangeIndex = ranges.length - 1; rangeIndex >= 0; rangeIndex--) {
      const range = ranges[rangeIndex]
      const group = children.slice(range.from, range.to) as TreeNode<V>[]
      const newNodeValue = mergeNodes(...group)
      node.replaceChildren(range.from, range.to, [new TreeNode(newNodeValue)])
    }
  }, true)
}

export function printTreeNode<T extends NonNullable<any>>(treeNode: TreeNode<T>): string {
  return `(${treeNode.getValue()} ${treeNode.getChildren().map(printTreeNode).join(' ')})`
}

export function printForest<T extends NonNullable<any>>(forest: Forest<T, TreeNode<T>>): string {
  return forest.getRoots().map(printTreeNode).join(' ')
}
