import {TreeNode, TreeNodeSerialized} from './tree'

export class Forest<T, TNode extends TreeNode<T>> {

  private readonly fakeRoot: TNode

  public getRoots(): TNode[] {
    return this.fakeRoot.getChildren()
  }

  public appendRoots(roots: TNode[]) {
    this.fakeRoot.addChildren(roots)
  }

  // root, left, right
  public preOrder(cb: (node: TNode) => any, includeFakeRoot: boolean = false): void {
    if (includeFakeRoot) cb(this.fakeRoot)
    this.getRoots().forEach(root => root.preOrder(cb as any))
  }

  // left, right, root
  public postOrder(cb: (node: TNode) => any): void {
    this.getRoots().forEach(root => root.postOrder(cb as any))
  }

  public getLeaves(): TNode[] {
    const leaves: TNode[] = []
    this.preOrder(node => {
      if (!node.hasChildren()) {
        leaves.push(node)
      }
    })
    return leaves
  }

  constructor(_roots: TNode[] = []) {
    this.fakeRoot = new TreeNode(null as any, _roots) as any
  }

  public serialize(): TreeNodeSerialized<T>[] {
    return this.getRoots().map(root => root.serialize())
  }

  public static deserialize<T, TNode extends TreeNode<T>>(serialized: TreeNodeSerialized<T>[], createNode: (serialized: TreeNodeSerialized<T>) => TNode): Forest<T, TNode> {
    return new Forest<T, TNode>(serialized.map(node => createNode(node)))
  }

}
