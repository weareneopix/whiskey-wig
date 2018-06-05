export interface TreeNodeSerialized<T, V extends T = T> {
  v: V
  c: TreeNodeSerialized<T>[]
}

export class TreeNode<T, V extends T = T> {

  private _parent: this | undefined
  private _children: this[] = []

  public getValue(): V {
    return this._value
  }

  public getChildren() {
    return this._children
  }

  public getParent(): TreeNode<T> | undefined {
    return this._parent
  }

  public getParentOrThrow(): TreeNode<T> {
    if (this._parent == null) throw new Error(`Expected node to have a parent.`)
    return this._parent
  }

  public hasChildren(): boolean {
    return this._children.length > 0
  }

  public getChildAt(index: number): this {
    return this._children[index]
  }

  public addChildren(newChildren: this[]): this {
    this._children = [...this._children, ...newChildren]
    newChildren.forEach(child => child.registerParent(this))
    return this
  }

  public removeChildAt(index: number): this {
    const [child] = this._children.splice(index, 1)
    child._parent = undefined
    return child
  }

  public removeChild(child: this): this {
    const index = this._children.indexOf(child)
    return this.removeChildAt(index)
  }

  private replaceChild(existingChild: this, newChildren: this[]): void {
    const index = this._children.findIndex(child => existingChild == child)
    if (index == -1) {
      throw new Error(`No child found to remove.`)
    }
    const child = this._children[index]._parent = undefined
    this._children.splice(index, 1, ...newChildren)
    newChildren.forEach(newChild => newChild._parent = this)
  }

  public replaceChildren(from: number, to: number, newChildren: this[]): void {
    const childrenToRemove = this._children.slice(from, to)
    childrenToRemove.forEach(node => this.removeChild(node))
    this._children.splice(from, 0, ...newChildren)
    newChildren.forEach(newChild => newChild._parent = this)
  }

  public detachFromFree() {
    const parent = this.getParent()
    if (parent == null) return
    parent.removeChild(this)
  }

  public removeAndFlatten() {
    this.getParentOrThrow().replaceChild(this, this.getChildren())
  }

  protected registerParent(parent: this): void {
    this._parent = parent
  }

  constructor(private _value: V, _children: TreeNode<T>[] = []) {
    this.addChildren(_children as this[])
  }

  // root, left, right
  public preOrder(cb: (node: TreeNode<any>) => any): void {
    cb(this)
    this.getChildren().forEach(child => child.preOrder(cb))
  }

  // left, right, root
  public postOrder(cb: (node: TreeNode<any>) => any): void {
    this.getChildren().forEach(child => child.postOrder(cb))
    cb(this)
  }

  public serialize(): TreeNodeSerialized<T, V> {
    const value = this.getValue()
    const children = this.getChildren().map(child => child.serialize())
    return {v: value, c: children}
  }

  public static deserialize<T, V extends T = T>(serialized: TreeNodeSerialized<T, V>): TreeNode<T, V> {
    return new TreeNode(serialized.v, serialized.c.map(child => TreeNode.deserialize(child)))
  }

}
